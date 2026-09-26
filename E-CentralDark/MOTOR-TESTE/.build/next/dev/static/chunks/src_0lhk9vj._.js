(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/i18nFallback.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "translateUsageOrFallback",
    ()=>translateUsageOrFallback
]);
function translateUsageOrFallback(t, key, fallback, values) {
    try {
        if (typeof t.has === "function" && !t.has(key)) {
            return fallback;
        }
        const translated = values ? t(key, values) : t(key);
        if (!translated || translated === key || translated === `usage.${key}`) {
            return fallback;
        }
        return translated;
    } catch  {
        return fallback;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/providerQuotaVisibility.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isProviderQuotaVisible",
    ()=>isProviderQuotaVisible,
    "supportsProviderQuota",
    ()=>supportsProviderQuota
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-client] (ecmascript) <locals>");
;
function isProviderQuotaVisible(connection) {
    return connection.quotaVisible !== false;
}
function supportsProviderQuota(providerId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["USAGE_SUPPORTED_PROVIDERS"].includes(providerId);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AutoRefreshButtonLabel",
    ()=>AutoRefreshButtonLabel,
    "default",
    ()=>ProviderQuotaWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ProviderIcon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/i18nFallback.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerQuotaVisibility$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/providerQuotaVisibility.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function formatAutoRefreshCountdown(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
function AutoRefreshButtonLabel({ autoRefreshIntervalMs, lastRefreshAllAt, refreshingAll, tr }) {
    _s();
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AutoRefreshButtonLabel.useState": ()=>Date.now()
    }["AutoRefreshButtonLabel.useState"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AutoRefreshButtonLabel.useEffect": ()=>{
            if (autoRefreshIntervalMs <= 0 || refreshingAll) return;
            const tick = {
                "AutoRefreshButtonLabel.useEffect.tick": ()=>setNow(Date.now())
            }["AutoRefreshButtonLabel.useEffect.tick"];
            tick();
            const timer = window.setInterval(tick, 1000);
            const handleVisibilityChange = {
                "AutoRefreshButtonLabel.useEffect.handleVisibilityChange": ()=>{
                    if (document.visibilityState === "visible") tick();
                }
            }["AutoRefreshButtonLabel.useEffect.handleVisibilityChange"];
            document.addEventListener("visibilitychange", handleVisibilityChange);
            return ({
                "AutoRefreshButtonLabel.useEffect": ()=>{
                    window.clearInterval(timer);
                    document.removeEventListener("visibilitychange", handleVisibilityChange);
                }
            })["AutoRefreshButtonLabel.useEffect"];
        }
    }["AutoRefreshButtonLabel.useEffect"], [
        autoRefreshIntervalMs,
        refreshingAll,
        lastRefreshAllAt
    ]);
    if (refreshingAll) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: tr("refreshing", "Refreshing")
        }, void 0, false);
    }
    if (autoRefreshIntervalMs <= 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: tr("refreshAll", "Refresh All")
        }, void 0, false);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            tr("autoRefreshing", "Auto-refreshing"),
            " ",
            formatAutoRefreshCountdown(Math.max(0, autoRefreshIntervalMs - (now - lastRefreshAllAt)))
        ]
    }, void 0, true);
}
_s(AutoRefreshButtonLabel, "2IU6yg86GfAIPaiHfn+vZjj7R4s=");
_c = AutoRefreshButtonLabel;
function ProviderQuotaWidget({ autoRefreshInterval = 0 }) {
    _s1();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("usage");
    const tr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderQuotaWidget.useCallback[tr]": (key, fallback)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, key, fallback)
    }["ProviderQuotaWidget.useCallback[tr]"], [
        t
    ]);
    const [connections, setConnections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [quotaData, setQuotaData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [refreshingAll, setRefreshingAll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const refreshingAllRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const lastRefreshAllAtRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(Date.now());
    const [lastRefreshAllAt, setLastRefreshAllAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "ProviderQuotaWidget.useState": ()=>lastRefreshAllAtRef.current
    }["ProviderQuotaWidget.useState"]);
    const autoRefreshIntervalMs = autoRefreshInterval > 0 ? autoRefreshInterval * 1000 : 0;
    const fetchConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderQuotaWidget.useCallback[fetchConnections]": async ()=>{
            try {
                const res = await fetch("/api/providers/client");
                if (!res.ok) throw new Error("Failed to load connections");
                const data = await res.json();
                return data.connections || [];
            } catch  {
                return [];
            }
        }
    }["ProviderQuotaWidget.useCallback[fetchConnections]"], []);
    const fetchCached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderQuotaWidget.useCallback[fetchCached]": async ()=>{
            try {
                const res = await fetch("/api/usage/provider-limits");
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                return data.caches || {};
            } catch  {
                return {};
            }
        }
    }["ProviderQuotaWidget.useCallback[fetchCached]"], []);
    const loadData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderQuotaWidget.useCallback[loadData]": async ()=>{
            setLoading(true);
            const [conns, caches] = await Promise.all([
                fetchConnections(),
                fetchCached()
            ]);
            // Only keep connections that are usage/quota supported
            const relevant = conns.filter({
                "ProviderQuotaWidget.useCallback[loadData].relevant": (c)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerQuotaVisibility$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isProviderQuotaVisible"])(c) && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["USAGE_SUPPORTED_PROVIDERS"].includes(c.provider) && (c.authType === "oauth" || c.authType === "apikey")
            }["ProviderQuotaWidget.useCallback[loadData].relevant"]);
            setConnections(relevant);
            setQuotaData(caches);
            setLoading(false);
        }
    }["ProviderQuotaWidget.useCallback[loadData]"], [
        fetchConnections,
        fetchCached
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProviderQuotaWidget.useEffect": ()=>{
            loadData();
        }
    }["ProviderQuotaWidget.useEffect"], [
        loadData
    ]);
    const refreshAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderQuotaWidget.useCallback[refreshAll]": async ()=>{
            if (refreshingAllRef.current) return;
            refreshingAllRef.current = true;
            const now = Date.now();
            lastRefreshAllAtRef.current = now;
            setLastRefreshAllAt(now);
            setRefreshingAll(true);
            try {
                const res = await fetch("/api/usage/provider-limits", {
                    method: "POST"
                });
                if (!res.ok) {
                    const err = await res.json().catch({
                        "ProviderQuotaWidget.useCallback[refreshAll]": ()=>({})
                    }["ProviderQuotaWidget.useCallback[refreshAll]"]);
                    throw new Error(err.error || "Refresh failed");
                }
                const data = await res.json();
                setQuotaData(data.caches || {});
            } catch (e) {
                console.error("ProviderQuotaWidget refreshAll error:", e);
            } finally{
                refreshingAllRef.current = false;
                setRefreshingAll(false);
            }
        }
    }["ProviderQuotaWidget.useCallback[refreshAll]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProviderQuotaWidget.useEffect": ()=>{
            if (autoRefreshIntervalMs <= 0) return;
            const maybeRefresh = {
                "ProviderQuotaWidget.useEffect.maybeRefresh": ()=>{
                    if (document.visibilityState !== "visible") return;
                    if (refreshingAllRef.current) return;
                    if (Date.now() - lastRefreshAllAtRef.current >= autoRefreshIntervalMs) {
                        void refreshAll();
                    }
                }
            }["ProviderQuotaWidget.useEffect.maybeRefresh"];
            maybeRefresh();
            const timer = window.setInterval(maybeRefresh, 1000);
            const handleVisibilityChange = {
                "ProviderQuotaWidget.useEffect.handleVisibilityChange": ()=>maybeRefresh()
            }["ProviderQuotaWidget.useEffect.handleVisibilityChange"];
            document.addEventListener("visibilitychange", handleVisibilityChange);
            return ({
                "ProviderQuotaWidget.useEffect": ()=>{
                    window.clearInterval(timer);
                    document.removeEventListener("visibilitychange", handleVisibilityChange);
                }
            })["ProviderQuotaWidget.useEffect"];
        }
    }["ProviderQuotaWidget.useEffect"], [
        autoRefreshIntervalMs,
        refreshAll
    ]);
    // Simple summary: group by provider for display
    const providerGroups = connections.reduce((acc, conn)=>{
        if (!acc[conn.provider]) acc[conn.provider] = [];
        acc[conn.provider].push(conn);
        return acc;
    }, {});
    const providerEntries = Object.entries(providerGroups).sort(([a], [b])=>a.localeCompare(b));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        className: "overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between border-b border-border px-4 py-3 bg-surface/60",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-primary text-[20px]",
                                children: "account_balance"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                lineNumber: 200,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-semibold text-base",
                                        children: tr("providerQuota", "Provider Quota")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                        lineNumber: 204,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] text-text-muted -mt-0.5",
                                        children: tr("providerQuotaHomeHint", "Live status across connected accounts")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                        lineNumber: 205,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                lineNumber: 203,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: refreshAll,
                        disabled: refreshingAll || loading,
                        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-bg-subtle text-xs font-medium text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors",
                        title: autoRefreshIntervalMs > 0 ? tr("autoRefreshing", "Auto-refreshing") : tr("refreshAll", "Refresh All"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `material-symbols-outlined text-[16px] ${refreshingAll ? "animate-spin" : ""}`,
                                children: autoRefreshIntervalMs > 0 ? "schedule" : "refresh"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                lineNumber: 221,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AutoRefreshButtonLabel, {
                                    autoRefreshIntervalMs: autoRefreshIntervalMs,
                                    lastRefreshAllAt: lastRefreshAllAt,
                                    refreshingAll: refreshingAll,
                                    tr: tr
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                    lineNumber: 227,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                lineNumber: 226,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                        lineNumber: 211,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                lineNumber: 198,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: [
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center py-8 text-text-muted text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined animate-spin mr-2",
                                children: "progress_activity"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                lineNumber: 241,
                                columnNumber: 13
                            }, this),
                            tr("loadingQuotas", "Loading...")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                        lineNumber: 240,
                        columnNumber: 11
                    }, this) : providerEntries.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-6 text-sm text-text-muted",
                        children: [
                            tr("noProviders", "No Providers Connected"),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-1 text-xs",
                                children: tr("connectProvidersForQuota", "Connect to providers with OAuth to track your API quota limits and usage.")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                lineNumber: 247,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                        lineNumber: 245,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3",
                        children: providerEntries.map(([provider, conns])=>{
                            const firstConn = conns[0];
                            const cache = quotaData[firstConn?.id];
                            const hasQuota = cache?.quotas && Object.keys(cache.quotas).length > 0;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-border bg-surface/40 p-3 flex flex-col gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                providerId: provider,
                                                size: 18
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                                lineNumber: 267,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium text-sm truncate",
                                                children: provider.charAt(0).toUpperCase() + provider.slice(1)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                                lineNumber: 268,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-text-muted ml-auto tabular-nums",
                                                children: conns.length
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                                lineNumber: 271,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                        lineNumber: 266,
                                        columnNumber: 19
                                    }, this),
                                    hasQuota ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-text-muted",
                                        title: tr("details", "Details"),
                                        children: Object.keys(cache.quotas).length
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                        lineNumber: 277,
                                        columnNumber: 21
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: refreshAll,
                                        className: "text-left text-xs text-amber-600 dark:text-amber-500 hover:underline",
                                        children: tr("refreshAll", "Refresh All")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                        lineNumber: 281,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, provider, true, {
                                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                lineNumber: 262,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                        lineNumber: 255,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 text-[11px] text-right text-text-muted",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "/dashboard/usage?tab=limits",
                            className: "hover:text-primary hover:underline",
                            children: [
                                tr("viewDetails", "View details"),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    "aria-hidden": "true",
                                    children: " →"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                                    lineNumber: 300,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                            lineNumber: 298,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                        lineNumber: 297,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx",
        lineNumber: 196,
        columnNumber: 5
    }, this);
}
_s1(ProviderQuotaWidget, "qWgVQAtwmPq5c1UcQt3cnqPY+C4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c1 = ProviderQuotaWidget;
var _c, _c1;
__turbopack_context__.k.register(_c, "AutoRefreshButtonLabel");
__turbopack_context__.k.register(_c1, "ProviderQuotaWidget");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(dashboard)/home/ProviderQuotaWidget.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_0lhk9vj._.js.map