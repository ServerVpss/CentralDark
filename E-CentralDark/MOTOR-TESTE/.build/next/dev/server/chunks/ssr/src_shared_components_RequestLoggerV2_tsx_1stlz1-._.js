module.exports = [
"[project]/src/shared/components/RequestLoggerV2.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$RequestLoggerDetail$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/RequestLoggerDetail.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clipboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/clipboard.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/colors.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerDisplayLabel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/providerDisplayLabel.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/emailPrivacyStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerSignature$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/requestLoggerSignature.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerPreferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/requestLoggerPreferences.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/logTableStyles.ts [app-ssr] (ecmascript)");
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
// Number of call-log rows fetched per page. The viewer grows its window by this
// amount on "Load more" / infinite scroll so users can browse past the first
// page (previously hardcoded to a single 300-row window). See #2565.
// Reduced from 300 → 50 to avoid browser freeze and network saturation.
const PAGE_SIZE = 50;
function getLogTotalTokens(log) {
    return (log?.tokens?.in || 0) + (log?.tokens?.out || 0);
}
function getLogTps(log) {
    const tokensOut = log?.tokens?.out || 0;
    const durationMs = log?.duration || 0;
    if (tokensOut <= 0 || durationMs <= 0) return 0;
    return tokensOut / (durationMs / 1000);
}
function formatTps(tps) {
    if (tps <= 0) return "—";
    if (tps >= 100) return Math.round(tps).toLocaleString();
    return tps.toFixed(1);
}
function getCacheSourceMeta(cacheSource) {
    if (cacheSource === "semantic") {
        return {
            key: "semantic",
            className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
        };
    }
    return {
        key: "upstream",
        className: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30"
    };
}
const RequestLoggerV2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])((props, ref)=>{
    const { initialSelectedId } = props;
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("requestLogger");
    const { emailsVisible } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
    // Get translated status filters
    const statusFilters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            {
                key: "all",
                label: t("statusFilters.all"),
                icon: ""
            },
            {
                key: "error",
                label: t("statusFilters.error"),
                icon: "error"
            },
            {
                key: "ok",
                label: t("statusFilters.success"),
                icon: "check_circle"
            },
            {
                key: "combo",
                label: t("statusFilters.combo"),
                icon: "hub"
            }
        ], [
        t
    ]);
    // Get translated columns
    const columns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            {
                key: "status",
                label: t("columns.status")
            },
            {
                key: "cacheSource",
                label: t("columns.cacheSource")
            },
            {
                key: "model",
                label: t("columns.model")
            },
            {
                key: "requestedModel",
                label: t("columns.requested")
            },
            {
                key: "provider",
                label: t("columns.provider")
            },
            {
                key: "protocol",
                label: t("columns.protocol")
            },
            {
                key: "account",
                label: t("columns.account")
            },
            {
                key: "apiKey",
                label: t("columns.apiKey")
            },
            {
                key: "combo",
                label: t("columns.combo")
            },
            {
                key: "tokens",
                label: t("columns.tokens")
            },
            {
                key: "tps",
                label: t("columns.tps")
            },
            {
                key: "duration",
                label: t("columns.duration")
            },
            {
                key: "time",
                label: t("columns.time")
            }
        ], [
        t
    ]);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [recording, setRecording] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [activeFilter, setActiveFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("all");
    const [selectedModel, setSelectedModel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedAccount, setSelectedAccount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedProvider, setSelectedProvider] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedApiKey, setSelectedApiKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("newest");
    const [selectedLog, setSelectedLog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [correlationIdFilter, setCorrelationIdFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [hoveredCid, setHoveredCid] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [groupedView, setGroupedView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [detailLoading, setDetailLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Column sort toggle: clicking a column header toggles asc/desc
    const columnSortMap = {
        status: {
            desc: "status_desc",
            asc: "status_asc"
        },
        model: {
            desc: "model_desc",
            asc: "model_asc"
        },
        tokens: {
            desc: "tokens_desc",
            asc: "tokens_asc"
        },
        tps: {
            desc: "tps_desc",
            asc: "tps_asc"
        },
        duration: {
            desc: "duration_desc",
            asc: "duration_asc"
        },
        time: {
            desc: "newest",
            asc: "oldest"
        }
    };
    const toggleSort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((column)=>{
        const mapping = columnSortMap[column];
        if (!mapping) return;
        setSortBy((prev)=>{
            if (prev === mapping.desc) return mapping.asc;
            return mapping.desc;
        });
    }, []);
    const getSortIndicator = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((column)=>{
        const mapping = columnSortMap[column];
        if (!mapping) return "";
        if (sortBy === mapping.desc) return " ↓";
        if (sortBy === mapping.asc) return " ↑";
        return "";
    }, [
        sortBy
    ]);
    const [detailData, setDetailData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [detailLoggingEnabled, setDetailLoggingEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [detailLoggingLoading, setDetailLoggingLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [limit, setLimit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(PAGE_SIZE);
    const [hasMore, setHasMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [refreshIntervalSec, setRefreshIntervalSec] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerPreferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_REFRESH_INTERVAL_SEC"]);
    const intervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const refreshIntervalSecRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerPreferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_REFRESH_INTERVAL_SEC"]);
    const detailRequestRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])("");
    const hasLoadedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const logsSignatureRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])("");
    const scrollContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const loadMoreSentinelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const hasScrolledRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [providerNodes, setProviderNodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const visibleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    const [visibleColumns, setVisibleColumns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        const defaultVisible = Object.fromEntries(columns.map((c)=>[
                c.key,
                true
            ]));
        if (globalThis.window === undefined) return defaultVisible;
        try {
            const saved = localStorage.getItem("loggerVisibleColumns");
            return saved ? {
                ...defaultVisible,
                ...JSON.parse(saved)
            } : defaultVisible;
        } catch  {
            return defaultVisible;
        }
    });
    const toggleColumn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((key)=>{
        setVisibleColumns((prev)=>{
            const next = {
                ...prev,
                [key]: !prev[key]
            };
            try {
                localStorage.setItem("loggerVisibleColumns", JSON.stringify(next));
            } catch  {}
            return next;
        });
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const saved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerPreferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readSavedRefreshIntervalSec"])();
        refreshIntervalSecRef.current = saved;
        setRefreshIntervalSec(saved);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        refreshIntervalSecRef.current = refreshIntervalSec;
    }, [
        refreshIntervalSec
    ]);
    const updateRefreshIntervalSec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((valueOrUpdater)=>{
        const current = refreshIntervalSecRef.current;
        const rawValue = typeof valueOrUpdater === "function" ? valueOrUpdater(current) : valueOrUpdater;
        const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerPreferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clampRefreshIntervalSec"])(rawValue);
        refreshIntervalSecRef.current = next;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerPreferences$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["writeSavedRefreshIntervalSec"])(next);
        setRefreshIntervalSec(next);
    }, []);
    const fetchLogs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (showLoading = false)=>{
        if (showLoading) setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (activeFilter === "error") params.set("status", "error");
            if (activeFilter === "ok") params.set("status", "ok");
            if (activeFilter === "combo") params.set("combo", "1");
            if (selectedModel) params.set("model", selectedModel);
            if (selectedProvider) params.set("provider", selectedProvider);
            if (selectedAccount) params.set("account", selectedAccount);
            if (selectedApiKey) params.set("apiKey", selectedApiKey);
            if (correlationIdFilter) params.set("correlationId", correlationIdFilter);
            params.set("limit", String(limit));
            const res = await fetch(`/api/usage/call-logs?${params}`);
            if (res.ok) {
                const data = await res.json();
                // If the server returned a full window, more rows may exist beyond it.
                setHasMore(Array.isArray(data) && data.length >= limit);
                // Skip re-render if data hasn't changed (#1369 GPU perf). The signature
                // captures id + status + duration + tokens_out so in-progress updates
                // still re-render while identical snapshots are skipped.
                const sig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerSignature$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeLogsSignature"])(data);
                if (sig !== logsSignatureRef.current) {
                    logsSignatureRef.current = sig;
                    setLogs(data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch call logs:", error);
        } finally{
            if (showLoading) setLoading(false);
        }
    }, [
        search,
        activeFilter,
        selectedModel,
        selectedAccount,
        selectedProvider,
        selectedApiKey,
        correlationIdFilter,
        limit
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const showLoading = !hasLoadedRef.current;
        hasLoadedRef.current = true;
        fetchLogs(showLoading);
    }, [
        fetchLogs
    ]);
    // Fetch provider nodes for display labels
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetch("/api/provider-nodes").then((r)=>r.ok ? r.json() : {
                nodes: []
            }).then((d)=>setProviderNodes(d.nodes || [])).catch(()=>{});
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetch("/api/logs/detail?limit=1").then(async (res)=>{
            if (!res.ok) return null;
            return await res.json();
        }).then((data)=>{
            if (!data) return;
            setDetailLoggingEnabled(data.enabled === true);
        }).catch(()=>{});
    }, []);
    // Visibility-aware auto-refresh: pause polling when tab is hidden or user has
    // scrolled past the first page, or when a detail modal is open.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onVisibility = ()=>{
            const isVisible = document.visibilityState === "visible";
            visibleRef.current = isVisible;
            if (isVisible && !selectedLog && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerSignature$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldAutoRefresh"])(recording, limit, PAGE_SIZE)) {
                fetchLogs(false);
            }
        };
        // #4133: re-arm on window focus. Embedded / proxied hosts (Docker dashboard
        // wrappers, webviews) can fire a one-shot `visibilitychange` → hidden and
        // then keep reporting "hidden" — or recover without firing the event again —
        // which left `visibleRef` stuck `false` and froze auto-refresh permanently
        // (the "still not refreshing on 3.8.28, works on 3.8.24" report). A window
        // `focus` is a reliable signal the page is actively viewed, so re-arm and
        // poll. A genuinely backgrounded tab never receives focus, so this does not
        // defeat the perf pause.
        const onFocus = ()=>{
            visibleRef.current = true;
            if (!selectedLog && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerSignature$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldAutoRefresh"])(recording, limit, PAGE_SIZE)) {
                fetchLogs(false);
            }
        };
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("focus", onFocus);
        return ()=>{
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("focus", onFocus);
        };
    }, [
        recording,
        limit,
        fetchLogs,
        selectedLog
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!selectedLog && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerSignature$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldAutoRefresh"])(recording, limit, PAGE_SIZE)) {
            intervalRef.current = setInterval(()=>{
                // #3972/#4054/#4133: poll while the page is plausibly viewed — the
                // event-tracked `visibleRef` (fail-open) OR a *live* `visibilityState`
                // read. A real background tab has both false → pause (perf); an
                // embedded host that misreports "hidden" keeps polling instead of
                // freezing. The window-`focus` re-arm above covers a host pinned
                // "hidden" while focused.
                if (visibleRef.current || document.visibilityState === "visible") {
                    fetchLogs(false);
                }
            }, refreshIntervalSec * 1000);
        }
        return ()=>{
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [
        recording,
        fetchLogs,
        limit,
        refreshIntervalSec,
        selectedLog
    ]);
    // Reset the window back to the first page whenever the active filters change,
    // so switching filters doesn't keep fetching a large expanded window.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setLimit(PAGE_SIZE);
        // #4269: a filter change is a fresh first-page view — re-arm the ghost-load-more
        // guard so auto-refresh resumes until the user scrolls again.
        hasScrolledRef.current = false;
    }, [
        search,
        activeFilter,
        selectedModel,
        selectedAccount,
        selectedProvider,
        selectedApiKey,
        correlationIdFilter
    ]);
    const loadMore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setLimit((prev)=>prev + PAGE_SIZE);
    }, []);
    // #4269: record the first genuine user scroll of the log list. Until then, the
    // infinite-scroll observer below must NOT grow the window (see
    // shouldTriggerInfiniteScroll) — otherwise a sentinel that is already visible on
    // mount fires a "ghost" loadMore and permanently pauses auto-refresh.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const root = scrollContainerRef.current;
        if (!root) return;
        const onScroll = ()=>{
            if (root.scrollTop > 0) hasScrolledRef.current = true;
        };
        root.addEventListener("scroll", onScroll, {
            passive: true
        });
        return ()=>root.removeEventListener("scroll", onScroll);
    }, []);
    // Infinite scroll: grow the window when the sentinel near the bottom of the
    // scroll container becomes visible — but only after a real user scroll (#4269).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const sentinel = loadMoreSentinelRef.current;
        const root = scrollContainerRef.current;
        if (!sentinel || !hasMore) return;
        const observer = new IntersectionObserver((entries)=>{
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$requestLoggerSignature$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shouldTriggerInfiniteScroll"])({
                isIntersecting: !!entries[0]?.isIntersecting,
                hasMore,
                loading,
                hasScrolled: hasScrolledRef.current
            })) {
                loadMore();
            }
        }, {
            root,
            rootMargin: "200px"
        });
        observer.observe(sentinel);
        return ()=>observer.disconnect();
    }, [
        hasMore,
        loading,
        loadMore
    ]);
    const filteredLogs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let arr = logs;
        // Status filter
        if (activeFilter === "error") {
            arr = arr.filter((l)=>l.status >= 400);
        } else if (activeFilter === "ok") {
            arr = arr.filter((l)=>l.status >= 200 && l.status < 300);
        } else if (activeFilter === "combo") {
            arr = arr.filter((l)=>l.comboName);
        }
        return arr;
    }, [
        logs,
        activeFilter
    ]);
    // Grouped view: deduplicate by correlationId, keeping only the latest per group.
    // Rows without a correlationId are always shown.
    const dedupedLogs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!groupedView) return filteredLogs;
        const byCid = new Map();
        const noCid = [];
        for (const log of filteredLogs){
            const cid = log.correlationId;
            if (!cid) {
                noCid.push(log);
                continue;
            }
            const existing = byCid.get(cid);
            if (!existing || new Date(log.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
                byCid.set(cid, log);
            }
        }
        return [
            ...noCid,
            ...byCid.values()
        ];
    }, [
        filteredLogs,
        groupedView
    ]);
    const sortedLogs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const arr = [
            ...dedupedLogs
        ];
        arr.sort((a, b)=>{
            switch(sortBy){
                case "oldest":
                    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                case "tokens_desc":
                    return getLogTotalTokens(b) - getLogTotalTokens(a);
                case "tokens_asc":
                    return getLogTotalTokens(a) - getLogTotalTokens(b);
                case "duration_desc":
                    return (b.duration || 0) - (a.duration || 0);
                case "duration_asc":
                    return (a.duration || 0) - (b.duration || 0);
                case "tps_desc":
                    return getLogTps(b) - getLogTps(a);
                case "tps_asc":
                    return getLogTps(a) - getLogTps(b);
                case "status_desc":
                    return (b.status || 0) - (a.status || 0);
                case "status_asc":
                    return (a.status || 0) - (b.status || 0);
                case "model_asc":
                    return (a.model || "").localeCompare(b.model || "");
                case "model_desc":
                    return (b.model || "").localeCompare(a.model || "");
                case "newest":
                default:
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            }
        });
        return arr;
    }, [
        dedupedLogs,
        sortBy
    ]);
    // Group by correlationId: mark retries as children so they render indented
    // under the first request in each group. Compute group health:
    //   "healed"  — at least one failure followed by a success
    //   "failed"  — all attempts failed
    //   null      — single request or all succeeded
    const groupedLogs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const cidGroups = new Map();
        for (const log of sortedLogs){
            const cid = log.correlationId;
            if (cid) {
                if (!cidGroups.has(cid)) cidGroups.set(cid, []);
                cidGroups.get(cid).push(log);
            }
        }
        return sortedLogs.map((log)=>{
            const cid = log.correlationId;
            if (!cid) return {
                ...log,
                isRetry: false,
                groupSize: 1,
                groupStatus: null
            };
            const group = cidGroups.get(cid);
            if (!group || group.length <= 1) return {
                ...log,
                isRetry: false,
                groupSize: 1,
                groupStatus: null
            };
            const isFirst = group[0].id === log.id;
            const hasFailure = group.some((g)=>g.status >= 400 || g.active);
            const hasSuccess = group.some((g)=>g.status >= 200 && g.status < 300);
            const groupStatus = hasFailure && hasSuccess ? "healed" : hasFailure ? "failed" : null;
            return {
                ...log,
                isRetry: !isFirst,
                groupSize: group.length,
                groupStatus
            };
        });
    }, [
        sortedLogs
    ]);
    // Fetch log detail from the persisted call-log endpoint. If a deep-linked
    // request is still being finalized, keep the modal open and poll this same
    // endpoint until the row appears.
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const openDetail = async (logEntry)=>{
        // Guard: if no valid id provided, close instead of opening an empty modal
        if (!logEntry?.id) {
            try {
                closeDetail();
            } catch  {}
            return;
        }
        const requestToken = `${logEntry.id}:${Date.now()}:${Math.random()}`;
        detailRequestRef.current = requestToken;
        const isCurrentDetailRequest = ()=>detailRequestRef.current === requestToken;
        setSelectedLog(logEntry);
        try {
            const url = new URL(globalThis.location.href);
            url.searchParams.set("id", logEntry.id);
            router.replace(url.pathname + url.search);
        } catch (e) {
        // ignore navigation errors
        }
        setDetailLoading(true);
        setDetailData(null);
        try {
            const res = await fetch(`/api/logs/${logEntry.id}`, {
                cache: "no-store"
            });
            if (res.ok) {
                const data = await res.json();
                if (!isCurrentDetailRequest()) return;
                const dataHasPipeline = data?.pipelinePayloads && Object.keys(data.pipelinePayloads || {}).length > 0;
                setDetailData((prev)=>({
                        ...prev,
                        ...data,
                        pipelinePayloads: dataHasPipeline ? data.pipelinePayloads : prev?.pipelinePayloads
                    }));
                // ensure the modal summary reflects the fetched call log summary
                if (data && typeof data === "object") {
                    setSelectedLog((prev)=>({
                            ...prev,
                            ...data,
                            active: data.active === true
                        }));
                }
            } else {
                // A deep-linked id can legitimately 404 while the request is still
                // finalizing. Keep the modal open and poll /api/logs/[id] instead of
                // falling back to an in-memory active-request endpoint.
                if (!isCurrentDetailRequest()) return;
                if (res.status === 404) {
                    if (logEntry.pendingLookup || logEntry.active) {
                        setSelectedLog((prev)=>({
                                ...prev,
                                id: logEntry.id,
                                status: 0,
                                method: prev?.method,
                                path: prev?.path || ""
                            }));
                        setDetailData({
                            detailState: "pending"
                        });
                        return;
                    }
                    try {
                        console.warn("Log not found:", logEntry.id);
                    } catch  {}
                    try {
                        closeDetail();
                    } catch  {}
                    return;
                }
                // other errors: show a minimal error indicator by setting detailData to an error object
                try {
                    const body = await res.text().catch(()=>null);
                    if (!isCurrentDetailRequest()) return;
                    setDetailData({
                        error: `Failed to fetch log (status ${res.status})`,
                        body
                    });
                } catch  {}
            }
        } catch (error) {
            console.error("Failed to fetch log detail:", error);
        } finally{
            if (isCurrentDetailRequest()) setDetailLoading(false);
        }
    };
    const closeDetail = ()=>{
        detailRequestRef.current = "";
        setSelectedLog(null);
        setDetailData(null);
        try {
            // remove id param when closing detail
            const url = new URL(globalThis.location.href);
            url.searchParams.delete("id");
            router.replace(url.pathname + url.search);
        } catch (e) {
        // ignore navigation errors
        }
    };
    const sortedLogsForNav = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>sortedLogs, [
        sortedLogs
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, ()=>({
            openDetail,
            getSortedLogs: ()=>sortedLogsForNav
        }), [
        openDetail,
        sortedLogsForNav
    ]);
    // If the page provided an initialSelectedId (via ?id=), open it on mount.
    // Guard with a ref so subsequent URL updates (close -> replace) don't re-open the modal.
    const initialOpenedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (initialSelectedId && !initialOpenedRef.current) {
            initialOpenedRef.current = true;
            openDetail({
                id: initialSelectedId,
                pendingLookup: true
            }).then((r)=>r).catch((error_)=>{
                console.error("Failed to open initial log id:", error_);
            });
        }
    }, [
        initialSelectedId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const isActive = selectedLog?.active === true;
        if (!selectedLog?.id || !isActive) return;
        let cancelled = false;
        let graceCount = 0;
        const interval = setInterval(async ()=>{
            if (document.visibilityState !== "visible") return;
            try {
                const res = await fetch(`/api/logs/${selectedLog.id}`, {
                    cache: "no-store"
                });
                if (cancelled) return;
                if (res.status === 404) {
                    if (isActive) return;
                    clearInterval(interval);
                    return;
                }
                if (res.ok) {
                    const data = await res.json();
                    const stillActive = data.active === true;
                    setDetailData((prev)=>({
                            ...prev,
                            ...data,
                            pipelinePayloads: data?.pipelinePayloads || prev?.pipelinePayloads
                        }));
                    setSelectedLog((prev)=>({
                            ...prev,
                            ...data,
                            active: stillActive
                        }));
                    if (!stillActive) {
                        graceCount++;
                        if (graceCount >= 3) clearInterval(interval);
                    }
                }
            } catch  {
            // keep waiting; the detail endpoint is the single source of truth
            }
        }, 1000);
        return ()=>{
            cancelled = true;
            clearInterval(interval);
        };
    }, [
        selectedLog?.id,
        detailData?.detailState,
        selectedLog?.active,
        fetchLogs
    ]);
    // Poll for related logs (same correlationId) while the detail modal is open.
    // This ensures newly completed retries appear without closing the modal.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const cid = selectedLog?.correlationId;
        if (!selectedLog?.id || !cid) return;
        let cancelled = false;
        const interval = setInterval(async ()=>{
            if (document.visibilityState !== "visible") return;
            try {
                const res = await fetch(`/api/usage/call-logs?correlationId=${encodeURIComponent(cid)}`, {
                    cache: "no-store"
                });
                if (cancelled || !res.ok) return;
                const cidLogs = await res.json();
                if (!Array.isArray(cidLogs) || cidLogs.length === 0) return;
                setLogs((prev)=>{
                    const ids = new Set(cidLogs.map((l)=>l.id));
                    let changed = false;
                    const merged = prev.map((l)=>{
                        const updated = cidLogs.find((c)=>c.id === l.id);
                        if (updated) {
                            changed = true;
                            return {
                                ...l,
                                ...updated
                            };
                        }
                        return l;
                    });
                    for (const cl of cidLogs){
                        if (!merged.some((m)=>m.id === cl.id)) {
                            merged.push(cl);
                            changed = true;
                        }
                    }
                    return changed ? merged : prev;
                });
            } catch  {
            /* poll failed — non-critical */ }
        }, 3000);
        return ()=>{
            cancelled = true;
            clearInterval(interval);
        };
    }, [
        selectedLog?.id,
        selectedLog?.correlationId
    ]);
    const currentLogIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!selectedLog) return -1;
        return sortedLogsForNav.findIndex((l)=>l.id === selectedLog.id);
    }, [
        selectedLog,
        sortedLogsForNav
    ]);
    const handlePrev = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const idx = currentLogIndex;
        const target = idx > 0 ? sortedLogsForNav[idx - 1] : null;
        if (target?.id) {
            openDetail(target).then((r)=>r).catch((error_)=>{
                console.error("Failed to open previous log id:", error_);
            });
        } else {
            closeDetail();
        }
    }, [
        currentLogIndex,
        sortedLogsForNav
    ]);
    const handleNext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const idx = currentLogIndex;
        const target = idx >= 0 && idx < sortedLogsForNav.length - 1 ? sortedLogsForNav[idx + 1] : null;
        if (target?.id) {
            openDetail(target).then((r)=>r).catch((error_)=>{
                console.error("Failed to open previous log id:", error_);
            });
        } else {
            closeDetail();
        }
    }, [
        currentLogIndex,
        sortedLogsForNav
    ]);
    const toggleDetailLogging = async ()=>{
        setDetailLoggingLoading(true);
        try {
            const nextEnabled = !detailLoggingEnabled;
            const res = await fetch("/api/logs/detail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    enabled: nextEnabled
                })
            });
            if (!res.ok) throw new Error(t("updatePipelineFailed"));
            setDetailLoggingEnabled(nextEnabled);
        } catch (error) {
            console.error("Failed to toggle pipeline logging:", error);
        } finally{
            setDetailLoggingLoading(false);
        }
    };
    const sourceLogsForDropdowns = logs;
    // Unique accounts and providers for dropdowns
    const uniqueAccounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(sourceLogsForDropdowns.map((l)=>l.account).filter((a)=>a && a !== "-"))
        ], [
        sourceLogsForDropdowns
    ]);
    const uniqueModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(sourceLogsForDropdowns.flatMap((l)=>[
                    l.model,
                    l.requestedModel
                ]).filter(Boolean))
        ].sort(), [
        sourceLogsForDropdowns
    ]);
    const uniqueProviders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(sourceLogsForDropdowns.map((l)=>l.provider).filter((p)=>p && p !== "-"))
        ].sort(), [
        sourceLogsForDropdowns
    ]);
    const uniqueApiKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(sourceLogsForDropdowns.map((l)=>l.apiKeyId || l.apiKeyName).filter(Boolean))
        ].sort(), [
        sourceLogsForDropdowns
    ]);
    // Stats (memoized to avoid re-computation on every render)
    const { totalCount, okCount, errorCount, comboCount, apiKeyCount, runningCount } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            totalCount: filteredLogs.length,
            okCount: filteredLogs.filter((l)=>l.status >= 200 && l.status < 300).length,
            errorCount: filteredLogs.filter((l)=>l.status >= 400).length,
            comboCount: logs.filter((l)=>l.comboName).length,
            apiKeyCount: uniqueApiKeys.length,
            runningCount: filteredLogs.filter((l)=>l.active === true).length
        }), [
        filteredLogs,
        logs,
        uniqueApiKeys
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setRecording(!recording),
                        className: `flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${recording ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400" : "bg-bg-subtle border-border text-text-muted"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `w-2 h-2 rounded-full ${recording ? "bg-red-500 animate-pulse" : "bg-text-muted"}`
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 849,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            recording ? t("recording") : t("paused")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 841,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: toggleDetailLogging,
                        disabled: detailLoggingLoading,
                        className: `flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-60 ${detailLoggingEnabled ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300" : "bg-bg-subtle border-border text-text-muted"}`,
                        title: t("capturePipeline"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `w-2 h-2 rounded-full ${detailLoggingEnabled ? "bg-amber-500" : "bg-text-muted"}`
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 865,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            detailLoggingLoading ? t("updatingPipelineLogs") : detailLoggingEnabled ? t("pipelineLogsOn") : t("pipelineLogsOff")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 855,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-[200px] relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]",
                                children: "search"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 877,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: t("searchPlaceholder"),
                                value: search,
                                onChange: (e)=>setSearch(e.target.value),
                                className: "w-full pl-10 pr-4 py-2 rounded-lg bg-bg-subtle border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 880,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 876,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-[180px] relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[16px]",
                                children: "tag"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 891,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Correlation ID",
                                value: correlationIdFilter,
                                onChange: (e)=>setCorrelationIdFilter(e.target.value),
                                className: "w-full pl-9 pr-3 py-2 rounded-lg bg-bg-subtle border border-border text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-primary"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 894,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 890,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setGroupedView((v)=>!v),
                        className: `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${groupedView ? "bg-violet-500/15 border-violet-500/30 text-violet-700 dark:text-violet-300" : "bg-bg-subtle border-border text-text-muted hover:text-text-primary"}`,
                        title: groupedView ? "Show all rows" : "Show latest per correlation ID",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[16px]",
                                children: groupedView ? "unfold_less" : "unfold_more"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 913,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            groupedView ? "Grouped" : "All"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 904,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: selectedProvider,
                        onChange: (e)=>setSelectedProvider(e.target.value),
                        className: "px-3 py-2 rounded-lg bg-bg-subtle border border-border text-sm text-text-primary focus:outline-none focus:border-primary appearance-none cursor-pointer min-w-[140px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: t("allProviders")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 925,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            uniqueProviders.map((p)=>{
                                const compatLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerDisplayLabel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProviderDisplayLabel"])(p, providerNodes);
                                const pc = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"][p];
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: p,
                                    children: compatLabel || pc?.label || p.toUpperCase()
                                }, p, false, {
                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                    lineNumber: 930,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0));
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 920,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: selectedModel,
                        onChange: (e)=>setSelectedModel(e.target.value),
                        className: "px-3 py-2 rounded-lg bg-bg-subtle border border-border text-sm text-text-primary focus:outline-none focus:border-primary appearance-none cursor-pointer min-w-[180px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: t("allModels")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 943,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            uniqueModels.map((model)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: model,
                                    children: model
                                }, model, false, {
                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                    lineNumber: 945,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 938,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: selectedAccount,
                        onChange: (e)=>setSelectedAccount(e.target.value),
                        className: "px-3 py-2 rounded-lg bg-bg-subtle border border-border text-sm text-text-primary focus:outline-none focus:border-primary appearance-none cursor-pointer min-w-[140px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: t("allAccounts")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 957,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            uniqueAccounts.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: a,
                                    children: emailsVisible ? a : `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maskAccount"])(a, false)} · #${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stableAccountSuffix"])(a)}`
                                }, a, false, {
                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                    lineNumber: 959,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 952,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: selectedApiKey,
                        onChange: (e)=>setSelectedApiKey(e.target.value),
                        className: "px-3 py-2 rounded-lg bg-bg-subtle border border-border text-sm text-text-primary focus:outline-none focus:border-primary appearance-none cursor-pointer min-w-[160px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: t("allApiKeys")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 971,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            uniqueApiKeys.map((value)=>{
                                const matched = logs.find((l)=>(l.apiKeyId || l.apiKeyName) === value);
                                const label = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatApiKeyLabel"])(matched?.apiKeyName, matched?.apiKeyId);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: value,
                                    children: label
                                }, value, false, {
                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                    lineNumber: 976,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0));
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 966,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-xs text-text-muted",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2 py-1 rounded bg-bg-subtle border border-border font-mono",
                                children: [
                                    totalCount,
                                    " ",
                                    t("total")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 985,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            runningCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2 py-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono",
                                children: [
                                    runningCount,
                                    " running"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 989,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2 py-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono",
                                children: [
                                    okCount,
                                    " ",
                                    t("ok")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 993,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            errorCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2 py-1 rounded bg-red-500/10 text-red-700 dark:text-red-400 font-mono",
                                children: [
                                    errorCount,
                                    " ",
                                    t("err")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 997,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            comboCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2 py-1 rounded bg-violet-500/10 text-violet-700 dark:text-violet-400 font-mono",
                                children: [
                                    comboCount,
                                    " ",
                                    t("combo")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1002,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            apiKeyCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2 py-1 rounded bg-primary/10 text-primary font-mono",
                                children: [
                                    apiKeyCount,
                                    " ",
                                    t("keys")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1007,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2 py-1 rounded bg-bg-subtle border border-border font-mono",
                                children: [
                                    sortedLogs.length,
                                    " ",
                                    t("shown")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1011,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 984,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: sortBy,
                        onChange: (e)=>setSortBy(e.target.value),
                        className: "px-3 py-2 rounded-lg bg-bg-subtle border border-border text-sm text-text-primary focus:outline-none focus:border-primary appearance-none cursor-pointer min-w-[150px]",
                        title: t("sortLogs"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "newest",
                                children: t("sortNewest")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1023,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "oldest",
                                children: t("sortOldest")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1024,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "tokens_desc",
                                children: t("sortTokensDesc")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1025,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "tokens_asc",
                                children: t("sortTokensAsc")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1026,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "duration_desc",
                                children: t("sortDurationDesc")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1027,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "duration_asc",
                                children: t("sortDurationAsc")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1028,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "status_desc",
                                children: t("sortStatusDesc")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1029,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "status_asc",
                                children: t("sortStatusAsc")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1030,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "model_asc",
                                children: t("sortModelAsc")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1031,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "model_desc",
                                children: t("sortModelDesc")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1032,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 1017,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>updateRefreshIntervalSec((v)=>v - 1),
                                className: "w-6 h-6 flex items-center justify-center rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors text-sm font-bold",
                                title: "Decrease interval",
                                children: "−"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1037,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: 1,
                                max: 300,
                                value: refreshIntervalSec,
                                onChange: (e)=>{
                                    const v = Number.parseInt(e.target.value, 10);
                                    if (!Number.isNaN(v)) updateRefreshIntervalSec(v);
                                },
                                className: "w-12 text-center text-[11px] bg-transparent border border-border rounded px-1 py-0.5 text-text-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                                title: "Auto-refresh interval in seconds"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1044,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>updateRefreshIntervalSec((v)=>v + 1),
                                className: "w-6 h-6 flex items-center justify-center rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors text-sm font-bold",
                                title: "Increase interval",
                                children: "+"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1056,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] text-text-muted",
                                children: "s"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1063,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 1036,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>fetchLogs(false),
                        className: "p-2 rounded-lg hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors",
                        title: t("refresh"),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[18px]",
                            children: "refresh"
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                            lineNumber: 1072,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 1067,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                lineNumber: 839,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-2",
                children: [
                    statusFilters.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setActiveFilter(activeFilter === f.key ? "all" : f.key),
                            className: `flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeFilter === f.key ? f.key === "error" ? "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40" : f.key === "ok" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40" : f.key === "combo" ? "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/40" : "bg-primary text-white border-primary" : "bg-bg-subtle border-border text-text-muted hover:border-text-muted"}`,
                            children: [
                                f.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: f.icon
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                    lineNumber: 1095,
                                    columnNumber: 26
                                }, ("TURBOPACK compile-time value", void 0)),
                                f.label
                            ]
                        }, f.key, true, {
                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                            lineNumber: 1080,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))),
                    uniqueProviders.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "w-px h-5 bg-border mx-1"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 1101,
                        columnNumber: 42
                    }, ("TURBOPACK compile-time value", void 0)),
                    uniqueProviders.map((p)=>{
                        const compatLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerDisplayLabel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProviderDisplayLabel"])(p, providerNodes);
                        const pc = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"][p] || {
                            bg: "#374151",
                            text: "#fff",
                            label: compatLabel || p.toUpperCase()
                        };
                        const displayLabel = compatLabel || pc.label;
                        const isActive = selectedProvider === p;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setSelectedProvider(isActive ? "" : p),
                            className: `px-3 py-1 rounded-full text-xs font-bold uppercase border transition-all ${isActive ? "border-white/40 ring-1 ring-white/20" : "border-transparent opacity-70 hover:opacity-100"}`,
                            style: {
                                backgroundColor: isActive ? pc.bg : `${pc.bg}33`,
                                color: isActive ? pc.text : pc.bg
                            },
                            children: displayLabel
                        }, p, false, {
                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                            lineNumber: 1114,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0));
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                lineNumber: 1077,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-text-muted uppercase tracking-wider mr-1",
                        children: t("columnsLabel")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                        lineNumber: 1135,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    columns.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>toggleColumn(col.key),
                            className: `px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${visibleColumns[col.key] ? "bg-primary/15 text-primary border-primary/30" : "bg-bg-subtle text-text-muted border-border opacity-50 hover:opacity-80"}`,
                            children: col.label
                        }, col.key, false, {
                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                            lineNumber: 1139,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)))
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                lineNumber: 1134,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                padding: "none",
                className: "min-h-[460px] resize-y overflow-auto bg-surface",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: scrollContainerRef,
                    className: "p-0 overflow-x-auto overflow-y-auto h-full min-h-[460px]",
                    children: [
                        loading && logs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-8 text-center text-text-muted",
                            children: t("loadingLogs")
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                            lineNumber: 1160,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0)) : logs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-8 text-center text-text-muted",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[48px] mb-2 block opacity-40",
                                    children: "receipt_long"
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                    lineNumber: 1163,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                t("noLogs")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                            lineNumber: 1162,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0)) : sortedLogs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-8 text-center text-text-muted",
                            children: t("noMatchingLogs")
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                            lineNumber: 1169,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_CLASS"],
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEAD_CLASS"],
                                    style: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_BG_STYLE"],
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_ROW_CLASS"],
                                        style: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_BG_STYLE"],
                                        children: [
                                            visibleColumns.status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_CLASS"]} cursor-pointer select-none`,
                                                onClick: ()=>toggleSort("status"),
                                                children: [
                                                    t("columns.status"),
                                                    getSortIndicator("status")
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1175,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.cacheSource && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_CLASS"],
                                                children: t("columns.cacheSource")
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1184,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.model && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_CLASS"],
                                                children: t("columns.model")
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1187,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.requestedModel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_CLASS"],
                                                children: t("columns.requested")
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1190,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.provider && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_CLASS"],
                                                children: t("columns.provider")
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1193,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.protocol && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_CLASS"],
                                                children: t("columns.protocol")
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1196,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.account && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_CLASS"],
                                                children: t("columns.account")
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1199,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.apiKey && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_CLASS"],
                                                children: t("columns.apiKey")
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1202,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.combo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_CLASS"],
                                                children: t("columns.combo")
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1205,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.tokens && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_RIGHT_CLASS"]} cursor-pointer select-none`,
                                                onClick: ()=>toggleSort("tokens"),
                                                children: [
                                                    t("columns.tokens"),
                                                    getSortIndicator("tokens")
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1208,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.tps && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_RIGHT_CLASS"]} cursor-pointer select-none`,
                                                onClick: ()=>toggleSort("tps"),
                                                children: [
                                                    t("columns.tps"),
                                                    getSortIndicator("tps")
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1217,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.duration && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_RIGHT_CLASS"]} cursor-pointer select-none`,
                                                onClick: ()=>toggleSort("duration"),
                                                children: [
                                                    t("columns.duration"),
                                                    getSortIndicator("duration")
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1226,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            visibleColumns.time && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$logTableStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOG_TABLE_HEADER_CELL_RIGHT_CLASS"]} cursor-pointer select-none`,
                                                onClick: ()=>toggleSort("time"),
                                                children: [
                                                    t("columns.time"),
                                                    getSortIndicator("time")
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                lineNumber: 1235,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                        lineNumber: 1173,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                    lineNumber: 1172,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    className: "divide-y divide-border/30",
                                    children: groupedLogs.map((log)=>{
                                        const isActive = log.active === true;
                                        const statusStyle = isActive ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getHttpStatusStyle"])(log.status);
                                        const protocolKey = isActive ? null : log.sourceFormat || log.provider;
                                        const protocol = protocolKey ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProtocolColor"])(protocolKey, log.provider) : null;
                                        const compatLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerDisplayLabel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProviderDisplayLabel"])(log.provider, providerNodes);
                                        const providerColor = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"][log.provider] || {
                                            bg: "#374151",
                                            text: "#fff",
                                            label: compatLabel || (log.provider || "-").toUpperCase()
                                        };
                                        const providerLabel = log.providerDisplay || compatLabel || providerColor.label;
                                        const isError = !isActive && log.status >= 400;
                                        const cacheSourceMeta = getCacheSourceMeta(log.cacheSource);
                                        const isSemanticCache = cacheSourceMeta?.key === "semantic";
                                        const accountLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maskAccount"])(log.account, emailsVisible);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            onClick: ()=>openDetail(log),
                                            "data-cid": log.correlationId || undefined,
                                            onMouseEnter: ()=>log.correlationId && setHoveredCid(log.correlationId),
                                            onMouseLeave: ()=>setHoveredCid(null),
                                            className: `cursor-pointer transition-colors ` + `${isError ? "bg-red-500/5 hover:bg-red-500/15 dark:hover:bg-red-400/15" : "hover:bg-sky-500/10 dark:hover:bg-sky-400/10"} ` + `${log.isRetry ? "border-l-2 border-l-amber-500/50" : ""} ` + `${hoveredCid && log.correlationId === hoveredCid ? "bg-violet-500/10 dark:bg-violet-400/10 ring-1 ring-violet-500/20" : ""}`,
                                            style: log.isRetry ? {
                                                backgroundColor: hoveredCid && log.correlationId === hoveredCid ? undefined : "rgba(245,158,11,0.03)"
                                            } : undefined,
                                            children: [
                                                visibleColumns.status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2",
                                                    children: isActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/25",
                                                        title: "In progress",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-block h-3 w-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                            lineNumber: 1300,
                                                            columnNumber: 33
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1296,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "inline-block px-2 py-0.5 rounded text-[10px] font-bold min-w-[36px] text-center",
                                                                style: {
                                                                    backgroundColor: statusStyle.bg,
                                                                    color: statusStyle.text
                                                                },
                                                                children: log.status || "..."
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                lineNumber: 1304,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            log.groupStatus === "healed" && !log.isRetry && log.status >= 400 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-emerald-500 text-[11px]",
                                                                title: "Recovered by retry",
                                                                children: "✓"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                lineNumber: 1316,
                                                                columnNumber: 37
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            log.isRetry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "inline-flex items-center text-amber-500 hover:text-amber-400 text-[11px] ml-0.5",
                                                                title: "Go to parent request",
                                                                onClick: (e)=>{
                                                                    e.stopPropagation();
                                                                    const parent = groupedLogs.find((g)=>g.correlationId === log.correlationId && !g.isRetry);
                                                                    if (parent) openDetail(parent);
                                                                },
                                                                children: "↳"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                lineNumber: 1324,
                                                                columnNumber: 35
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1303,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1294,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.cacheSource && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2",
                                                    children: isActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted text-[10px]",
                                                        children: "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1345,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${cacheSourceMeta?.className || ""}`,
                                                        title: isSemanticCache ? t("semanticCacheHit") : t("upstreamResponse"),
                                                        children: isSemanticCache ? t("semantic") : t("upstream")
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1347,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1343,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.model && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2 font-medium text-primary font-mono text-[11px]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: log.model
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                    lineNumber: 1361,
                                                                    columnNumber: 31
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                log.groupStatus === "healed" && !log.isRetry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "inline-flex items-center gap-0.5 px-1 py-0 rounded text-[8px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
                                                                    title: `Failed, recovered after ${log.groupSize - 1} retry`,
                                                                    children: "healed"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                    lineNumber: 1363,
                                                                    columnNumber: 33
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                log.groupStatus === "failed" && !log.isRetry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "inline-flex items-center gap-0.5 px-1 py-0 rounded text-[8px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25",
                                                                    title: `All ${log.groupSize} attempts failed`,
                                                                    children: "failed"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                    lineNumber: 1371,
                                                                    columnNumber: 33
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                log.modelPinned && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "inline-flex items-center gap-0.5 px-1 py-0 rounded text-[8px] font-bold bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/25",
                                                                    title: "Model selected via context-cache session pinning",
                                                                    children: "pinned"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                    lineNumber: 1379,
                                                                    columnNumber: 33
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                            lineNumber: 1360,
                                                            columnNumber: 29
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        log.correlationId && !log.isRetry && log.groupSize > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[9px] text-text-muted font-normal truncate max-w-[120px]",
                                                            title: log.correlationId,
                                                            children: [
                                                                log.correlationId.slice(0, 12),
                                                                "… · ",
                                                                log.groupSize,
                                                                " attempts"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                            lineNumber: 1388,
                                                            columnNumber: 31
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        log.correlationId && !log.isRetry && log.groupSize <= 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[9px] text-text-muted font-normal truncate max-w-[120px]",
                                                            title: log.correlationId,
                                                            children: [
                                                                log.correlationId.slice(0, 12),
                                                                "…"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                            lineNumber: 1396,
                                                            columnNumber: 31
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        log.correlationId && log.isRetry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[9px] text-amber-500/70 font-normal truncate max-w-[120px]",
                                                            title: log.correlationId,
                                                            children: [
                                                                log.correlationId.slice(0, 12),
                                                                "…"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                            lineNumber: 1404,
                                                            columnNumber: 31
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1359,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.requestedModel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2 font-mono text-[11px]",
                                                    children: log.requestedModel ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: log.requestedModel !== log.model ? "text-amber-600 dark:text-amber-400" : "text-text-muted",
                                                        title: log.requestedModel !== log.model ? t("requestedRoutedTitle", {
                                                            requested: log.requestedModel,
                                                            routed: log.model
                                                        }) : log.requestedModel,
                                                        children: log.requestedModel
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1416,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted text-[10px]",
                                                        children: "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1434,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1414,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.provider && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                                                        style: {
                                                            backgroundColor: providerColor.bg,
                                                            color: providerColor.text
                                                        },
                                                        children: providerLabel
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1440,
                                                        columnNumber: 29
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1439,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.protocol && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2",
                                                    children: isActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted text-[10px]",
                                                        children: "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1454,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                                                        style: protocol ? {
                                                            backgroundColor: protocol.bg,
                                                            color: protocol.text
                                                        } : {},
                                                        children: protocol?.label || "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1456,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1452,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.account && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2 text-text-muted truncate max-w-[120px]",
                                                    title: accountLabel,
                                                    children: accountLabel
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1470,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.apiKey && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2 text-text-muted truncate max-w-[140px]",
                                                    title: log.apiKeyName || log.apiKeyId || t("noApiKey"),
                                                    children: isActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted text-[10px]",
                                                        children: "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1483,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatApiKeyLabel"])(log.apiKeyName, log.apiKeyId)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1478,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.combo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2",
                                                    children: isActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted text-[10px]",
                                                        children: "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1492,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0)) : log.comboName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-500/20 text-violet-800 dark:text-violet-300 border border-violet-500/40",
                                                        children: log.comboName
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1494,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted text-[10px]",
                                                        children: "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1498,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1490,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.tokens && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2 text-right whitespace-nowrap",
                                                    children: isActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted text-[10px]",
                                                        children: "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1505,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-text-muted",
                                                                children: "TI:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                lineNumber: 1508,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-primary",
                                                                children: log.tokens?.in?.toLocaleString() || 0
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                lineNumber: 1509,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "mx-1 text-border",
                                                                children: "|"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                lineNumber: 1512,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-text-muted",
                                                                children: "TO:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                lineNumber: 1513,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-emerald-700 dark:text-emerald-400",
                                                                children: log.tokens?.out?.toLocaleString() || 0
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                lineNumber: 1514,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            log.tokens?.compressed != null && log.tokens.compressed > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "mx-1 text-border",
                                                                        children: "|"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                        lineNumber: 1519,
                                                                        columnNumber: 37
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-purple-500 dark:text-purple-400 font-semibold",
                                                                        title: `${log.tokens.compressed.toLocaleString()} tokens compressed`,
                                                                        children: [
                                                                            "↓",
                                                                            log.tokens.compressed.toLocaleString()
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                                        lineNumber: 1520,
                                                                        columnNumber: 37
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true)
                                                        ]
                                                    }, void 0, true)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1503,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.tps && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2 text-right whitespace-nowrap font-mono",
                                                    children: isActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted text-[10px]",
                                                        children: "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                        lineNumber: 1535,
                                                        columnNumber: 31
                                                    }, ("TURBOPACK compile-time value", void 0)) : (()=>{
                                                        const tps = getLogTps(log);
                                                        const color = tps <= 0 ? "text-text-muted" : tps >= 80 ? "text-emerald-600 dark:text-emerald-400" : tps >= 30 ? "text-sky-600 dark:text-sky-400" : "text-amber-600 dark:text-amber-400";
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: color,
                                                            title: `${tps.toFixed(2)} tokens/sec`,
                                                            children: formatTps(tps)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                            lineNumber: 1548,
                                                            columnNumber: 35
                                                        }, ("TURBOPACK compile-time value", void 0));
                                                    })()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1533,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.duration && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2 text-right text-text-muted font-mono",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDuration"])(log.duration)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1557,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                visibleColumns.time && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2 text-right text-text-muted",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTime"])(log.timestamp)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                                    lineNumber: 1562,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, log.id, true, {
                                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                            lineNumber: 1266,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0));
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                    lineNumber: 1245,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                            lineNumber: 1171,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0)),
                        hasMore && sortedLogs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: loadMoreSentinelRef,
                            className: "flex justify-center py-3 border-t border-border/30",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: loadMore,
                                className: "px-4 py-1.5 text-xs rounded-md border border-border bg-bg-subtle hover:bg-bg-muted text-text-muted transition-colors",
                                children: loading ? t("loadingMore") : t("loadMore")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                                lineNumber: 1578,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                            lineNumber: 1574,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                    lineNumber: 1155,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                lineNumber: 1154,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[10px] text-text-muted italic",
                children: t("callLogsInfo", {
                    dataDir: "{DATA_DIR}/call_logs/",
                    retentionDays: "CALL_LOG_RETENTION_DAYS",
                    maxEntries: "CALL_LOG_MAX_ENTRIES"
                })
            }, void 0, false, {
                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                lineNumber: 1590,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            selectedLog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$RequestLoggerDetail$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                log: selectedLog,
                detail: detailData,
                loading: detailLoading,
                debugEnabled: selectedLog.active ? true : detailLoggingEnabled,
                emailsVisible: emailsVisible,
                onClose: closeDetail,
                onCopy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clipboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["copyToClipboard"],
                onPrevious: handlePrev,
                onNext: handleNext,
                relatedLogs: selectedLog.correlationId ? groupedLogs.filter((l)=>l.correlationId === selectedLog.correlationId) : [],
                onSelectRelated: (r)=>{
                    closeDetail();
                    openDetail(r);
                }
            }, void 0, false, {
                fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
                lineNumber: 1600,
                columnNumber: 11
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/RequestLoggerV2.tsx",
        lineNumber: 837,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
RequestLoggerV2.displayName = "RequestLoggerV2";
const __TURBOPACK__default__export__ = RequestLoggerV2;
}),
];

//# sourceMappingURL=src_shared_components_RequestLoggerV2_tsx_1stlz1-._.js.map