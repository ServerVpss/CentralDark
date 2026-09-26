module.exports = [
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/hooks/usePools.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePools",
    ()=>usePools
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function usePools() {
    const [pools, setPools] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const mountedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    const fetchPools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/quota/pools");
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await res.json();
            if (!mountedRef.current) return;
            const list = Array.isArray(data) ? data : Array.isArray(data.pools) ? data.pools : [];
            setPools(list);
        } catch (err) {
            if (!mountedRef.current) return;
            setError(err instanceof Error ? err.message : "Failed to load pools");
        } finally{
            if (mountedRef.current) setLoading(false);
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mountedRef.current = true;
        void fetchPools();
        return ()=>{
            mountedRef.current = false;
        };
    }, [
        fetchPools
    ]);
    const mutate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        await fetchPools();
    }, [
        fetchPools
    ]);
    return {
        pools,
        loading,
        error,
        mutate
    };
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/hooks/usePoolUsage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePoolUsage",
    ()=>usePoolUsage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function usePoolUsage(poolId, pollIntervalMs = 15_000) {
    const [usage, setUsage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const mountedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    const fetchUsage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!poolId) return;
        try {
            const res = await fetch(`/api/quota/pools/${poolId}/usage`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            // The endpoint wraps the snapshot as `{ usage: snapshot }` — unwrap it.
            // Storing the wrapper directly left `usage.dimensions` undefined, which
            // crashed StackedAllocationBar (usage.dimensions[i]) for any pool that has
            // allocations — taking down the whole quota-share page.
            const data = await res.json();
            if (!mountedRef.current) return;
            setUsage(data?.usage ?? null);
            setError(null);
        } catch (err) {
            if (!mountedRef.current) return;
            setError(err instanceof Error ? err.message : "Failed to load usage");
        } finally{
            if (mountedRef.current) setLoading(false);
        }
    }, [
        poolId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mountedRef.current = true;
        void fetchUsage();
        const interval = setInterval(()=>{
            void fetchUsage();
        }, pollIntervalMs);
        return ()=>{
            mountedRef.current = false;
            clearInterval(interval);
        };
    }, [
        fetchUsage,
        pollIntervalMs
    ]);
    return {
        usage,
        loading,
        error
    };
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/hooks/useLocalStoragePoolMigration.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adaptLsPoolToApiSchema",
    ()=>adaptLsPoolToApiSchema,
    "useLocalStoragePoolMigration",
    ()=>useLocalStoragePoolMigration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const LS_KEY = "omniroute:quota-share:pools";
function adaptLsPoolToApiSchema(lsPool) {
    const connectionId = lsPool.connectionId || "";
    const name = lsPool.accountLabel || lsPool.provider || lsPool.connectionId?.slice(0, 12) || "Migrated pool";
    const policy = lsPool.policy === "soft" || lsPool.policy === "burst" ? lsPool.policy : "hard";
    const allocations = (lsPool.allocations || []).filter((a)=>a.apiKeyId).map((a)=>({
            apiKeyId: a.apiKeyId,
            weight: typeof a.percent === "number" ? Math.max(0, Math.min(100, a.percent)) : 0,
            policy
        }));
    return {
        connectionId,
        name,
        allocations
    };
}
function useLocalStoragePoolMigration({ pools, mutate }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const raw = undefined;
        let lsPools;
    }, [
        pools.length,
        mutate
    ]);
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/hooks/usePoolsUsageAggregate.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePoolsUsageAggregate",
    ()=>usePoolsUsageAggregate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const POLL_MS = 15_000;
function usePoolsUsageAggregate(pools) {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        avgUtilizationPercent: 0,
        borrowingKeyCount: 0,
        loading: true,
        error: null
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let mounted = true;
        const ids = pools.map((p)=>p.id);
        if (ids.length === 0) {
            setState({
                avgUtilizationPercent: 0,
                borrowingKeyCount: 0,
                loading: false,
                error: null
            });
            return;
        }
        const fetchAll = async ()=>{
            try {
                const snapshots = await Promise.all(ids.map((id)=>fetch(`/api/quota/pools/${id}/usage`).then((r)=>r.ok ? r.json() : null)));
                if (!mounted) return;
                const valid = snapshots.filter((s)=>s !== null && !!s.usage);
                let totalUtil = 0;
                let utilCount = 0;
                let borrowing = 0;
                for (const { usage } of valid){
                    for (const dim of usage.dimensions ?? []){
                        if (dim.limit > 0) {
                            totalUtil += dim.consumedTotal / dim.limit * 100;
                            utilCount += 1;
                        }
                        for (const key of dim.perKey ?? []){
                            if (key.borrowing) borrowing += 1;
                        }
                    }
                }
                setState({
                    avgUtilizationPercent: utilCount > 0 ? totalUtil / utilCount : 0,
                    borrowingKeyCount: borrowing,
                    loading: false,
                    error: null
                });
            } catch (err) {
                if (mounted) {
                    setState((s)=>({
                            ...s,
                            loading: false,
                            error: err instanceof Error ? err.message : "fetch failed"
                        }));
                }
            }
        };
        void fetchAll();
        const interval = setInterval(fetchAll, POLL_MS);
        return ()=>{
            mounted = false;
            clearInterval(interval);
        };
    }, [
        pools.map((p)=>p.id).join(",")
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    return state;
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuotaConceptCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function QuotaConceptCard() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaShare");
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        padding: "md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "w-full flex items-center justify-between gap-2 cursor-pointer",
                onClick: ()=>setExpanded((p)=>!p),
                "aria-expanded": expanded,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[20px] text-primary",
                                children: "info"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                                lineNumber: 20,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-semibold text-text-main",
                                children: t("conceptTitle")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                                lineNumber: 21,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[18px] text-text-muted",
                        children: expanded ? "expand_less" : "expand_more"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 space-y-2 text-xs text-text-muted leading-relaxed",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: t("conceptIntro")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConceptItem, {
                                icon: "balance",
                                text: t("conceptFairShare")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                                lineNumber: 32,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConceptItem, {
                                icon: "trending_up",
                                text: t("conceptBorrowing")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                                lineNumber: 33,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConceptItem, {
                                icon: "lock",
                                text: t("conceptGlobalCap")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                                lineNumber: 34,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConceptItem, {
                                icon: "schedule",
                                text: t("conceptWindows")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                                lineNumber: 35,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConceptItemWithDesc, {
                                icon: "vpn_key",
                                title: t("conceptKeyHowTitle"),
                                desc: t("conceptKeyHowDesc")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                                lineNumber: 36,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConceptItemWithDesc, {
                                icon: "block",
                                title: t("conceptExclusiveTitle"),
                                desc: t("conceptExclusiveDesc")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                                lineNumber: 41,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                        lineNumber: 31,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                lineNumber: 29,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
function ConceptItem({ icon, text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-start gap-1.5 rounded-md bg-bg-subtle/40 p-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5",
                children: icon
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: text
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
function ConceptItemWithDesc({ icon, title, desc }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-start gap-1.5 rounded-md bg-bg-subtle/40 p-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5",
                children: icon
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-0.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-semibold text-text-main",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-text-muted",
                        children: desc
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/quota/quotaModelNaming.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Deterministic naming helpers for quota virtual models (Phase B3).
 *
 * FORMAT: `qtSd/<groupSlug>/<provider>/<model>`
 *
 * The groupSlug is pure alphanumeric (no "-", no "/"), and the segments are
 * separated by "/" which makes parsing unambiguous: split on "/", take the
 * first 3 segments (prefix literal "qtSd", groupSlug, provider) and join the
 * remainder as the model id (model ids may contain "/" for namespaced models).
 */ __turbopack_context__.s([
    "QUOTA_MODEL_PREFIX",
    ()=>QUOTA_MODEL_PREFIX,
    "isQuotaModelName",
    ()=>isQuotaModelName,
    "parseQuotaModelName",
    ()=>parseQuotaModelName,
    "quotaGroupSlug",
    ()=>quotaGroupSlug,
    "quotaModelName",
    ()=>quotaModelName,
    "quotaPoolSlug",
    ()=>quotaPoolSlug
]);
const QUOTA_MODEL_PREFIX = "qtSd/";
function quotaGroupSlug(name) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return slug.length > 0 ? slug : "pool";
}
function quotaPoolSlug(poolName) {
    return quotaGroupSlug(poolName);
}
function quotaModelName(groupName, provider, model) {
    return `${QUOTA_MODEL_PREFIX}${quotaGroupSlug(groupName)}/${provider}/${model}`;
}
function parseQuotaModelName(name) {
    if (!name.startsWith(QUOTA_MODEL_PREFIX)) {
        return null;
    }
    // rest = "<groupSlug>/<provider>/<model>" (after "qtSd/")
    const rest = name.slice(QUOTA_MODEL_PREFIX.length);
    const parts = rest.split("/");
    // Need at least: groupSlug, provider, model  → 3 parts in rest
    if (parts.length < 3) {
        return null;
    }
    const groupSlug = parts[0];
    const provider = parts[1];
    const model = parts.slice(2).join("/");
    if (groupSlug.length === 0 || provider.length === 0 || model.length === 0) {
        return null;
    }
    return {
        groupSlug,
        provider,
        model
    };
}
function isQuotaModelName(name) {
    return name.startsWith(QUOTA_MODEL_PREFIX);
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuotaEndpointsCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/emailPrivacyStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/quotaModelNaming.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
// ─────────────────────────────────────────────────────────────────────────────
// Representative model list per provider (same constant as PoolWizard)
// ─────────────────────────────────────────────────────────────────────────────
const PREVIEW_MODELS_BY_PROVIDER = {
    openai: [
        "gpt-4o",
        "gpt-4o-mini",
        "o3",
        "gpt-4-turbo"
    ],
    anthropic: [
        "claude-opus-4-5",
        "claude-sonnet-4-5",
        "claude-haiku-3-5"
    ],
    gemini: [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.0-flash"
    ],
    cx: [
        "gpt-5.4-mini",
        "gpt-5.4",
        "o3"
    ],
    codex: [
        "codex-mini-latest",
        "codex-latest"
    ],
    glm: [
        "glm-4",
        "glm-4v",
        "glm-z1-airx"
    ],
    minimax: [
        "minimax-m1",
        "minimax-text-01"
    ],
    kimi: [
        "moonshot-v1-8k",
        "moonshot-v1-32k"
    ],
    default: [
        "model-a",
        "model-b",
        "model-c"
    ]
};
const MAX_MODELS_SHOWN = 3;
function getPreviewModels(provider) {
    return PREVIEW_MODELS_BY_PROVIDER[provider] ?? PREVIEW_MODELS_BY_PROVIDER["default"];
}
function QuotaEndpointsCard({ groups, pools, connections, apiKeys }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaShare");
    const emailsVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((s)=>s.emailsVisible);
    const [selectedKeyId, setSelectedKeyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [previewModels, setPreviewModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingPreview, setLoadingPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [realCombos, setRealCombos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Fetch the REAL minted qtSd/* combo names so the default (no-key) view shows
    // actual models instead of the representative PREVIEW_MODELS_BY_PROVIDER
    // placeholders (model-a/b/c for providers not in the hardcoded map).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let alive = true;
        void fetch("/api/combos").then((r)=>r.ok ? r.json() : null).then((body)=>{
            if (!alive) return;
            const names = Array.isArray(body?.combos) ? body.combos.map((c)=>typeof c.name === "string" ? c.name : "").filter((n)=>n.length > 0 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isQuotaModelName"])(n)) : [];
            setRealCombos(names);
        }).catch(()=>{
            if (alive) setRealCombos(null);
        });
        return ()=>{
            alive = false;
        };
    }, []);
    // Anthropic-format providers (claude*/anthropic) can be called on the native
    // Messages endpoint too, so we surface POST /v1/messages when one is in scope.
    const isAnthropicProvider = (provider)=>provider === "anthropic" || provider.startsWith("claude");
    const hasAnthropic = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const provs = new Set();
        for (const pool of pools){
            for (const cid of pool.connectionIds ?? [
                pool.connectionId
            ]){
                const conn = connections.find((c)=>c.id === cid);
                if (conn) provs.add(conn.provider);
            }
        }
        return [
            ...provs
        ].some(isAnthropicProvider);
    }, [
        pools,
        connections
    ]);
    // Responses-API providers (codex / github gpt-5.x / openai-compatible *responses*)
    // are callable on POST /v1/responses (codex is also reachable over the WS proxy
    // at the same path). conn.provider holds canonical slugs ("codex"/"github").
    const isResponsesProvider = (provider)=>provider === "codex" || provider === "github" || provider.includes("responses");
    const hasResponses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const provs = new Set();
        for (const pool of pools){
            for (const cid of pool.connectionIds ?? [
                pool.connectionId
            ]){
                const conn = connections.find((c)=>c.id === cid);
                if (conn) provs.add(conn.provider);
            }
        }
        return [
            ...provs
        ].some(isResponsesProvider);
    }, [
        pools,
        connections
    ]);
    // The Responses-over-WebSocket proxy is wired EXCLUSIVELY to codex, so the WS
    // endpoint line only shows when a codex connection is in scope.
    const hasCodex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const provs = new Set();
        for (const pool of pools){
            for (const cid of pool.connectionIds ?? [
                pool.connectionId
            ]){
                const conn = connections.find((c)=>c.id === cid);
                if (conn) provs.add(conn.provider);
            }
        }
        return provs.has("codex");
    }, [
        pools,
        connections
    ]);
    // ── Derive default model list from groups + pools + connections ──────────────
    // For each group, collect all pools that belong to it, then for each pool's
    // providers (from connectionIds), generate qtSd/<groupSlug>/<provider>/<model>
    // using the same PREVIEW_MODELS_BY_PROVIDER map that PoolWizard uses.
    //
    // This is a REPRESENTATIVE list — the full list is served by /v1/models.
    const defaultByGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return groups.map((group)=>{
            const groupPools = pools.filter((p)=>(p.groupId ?? "group-demo") === group.id);
            // Collect unique providers for this group
            const providerSet = new Set();
            for (const pool of groupPools){
                const cids = pool.connectionIds ?? [
                    pool.connectionId
                ];
                for (const cid of cids){
                    const conn = connections.find((c)=>c.id === cid);
                    if (conn) providerSet.add(conn.provider);
                }
            }
            const entries = Array.from(providerSet).map((provider)=>{
                const previewModelIds = getPreviewModels(provider);
                const models = previewModelIds.slice(0, MAX_MODELS_SHOWN).map((m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["quotaModelName"])(group.name, provider, m));
                return {
                    provider,
                    models
                };
            });
            return {
                group,
                entries
            };
        });
    }, [
        groups,
        pools,
        connections
    ]);
    // Real qtSd combos grouped by group → provider (preferred over placeholders).
    const realByGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!realCombos || realCombos.length === 0) return null;
        const byGroupSlug = new Map();
        for (const name of realCombos){
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseQuotaModelName"])(name);
            if (!parsed) continue;
            if (!byGroupSlug.has(parsed.groupSlug)) byGroupSlug.set(parsed.groupSlug, new Map());
            const provMap = byGroupSlug.get(parsed.groupSlug);
            if (!provMap.has(parsed.provider)) provMap.set(parsed.provider, []);
            provMap.get(parsed.provider).push(name);
        }
        return groups.map((group)=>{
            const provMap = byGroupSlug.get((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["quotaGroupSlug"])(group.name));
            if (!provMap) return null;
            const entries = [
                ...provMap.entries()
            ].map(([provider, models])=>({
                    provider,
                    models
                }));
            return {
                group,
                entries
            };
        }).filter((g)=>g !== null);
    }, [
        realCombos,
        groups
    ]);
    // Default (no-key) view prefers the real combos; falls back to placeholders
    // only when the combos fetch failed or returned nothing.
    const viewByGroup = realByGroup ?? defaultByGroup;
    // ── Key name with optional email masking ─────────────────────────────────────
    const keyLabel = (key)=>{
        const raw = key.name || key.id.slice(0, 12) + "…";
        return emailsVisible ? raw : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maskEmailLikeValue"])(raw);
    };
    // ── Key selector handler ─────────────────────────────────────────────────────
    const handleKeyChange = async (keyId)=>{
        setSelectedKeyId(keyId);
        if (!keyId) {
            setPreviewModels(null);
            return;
        }
        setLoadingPreview(true);
        try {
            const res = await fetch(`/api/quota/keys/${keyId}/models`);
            if (res.ok) {
                const body = await res.json();
                setPreviewModels(Array.isArray(body.models) ? body.models : []);
            } else {
                setPreviewModels([]);
            }
        } catch  {
            setPreviewModels([]);
        } finally{
            setLoadingPreview(false);
        }
    };
    // ── Compute the combined default model count across all groups ────────────────
    const hasAnyDefaultModels = viewByGroup.some((g)=>g.entries.some((e)=>e.models.length > 0));
    // ── Render ───────────────────────────────────────────────────────────────────
    const hasData = groups.length > 0 && pools.length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        padding: "sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-3 flex-wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5",
                                children: "api"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                lineNumber: 285,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-semibold text-text-main",
                                        children: t("endpointsTitle")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 289,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-text-muted mt-0.5 max-w-lg",
                                        children: t("endpointsHint")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 290,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                lineNumber: 288,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                        lineNumber: 284,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 shrink-0",
                        children: [
                            apiKeys.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-xs text-text-muted whitespace-nowrap",
                                        children: t("previewForKey")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 298,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: selectedKeyId,
                                        onChange: (e)=>void handleKeyChange(e.target.value),
                                        className: "px-2 py-1 rounded border border-border bg-bg-base text-xs text-text-main min-w-[140px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: t("previewKeyNone")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                                lineNumber: 306,
                                                columnNumber: 17
                                            }, this),
                                            apiKeys.map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: k.id,
                                                    children: keyLabel(k)
                                                }, k.id, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                                    lineNumber: 308,
                                                    columnNumber: 19
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 301,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setCollapsed((c)=>!c),
                                title: collapsed ? t("endpointsExpand") : t("endpointsCollapse"),
                                "aria-label": collapsed ? t("endpointsExpand") : t("endpointsCollapse"),
                                className: "p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-main transition-colors cursor-pointer",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[18px]",
                                    children: collapsed ? "expand_more" : "expand_less"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                    lineNumber: 322,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                lineNumber: 315,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                        lineNumber: 295,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                lineNumber: 283,
                columnNumber: 7
            }, this),
            !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 rounded-md bg-bg-subtle/50 border border-border/40 px-3 py-2 space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 flex-wrap",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] uppercase tracking-wide text-text-muted font-semibold shrink-0",
                                        children: t("endpointsBaseUrl")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 334,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-xs text-primary font-mono",
                                        children: "POST /v1/chat/completions"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 337,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-text-muted mx-1",
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 338,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-xs text-text-muted font-mono",
                                        children: 'model: "qtSd/<group>/<provider>/<model>"'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 339,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                lineNumber: 333,
                                columnNumber: 9
                            }, this),
                            hasAnthropic && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 flex-wrap",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] uppercase tracking-wide text-text-muted font-semibold shrink-0",
                                        children: t("endpointsBaseUrl")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 345,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-xs text-primary font-mono",
                                        children: "POST /v1/messages"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 348,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-text-muted mx-1",
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 349,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-xs text-text-muted font-mono",
                                        children: 'model: "qtSd/<group>/<provider>/<model>"'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 350,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-text-muted",
                                        children: [
                                            "(",
                                            t("endpointsAnthropicNote"),
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 353,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                lineNumber: 344,
                                columnNumber: 11
                            }, this),
                            hasResponses && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 flex-wrap",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] uppercase tracking-wide text-text-muted font-semibold shrink-0",
                                        children: t("endpointsBaseUrl")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 358,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-xs text-primary font-mono",
                                        children: "POST /v1/responses"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 361,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-text-muted mx-1",
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 362,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-xs text-text-muted font-mono",
                                        children: 'model: "qtSd/<group>/<provider>/<model>"'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 363,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-text-muted",
                                        children: [
                                            "(",
                                            t("endpointsResponsesNote"),
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 366,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                lineNumber: 357,
                                columnNumber: 11
                            }, this),
                            hasCodex && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 flex-wrap",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] uppercase tracking-wide text-text-muted font-semibold shrink-0",
                                        children: t("endpointsBaseUrl")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 371,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-xs text-primary font-mono",
                                        children: "WS /v1/responses"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 374,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-text-muted mx-1",
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 375,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-xs text-text-muted font-mono",
                                        children: 'model: "qtSd/<group>/codex/<model>"'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 376,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-text-muted",
                                        children: [
                                            "(",
                                            t("endpointsWsNote"),
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 379,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                lineNumber: 370,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                        lineNumber: 332,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3",
                        children: loadingPreview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs text-text-muted animate-pulse py-2",
                            children: t("loading")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                            lineNumber: 387,
                            columnNumber: 11
                        }, this) : previewModels !== null ? // Per-key preview from the API
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: previewModels.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted italic",
                                children: t("noAllocations")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                lineNumber: 392,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "space-y-0.5",
                                children: previewModels.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            className: "text-[11px] font-mono text-text-main bg-bg-subtle/40 rounded px-1.5 py-0.5 inline-block",
                                            children: m
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                            lineNumber: 397,
                                            columnNumber: 21
                                        }, this)
                                    }, m, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                        lineNumber: 396,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                lineNumber: 394,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                            lineNumber: 390,
                            columnNumber: 11
                        }, this) : hasData && hasAnyDefaultModels ? // Default view: grouped by group → provider → real qtSd model ids
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: viewByGroup.map(({ group, entries })=>{
                                if (entries.length === 0) return null;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1.5 mb-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[13px] text-text-muted",
                                                    children: "folder"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                                    lineNumber: 413,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[11px] font-semibold text-text-muted uppercase tracking-wide",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["quotaGroupSlug"])(group.name)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                                    lineNumber: 416,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                            lineNumber: 412,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-1 pl-4",
                                            children: entries.map(({ provider, models })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-0.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] text-text-muted font-medium",
                                                            children: provider
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                                            lineNumber: 423,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                            className: "space-y-0.5",
                                                            children: models.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                        className: "text-[11px] font-mono text-text-main bg-bg-subtle/40 rounded px-1.5 py-0.5 inline-block",
                                                                        children: m
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                                                        lineNumber: 427,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, m, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                                                    lineNumber: 426,
                                                                    columnNumber: 29
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                                            lineNumber: 424,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, provider, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                                    lineNumber: 422,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                            lineNumber: 420,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, group.id, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                    lineNumber: 411,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                            lineNumber: 407,
                            columnNumber: 11
                        }, this) : // No pools yet — show the format placeholder
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs text-text-muted italic",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                    className: "font-mono text-[11px]",
                                    children: "qtSd/<groupSlug>/<provider>/<model>"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                                    lineNumber: 443,
                                    columnNumber: 13
                                }, this),
                                " — ",
                                t("emptyDescription")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                            lineNumber: 442,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
                        lineNumber: 385,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx",
        lineNumber: 281,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/DimensionBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DimensionBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function fmtCountdown(ms) {
    if (ms <= 0) return "now";
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor(ms % 3_600_000 / 60_000);
    if (h >= 24) {
        const d = Math.floor(h / 24);
        return `${d}d ${h % 24}h`;
    }
    return `${h}h ${m}m`;
}
function DimensionBar({ dimension, consumedTotal, resetAt }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaShare");
    // Capture mount time once — avoids impure Date.now() call on every render
    const [now] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>Date.now());
    const usedPct = dimension.limit > 0 ? Math.min(consumedTotal / dimension.limit * 100, 100) : 0;
    const barColor = usedPct >= 90 ? "bg-red-500" : usedPct >= 70 ? "bg-amber-400" : "bg-primary";
    const resetMs = resetAt ? new Date(resetAt).getTime() - now : null;
    const countdown = resetMs !== null && resetMs > 0 ? fmtCountdown(resetMs) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1 min-w-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between text-[10px] text-text-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-semibold uppercase tracking-wide",
                        children: [
                            dimension.unit,
                            " / ",
                            dimension.window
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/DimensionBar.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "tabular-nums font-bold",
                        style: {
                            color: usedPct >= 90 ? "#f87171" : usedPct >= 70 ? "#fbbf24" : undefined
                        },
                        children: [
                            Math.round(usedPct),
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/DimensionBar.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/DimensionBar.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-1.5 rounded-sm bg-black/6 dark:bg-white/6 overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `h-full rounded-sm transition-all ${barColor}`,
                    style: {
                        width: `${usedPct}%`
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/DimensionBar.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/DimensionBar.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            countdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[10px] text-text-muted",
                children: [
                    t("dimensionResetIn"),
                    " ",
                    countdown
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/DimensionBar.tsx",
                lineNumber: 56,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/DimensionBar.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AllocationTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
"use client";
;
;
const SLICE_PALETTE = [
    "#a78bfa",
    "#60a5fa",
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#22d3ee",
    "#f472b6",
    "#94a3b8"
];
function AllocationTable({ allocations, usage, keyLabels }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaShare");
    if (allocations.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-[11px] text-text-muted italic py-3 text-center bg-bg-subtle/40 rounded-md",
            children: t("noAllocations")
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, this);
    }
    // Build per-key consumption lookup from first dimension (primary)
    const primaryDim = usage?.dimensions?.[0];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "overflow-x-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "w-full text-[11px]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        className: "text-[10px] uppercase tracking-wide text-text-muted border-b border-border/40",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "text-left py-1 pr-2 font-semibold",
                                children: t("apiKeyColumn")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                lineNumber: 44,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "text-right py-1 pr-2 font-semibold",
                                children: t("weightColumn")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                lineNumber: 45,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "text-right py-1 pr-2 font-semibold",
                                children: t("realConsumedColumn")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                lineNumber: 46,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "text-right py-1 pr-2 font-semibold",
                                children: t("deficitColumn")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                lineNumber: 47,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "text-right py-1 font-semibold",
                                children: t("policy")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                lineNumber: 48,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: allocations.map((alloc, i)=>{
                        const color = SLICE_PALETTE[i % SLICE_PALETTE.length];
                        const label = keyLabels[alloc.apiKeyId] || alloc.apiKeyId.slice(0, 12) + "…";
                        const perKeyData = primaryDim?.perKey?.find((k)=>k.apiKeyId === alloc.apiKeyId);
                        const consumed = perKeyData?.consumed ?? null;
                        const fairShare = perKeyData?.fairShare ?? null;
                        const deficit = perKeyData !== undefined ? perKeyData.deficit : null;
                        const borrowing = perKeyData?.borrowing ?? false;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            className: "border-b border-border/20 last:border-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "py-1.5 pr-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-block w-2.5 h-2.5 rounded-sm shrink-0",
                                                style: {
                                                    background: color
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                                lineNumber: 66,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono truncate text-text-main",
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                                lineNumber: 70,
                                                columnNumber: 21
                                            }, this),
                                            borrowing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold shrink-0",
                                                title: t("borrowingIndicator"),
                                                children: t("borrowingIndicator")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                                lineNumber: 72,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                        lineNumber: 65,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                    lineNumber: 64,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "py-1.5 pr-2 text-right font-bold tabular-nums",
                                    style: {
                                        color
                                    },
                                    children: [
                                        alloc.weight,
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                    lineNumber: 81,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "py-1.5 pr-2 text-right tabular-nums text-text-muted",
                                    children: consumed !== null ? consumed.toLocaleString() : "—"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                    lineNumber: 84,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "py-1.5 pr-2 text-right tabular-nums",
                                    children: [
                                        deficit !== null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: deficit > 0 ? "text-red-400" : deficit < 0 ? "text-emerald-400" : "text-text-muted",
                                            children: [
                                                deficit > 0 ? "+" : "",
                                                deficit.toLocaleString()
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                            lineNumber: 89,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-text-muted",
                                            children: "—"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                            lineNumber: 102,
                                            columnNumber: 21
                                        }, this),
                                        fairShare !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[9px] text-text-muted ml-1",
                                            children: [
                                                "(",
                                                t("fairShareShort"),
                                                ": ",
                                                fairShare.toLocaleString(),
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                            lineNumber: 105,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                    lineNumber: 87,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "py-1.5 text-right",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-[9px] px-1.5 py-0.5 rounded font-semibold ${alloc.policy === "hard" ? "bg-red-500/10 text-red-400" : alloc.policy === "soft" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`,
                                        children: t(`policy${alloc.policy[0].toUpperCase()}${alloc.policy.slice(1)}`)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                        lineNumber: 111,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                                    lineNumber: 110,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, alloc.apiKeyId, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                            lineNumber: 63,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
            lineNumber: 41,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/BurnRateChart.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BurnRateChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
;
"use client";
;
;
const BurnRateChartInner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/BurnRateChartInner.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
function BurnRateChart({ usage }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BurnRateChartInner, {
        usage: usage
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/BurnRateChart.tsx",
        lineNumber: 15,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/StackedAllocationBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StackedAllocationBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
"use client";
;
;
const PALETTE = [
    "#a78bfa",
    "#60a5fa",
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#22d3ee",
    "#f472b6",
    "#94a3b8"
];
function StackedAllocationBar({ allocations, usage, keyLabels, dimensionIndex = 0 }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaShare");
    if (allocations.length === 0) {
        return null;
    }
    // Build a map of apiKeyId → { consumed, fairShare } from the relevant dimension
    const perKeyMap = {};
    if (usage) {
        const dim = usage.dimensions?.[dimensionIndex];
        if (dim) {
            for (const entry of dim.perKey ?? []){
                perKeyMap[entry.apiKeyId] = {
                    consumed: entry.consumed,
                    fairShare: entry.fairShare
                };
            }
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                className: "text-[10px] uppercase tracking-wide font-bold text-text-muted mb-1.5",
                children: t("stackedBarTitle")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/StackedAllocationBar.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-3 rounded overflow-hidden w-full mb-2",
                children: allocations.map((alloc, i)=>{
                    const color = PALETTE[i % PALETTE.length];
                    const keyUsage = perKeyMap[alloc.apiKeyId];
                    let consumedPercent = null;
                    if (keyUsage && keyUsage.fairShare > 0) {
                        consumedPercent = Math.round(keyUsage.consumed / keyUsage.fairShare * 100);
                    }
                    const label = keyLabels[alloc.apiKeyId] ?? alloc.apiKeyId;
                    const tooltipText = consumedPercent !== null ? `${label}: ${alloc.weight}% (${t("usedSuffix", {
                        percent: consumedPercent
                    })})` : `${label}: ${alloc.weight}%`;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: `${alloc.weight}%`,
                            backgroundColor: color
                        },
                        title: tooltipText,
                        "aria-label": tooltipText
                    }, alloc.apiKeyId, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/StackedAllocationBar.tsx",
                        lineNumber: 71,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/StackedAllocationBar.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-x-3 gap-y-1",
                children: allocations.map((alloc, i)=>{
                    const color = PALETTE[i % PALETTE.length];
                    const keyUsage = perKeyMap[alloc.apiKeyId];
                    let consumedPercent = null;
                    if (keyUsage && keyUsage.fairShare > 0) {
                        consumedPercent = Math.round(keyUsage.consumed / keyUsage.fairShare * 100);
                    }
                    const label = keyLabels[alloc.apiKeyId] ?? alloc.apiKeyId;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex items-center gap-1 text-[10px] text-text-muted",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-block w-2 h-2 rounded-sm shrink-0",
                                style: {
                                    backgroundColor: color
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/StackedAllocationBar.tsx",
                                lineNumber: 96,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    label,
                                    " ",
                                    alloc.weight,
                                    "%",
                                    consumedPercent !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-text-muted/70",
                                        children: [
                                            " ",
                                            "(",
                                            t("usedSuffix", {
                                                percent: consumedPercent
                                            }),
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/StackedAllocationBar.tsx",
                                        lineNumber: 103,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/StackedAllocationBar.tsx",
                                lineNumber: 100,
                                columnNumber: 15
                            }, this)
                        ]
                    }, alloc.apiKeyId, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/StackedAllocationBar.tsx",
                        lineNumber: 92,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/StackedAllocationBar.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/StackedAllocationBar.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/quotaParsing.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hasFixedQuotaOrder",
    ()=>hasFixedQuotaOrder,
    "parseQuotaData",
    ()=>parseQuotaData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-ssr] (ecmascript)");
;
;
const GLM_QUOTA_ORDER = {
    session: 0,
    weekly: 1,
    mcp_monthly: 2
};
const CODEX_QUOTA_ORDER = {
    session: 0,
    weekly: 1,
    gpt_5_3_codex_spark_session: 2,
    gpt_5_3_codex_spark_weekly: 3,
    banked_reset_credits: 4
};
const GLM_FAMILY_PROVIDERS = [
    "glm",
    "glm-cn",
    "glmt",
    "opencode-go"
];
function hasFixedQuotaOrder(providerId) {
    const id = String(providerId || "").toLowerCase();
    return id === "codex" || GLM_FAMILY_PROVIDERS.includes(id);
}
function quotaEntries(data) {
    return data?.quotas && typeof data.quotas === "object" ? Object.entries(data.quotas) : [];
}
function isUnlimitedEmpty(quota) {
    return Boolean(quota?.unlimited && (!quota?.total || quota.total <= 0));
}
function isPastResetWindow(resetAt) {
    if (!resetAt) return false;
    const resetTime = typeof resetAt === "number" ? resetAt : typeof resetAt === "string" ? Date.parse(resetAt) : NaN;
    return Number.isFinite(resetTime) && Date.now() >= resetTime;
}
function getResetAdjustedQuota(quota) {
    const usedRaw = Number(quota?.used || 0);
    const totalRaw = Number(quota?.total || 0);
    const total = Number.isFinite(totalRaw) ? totalRaw : 0;
    const remainingRaw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safePercentage"])(quota?.remainingPercentage);
    const hasPendingUsage = usedRaw > 0 || remainingRaw !== undefined && remainingRaw < 100;
    const staleAfterReset = isPastResetWindow(quota?.resetAt || null) && hasPendingUsage;
    return {
        staleAfterReset,
        total,
        used: staleAfterReset ? 0 : usedRaw,
        remainingPercentage: staleAfterReset && total > 0 ? 100 : remainingRaw
    };
}
function normalizeQuotaEntry(name, quota = {}, extras = {}) {
    const adjusted = getResetAdjustedQuota(quota);
    const remaining = Number(quota?.remaining);
    return {
        name,
        used: Number.isFinite(adjusted.used) ? adjusted.used : 0,
        total: adjusted.total,
        ...Number.isFinite(remaining) ? {
            remaining
        } : {},
        resetAt: quota?.resetAt || null,
        staleAfterReset: adjusted.staleAfterReset,
        ...adjusted.remainingPercentage !== undefined ? {
            remainingPercentage: adjusted.remainingPercentage
        } : {},
        ...quota?.extraCreditsInferred !== undefined ? {
            extraCreditsInferred: Number(quota.extraCreditsInferred) || 0
        } : {},
        ...quota?.overPlan !== undefined ? {
            overPlan: quota.overPlan === true
        } : {},
        ...quota?.displayName !== undefined ? {
            displayName: String(quota.displayName)
        } : {},
        ...quota?.isPercentageOnly !== undefined ? {
            isPercentageOnly: quota.isPercentageOnly === true
        } : {},
        ...extras
    };
}
function parseGeneric(data) {
    return quotaEntries(data).map(([name, quota])=>normalizeQuotaEntry(name, quota));
}
function parseGithub(data) {
    return quotaEntries(data).filter(([, quota])=>!isUnlimitedEmpty(quota)).map(([name, quota])=>normalizeQuotaEntry(name, quota));
}
function parseGlmFamily(data) {
    return quotaEntries(data).map(([name, quota])=>normalizeQuotaEntry(name, quota, {
            displayName: quota?.displayName,
            details: Array.isArray(quota?.details) ? quota.details : undefined,
            isPercentageOnly: Number(quota?.total || 0) === 100 && quota?.remainingPercentage !== undefined
        }));
}
function buildCreditsQuota(name, remaining, remainingPercentage, extra = {}) {
    return {
        name,
        used: 0,
        total: 0,
        remaining,
        resetAt: null,
        unlimited: false,
        isCredits: true,
        remainingPercentage,
        creditCount: remaining,
        ...extra
    };
}
function parseAntigravityQuota(modelKey, quota) {
    if (modelKey === "credits") {
        const remaining = Number(quota?.remaining ?? 0);
        return buildCreditsQuota("credits", remaining, remaining > 50 ? 100 : remaining > 10 ? 60 : 20);
    }
    if (modelKey === "models" || isUnlimitedEmpty(quota)) return null;
    return normalizeQuotaEntry(modelKey, quota, {
        modelKey,
        isPercentageOnly: quota?.fractionReported === true,
        ...quota?.quotaSource ? {
            quotaSource: quota.quotaSource
        } : {},
        ...quota?.fractionReported !== undefined ? {
            fractionReported: quota.fractionReported
        } : {}
    });
}
function parseAntigravity(data) {
    return quotaEntries(data).map(([modelKey, quota])=>parseAntigravityQuota(modelKey, quota)).filter(Boolean);
}
function buildBankedResetCreditsQuota(count) {
    return {
        name: "banked_reset_credits",
        used: 0,
        total: 0,
        remaining: count,
        resetAt: null,
        unlimited: false,
        isResetCredits: true,
        remainingPercentage: 100,
        creditCount: count
    };
}
function parseCodex(data) {
    const quotas = quotaEntries(data).map(([quotaType, quota])=>normalizeQuotaEntry(quotaType, quota, {
            displayName: quota?.displayName,
            isPercentageOnly: true
        }));
    const bankedResetCredits = Number(data?.bankedResetCredits);
    if (Number.isFinite(bankedResetCredits) && bankedResetCredits > 0) {
        quotas.push(buildBankedResetCreditsQuota(bankedResetCredits));
    }
    return quotas;
}
function buildClaudeExtraUsageQuota(extraUsage) {
    const monthlyLimit = Number(extraUsage?.monthly_limit ?? 0);
    const usedCredits = Number(extraUsage?.used_credits ?? 0);
    const utilization = Number(extraUsage?.utilization ?? 0);
    const remainingPercentage = Number.isFinite(utilization) ? Math.max(0, 100 - utilization) : undefined;
    const remaining = Number.isFinite(monthlyLimit) ? Math.max(0, monthlyLimit - usedCredits) : 0;
    return buildCreditsQuota("extra_usage", remaining, remainingPercentage ?? 100, {
        used: Number.isFinite(usedCredits) ? usedCredits : 0,
        total: Number.isFinite(monthlyLimit) ? monthlyLimit : 0,
        currency: extraUsage?.currency
    });
}
// #6806: some Claude plans (e.g. "default_raven_enterprise") return no
// five_hour/seven_day utilization windows at all — only a credit-billing
// extraUsage block — so quotas can be {} while extraUsage still holds real,
// actionable usage data. Fold it in instead of falling back to "No quota data".
function parseClaude(data) {
    if (data?.message) return [
        {
            name: "error",
            used: 0,
            total: 0,
            resetAt: null,
            message: data.message
        }
    ];
    const quotas = quotaEntries(data).map(([name, quota])=>normalizeQuotaEntry(name, quota, {
            isPercentageOnly: true
        }));
    if (data?.extraUsage?.is_enabled) {
        quotas.push(buildClaudeExtraUsageQuota(data.extraUsage));
    }
    return quotas;
}
function parseDeepseekQuota(quotaKey, quota) {
    const match = quotaKey.match(/^credits(?:_([a-z]{3}))?$/);
    if (!match) return normalizeQuotaEntry(quotaKey, quota);
    const remaining = Number(quota?.remaining ?? 0);
    const currency = quota?.currency ?? (match[1] ? match[1].toUpperCase() : "USD");
    return buildCreditsQuota(currency, remaining, remaining > 20 ? 100 : remaining > 5 ? 60 : 20, {
        currency
    });
}
function parseDeepseek(data) {
    return quotaEntries(data).map(([quotaKey, quota])=>parseDeepseekQuota(quotaKey, quota));
}
function parseProviderQuotas(providerId, data) {
    if (providerId === "github") return parseGithub(data);
    if ([
        "glm",
        "glm-cn",
        "glmt",
        "opencode-go"
    ].includes(providerId)) return parseGlmFamily(data);
    if (providerId === "antigravity" || providerId === "agy") return parseAntigravity(data);
    if (providerId === "codex") return parseCodex(data);
    if (providerId === "claude") return parseClaude(data);
    if (providerId === "deepseek") return parseDeepseek(data);
    return parseGeneric(data);
}
function sortProviderModelOrder(provider, quotas) {
    const modelOrder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getModelsByProviderId"])(provider);
    if (modelOrder.length === 0) return;
    const orderMap = new Map(modelOrder.map((m, i)=>[
            m.id,
            i
        ]));
    quotas.sort((a, b)=>(orderMap.get(a.modelKey || a.name) ?? 999) - (orderMap.get(b.modelKey || b.name) ?? 999));
}
function sortGlmOrder(providerId, quotas) {
    if (!GLM_FAMILY_PROVIDERS.includes(providerId)) return;
    quotas.sort((a, b)=>(GLM_QUOTA_ORDER[a.name] ?? 99) - (GLM_QUOTA_ORDER[b.name] ?? 99));
}
function sortCodexOrder(providerId, quotas) {
    if (providerId !== "codex") return;
    quotas.sort((a, b)=>(CODEX_QUOTA_ORDER[a.name] ?? 99) - (CODEX_QUOTA_ORDER[b.name] ?? 99));
}
function parseQuotaData(provider, data) {
    if (!data || typeof data !== "object") return [];
    const providerId = String(provider || "").toLowerCase();
    try {
        const normalizedQuotas = parseProviderQuotas(providerId, data);
        sortProviderModelOrder(provider, normalizedQuotas);
        sortGlmOrder(providerId, normalizedQuotas);
        sortCodexOrder(providerId, normalizedQuotas);
        return normalizedQuotas;
    } catch (error) {
        console.error(`Error parsing quota data for ${provider}:`, error);
        return [];
    }
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "STATUS_EMOJI",
    ()=>STATUS_EMOJI,
    "buildProviderLimitsResolvedPlans",
    ()=>buildProviderLimitsResolvedPlans,
    "buildProviderOptions",
    ()=>buildProviderOptions,
    "calculatePercentage",
    ()=>calculatePercentage,
    "collectHiddenQuotaModelIds",
    ()=>collectHiddenQuotaModelIds,
    "compareProviderGroups",
    ()=>compareProviderGroups,
    "compareQuotaConnections",
    ()=>compareQuotaConnections,
    "computeCanEditCutoff",
    ()=>computeCanEditCutoff,
    "computeCanRedeemResetCredit",
    ()=>computeCanRedeemResetCredit,
    "filterHiddenModelQuotas",
    ()=>filterHiddenModelQuotas,
    "filterQuotasByVisibility",
    ()=>filterQuotasByVisibility,
    "formatCountdown",
    ()=>formatCountdown,
    "formatQuotaLabel",
    ()=>formatQuotaLabel,
    "formatResetTime",
    ()=>formatResetTime,
    "getBarColor",
    ()=>getBarColor,
    "getHiddenQuotaRows",
    ()=>getHiddenQuotaRows,
    "getNextResetSummary",
    ()=>getNextResetSummary,
    "getQuotaRemainingPercentage",
    ()=>getQuotaRemainingPercentage,
    "getQuotaVisibilityKey",
    ()=>getQuotaVisibilityKey,
    "getStatusColor",
    ()=>getStatusColor,
    "getStatusEmoji",
    ()=>getStatusEmoji,
    "hasQuotaCutoffOverrides",
    ()=>hasQuotaCutoffOverrides,
    "isPercentageOnlyQuota",
    ()=>isPercentageOnlyQuota,
    "matchesProviderFilter",
    ()=>matchesProviderFilter,
    "normalizePlanTier",
    ()=>normalizePlanTier,
    "resolvePlanValue",
    ()=>resolvePlanValue,
    "shouldShowQuotaUsageCount",
    ()=>shouldShowQuotaUsageCount,
    "topQuotas",
    ()=>topQuotas,
    "worstStatus",
    ()=>worstStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/quotaParsing.ts [app-ssr] (ecmascript)");
;
;
const PROVIDER_PLAN_FALLBACKS = new Set([
    "claude code",
    "kimi coding",
    "kiro",
    "amazon q",
    "openai codex",
    "codex",
    "github copilot"
]);
const QUOTA_LABEL_MAP = {
    chat: "Chat",
    completions: "Completions",
    premium_interactions: "Premium",
    session: "Session",
    weekly: "Weekly",
    code_review: "Code Review",
    code_review_weekly: "Code Review Weekly",
    gpt_5_3_codex_spark_session: "GPT-5.3-Codex-Spark Session",
    gpt_5_3_codex_spark_weekly: "GPT-5.3-Codex-Spark Weekly",
    agentic_request: "Agentic",
    agentic_request_freetrial: "Agentic (Trial)",
    credits: "AI Credits",
    models: "Models",
    mcp_monthly: "Monthly",
    "search-prime": "Web Search",
    "web-reader": "Web Reader",
    zread: "Zread",
    "5 Hours Quota": "5 Hours",
    "Weekly Quota": "Weekly",
    "Monthly Tools": "Monthly Tools",
    tokens: "Tokens",
    time_limit: "Time Limit",
    banked_reset_credits: "Banked Reset Credits",
    gemini_weekly: "Gemini Weekly",
    claude_gpt_weekly: "Claude & GPT Weekly"
};
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function isClaudeOrganizationTypeLabel(value) {
    return /^default_claude(?:_ai)?$/i.test(value.trim());
}
function normalizePlanCandidate(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.toLowerCase() === "unknown") return null;
    if (PROVIDER_PLAN_FALLBACKS.has(trimmed.toLowerCase())) return null;
    if (isClaudeOrganizationTypeLabel(trimmed)) return null;
    return trimmed;
}
function escapeRegExpToken(token) {
    return token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Match tier tokens as whole words (avoids MINIMAX → Max, APPROVE → Pro, etc.). */ function hasTierToken(upper, token) {
    const escaped = escapeRegExpToken(token.toUpperCase());
    const pattern = new RegExp(`(?:^|[^A-Z])${escaped}(?:[^A-Z]|$)`);
    return pattern.test(upper);
}
function toTitleCaseWords(value) {
    return value.split(/[\s_-]+/).filter(Boolean).map((part)=>part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function formatQuotaLabel(name) {
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) return "";
    const mapped = QUOTA_LABEL_MAP[trimmed];
    if (mapped) return mapped;
    if (/^session\s*\(\d+[hm]\)$/i.test(trimmed)) {
        return "Session";
    }
    if (/^weekly\s*\(\d+d\)$/i.test(trimmed)) {
        return "Weekly";
    }
    const weeklyModelMatch = trimmed.match(/^weekly\s+(.+?)\s*\(\d+d\)$/i);
    if (weeklyModelMatch) {
        return `Weekly ${toTitleCaseWords(weeklyModelMatch[1])}`;
    }
    return trimmed;
}
function formatResetTime(date) {
    if (!date) return "-";
    try {
        const resetDate = typeof date === "string" ? new Date(date) : date;
        const now = new Date();
        const diffMs = resetDate - now;
        if (diffMs <= 0) return "-";
        const totalMinutes = Math.ceil(diffMs / (1000 * 60));
        // < 60 minutes: show only minutes
        if (totalMinutes < 60) {
            return `${totalMinutes}m`;
        }
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        // < 24 hours: show hours and minutes
        if (totalHours < 24) {
            return `${totalHours}h ${remainingMinutes}m`;
        }
        // >= 24 hours: show days, hours, and minutes
        const days = Math.floor(totalHours / 24);
        const remainingHours = totalHours % 24;
        return `${days}d ${remainingHours}h ${remainingMinutes}m`;
    } catch (error) {
        return "-";
    }
}
function getStatusColor(percentage) {
    if (percentage > 70) return "green";
    if (percentage >= 30) return "yellow";
    return "red"; // 0-29% including 0% (out of quota) - show red
}
function getStatusEmoji(percentage) {
    if (percentage > 70) return "🟢";
    if (percentage >= 30) return "🟡";
    return "🔴"; // 0-29% including 0% (out of quota) - show red
}
function calculatePercentage(used, total) {
    if (!total || total === 0) return 0;
    if (!used || used < 0) return 100;
    if (used >= total) return 0;
    return Math.round((total - used) / total * 100);
}
function resolvePlanValue(plan, providerSpecificData, providerId) {
    const livePlan = normalizePlanCandidate(plan);
    if (String(providerId || "").toLowerCase() === "grok-cli") return livePlan || null;
    const psd = toRecord(providerSpecificData);
    const persistedCandidates = [
        psd.workspacePlanType,
        psd.plan,
        psd.subscriptionTier,
        psd.subscription,
        psd.tier,
        psd.accountTier,
        // Claude OAuth bootstrap: rate_limit_tier has the Max 5x/20x multiplier.
        psd.organizationRateLimitTier,
        psd.rateLimitTier,
        psd.organizationType,
        // Codex OAuth bootstrap: chatgpt_plan_type is captured at import time
        // (src/lib/oauth/services/codexImport.ts) and is the only source of the
        // plan when the live Codex usage endpoint omits plan_type/planType (the
        // usage service then reports the literal string "unknown" — see
        // open-sse/services/usage/codex.ts).
        psd.chatgptPlanType
    ];
    if (livePlan && normalizePlanTier(livePlan).key !== "free") {
        return livePlan;
    }
    for (const candidate of persistedCandidates){
        const normalized = normalizePlanCandidate(candidate);
        if (normalized) return normalized;
    }
    return livePlan || null;
}
function buildProviderLimitsResolvedPlans(connections, quotaData) {
    const out = {};
    for (const conn of connections){
        out[conn.id] = resolvePlanValue(quotaData[conn.id]?.plan, conn.providerSpecificData, conn.provider);
    }
    return out;
}
function unknownPlanTier(raw = null) {
    return {
        key: "unknown",
        label: "Unknown",
        variant: "default",
        rank: 0,
        raw
    };
}
function formatUnknownPlanLabel(raw) {
    return raw.toLowerCase().split(/[\s_-]+/).map((part)=>part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function matchClaudePlanTier(raw, upper) {
    const match = upper.match(/(?:DEFAULT_)?CLAUDE_(MAX|PRO|TEAM|ENTERPRISE|FREE)(?:_(\d+X))?/);
    if (!match) return null;
    const multiplier = match[2] ? ` ${match[2].toLowerCase()}` : "";
    const tiers = {
        MAX: {
            key: "ultra",
            label: `Max${multiplier}`,
            variant: "success",
            rank: 4,
            raw
        },
        PRO: {
            key: "pro",
            label: "Pro",
            variant: "success",
            rank: 3,
            raw
        },
        TEAM: {
            key: "team",
            label: "Team",
            variant: "info",
            rank: 6,
            raw
        },
        ENTERPRISE: {
            key: "enterprise",
            label: "Enterprise",
            variant: "info",
            rank: 7,
            raw
        },
        FREE: {
            key: "free",
            label: "Free",
            variant: "default",
            rank: 1,
            raw
        }
    };
    return tiers[match[1]];
}
function matchKeywordPlanTier(raw, upper) {
    if (upper.includes("PRO+") || upper.includes("PRO PLUS") || upper.includes("PROPLUS")) return {
        key: "plus",
        label: "Pro+",
        variant: "success",
        rank: 4,
        raw
    };
    if (upper.includes("ENTERPRISE") || upper.includes("CORP") || upper.includes("ORG")) return {
        key: "enterprise",
        label: "Enterprise",
        variant: "info",
        rank: 7,
        raw
    };
    if (upper.includes("TEAM") || upper.includes("CHATGPTTEAM")) return {
        key: "team",
        label: "Team",
        variant: "info",
        rank: 6,
        raw
    };
    if (upper.includes("BUSINESS") || upper.includes("STANDARD") || upper.includes("BIZ")) return {
        key: "business",
        label: "Business",
        variant: "warning",
        rank: 5,
        raw
    };
    if (upper.includes("STUDENT")) return {
        key: "pro",
        label: "Student",
        variant: "success",
        rank: 3,
        raw
    };
    if (upper.includes("ULTRA")) return {
        key: "ultra",
        label: "Ultra",
        variant: "success",
        rank: 4,
        raw
    };
    return null;
}
function matchTokenPlanTier(raw, upper) {
    if (hasTierToken(upper, "MAX")) return {
        key: "ultra",
        label: "Max",
        variant: "success",
        rank: 4,
        raw
    };
    if (hasTierToken(upper, "PRO") || hasTierToken(upper, "PREMIUM")) return {
        key: "pro",
        label: "Pro",
        variant: "success",
        rank: 3,
        raw
    };
    if (hasTierToken(upper, "STARTER")) return {
        key: "lite",
        label: "Starter",
        variant: "primary",
        rank: 2,
        raw
    };
    if (hasTierToken(upper, "LITE") || hasTierToken(upper, "LIGHT")) return {
        key: "lite",
        label: "Lite",
        variant: "primary",
        rank: 2,
        raw
    };
    if (hasTierToken(upper, "PLUS") || hasTierToken(upper, "PAID")) return {
        key: "plus",
        label: "Plus",
        variant: "success",
        rank: 2,
        raw
    };
    return null;
}
function matchFreePlanTier(raw, upper) {
    return upper.includes("FREE") || upper.includes("BASIC") || upper.includes("TRIAL") || upper.includes("LEGACY") ? {
        key: "free",
        label: "Free",
        variant: "default",
        rank: 1,
        raw
    } : null;
}
function normalizePlanTier(plan) {
    const raw = typeof plan === "string" ? plan.trim() : "";
    if (!raw) return unknownPlanTier(null);
    const upper = raw.toUpperCase();
    // Provider names that are not real plan tiers — treat as unknown
    if (PROVIDER_PLAN_FALLBACKS.has(raw.toLowerCase())) return unknownPlanTier(raw);
    // Match Anthropic bootstrap strings (claude_max, default_claude_max_20x, etc.)
    // before the generic PRO/TEAM checks so underscored values don't fall through.
    const matched = matchClaudePlanTier(raw, upper) || matchKeywordPlanTier(raw, upper) || matchTokenPlanTier(raw, upper) || matchFreePlanTier(raw, upper);
    return matched || {
        ...unknownPlanTier(raw),
        label: formatUnknownPlanLabel(raw) || "Unknown"
    };
}
function computeCanEditCutoff(quotas) {
    return quotas.some((q)=>q && typeof q.name === "string" && !q.isCredits);
}
function computeCanRedeemResetCredit(provider, quotas) {
    return provider === "codex" && quotas.some((q)=>q?.isResetCredits && Number(q.creditCount ?? q.remaining ?? 0) > 0);
}
function hasQuotaCutoffOverrides(connection) {
    const overrides = connection.quotaWindowThresholds || null;
    return !!overrides && Object.keys(overrides).length > 0;
}
const STATUS_EMOJI = {
    critical: "🔴",
    alert: "🟡",
    ok: "🟢",
    empty: "⚪"
};
const QUOTA_BAR_GREEN_THRESHOLD = 50;
const QUOTA_BAR_YELLOW_THRESHOLD = 20;
function quotaRemainingPercent(q) {
    return getQuotaRemainingPercentage(q);
}
function quotaStatus(q) {
    const pct = quotaRemainingPercent(q);
    if (pct <= QUOTA_BAR_YELLOW_THRESHOLD) return "critical";
    if (pct <= QUOTA_BAR_GREEN_THRESHOLD) return "alert";
    return "ok";
}
function worstStatus(quotas) {
    if (!quotas || quotas.length === 0) return "empty";
    let worst = "ok";
    for (const q of quotas){
        const s = quotaStatus(q);
        if (s === "critical") return "critical";
        if (s === "alert" && worst === "ok") worst = "alert";
    }
    return worst;
}
const STATUS_ORDER = {
    critical: 0,
    alert: 1,
    ok: 2
};
function topQuotas(quotas, n = 3, providerId) {
    const filtered = quotas.filter(Boolean);
    // Providers with a deterministic fixed-window order (codex, glm family — see
    // quotaParsing.ts's sortCodexOrder()/sortGlmOrder()) must keep the order
    // parseQuotaData() already established rather than being re-sorted by
    // status/remaining-%, which would undo it (#6687's collapsed-card sibling, #7764).
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasFixedQuotaOrder"])(providerId)) {
        return filtered.slice(0, n);
    }
    return [
        ...filtered
    ].sort((a, b)=>{
        const sa = STATUS_ORDER[quotaStatus(a)];
        const sb = STATUS_ORDER[quotaStatus(b)];
        if (sa !== sb) return sa - sb;
        return quotaRemainingPercent(a) - quotaRemainingPercent(b);
    }).slice(0, n);
}
function getQuotaRemainingPercentage(q) {
    if (q?.unlimited) return 100;
    if (q?.remainingPercentage !== undefined) return Number(q.remainingPercentage);
    return calculatePercentage(q?.used, q?.total);
}
function isPercentageOnlyQuota(q) {
    return q?.isPercentageOnly === true || q?.fractionReported === true;
}
function shouldShowQuotaUsageCount(q) {
    const total = Number(q?.total || 0);
    return total > 0 && q?.unlimited !== true && !isPercentageOnlyQuota(q);
}
function getBarColor(remainingPercentage) {
    if (remainingPercentage > QUOTA_BAR_GREEN_THRESHOLD) {
        return {
            bar: "#22c55e",
            text: "#22c55e",
            bg: "rgba(34,197,94,0.12)"
        };
    }
    if (remainingPercentage > QUOTA_BAR_YELLOW_THRESHOLD) {
        return {
            bar: "#eab308",
            text: "#eab308",
            bg: "rgba(234,179,8,0.12)"
        };
    }
    return {
        bar: "#ef4444",
        text: "#ef4444",
        bg: "rgba(239,68,68,0.12)"
    };
}
function formatCountdown(resetAt) {
    if (!resetAt) return null;
    try {
        const diff = new Date(resetAt).getTime() - Date.now();
        if (diff <= 0) return null;
        const h = Math.floor(diff / 3_600_000);
        const m = Math.floor(diff % 3_600_000 / 60_000);
        if (h >= 24) {
            const d = Math.floor(h / 24);
            return `${d}d ${h % 24}h ${m}m`;
        }
        return `${h}h ${m}m`;
    } catch  {
        return null;
    }
}
function getNextResetSummary(quotas) {
    if (!quotas || quotas.length === 0) return null;
    const now = Date.now();
    let soonest = Number.POSITIVE_INFINITY;
    let soonestIso = null;
    for (const q of quotas){
        if (!q?.resetAt) continue;
        const ts = new Date(q.resetAt).getTime();
        if (!Number.isFinite(ts) || ts <= now) continue;
        if (ts < soonest) {
            soonest = ts;
            soonestIso = typeof q.resetAt === "string" ? q.resetAt : new Date(ts).toISOString();
        }
    }
    return soonestIso ? formatCountdown(soonestIso) : null;
}
function addQuotaModelIdVariants(out, provider, modelId) {
    const raw = modelId.trim().toLowerCase();
    const providerId = provider.trim().toLowerCase();
    if (!raw) return;
    out.add(raw);
    if (!providerId) return;
    const prefix = `${providerId}/`;
    if (raw.startsWith(prefix)) {
        const stripped = raw.slice(prefix.length);
        if (stripped) out.add(stripped);
    } else {
        out.add(`${providerId}/${raw}`);
    }
}
function collectHiddenQuotaModelIds(provider, payload) {
    const hidden = new Set();
    const data = toRecord(payload);
    const collect = (entries)=>{
        if (!Array.isArray(entries)) return;
        for (const entry of entries){
            const record = toRecord(entry);
            if (record.isHidden !== true && record.isDeleted !== true) continue;
            if (typeof record.id === "string") addQuotaModelIdVariants(hidden, provider, record.id);
        }
    };
    collect(data.models);
    collect(data.modelCompatOverrides);
    return Array.from(hidden);
}
function filterHiddenModelQuotas(provider, quotas, hiddenModelIds) {
    if (!Array.isArray(quotas)) return [];
    if (!hiddenModelIds || hiddenModelIds.length === 0) return quotas;
    const hidden = new Set(hiddenModelIds.map((id)=>id.trim().toLowerCase()).filter((id)=>id.length > 0));
    if (hidden.size === 0) return quotas;
    return quotas.filter((quota)=>{
        if (!quota || quota.isCredits) return true;
        const modelId = typeof quota.modelKey === "string" ? quota.modelKey : typeof quota.modelId === "string" ? quota.modelId : "";
        if (!modelId) return true;
        const candidates = new Set();
        addQuotaModelIdVariants(candidates, provider, modelId);
        return !Array.from(candidates).some((candidate)=>hidden.has(candidate));
    });
}
function getQuotaVisibilityKey(quota) {
    if (!quota || typeof quota !== "object") return "";
    return String(quota.modelKey || quota.name || "").trim();
}
function getProviderHiddenQuotaSet(provider, quotaVisibility) {
    const hidden = quotaVisibility?.[provider]?.hidden;
    return new Set(Array.isArray(hidden) ? hidden.map(String) : []);
}
function filterQuotasByVisibility(provider, quotas = [], quotaVisibility = {}) {
    if (!Array.isArray(quotas) || quotas.length === 0) return [];
    const hidden = getProviderHiddenQuotaSet(provider, quotaVisibility);
    if (hidden.size === 0) return quotas;
    return quotas.filter((quota)=>!hidden.has(getQuotaVisibilityKey(quota)));
}
function getHiddenQuotaRows(provider, quotas = [], quotaVisibility = {}) {
    if (!Array.isArray(quotas) || quotas.length === 0) return [];
    const hidden = getProviderHiddenQuotaSet(provider, quotaVisibility);
    if (hidden.size === 0) return [];
    return quotas.filter((quota)=>hidden.has(getQuotaVisibilityKey(quota)));
}
function matchesProviderFilter(connection, providerFilter) {
    if (!providerFilter || providerFilter === "all") return true;
    if (!connection || typeof connection.provider !== "string") return false;
    return connection.provider === providerFilter;
}
function buildProviderOptions(connections, compare = (a, b)=>a.localeCompare(b)) {
    const seen = new Set();
    for (const conn of connections){
        if (conn && typeof conn.provider === "string" && conn.provider) {
            seen.add(conn.provider);
        }
    }
    return Array.from(seen).sort(compare);
}
/** Label/name key: providers-page `getProviderSortLabel` — case-insensitive display name. */ function quotaConnLabel(conn) {
    const name = typeof conn.name === "string" ? conn.name : "";
    const provider = typeof conn.provider === "string" ? conn.provider : "";
    return (name || provider).toLowerCase();
}
/** Technical tiebreak key: providers-page `providerId.localeCompare(...)` — ASCII on purpose. */ function quotaConnTiebreak(conn) {
    const email = typeof conn.email === "string" ? conn.email : "";
    const id = typeof conn.id === "string" ? conn.id : String(conn.id ?? "");
    return email || id;
}
function providerRank(provider, providerOrder) {
    const key = typeof provider === "string" ? provider : "";
    return providerOrder[key] ?? 99;
}
function compareQuotaConnections(a, b, opts) {
    const cmp = opts.compare ?? ((x, y)=>x.localeCompare(y));
    const labels = opts.providerLabels ?? {};
    const ra = providerRank(a.provider, opts.providerOrder);
    const rb = providerRank(b.provider, opts.providerOrder);
    if (ra !== rb) return ra - rb;
    const pa = typeof a.provider === "string" ? a.provider : "";
    const pb = typeof b.provider === "string" ? b.provider : "";
    const providerLabelCmp = cmp(labels[pa] ?? pa, labels[pb] ?? pb);
    if (providerLabelCmp !== 0) return providerLabelCmp;
    if (pa !== pb) return pa < pb ? -1 : 1;
    if (opts.accountCompare) {
        const acc = opts.accountCompare(a, b);
        if (acc !== 0) return acc;
    }
    const accountLabelCmp = cmp(quotaConnLabel(a), quotaConnLabel(b));
    if (accountLabelCmp !== 0) return accountLabelCmp;
    const ta = quotaConnTiebreak(a);
    const tb = quotaConnTiebreak(b);
    return ta < tb ? -1 : ta > tb ? 1 : 0;
}
function compareProviderGroups(a, b, opts) {
    const cmp = opts.compare ?? ((x, y)=>x.localeCompare(y));
    const labels = opts.providerLabels ?? {};
    const ra = providerRank(a, opts.providerOrder);
    const rb = providerRank(b, opts.providerOrder);
    if (ra !== rb) return ra - rb;
    const labelCmp = cmp(labels[a] ?? a, labels[b] ?? b);
    if (labelCmp !== 0) return labelCmp;
    return a < b ? -1 : a > b ? 1 : 0;
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AccountQuotaRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ProviderIcon.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/emailPrivacyStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/quotaParsing.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
/** Aggregate the worst-remaining quota across all quotas for a connection. */ function summarizeQuotas(provider, raw) {
    if (!raw || typeof raw !== "object") return null;
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseQuotaData"])(provider, raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    let worst = null;
    let closestResetAt = null;
    let closestResetMs = Number.POSITIVE_INFINITY;
    const now = Date.now();
    for (const q of parsed){
        if (!q || q.unlimited) continue;
        const pct = q.remainingPercentage !== undefined ? Number(q.remainingPercentage) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calculatePercentage"])(q.used, q.total);
        if (!Number.isFinite(pct)) continue;
        if (worst === null || pct < worst) worst = pct;
        if (q.resetAt) {
            const ts = new Date(q.resetAt).getTime();
            if (Number.isFinite(ts) && ts > now && ts < closestResetMs) {
                closestResetMs = ts;
                closestResetAt = typeof q.resetAt === "string" ? q.resetAt : new Date(ts).toISOString();
            }
        }
    }
    if (worst === null) return null;
    return {
        pct: Math.round(worst),
        resetAt: closestResetAt
    };
}
function PctDot({ pct }) {
    const color = pct <= 20 ? "bg-red-500" : pct <= 50 ? "bg-yellow-500" : "bg-emerald-500";
    const textColor = pct <= 20 ? "text-red-500" : pct <= 50 ? "text-yellow-500" : "text-emerald-500";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center gap-1 tabular-nums text-[11px] ${textColor}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `w-1.5 h-1.5 rounded-full shrink-0 ${color}`,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            pct,
            "%"
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
function AccountQuotaRow({ provider, providers, connectionIds }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaShare");
    const emailsVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((s)=>s.emailsVisible);
    // Keyed by connectionId
    const [caches, setCaches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let alive = true;
        fetch("/api/usage/provider-limits").then((r)=>r.ok ? r.json() : null).then((data)=>{
            if (!alive) return;
            const map = data?.caches;
            setCaches(map && typeof map === "object" ? map : {});
        }).catch(()=>{
            if (alive) setError(true);
        });
        return ()=>{
            alive = false;
        };
    }, []);
    // Resolve the effective connection list to display
    const ids = Array.isArray(connectionIds) && connectionIds.length > 0 ? connectionIds : [];
    // Resolve provider for each connection (providers[i] matches connectionIds[i])
    const providerFor = (index)=>Array.isArray(providers) && providers[index] != null ? providers[index] : provider;
    const renderFallback = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-[11px] text-text-muted tabular-nums",
            children: t("accountQuotaNone")
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
            lineNumber: 123,
            columnNumber: 5
        }, this);
    if (error || caches === null) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-2 pt-2 border-t border-border/30",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[10px] uppercase tracking-wide font-bold text-text-muted block mb-1",
                    children: t("accountQuotaTitle")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                    lineNumber: 131,
                    columnNumber: 9
                }, this),
                renderFallback()
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
            lineNumber: 130,
            columnNumber: 7
        }, this);
    }
    // If no connectionIds, nothing to display
    if (ids.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-2 pt-2 border-t border-border/30",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[10px] uppercase tracking-wide font-bold text-text-muted block mb-1",
                    children: t("accountQuotaTitle")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                    lineNumber: 143,
                    columnNumber: 9
                }, this),
                renderFallback()
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
            lineNumber: 142,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-2 pt-2 border-t border-border/30",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] uppercase tracking-wide font-bold text-text-muted block mb-1.5",
                children: t("accountQuotaTitle")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                lineNumber: 153,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1",
                children: ids.map((connId, idx)=>{
                    const raw = caches?.[connId];
                    const prov = providerFor(idx);
                    const summary = summarizeQuotas(prov, raw);
                    const reset = summary?.resetAt ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatCountdown"])(summary.resetAt) : null;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 text-[11px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    providerId: prov,
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                                    lineNumber: 166,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                                lineNumber: 165,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-text-muted truncate max-w-[90px]",
                                title: emailsVisible ? connId : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maskEmailLikeValue"])(connId),
                                children: emailsVisible ? `${connId.slice(0, 8)}…` : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maskEmailLikeValue"])(connId)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                                lineNumber: 168,
                                columnNumber: 15
                            }, this),
                            summary ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PctDot, {
                                        pct: summary.pct
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                                        lineNumber: 173,
                                        columnNumber: 19
                                    }, this),
                                    reset ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-text-muted",
                                        children: [
                                            "· ",
                                            reset
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                                        lineNumber: 175,
                                        columnNumber: 21
                                    }, this) : null
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-text-muted",
                                children: t("accountQuotaNone")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                                lineNumber: 179,
                                columnNumber: 17
                            }, this)
                        ]
                    }, connId, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                        lineNumber: 164,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
                lineNumber: 156,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx",
        lineNumber: 152,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UsageLogCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function formatTime(epochMs) {
    try {
        return new Date(epochMs).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    } catch  {
        return String(epochMs);
    }
}
function UsageLogCard({ poolId, keyLabels }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaShare");
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [events, setEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loaded, setLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) return;
        let alive = true;
        fetch(`/api/quota/pools/${poolId}/log`).then((r)=>r.ok ? r.json() : null).then((data)=>{
            if (!alive) return;
            const raw = data?.events;
            setEvents(Array.isArray(raw) ? raw : [] ?? []);
            setLoaded(true);
        }).catch(()=>{
            if (alive) {
                setEvents([] ?? []);
                setLoaded(true);
            }
        });
        return ()=>{
            alive = false;
        };
    }, [
        open,
        poolId
    ]);
    const keyLabel = (apiKeyId)=>keyLabels?.[apiKeyId] ?? apiKeyId.slice(0, 10) + "…";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-2 pt-2 border-t border-border/30",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setOpen((prev)=>!prev),
                className: "flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold text-text-muted hover:text-text-main w-full text-left cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `material-symbols-outlined text-[13px] transition-transform ${open ? "rotate-90" : ""}`,
                        children: "chevron_right"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    t("logTitle")
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-1.5",
                children: !loaded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-[11px] text-text-muted italic",
                    children: t("loading")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                    lineNumber: 84,
                    columnNumber: 13
                }, this) : events.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-[11px] text-text-muted italic",
                    children: t("logEmpty")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                    lineNumber: 86,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-1",
                    children: events.map((ev, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1.5 text-[11px] text-text-muted",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "tabular-nums text-text-muted/60 shrink-0 w-[52px]",
                                    children: formatTime(ev.updatedAt)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                                    lineNumber: 94,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "truncate max-w-[80px]",
                                    title: ev.apiKeyId,
                                    children: keyLabel(ev.apiKeyId)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                                    lineNumber: 97,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-text-muted/50",
                                    children: "·"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                                    lineNumber: 100,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "truncate max-w-[80px]",
                                    children: ev.unit
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                                    lineNumber: 101,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-text-muted/50",
                                    children: "·"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                                    lineNumber: 102,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "tabular-nums text-text-main/80",
                                    children: [
                                        ev.consumed.toFixed(0),
                                        " ",
                                        ev.window
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                                    lineNumber: 103,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, `${ev.apiKeyId}-${ev.dimensionKey}-${ev.bucketIndex}-${i}`, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                            lineNumber: 90,
                            columnNumber: 17
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                    lineNumber: 88,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
                lineNumber: 82,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PoolCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ProviderIcon.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/emailPrivacyStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$DimensionBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/DimensionBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$AllocationTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AllocationTable.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$BurnRateChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/BurnRateChart.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$StackedAllocationBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/StackedAllocationBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$AccountQuotaRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/AccountQuotaRow.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$UsageLogCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/UsageLogCard.tsx [app-ssr] (ecmascript)");
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
;
function computeStatus(usage) {
    const dims = usage?.dimensions ?? [];
    if (dims.length === 0) return "green";
    const utilizations = dims.map((d)=>d.limit > 0 ? d.consumedTotal / d.limit * 100 : 0);
    const avg = utilizations.reduce((s, u)=>s + u, 0) / utilizations.length;
    if (avg > 80) return "red";
    if (avg > 50) return "amber";
    return "green";
}
const STATUS_ICONS = {
    green: {
        icon: "check_circle",
        cls: "text-emerald-400"
    },
    amber: {
        icon: "warning",
        cls: "text-amber-400"
    },
    red: {
        icon: "error",
        cls: "text-red-400"
    }
};
function PoolCard({ pool, usage, keyLabels, connectionLabel, provider, providers, connectionIds, onEdit, onRemove }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaShare");
    const emailsVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((s)=>s.emailsVisible);
    const status = computeStatus(usage);
    const { icon: statusIcon, cls: statusCls } = STATUS_ICONS[status];
    const displayName = emailsVisible ? pool.name : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maskEmailLikeValue"])(pool.name);
    const displayConnectionLabel = emailsVisible ? connectionLabel : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maskEmailLikeValue"])(connectionLabel);
    // Check for plan dimensions from usage
    const hasDimensions = !!usage?.dimensions?.length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        padding: "md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-3 mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 min-w-0",
                        children: [
                            providers && providers.length > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-0.5 shrink-0",
                                children: [
                                    providers.slice(0, 3).map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-5 h-5 rounded flex items-center justify-center overflow-hidden bg-bg-subtle",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                providerId: p,
                                                size: 20,
                                                type: "color"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                                lineNumber: 87,
                                                columnNumber: 19
                                            }, this)
                                        }, p, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                            lineNumber: 83,
                                            columnNumber: 17
                                        }, this)),
                                    providers.length > 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-text-muted font-semibold ml-0.5",
                                        children: [
                                            "+",
                                            providers.length - 3
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                        lineNumber: 91,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-7 h-7 rounded-md flex items-center justify-center overflow-hidden shrink-0 bg-bg-subtle",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    providerId: provider,
                                    size: 28,
                                    type: "color"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                    lineNumber: 98,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                lineNumber: 97,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `material-symbols-outlined text-[16px] shrink-0 ${statusCls}`,
                                                children: statusIcon
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                                lineNumber: 103,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-bold text-text-main truncate",
                                                children: [
                                                    displayName,
                                                    " · ",
                                                    displayConnectionLabel
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                                lineNumber: 106,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                        lineNumber: 102,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[11px] text-text-muted",
                                        children: [
                                            t("allocationsCount", {
                                                count: pool.allocations.length
                                            }),
                                            " · ID: ",
                                            pool.id.slice(0, 12)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                        lineNumber: 110,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: onEdit,
                                title: t("editAllocations"),
                                className: "p-1.5 rounded-md hover:bg-bg-subtle text-text-muted hover:text-text-main cursor-pointer",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[16px]",
                                    children: "edit"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                lineNumber: 116,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: onRemove,
                                title: t("removePool"),
                                className: "p-1.5 rounded-md hover:bg-red-500/10 text-text-muted hover:text-red-400 cursor-pointer",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[16px]",
                                    children: "delete"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                    lineNumber: 130,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                                lineNumber: 124,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            hasDimensions ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-3 mb-3",
                style: {
                    gridTemplateColumns: `repeat(${Math.min(usage?.dimensions?.length ?? 0, 3)}, 1fr)`
                },
                children: (usage?.dimensions ?? []).map((dim, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$DimensionBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        dimension: {
                            unit: dim.unit,
                            window: dim.window,
                            limit: dim.limit
                        },
                        consumedTotal: dim.consumedTotal
                    }, `${dim.unit}-${dim.window}-${i}`, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                        lineNumber: 144,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                lineNumber: 137,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[11px] text-text-muted italic mb-3",
                children: [
                    t("multiDimensionLabel"),
                    " — ",
                    t("loading")
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                lineNumber: 152,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$StackedAllocationBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                allocations: pool.allocations,
                usage: usage,
                keyLabels: keyLabels
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        className: "text-[10px] uppercase tracking-wide font-bold text-text-muted mb-1.5",
                        children: "Allocations"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                        lineNumber: 166,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$AllocationTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        allocations: pool.allocations,
                        usage: usage,
                        keyLabels: keyLabels
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                        lineNumber: 169,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                lineNumber: 165,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$AccountQuotaRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                provider: provider,
                providers: providers,
                connectionIds: connectionIds
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this),
            usage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pt-2 border-t border-border/30",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$BurnRateChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    usage: usage
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                    lineNumber: 186,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                lineNumber: 185,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$UsageLogCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                poolId: pool.id,
                keyLabels: keyLabels
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
                lineNumber: 191,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript) <export default as Modal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/lib/quota/planRegistry.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getKnownPlan",
    ()=>getKnownPlan,
    "knownProviders",
    ()=>knownProviders
]);
const KNOWN_PLANS = {
    codex: {
        provider: "codex",
        dimensions: [
            {
                unit: "percent",
                window: "5h",
                limit: 100
            },
            {
                unit: "percent",
                window: "weekly",
                limit: 100
            }
        ]
    },
    // Claude Code (Pro / Max 5x / Max 20x) is a percentage-of-plan quota over a 5h
    // rolling window + a weekly cap, shared across Claude and Claude Code. The exact
    // token caps are not published and vary by task, so % is the practical unit; the
    // provider reports % used and fair-share attributes it across keys by local count.
    claude: {
        provider: "claude",
        dimensions: [
            {
                unit: "percent",
                window: "5h",
                limit: 100
            },
            {
                unit: "percent",
                window: "weekly",
                limit: 100
            }
        ]
    },
    glm: {
        provider: "glm",
        dimensions: [
            // limit=0 = desconhecido; documentado. Mantido para correta detecção pelo planResolver.
            // Sliding window / fair-share devem tratar limit=0 como "manual obrigatório".
            {
                unit: "tokens",
                window: "5h",
                limit: Number.EPSILON
            },
            {
                unit: "tokens",
                window: "weekly",
                limit: Number.EPSILON
            }
        ]
    },
    minimax: {
        provider: "minimax",
        // MiniMax token plan (platform.minimax.io/docs/token-plan): monthly allowance
        // enforced over 5h-rolling + weekly windows. Tiers (M3): Plus ~1.633B ($20),
        // Max ~5.053B ($50), Ultra ~9.796B ($120). EPSILON = pick your tier in "Limite".
        dimensions: [
            {
                unit: "tokens",
                window: "5h",
                limit: Number.EPSILON
            },
            {
                unit: "tokens",
                window: "weekly",
                limit: Number.EPSILON
            }
        ]
    },
    // DeepSeek is prepaid in USD — its balance API is already wired (deepseekQuotaFetcher)
    // and shown on the quota page. fair-share supports the `usd` unit (COUNTABLE_UNITS),
    // so set a USD budget here ("fixado por valor"); the proxy sums each key's USD cost.
    deepseek: {
        provider: "deepseek",
        dimensions: [
            {
                unit: "usd",
                window: "monthly",
                limit: Number.EPSILON
            }
        ]
    },
    bailian: {
        provider: "bailian",
        dimensions: [
            {
                unit: "percent",
                window: "5h",
                limit: 100
            },
            {
                unit: "percent",
                window: "weekly",
                limit: 100
            },
            {
                unit: "percent",
                window: "monthly",
                limit: 100
            }
        ]
    },
    kimi: {
        provider: "kimi",
        dimensions: [
            {
                unit: "requests",
                window: "hourly",
                limit: 1500
            }
        ]
    },
    // Kimi "coding" plan connections register under the `kimi-coding` slug, which
    // exposes no upstream balance API. EPSILON = "unknown, set the real plan limit
    // manually in the Wizard 'Limite' step" (same convention as glm/minimax).
    "kimi-coding": {
        provider: "kimi-coding",
        dimensions: [
            {
                unit: "tokens",
                window: "5h",
                limit: Number.EPSILON
            },
            {
                unit: "tokens",
                window: "weekly",
                limit: Number.EPSILON
            }
        ]
    },
    // Xiaomi MiMo token plan (platform.xiaomimimo.com/token-plan) is a MONTHLY
    // allowance with no balance API. Default seeds the "lite" plan's 4.1B-token
    // monthly cap so the Wizard pre-fills a usable fair-share limit; adjust in the
    // "Limite" step to match the connection's actual plan.
    "xiaomi-mimo": {
        provider: "xiaomi-mimo",
        dimensions: [
            {
                unit: "tokens",
                window: "monthly",
                limit: 4_100_000_000
            }
        ]
    },
    // Xiaomi MiMo Token Plan (token-plan-sgp): same MONTHLY allowance with no
    // balance API as the regular account plan. Adjust in the Wizard's "Limite"
    // step when the connection is on a different plan.
    "xiaomi-mimo-token-plan": {
        provider: "xiaomi-mimo-token-plan",
        dimensions: [
            {
                unit: "tokens",
                window: "monthly",
                limit: 4_100_000_000
            }
        ]
    },
    alibaba: {
        provider: "alibaba",
        dimensions: [
            {
                unit: "requests",
                window: "monthly",
                limit: 90_000
            }
        ]
    },
    // Grok Build (xAI) — rate limits from x-ratelimit-* headers:
    // Daily: 864 requests, 18M tokens (from API headers)
    // Weekly: derived from daily * 7
    // #6844: this static estimate is now the fallback used only when the live
    // grok-cli quota fetcher (open-sse/services/grokCliQuotaFetcher.ts) returns
    // null (both credentials missing and upstream fetch/parse failures fail
    // open to this static plan) — the shared weekly percent-based credit pool
    // it estimates is not observable from local request/token counters alone.
    "grok-cli": {
        provider: "grok-cli",
        dimensions: [
            {
                unit: "requests",
                window: "daily",
                limit: 864
            },
            {
                unit: "tokens",
                window: "daily",
                limit: 18_000_000
            },
            {
                unit: "requests",
                window: "weekly",
                limit: 6048
            },
            {
                unit: "tokens",
                window: "weekly",
                limit: 126_000_000
            }
        ]
    }
};
function getKnownPlan(provider) {
    return KNOWN_PLANS[provider] ?? null;
}
function knownProviders() {
    return Object.keys(KNOWN_PLANS);
}
}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>PoolWizard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * PoolWizard — 3-step guided pool creation wizard.
 *
 * Step 1 · Conta   — connection picker + pool name + default policy
 * Step 2 · Limite  — editable plan dimensions for the chosen connection (PUT /api/quota/plans/[id])
 * Step 3 · Chaves  — allocation rows + "exclusive" checkbox + quotaModelName preview
 *
 * On finish:
 *   1. POST /api/quota/pools           → get new pool id
 *   2. PUT  /api/quota/plans/[connId]  → only when user edited dimensions
 *   3. PATCH /api/quota/pools/[id]     → allocations + exclusive flag
 *
 * Visually mirrors BuildWizard's Stepper from the Playground.
 *
 * Phase C1 — Quota Share Redesign.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript) <export default as Modal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/emailPrivacyStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/planRegistry.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/quotaModelNaming.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
;
;
;
// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────
const UNIT_OPTIONS = [
    "percent",
    "requests",
    "tokens",
    "usd"
];
const WINDOW_OPTIONS = [
    "5h",
    "hourly",
    "daily",
    "weekly",
    "monthly"
];
const SLICE_PALETTE = [
    "#a78bfa",
    "#60a5fa",
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#22d3ee",
    "#f472b6",
    "#94a3b8"
];
/** A few representative model names to show in the preview. */ const PREVIEW_MODELS_BY_PROVIDER = {
    openai: [
        "gpt-4o",
        "gpt-4o-mini",
        "o3",
        "gpt-4-turbo"
    ],
    anthropic: [
        "claude-opus-4-5",
        "claude-sonnet-4-5",
        "claude-haiku-3-5"
    ],
    gemini: [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.0-flash"
    ],
    cx: [
        "gpt-5.4-mini",
        "gpt-5.4",
        "o3"
    ],
    codex: [
        "codex-mini-latest",
        "codex-latest"
    ],
    glm: [
        "glm-4",
        "glm-4v",
        "glm-z1-airx"
    ],
    minimax: [
        "minimax-m1",
        "minimax-text-01"
    ],
    kimi: [
        "moonshot-v1-8k",
        "moonshot-v1-32k"
    ],
    default: [
        "model-a",
        "model-b",
        "model-c"
    ]
};
function getPreviewModels(provider) {
    return PREVIEW_MODELS_BY_PROVIDER[provider] ?? PREVIEW_MODELS_BY_PROVIDER["default"];
}
// ────────────────────────────────────────────────────────────────────────────
// Stepper header (mirrors BuildWizard's Stepper)
// ────────────────────────────────────────────────────────────────────────────
function Stepper({ currentStep }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaShare");
    const steps = [
        {
            num: 1,
            label: t("wizardStep1Label")
        },
        {
            num: 2,
            label: t("wizardStep2Label")
        },
        {
            num: 3,
            label: t("wizardStep3Label")
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-0 px-4 py-3 border-b border-border bg-bg-alt shrink-0",
        children: steps.map((step, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center",
                children: [
                    idx > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `h-px w-8 mx-2 transition-colors ${currentStep > step.num ? "bg-primary" : "bg-border"}`
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                        lineNumber: 135,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold transition-colors ${currentStep === step.num ? "bg-primary text-white" : currentStep > step.num ? "bg-primary/20 text-primary" : "bg-border text-text-muted"}`,
                                children: currentStep > step.num ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[12px]",
                                    children: "check"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 152,
                                    columnNumber: 17
                                }, this) : step.num
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                lineNumber: 142,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-xs font-medium transition-colors ${currentStep === step.num ? "text-text-main" : "text-text-muted"}`,
                                children: step.label
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                lineNumber: 157,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                        lineNumber: 141,
                        columnNumber: 11
                    }, this)
                ]
            }, step.num, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                lineNumber: 133,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
        lineNumber: 131,
        columnNumber: 5
    }, this);
}
function PoolWizard({ open, onClose, onSaved, connections, apiKeys, plans, existingPoolConnectionIds, groups = [], selectedGroupId: initialGroupId = "group-demo", editPool, editPoolExclusive, connectionPoolName = {} }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaShare");
    const tPlans = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaPlans");
    const emailsVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((s)=>s.emailsVisible);
    // ── Wizard step ───────────────────────────────────────────────────────────
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    // ── Step 1 state ──────────────────────────────────────────────────────────
    // Multi-select: ordered array of selected connection IDs. First element is primary.
    const [connectionIds, setConnectionIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [poolName, setPoolName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [defaultPolicy, setDefaultPolicy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("hard");
    // ── Step 2 state ──────────────────────────────────────────────────────────
    const [editDimensions, setEditDimensions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [dimensionsEdited, setDimensionsEdited] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Step 3 state ──────────────────────────────────────────────────────────
    const [allocations, setAllocations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [exclusive, setExclusive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Group selection ───────────────────────────────────────────────────────
    const [groupId, setGroupId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialGroupId);
    // ── Saving ────────────────────────────────────────────────────────────────
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // ── Derived state ─────────────────────────────────────────────────────────
    // The first selected connection is the "primary" — used for plan fetch/PUT.
    const primaryConnectionId = connectionIds[0] ?? "";
    // ── Helpers ───────────────────────────────────────────────────────────────
    const connLabel = (c)=>{
        const detail = c.name || c.email || c.displayName || c.id.slice(0, 12);
        const maskedDetail = emailsVisible ? detail : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maskEmailLikeValue"])(detail);
        return `${c.provider} / ${maskedDetail}`;
    };
    const selectedConn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>connections.find((c)=>c.id === primaryConnectionId), [
        connections,
        primaryConnectionId
    ]);
    // Locked provider: once the first connection is selected, all subsequent
    // selections must use the same provider (single-provider rule, Task 3).
    const lockedProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const first = connections.find((c)=>c.id === connectionIds[0]);
        return first?.provider ?? null;
    }, [
        connections,
        connectionIds
    ]);
    const availableConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>connections.filter((c)=>!existingPoolConnectionIds.has(c.id) && (lockedProvider ? c.provider === lockedProvider : true)), [
        connections,
        existingPoolConnectionIds,
        lockedProvider
    ]);
    // ── Load dimensions when primary connection changes ───────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!primaryConnectionId) {
            setEditDimensions([]);
            setDimensionsEdited(false);
            return;
        }
        const existingPlan = plans[primaryConnectionId];
        if (existingPlan && existingPlan.dimensions.length > 0) {
            setEditDimensions([
                ...existingPlan.dimensions
            ]);
        } else {
            const catalogPlan = selectedConn ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planRegistry$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getKnownPlan"])(selectedConn.provider) : null;
            setEditDimensions(catalogPlan ? [
                ...catalogPlan.dimensions
            ] : []);
        }
        setDimensionsEdited(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        primaryConnectionId
    ]);
    // ── Reset wizard on open/close ────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) {
            // Closing: always reset to defaults.
            setStep(1);
            setConnectionIds([]);
            setPoolName("");
            setDefaultPolicy("hard");
            setEditDimensions([]);
            setDimensionsEdited(false);
            setAllocations([]);
            setExclusive(false);
            setError(null);
            setSaving(false);
            setGroupId(initialGroupId);
        } else if (editPool) {
            // Opening in edit mode: pre-fill from the existing pool.
            const ids = Array.isArray(editPool.connectionIds) && editPool.connectionIds.length > 0 ? editPool.connectionIds : [
                editPool.connectionId
            ];
            setConnectionIds(ids);
            setPoolName(editPool.name);
            setGroupId(editPool.groupId ?? initialGroupId);
            setAllocations(editPool.allocations ?? []);
            // Preserve the pool's current exclusivity state so editing an exclusive pool
            // doesn't silently un-exclusive it. Falls back to false only when not provided.
            setExclusive(editPoolExclusive ?? false);
            // Pre-load plan dimensions for the primary connection (same as create path).
            // dimensionsEdited stays false so the PUT is skipped unless the user actively edits.
            const primaryId = ids[0];
            const existingPlan = plans[primaryId];
            if (existingPlan && existingPlan.dimensions.length > 0) {
                setEditDimensions([
                    ...existingPlan.dimensions
                ]);
            } else {
                setEditDimensions([]);
            }
            setDimensionsEdited(false);
            setError(null);
            setSaving(false);
            setStep(1);
        }
    // When open && !editPool (create mode): the existing create-reset on close handles defaults.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        open,
        editPool,
        initialGroupId
    ]);
    // Keep the group <select> on a real, selectable option: if the inherited page
    // filter was "all" (or an unknown id), snap to the first real group once groups
    // load. Prevents persisting groupId="all" (which renders under no group → B1).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open || editPool) return;
        if (groups.length === 0) return;
        if (groupId === "all" || !groups.some((g)=>g.id === groupId)) {
            setGroupId(groups[0].id);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        open,
        editPool,
        groups
    ]);
    // ── Step 2 — dimension editors ────────────────────────────────────────────
    const addDimension = ()=>{
        setEditDimensions((prev)=>[
                ...prev,
                {
                    unit: "percent",
                    window: "daily",
                    limit: 100
                }
            ]);
        setDimensionsEdited(true);
    };
    const removeDimension = (i)=>{
        setEditDimensions((prev)=>prev.filter((_, idx)=>idx !== i));
        setDimensionsEdited(true);
    };
    const updateDimension = (i, patch)=>{
        setEditDimensions((prev)=>prev.map((d, idx)=>idx === i ? {
                    ...d,
                    ...patch
                } : d));
        setDimensionsEdited(true);
    };
    // ── Step 3 — allocation editors ───────────────────────────────────────────
    const totalWeight = allocations.reduce((s, a)=>s + (Number.isFinite(a.weight) ? a.weight : 0), 0);
    const availableKeys = apiKeys.filter((k)=>!allocations.some((a)=>a.apiKeyId === k.id));
    const keyLabel = (id)=>apiKeys.find((k)=>k.id === id)?.name || id.slice(0, 12) + "…";
    const addKey = (id)=>{
        setAllocations((prev)=>{
            const next = [
                ...prev,
                {
                    apiKeyId: id,
                    weight: 0,
                    policy: defaultPolicy
                }
            ];
            // Equal-split: after adding, recompute weights so no key starts at 0.
            const n = next.length;
            const each = Math.floor(100 / n);
            const remainder = 100 - each * n;
            return next.map((a, i)=>({
                    ...a,
                    weight: each + (i < remainder ? 1 : 0)
                }));
        });
    };
    const updateWeight = (id, value)=>{
        setAllocations((prev)=>prev.map((a)=>a.apiKeyId === id ? {
                    ...a,
                    weight: Math.max(0, Math.min(100, value))
                } : a));
    };
    const updateAllocationPolicy = (id, policy)=>{
        setAllocations((prev)=>prev.map((a)=>a.apiKeyId === id ? {
                    ...a,
                    policy
                } : a));
    };
    const updateCapValue = (id, capValue)=>{
        setAllocations((prev)=>prev.map((a)=>a.apiKeyId === id ? {
                    ...a,
                    capValue
                } : a));
    };
    const removeAllocation = (id)=>{
        setAllocations((prev)=>prev.filter((a)=>a.apiKeyId !== id));
    };
    const equalSplit = ()=>{
        if (allocations.length === 0) return;
        const each = Math.floor(100 / allocations.length);
        const remainder = 100 - each * allocations.length;
        setAllocations((prev)=>prev.map((a, i)=>({
                    ...a,
                    weight: each + (i < remainder ? 1 : 0)
                })));
    };
    // ── Preview model names ───────────────────────────────────────────────────
    // Per-provider preview: { provider, names[], totalModels }
    const previewByProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const name = poolName.trim();
        if (connectionIds.length === 0 || !name) return [];
        const MAX_PER_PROVIDER = 3;
        return connectionIds.map((cid)=>{
            const conn = connections.find((c)=>c.id === cid);
            if (!conn) return null;
            const allModels = getPreviewModels(conn.provider);
            const names = allModels.slice(0, MAX_PER_PROVIDER).map((m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["quotaModelName"])(name, conn.provider, m));
            return {
                provider: conn.provider,
                names,
                totalModels: allModels.length
            };
        }).filter(Boolean);
    }, [
        connectionIds,
        connections,
        poolName
    ]);
    // Flat list (for legacy single-provider path, kept for step-3 rendering simplicity)
    const previewNames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>previewByProvider.flatMap((p)=>p.names), [
        previewByProvider
    ]);
    // Default pool name uses provider slug — NOT the raw connection label/email.
    const effectivePoolName = poolName.trim() || (selectedConn ? selectedConn.provider : "");
    // ── Save sequence ─────────────────────────────────────────────────────────
    const handleFinish = async ()=>{
        if (!selectedConn || connectionIds.length === 0) return;
        setSaving(true);
        setError(null);
        // Never persist the "all" filter sentinel (or an unknown id) as a real group.
        // Fall back to the first real group — the seed "group-demo" always exists (migration 088).
        const resolvedGroupId = groupId && groupId !== "all" && groups.some((g)=>g.id === groupId) ? groupId : groups[0]?.id ?? "group-demo";
        try {
            if (!editPool) {
                // ── Create mode: POST → optional PUT → PATCH ──────────────────────
                // 1. POST /api/quota/pools → get new pool id
                const createRes = await fetch("/api/quota/pools", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        connectionId: primaryConnectionId,
                        connectionIds,
                        name: effectivePoolName,
                        allocations: [],
                        groupId: resolvedGroupId
                    })
                });
                if (!createRes.ok) {
                    const errBody = await createRes.json().catch(()=>null);
                    throw new Error(errBody?.error?.message || `POST /api/quota/pools failed: HTTP ${createRes.status}`);
                }
                const createData = await createRes.json();
                const newPoolId = createData.pool.id;
                // 2. PUT /api/quota/plans/[primaryConnectionId] — only when user edited dimensions
                if (dimensionsEdited && editDimensions.length > 0) {
                    const planRes = await fetch(`/api/quota/plans/${primaryConnectionId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            dimensions: editDimensions
                        })
                    });
                    if (!planRes.ok) {
                        const errBody = await planRes.json().catch(()=>null);
                        throw new Error(errBody?.error?.message || `PUT /api/quota/plans failed: HTTP ${planRes.status}`);
                    }
                }
                // 3. PATCH /api/quota/pools/[id] — allocations + exclusive flag
                const patchRes = await fetch(`/api/quota/pools/${newPoolId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        allocations,
                        exclusive
                    })
                });
                if (!patchRes.ok) {
                    const errBody = await patchRes.json().catch(()=>null);
                    throw new Error(errBody?.error?.message || `PATCH /api/quota/pools failed: HTTP ${patchRes.status}`);
                }
            } else {
                // ── Edit mode: single PATCH (folds name, groupId, connectionIds, allocations, exclusive)
                // + optional PUT for plan dimensions when user edited them.
                // 1. PATCH /api/quota/pools/[id] — all editable fields in one call
                const editPatchRes = await fetch(`/api/quota/pools/${editPool.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: effectivePoolName,
                        groupId: resolvedGroupId,
                        connectionIds,
                        allocations,
                        exclusive
                    })
                });
                if (!editPatchRes.ok) {
                    const errBody = await editPatchRes.json().catch(()=>null);
                    throw new Error(errBody?.error?.message || `PATCH /api/quota/pools failed: HTTP ${editPatchRes.status}`);
                }
                // 2. PUT /api/quota/plans/[primaryConnectionId] — only when user actually edited dimensions
                if (dimensionsEdited && editDimensions.length > 0) {
                    const planRes = await fetch(`/api/quota/plans/${primaryConnectionId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            dimensions: editDimensions
                        })
                    });
                    if (!planRes.ok) {
                        const errBody = await planRes.json().catch(()=>null);
                        throw new Error(errBody?.error?.message || `PUT /api/quota/plans failed: HTTP ${planRes.status}`);
                    }
                }
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create pool");
        } finally{
            setSaving(false);
        }
    };
    // ── Render ────────────────────────────────────────────────────────────────
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
        isOpen: true,
        onClose: onClose,
        title: editPool ? t("editPoolTitle") : t("wizardTitle"),
        size: "lg",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col",
            style: {
                minHeight: 420
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Stepper, {
                    currentStep: step
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                    lineNumber: 551,
                    columnNumber: 9
                }, this),
                step === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 p-4 space-y-4 overflow-y-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-sm font-semibold text-text-main mb-0.5",
                                    children: t("wizardStep1Title")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 557,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] text-text-muted",
                                    children: t("wizardStep1Subtitle")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 560,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 556,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-[11px] uppercase tracking-wide text-text-muted font-semibold block mb-1",
                                    children: t("wizardConnectionsLabel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 565,
                                    columnNumber: 15
                                }, this),
                                lockedProvider && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-amber-400 mb-1.5",
                                    children: [
                                        t("wizardSingleProviderNote"),
                                        " (",
                                        lockedProvider,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 569,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1.5 rounded border border-border bg-bg-base px-3 py-2 max-h-48 overflow-y-auto",
                                    children: [
                                        availableConnections.map((c)=>{
                                            const checked = connectionIds.includes(c.id);
                                            const isPrimary = connectionIds[0] === c.id;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 cursor-pointer select-none py-0.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: checked,
                                                        onChange: ()=>{
                                                            setConnectionIds((prev)=>{
                                                                if (prev.includes(c.id)) {
                                                                    const next = prev.filter((id)=>id !== c.id);
                                                                    if (next.length === 0) setPoolName("");
                                                                    return next;
                                                                } else {
                                                                    return [
                                                                        ...prev,
                                                                        c.id
                                                                    ];
                                                                }
                                                            });
                                                        },
                                                        className: "accent-primary w-3.5 h-3.5 shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                        lineNumber: 582,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm truncate",
                                                        children: connLabel(c)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                        lineNumber: 598,
                                                        columnNumber: 23
                                                    }, this),
                                                    isPrimary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0",
                                                        children: t("wizardPrimaryBadge")
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                        lineNumber: 600,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, c.id, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                lineNumber: 578,
                                                columnNumber: 21
                                            }, this);
                                        }),
                                        connections.filter((c)=>existingPoolConnectionIds.has(c.id)).map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 cursor-not-allowed select-none py-0.5 opacity-40",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        disabled: true,
                                                        checked: false,
                                                        readOnly: true,
                                                        className: "w-3.5 h-3.5 shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                        lineNumber: 614,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm truncate",
                                                        children: [
                                                            connLabel(c),
                                                            " ",
                                                            t("alreadyUsedSuffix"),
                                                            connectionPoolName[c.id] ? ` — ${connectionPoolName[c.id]}` : ""
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                        lineNumber: 621,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, c.id, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                lineNumber: 610,
                                                columnNumber: 21
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 573,
                                    columnNumber: 15
                                }, this),
                                connections.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-amber-400 mt-1",
                                    children: t("noEligibleConnections")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 629,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 564,
                            columnNumber: 13
                        }, this),
                        connectionIds.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-[11px] uppercase tracking-wide text-text-muted font-semibold block mb-1",
                                    children: t("wizardPoolNameLabel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 636,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: poolName,
                                    onChange: (e)=>setPoolName(e.target.value),
                                    placeholder: selectedConn ? selectedConn.provider : t("wizardPoolNamePlaceholder"),
                                    className: "w-full px-3 py-2 rounded border border-border bg-bg-base text-sm"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 639,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 635,
                            columnNumber: 15
                        }, this),
                        connectionIds.length > 0 && groups.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-[11px] uppercase tracking-wide text-text-muted font-semibold block mb-1",
                                    children: t("wizardGroupLabel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 654,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: groupId,
                                    onChange: (e)=>setGroupId(e.target.value),
                                    className: "w-full px-3 py-2 rounded border border-border bg-bg-base text-sm",
                                    children: groups.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: g.id,
                                            children: g.name
                                        }, g.id, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 663,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 657,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 653,
                            columnNumber: 15
                        }, this),
                        connectionIds.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-[11px] uppercase tracking-wide text-text-muted font-semibold block mb-1",
                                    children: t("policyLabel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 674,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-1",
                                    children: [
                                        "hard",
                                        "soft",
                                        "burst"
                                    ].map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setDefaultPolicy(p),
                                            className: `px-3 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${defaultPolicy === p ? "bg-primary/15 border-primary/40 text-primary font-semibold" : "border-border text-text-muted hover:text-text-main"}`,
                                            children: p === "hard" ? t("policyHard") : p === "soft" ? t("policySoft") : t("policyBurst")
                                        }, p, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 679,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 677,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 673,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end pt-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setStep(2),
                                disabled: connectionIds.length === 0,
                                className: "flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                                children: [
                                    t("wizardNext"),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px]",
                                        children: "arrow_forward"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                        lineNumber: 707,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                lineNumber: 701,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 700,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                    lineNumber: 555,
                    columnNumber: 11
                }, this),
                step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 p-4 space-y-4 overflow-y-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-sm font-semibold text-text-main mb-0.5",
                                    children: t("wizardStep2Title")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 717,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] text-text-muted",
                                    children: t("wizardStep2Subtitle")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 720,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 716,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-lg border border-border/40 bg-bg-subtle/10 p-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] uppercase tracking-wide font-bold text-text-muted",
                                            children: tPlans("dimensionLabel")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 726,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: addDimension,
                                            className: "text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[14px]",
                                                    children: "add"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                    lineNumber: 734,
                                                    columnNumber: 19
                                                }, this),
                                                tPlans("addDimension")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 729,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 725,
                                    columnNumber: 15
                                }, this),
                                editDimensions.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[11px] text-text-muted italic py-3 text-center",
                                    children: [
                                        tPlans("unconfiguredLabel"),
                                        " — ",
                                        tPlans("addDimension")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 740,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: editDimensions.map((dim, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid items-center gap-2",
                                            style: {
                                                gridTemplateColumns: "1fr 1fr 90px 24px"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: dim.unit,
                                                    onChange: (e)=>updateDimension(i, {
                                                            unit: e.target.value
                                                        }),
                                                    className: "px-2 py-1.5 rounded border border-border bg-bg-base text-xs",
                                                    children: UNIT_OPTIONS.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: u,
                                                            children: tPlans(`unitOptions.${u}`)
                                                        }, u, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                            lineNumber: 758,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                    lineNumber: 752,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: dim.window,
                                                    onChange: (e)=>updateDimension(i, {
                                                            window: e.target.value
                                                        }),
                                                    className: "px-2 py-1.5 rounded border border-border bg-bg-base text-xs",
                                                    children: WINDOW_OPTIONS.map((w)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: w,
                                                            children: tPlans(`windowOptions.${w}`)
                                                        }, w, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                            lineNumber: 771,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                    lineNumber: 763,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    min: 0,
                                                    value: dim.limit,
                                                    onChange: (e)=>updateDimension(i, {
                                                            limit: Number(e.target.value)
                                                        }),
                                                    placeholder: tPlans("limitLabel"),
                                                    className: "px-2 py-1.5 rounded border border-border bg-bg-base text-xs tabular-nums text-right"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                    lineNumber: 776,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>removeDimension(i),
                                                    className: "p-0.5 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 cursor-pointer",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "material-symbols-outlined text-[16px]",
                                                        children: "close"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                        lineNumber: 789,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                    lineNumber: 784,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 747,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 745,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 724,
                            columnNumber: 13
                        }, this),
                        dimensionsEdited && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[10px] text-amber-400",
                            children: t("wizardDimensionsEditedNotice")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 797,
                            columnNumber: 15
                        }, this),
                        connectionIds.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[10px] text-text-muted bg-bg-subtle/40 px-3 py-2 rounded border border-border/40",
                            children: t("wizardAdditionalConnectionsNote")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 802,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between pt-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setStep(1),
                                    className: "flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[16px]",
                                            children: "arrow_back"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 812,
                                            columnNumber: 17
                                        }, this),
                                        t("wizardBack")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 808,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setStep(3),
                                    className: "flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors",
                                    children: [
                                        t("wizardNext"),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[16px]",
                                            children: "arrow_forward"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 820,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 815,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 807,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                    lineNumber: 715,
                    columnNumber: 11
                }, this),
                step === 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 p-4 space-y-4 overflow-y-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-sm font-semibold text-text-main mb-0.5",
                                    children: t("wizardStep3Title")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 830,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] text-text-muted",
                                    children: t("wizardStep3Subtitle")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 833,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 829,
                            columnNumber: 13
                        }, this),
                        allocations.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-[12px] text-text-muted italic py-4 text-center bg-bg-subtle/40 rounded-md",
                            children: t("noKeysAdded")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 838,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: allocations.map((a, i)=>{
                                const color = SLICE_PALETTE[i % SLICE_PALETTE.length];
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid items-center gap-2",
                                    style: {
                                        gridTemplateColumns: "12px minmax(0,1fr) 70px 80px 90px 24px"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-block w-3 h-3 rounded-sm",
                                            style: {
                                                background: color
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 851,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[12px] font-mono truncate",
                                            children: keyLabel(a.apiKeyId)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 855,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            min: 0,
                                            max: 100,
                                            value: a.weight,
                                            onChange: (e)=>updateWeight(a.apiKeyId, Number(e.target.value)),
                                            className: "px-2 py-1 rounded border border-border bg-bg-base text-sm text-right tabular-nums",
                                            title: t("weightPercent")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 856,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            min: 0,
                                            value: a.capValue ?? "",
                                            onChange: (e)=>updateCapValue(a.apiKeyId, e.target.value ? Number(e.target.value) : undefined),
                                            placeholder: t("policyCapAbsolutePlaceholder"),
                                            className: "px-2 py-1 rounded border border-border bg-bg-base text-xs tabular-nums",
                                            title: t("policyCapAbsoluteLabel")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 865,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: a.policy,
                                            onChange: (e)=>updateAllocationPolicy(a.apiKeyId, e.target.value),
                                            className: "px-1 py-1 rounded border border-border bg-bg-base text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "hard",
                                                    children: t("policyHard")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                    lineNumber: 886,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "soft",
                                                    children: t("policySoft")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                    lineNumber: 887,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "burst",
                                                    children: t("policyBurst")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                    lineNumber: 888,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 879,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>removeAllocation(a.apiKeyId),
                                            className: "p-0.5 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 cursor-pointer",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[16px]",
                                                children: "close"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                lineNumber: 895,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 890,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, a.apiKeyId, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 846,
                                    columnNumber: 21
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 842,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between text-[11px] pt-1 border-t border-border/40",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `font-bold tabular-nums ${totalWeight === 100 ? "text-emerald-400" : totalWeight > 100 ? "text-red-400" : "text-amber-400"}`,
                                    children: [
                                        t("totalLabel", {
                                            percent: totalWeight
                                        }),
                                        " ",
                                        totalWeight > 100 && t("totalExceeded")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 905,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        availableKeys.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: "",
                                            onChange: (e)=>e.target.value && addKey(e.target.value),
                                            className: "px-2 py-1 rounded border border-border bg-bg-base text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: t("addKey")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                    lineNumber: 924,
                                                    columnNumber: 21
                                                }, this),
                                                availableKeys.map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: k.id,
                                                        children: k.name || k.id.slice(0, 12) + "…"
                                                    }, k.id, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                        lineNumber: 926,
                                                        columnNumber: 23
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 919,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                            variant: "secondary",
                                            size: "sm",
                                            onClick: equalSplit,
                                            disabled: allocations.length === 0,
                                            children: t("equalSplit")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 932,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 917,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 904,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex items-start gap-2 cursor-pointer select-none pt-1 border-t border-border/40",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: exclusive,
                                    onChange: (e)=>setExclusive(e.target.checked),
                                    className: "mt-0.5 accent-primary w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 945,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-semibold text-text-main",
                                            children: t("wizardExclusiveLabel")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 952,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] text-text-muted mt-0.5",
                                            children: t("wizardExclusiveHint")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 955,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 951,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 944,
                            columnNumber: 13
                        }, this),
                        previewByProvider.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-md border border-border/40 bg-bg-subtle/30 p-3 text-[11px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-semibold text-text-muted uppercase tracking-wide mb-1.5 text-[10px]",
                                    children: t("wizardPreviewLabel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 962,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: previewByProvider.map(({ provider, names, totalModels })=>{
                                        const extra = totalModels - names.length;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                previewByProvider.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[10px] uppercase tracking-wide text-text-muted font-semibold mb-0.5",
                                                    children: provider
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                    lineNumber: 971,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-0.5",
                                                    children: [
                                                        names.map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-mono text-text-main truncate",
                                                                children: name
                                                            }, name, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                                lineNumber: 977,
                                                                columnNumber: 29
                                                            }, this)),
                                                        extra > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-text-muted italic",
                                                            children: t("wizardPreviewMoreModels", {
                                                                count: extra
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                            lineNumber: 982,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                                    lineNumber: 975,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, provider, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 969,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 965,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 961,
                            columnNumber: 15
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[11px] text-red-400 bg-red-500/10 px-3 py-2 rounded",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 995,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between pt-2 border-t border-border/40",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setStep(2),
                                    disabled: saving,
                                    className: "flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-40",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[16px]",
                                            children: "arrow_back"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                            lineNumber: 1004,
                                            columnNumber: 17
                                        }, this),
                                        t("wizardBack")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 999,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    variant: "primary",
                                    size: "sm",
                                    onClick: ()=>void handleFinish(),
                                    disabled: totalWeight > 100 || saving,
                                    children: saving ? t("loading") : editPool ? t("saveChanges") : t("wizardCreatePool")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                                    lineNumber: 1007,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                            lineNumber: 998,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
                    lineNumber: 828,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
            lineNumber: 550,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx",
        lineNumber: 544,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>QuotaSharePageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/emailPrivacyStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$hooks$2f$usePools$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/hooks/usePools.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$hooks$2f$usePoolUsage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/hooks/usePoolUsage.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$hooks$2f$useLocalStoragePoolMigration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/hooks/useLocalStoragePoolMigration.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$hooks$2f$usePoolsUsageAggregate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/hooks/usePoolsUsageAggregate.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$QuotaConceptCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaConceptCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$QuotaEndpointsCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/QuotaEndpointsCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$PoolCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$PoolWizard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/costs/quota-share/components/PoolWizard.tsx [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$PoolWizard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$PoolWizard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
;
;
;
// ────────────────────────────────────────────────────────────────────────────
// Stat card helper
// ────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, tone }) {
    const color = tone === "amber" ? "text-amber-400" : tone === "red" ? "text-red-400" : tone === "green" ? "text-emerald-400" : "text-text-main";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg border border-border/40 bg-bg-subtle/30 px-4 py-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[10px] uppercase tracking-wide text-text-muted font-semibold",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `text-2xl font-bold tabular-nums leading-tight ${color}`,
                children: value
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
// ────────────────────────────────────────────────────────────────────────────
// Per-pool wrapper that fetches usage
// ────────────────────────────────────────────────────────────────────────────
function PoolCardWithUsage({ pool, keyLabels, connectionLabel, provider, providers, connectionIds, onEdit, onRemove }) {
    const { usage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$hooks$2f$usePoolUsage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePoolUsage"])(pool.id);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$PoolCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        pool: pool,
        usage: usage,
        keyLabels: keyLabels,
        connectionLabel: connectionLabel,
        provider: provider,
        providers: providers,
        connectionIds: connectionIds,
        onEdit: onEdit,
        onRemove: onRemove
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
function QuotaSharePageClient() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("quotaShare");
    const { pools, loading, mutate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$hooks$2f$usePools$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePools"])();
    const emailsVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((s)=>s.emailsVisible);
    // LS → DB migration hook (B22) — runs once, idempotent
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$hooks$2f$useLocalStoragePoolMigration$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLocalStoragePoolMigration"])({
        pools,
        mutate
    });
    const [connections, setConnections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [apiKeys, setApiKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [plans, setPlans] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [createOpen, setCreateOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [removeError, setRemoveError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // ── Group state ───────────────────────────────────────────────────────────
    const [groups, setGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedGroupId, setSelectedGroupId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("all");
    const [newGroupInput, setNewGroupInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [showNewGroupInput, setShowNewGroupInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [renaming, setRenaming] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Fetch side data once on mount ─────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        Promise.all([
            fetch("/api/providers/client").then((r)=>r.ok ? r.json() : null).catch(()=>null),
            fetch("/api/keys").then((r)=>r.ok ? r.json() : null).catch(()=>null),
            fetch("/api/quota/plans").then((r)=>r.ok ? r.json() : null).catch(()=>null)
        ]).then(([connsData, keysData, plansData])=>{
            if (cancelled) return;
            const conns = Array.isArray(connsData?.connections) ? connsData.connections : [];
            const keys = Array.isArray(keysData) ? keysData : keysData?.keys || [];
            setConnections(conns);
            setApiKeys(keys);
            if (Array.isArray(plansData)) {
                const planMap = {};
                for (const p of plansData){
                    if (p.connectionId) planMap[p.connectionId] = {
                        dimensions: p.dimensions,
                        source: p.source
                    };
                }
                setPlans(planMap);
            }
        }).catch(()=>{
        // fail open — side data not critical
        });
        return ()=>{
            cancelled = true;
        };
    }, []);
    // ── Fetch groups ──────────────────────────────────────────────────────────
    const fetchGroups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (options)=>{
        try {
            const res = await fetch("/api/quota/groups", {
                signal: options?.signal
            });
            if (res.ok) {
                const data = await res.json();
                if (options?.signal?.aborted) return;
                setGroups(Array.isArray(data.groups) ? data.groups : []);
            }
        } catch  {
            if (options?.signal?.aborted) return;
        // fail open — groups list not critical
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const controller = new AbortController();
        void Promise.resolve().then(()=>fetchGroups({
                signal: controller.signal
            }));
        return ()=>{
            controller.abort();
        };
    }, [
        fetchGroups
    ]);
    // ── Group actions ─────────────────────────────────────────────────────────
    const handleCreateGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const name = newGroupInput.trim();
        if (!name) return;
        try {
            const res = await fetch("/api/quota/groups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name
                })
            });
            if (res.ok) {
                const data = await res.json();
                await fetchGroups();
                setSelectedGroupId(data.group.id);
            }
        } catch  {
        // fail open
        }
        setNewGroupInput("");
        setShowNewGroupInput(false);
    }, [
        newGroupInput,
        fetchGroups
    ]);
    const handleRenameGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const name = prompt(t("groupNamePrompt"), groups.find((g)=>g.id === selectedGroupId)?.name ?? "");
        if (!name?.trim()) return;
        setRenaming(true);
        try {
            const res = await fetch(`/api/quota/groups/${selectedGroupId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name.trim()
                })
            });
            if (res.ok) {
                await fetchGroups();
            }
        } catch  {
        // fail open
        }
        setRenaming(false);
    }, [
        selectedGroupId,
        groups,
        fetchGroups,
        t
    ]);
    // Delete the selected group. The API blocks deletion while the group still has
    // pools (HTTP 409) and protects the seed "group-demo"; surface both to the user.
    const handleDeleteGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (selectedGroupId === "all" || selectedGroupId === "group-demo") return;
        if (!confirm(t("deleteGroupConfirm"))) return;
        try {
            const res = await fetch(`/api/quota/groups/${selectedGroupId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setSelectedGroupId("all");
                await fetchGroups();
                await mutate();
            } else if (res.status === 409) {
                alert(t("deleteGroupHasPools"));
            }
        } catch  {
        // fail open
        }
    }, [
        selectedGroupId,
        fetchGroups,
        mutate,
        t
    ]);
    // ── Derived ──────────────────────────────────────────────────────────────
    const keyLabels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = {};
        for (const k of apiKeys)map[k.id] = k.name || k.id.slice(0, 12) + "…";
        return map;
    }, [
        apiKeys
    ]);
    const connLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((connectionId)=>{
        const conn = connections.find((c)=>c.id === connectionId);
        if (!conn) return connectionId.slice(0, 12);
        const raw = conn.name || conn.email || conn.displayName || conn.id.slice(0, 12);
        return emailsVisible ? raw : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maskEmailLikeValue"])(raw);
    }, [
        connections,
        emailsVisible
    ]);
    const connProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((connectionId)=>connections.find((c)=>c.id === connectionId)?.provider || "unknown", [
        connections
    ]);
    // connectionId → name of the pool it already belongs to (all members, not just
    // primary). Feeds the wizard's "already used" hint so the one-connection-per-pool
    // rule is explicit instead of silently disabling a checkbox.
    const connectionPoolName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = {};
        for (const p of pools){
            const name = p.name ?? p.id.slice(0, 8);
            for (const cid of p.connectionIds ?? [
                p.connectionId
            ]){
                if (!(cid in map)) map[cid] = name;
            }
        }
        return map;
    }, [
        pools
    ]);
    // Pools whose groupId matches no loaded group (e.g. legacy pools saved with the
    // "all" sentinel). Surfaced in an "Ungrouped" bucket so they stay editable/deletable.
    const orphanPools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const known = new Set(groups.map((g)=>g.id));
        return pools.filter((p)=>!known.has(p.groupId ?? "group-demo"));
    }, [
        pools,
        groups
    ]);
    const aggregate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$hooks$2f$usePoolsUsageAggregate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePoolsUsageAggregate"])(pools);
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            activePools: pools.length,
            keysAllocated: pools.reduce((s, p)=>s + p.allocations.length, 0),
            avgUtilization: aggregate.avgUtilizationPercent,
            borrowingNow: aggregate.borrowingKeyCount
        }), [
        pools,
        aggregate
    ]);
    // Pools filtered by selected group (kept for stats/empty-state checks)
    const filteredPools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>selectedGroupId === "all" ? pools : pools.filter((p)=>(p.groupId ?? "group-demo") === selectedGroupId), [
        pools,
        selectedGroupId
    ]);
    // Groups to render as stacked sections
    const groupsToRender = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>selectedGroupId === "all" ? groups : groups.filter((g)=>g.id === selectedGroupId), [
        groups,
        selectedGroupId
    ]);
    // ── Computed exclusivity for the pool being edited ───────────────────────
    //
    // A pool is exclusive when it has ≥1 allocation AND every allocated key
    // currently has the pool id in its allowedQuotas array.
    const editingExclusive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>!!editing && editing.allocations.length > 0 && editing.allocations.every((a)=>{
            const k = apiKeys.find((kk)=>kk.id === a.apiKeyId);
            const aq = k?.allowedQuotas;
            return Array.isArray(aq) && aq.includes(editing.id);
        }), [
        editing,
        apiKeys
    ]);
    // ── Mutations ─────────────────────────────────────────────────────────────
    /**
   * A failed delete must never look like a click that did nothing. Without the
   * response check the page just revalidated and left the card in place, so a
   * 401 from an expired session, a 500 or a dropped request were all
   * indistinguishable from "I misclicked" — and the operator would click again.
   */ const handleRemovePool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id)=>{
        if (!confirm(t("removeConfirm"))) return;
        setRemoveError(null);
        try {
            const res = await fetch(`/api/quota/pools/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const detail = await res.json().then((b)=>b?.error?.message || b?.error || b?.message).catch(()=>null);
                setRemoveError(detail ? `${t("removeFailed")} — ${detail}` : t("removeFailed"));
                return;
            }
        } catch  {
            // Network-level failure: there is no response to read.
            setRemoveError(t("removeFailed"));
            return;
        }
        await mutate();
    }, [
        mutate,
        t
    ]);
    // ── Render ────────────────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4",
        children: [
            removeError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "alert",
                className: "flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-700 dark:text-red-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[16px] text-red-500 shrink-0",
                        children: "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 420,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex-1",
                        children: removeError
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 421,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setRemoveError(null),
                        "aria-label": t("dismiss"),
                        className: "shrink-0 text-red-500 hover:text-red-400 cursor-pointer",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[16px]",
                            children: "close"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                            lineNumber: 428,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 422,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 416,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between flex-wrap gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-xl font-bold text-text-main flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[24px] text-primary",
                                        children: "pie_chart"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                        lineNumber: 437,
                                        columnNumber: 13
                                    }, this),
                                    t("title")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 436,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-text-muted mt-0.5",
                                children: t("description")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 440,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 435,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            variant: "primary",
                            size: "sm",
                            onClick: ()=>setCreateOpen(true),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px] mr-1",
                                    children: "add"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                    lineNumber: 444,
                                    columnNumber: 13
                                }, this),
                                t("newPool")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                            lineNumber: 443,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 442,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 434,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-700 dark:text-amber-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[16px] text-amber-500 shrink-0",
                        children: "science"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 452,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: t("betaTitle")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 456,
                                columnNumber: 11
                            }, this),
                            " — ",
                            t("betaText")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 455,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "https://github.com/diegosouzapw/OmniRoute/issues/new?labels=quota-share,beta&title=%5Bquota-share%5D%20",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "shrink-0 inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-300 hover:underline",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "bug_report"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 464,
                                columnNumber: 11
                            }, this),
                            t("betaReportLink")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 458,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 451,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 flex-wrap rounded-lg border border-border/40 bg-bg-subtle/20 px-3 py-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] uppercase tracking-wide text-text-muted font-semibold shrink-0",
                        children: t("groupLabel")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 471,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: selectedGroupId,
                        onChange: (e)=>setSelectedGroupId(e.target.value),
                        title: t("groupSelectHint"),
                        className: "px-2 py-1 rounded border border-border bg-bg-base text-sm text-text-main min-w-[120px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "all",
                                children: t("allGroups")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 480,
                                columnNumber: 11
                            }, this),
                            groups.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: g.id,
                                    children: g.name
                                }, g.id, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                    lineNumber: 482,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 474,
                        columnNumber: 9
                    }, this),
                    showNewGroupInput ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: newGroupInput,
                                onChange: (e)=>setNewGroupInput(e.target.value),
                                onKeyDown: (e)=>{
                                    if (e.key === "Enter") void handleCreateGroup();
                                    if (e.key === "Escape") {
                                        setShowNewGroupInput(false);
                                        setNewGroupInput("");
                                    }
                                },
                                placeholder: t("groupNamePrompt"),
                                autoFocus: true,
                                className: "px-2 py-1 rounded border border-border bg-bg-base text-sm w-36"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 489,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>void handleCreateGroup(),
                                disabled: !newGroupInput.trim(),
                                className: "text-xs px-2 py-1 rounded bg-primary/15 text-primary hover:bg-primary/25 transition-colors disabled:opacity-40",
                                children: t("newGroup")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 504,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setShowNewGroupInput(false);
                                    setNewGroupInput("");
                                },
                                className: "text-xs px-2 py-1 rounded border border-border text-text-muted hover:text-text-main transition-colors",
                                children: t("cancel")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 512,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 488,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setShowNewGroupInput(true),
                        className: "flex items-center gap-1 text-xs text-text-muted hover:text-text-main transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "add"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 529,
                                columnNumber: 13
                            }, this),
                            t("newGroup")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 524,
                        columnNumber: 11
                    }, this),
                    selectedGroupId !== "all" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>void handleRenameGroup(),
                        disabled: renaming,
                        className: "flex items-center gap-1 text-xs text-text-muted hover:text-text-main transition-colors ml-1 disabled:opacity-40",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "edit"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 540,
                                columnNumber: 13
                            }, this),
                            t("renameGroup")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 534,
                        columnNumber: 11
                    }, this),
                    selectedGroupId !== "all" && selectedGroupId !== "group-demo" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>void handleDeleteGroup(),
                        className: "flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "delete"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 550,
                                columnNumber: 13
                            }, this),
                            t("deleteGroup")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 545,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 470,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$QuotaConceptCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 557,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$QuotaEndpointsCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                groups: groups,
                pools: pools,
                connections: connections,
                apiKeys: apiKeys
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 560,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 lg:grid-cols-4 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("kpiActivePools"),
                        value: String(stats.activePools)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 569,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("kpiKeysAllocated"),
                        value: String(stats.keysAllocated)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 570,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("kpiAvgUtilization"),
                        value: `${Math.round(stats.avgUtilization)}%`,
                        tone: stats.avgUtilization > 80 ? "red" : stats.avgUtilization > 50 ? "amber" : "green"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 571,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: t("kpiBorrowingNow"),
                        value: String(stats.borrowingNow),
                        tone: stats.borrowingNow > 0 ? "amber" : undefined
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 576,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 568,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-text-muted text-sm py-10 text-center animate-pulse",
                children: t("loading")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 585,
                columnNumber: 9
            }, this) : pools.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-border bg-surface py-16 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[64px] opacity-15",
                        children: "pie_chart"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 590,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mt-3 text-base font-semibold text-text-main",
                        children: t("emptyTitle")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 591,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-sm text-text-muted max-w-md mx-auto",
                        children: t("emptyDescription")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 592,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        variant: "primary",
                        size: "sm",
                        className: "mt-4",
                        onClick: ()=>setCreateOpen(true),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px] mr-1",
                                children: "add"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 594,
                                columnNumber: 13
                            }, this),
                            t("newPool")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 593,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 589,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    groupsToRender.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl border border-dashed border-border bg-surface py-10 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-text-muted",
                                children: t("emptyDescription")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 602,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                variant: "primary",
                                size: "sm",
                                className: "mt-3",
                                onClick: ()=>setCreateOpen(true),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px] mr-1",
                                        children: "add"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                        lineNumber: 609,
                                        columnNumber: 17
                                    }, this),
                                    t("newPool")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 603,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 601,
                        columnNumber: 13
                    }, this) : groupsToRender.map((g)=>{
                        const groupPools = pools.filter((p)=>(p.groupId ?? "group-demo") === g.id);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[16px] text-text-muted",
                                            children: "folder"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                            lineNumber: 622,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-semibold text-text-main",
                                            children: g.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                            lineNumber: 625,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] text-text-muted",
                                            children: [
                                                "(",
                                                groupPools.length,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                            lineNumber: 626,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                    lineNumber: 621,
                                    columnNumber: 19
                                }, this),
                                groupPools.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-xl border border-dashed border-border bg-surface py-6 text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-text-muted",
                                            children: t("emptyDescription")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                            lineNumber: 630,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                            variant: "primary",
                                            size: "sm",
                                            className: "mt-3",
                                            onClick: ()=>setCreateOpen(true),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[14px] mr-1",
                                                    children: "add"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                                    lineNumber: 637,
                                                    columnNumber: 25
                                                }, this),
                                                t("newPool")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                            lineNumber: 631,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                    lineNumber: 629,
                                    columnNumber: 21
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3",
                                    children: groupPools.map((pool)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PoolCardWithUsage, {
                                            pool: pool,
                                            keyLabels: keyLabels,
                                            connectionLabel: connLabel(pool.connectionId),
                                            provider: connProvider(pool.connectionId),
                                            providers: [
                                                ...new Set((pool.connectionIds ?? [
                                                    pool.connectionId
                                                ]).map(connProvider))
                                            ],
                                            connectionIds: pool.connectionIds ?? [
                                                pool.connectionId
                                            ],
                                            onEdit: ()=>setEditing(pool),
                                            onRemove: ()=>void handleRemovePool(pool.id)
                                        }, pool.id, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                            lineNumber: 644,
                                            columnNumber: 25
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                    lineNumber: 642,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, g.id, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                            lineNumber: 619,
                            columnNumber: 17
                        }, this);
                    }),
                    selectedGroupId === "all" && orphanPools.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px] text-amber-400",
                                        children: "folder_off"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                        lineNumber: 672,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-semibold text-text-main",
                                        children: t("ungroupedTitle")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                        lineNumber: 675,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] text-text-muted",
                                        children: [
                                            "(",
                                            orphanPools.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                        lineNumber: 676,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 671,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] text-amber-400/80",
                                children: t("ungroupedHint")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 678,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3",
                                children: orphanPools.map((pool)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PoolCardWithUsage, {
                                        pool: pool,
                                        keyLabels: keyLabels,
                                        connectionLabel: connLabel(pool.connectionId),
                                        provider: connProvider(pool.connectionId),
                                        providers: [
                                            ...new Set((pool.connectionIds ?? [
                                                pool.connectionId
                                            ]).map(connProvider))
                                        ],
                                        connectionIds: pool.connectionIds ?? [
                                            pool.connectionId
                                        ],
                                        onEdit: ()=>setEditing(pool),
                                        onRemove: ()=>void handleRemovePool(pool.id)
                                    }, pool.id, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                        lineNumber: 681,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                                lineNumber: 679,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                        lineNumber: 670,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$PoolWizard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: createOpen,
                onClose: ()=>setCreateOpen(false),
                onSaved: ()=>void mutate(),
                connections: connections,
                apiKeys: apiKeys,
                plans: plans,
                existingPoolConnectionIds: new Set(pools.flatMap((p)=>p.connectionIds ?? [
                        p.connectionId
                    ])),
                connectionPoolName: connectionPoolName,
                groups: groups,
                selectedGroupId: selectedGroupId
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 702,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$costs$2f$quota$2d$share$2f$components$2f$PoolWizard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: !!editing,
                onClose: ()=>setEditing(null),
                onSaved: ()=>{
                    void mutate();
                    setEditing(null);
                },
                editPool: editing ?? undefined,
                editPoolExclusive: editingExclusive,
                connections: connections,
                apiKeys: apiKeys,
                plans: plans,
                existingPoolConnectionIds: new Set(pools.filter((p)=>p.id !== editing?.id).flatMap((p)=>p.connectionIds ?? [
                        p.connectionId
                    ])),
                connectionPoolName: connectionPoolName,
                groups: groups,
                selectedGroupId: selectedGroupId
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
                lineNumber: 718,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/costs/quota-share/QuotaSharePageClient.tsx",
        lineNumber: 413,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_0ykzsnv._.js.map