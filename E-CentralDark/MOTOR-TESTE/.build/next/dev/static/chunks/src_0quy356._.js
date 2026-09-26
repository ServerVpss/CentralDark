(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/shared/components/flow/FlowCanvas.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FlowCanvas",
    ()=>FlowCanvas,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const FIT_VIEW_OPTIONS = {
    padding: 0.22,
    duration: 250
};
const MIN_ZOOM = 0.08;
const MAX_ZOOM = 2;
const REFIT_DELAY_MS = 60;
function FlowCanvas({ nodes, edges, nodeTypes, edgeTypes, fitKey, interactive = false, className = "h-full w-full min-w-0 overflow-hidden", onNodeClick, children }) {
    _s();
    const rfInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Bumped on every onInit so queued fitView calls can be invalidated when
    // a new ReactFlow instance mounts (e.g. via fitKey change).
    const generationRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const onInit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FlowCanvas.useCallback[onInit]": (instance)=>{
            const generation = ++generationRef.current;
            rfInstance.current = instance;
            // Defer fitView until ReactFlow has measured its viewport, but guard
            // against the instance being replaced (generation mismatch) before the
            // timer fires — see Bug #4 in the audit report.
            setTimeout({
                "FlowCanvas.useCallback[onInit]": ()=>{
                    if (generationRef.current === generation) {
                        instance.fitView(FIT_VIEW_OPTIONS);
                    }
                }
            }["FlowCanvas.useCallback[onInit]"], REFIT_DELAY_MS);
        }
    }["FlowCanvas.useCallback[onInit]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FlowCanvas.useEffect": ()=>{
            const el = containerRef.current;
            if (!el) return;
            const ro = new ResizeObserver({
                "FlowCanvas.useEffect": ()=>{
                    rfInstance.current?.fitView(FIT_VIEW_OPTIONS);
                }
            }["FlowCanvas.useEffect"]);
            ro.observe(el);
            return ({
                "FlowCanvas.useEffect": ()=>ro.disconnect()
            })["FlowCanvas.useEffect"];
        }
    }["FlowCanvas.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FlowCanvas.useEffect": ()=>{
            // Snapshot the generation so a queued callback that fires after a
            // remount is silently dropped (no fitView on stale instance).
            const generation = generationRef.current;
            const id = setTimeout({
                "FlowCanvas.useEffect.id": ()=>{
                    if (generationRef.current === generation) {
                        rfInstance.current?.fitView(FIT_VIEW_OPTIONS);
                    }
                }
            }["FlowCanvas.useEffect.id"], REFIT_DELAY_MS);
            return ({
                "FlowCanvas.useEffect": ()=>clearTimeout(id)
            })["FlowCanvas.useEffect"];
        }
    }["FlowCanvas.useEffect"], [
        nodes.length
    ]);
    // Clear the ref on unmount so a late-arriving callback (e.g. a ResizeObserver
    // tick fired just before the React tree unmounted) cannot reach into a
    // disposed ReactFlow instance.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FlowCanvas.useEffect": ()=>{
            return ({
                "FlowCanvas.useEffect": ()=>{
                    rfInstance.current = null;
                }
            })["FlowCanvas.useEffect"];
        }
    }["FlowCanvas.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: className,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlow"], {
            className: "omniroute-flow",
            nodes: nodes,
            edges: edges,
            nodeTypes: nodeTypes,
            edgeTypes: edgeTypes,
            onNodeClick: onNodeClick,
            fitView: true,
            fitViewOptions: FIT_VIEW_OPTIONS,
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            onInit: onInit,
            proOptions: {
                hideAttribution: true
            },
            panOnDrag: true,
            zoomOnScroll: true,
            zoomOnPinch: true,
            zoomOnDoubleClick: true,
            preventScrolling: false,
            nodesDraggable: interactive,
            nodesConnectable: false,
            elementsSelectable: interactive,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Controls"], {
                    showInteractive: false
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/flow/FlowCanvas.tsx",
                    lineNumber: 145,
                    columnNumber: 9
                }, this),
                children
            ]
        }, fitKey, true, {
            fileName: "[project]/src/shared/components/flow/FlowCanvas.tsx",
            lineNumber: 122,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/shared/components/flow/FlowCanvas.tsx",
        lineNumber: 121,
        columnNumber: 5
    }, this);
}
_s(FlowCanvas, "kdEXNmvVaW81iLzhILJnkswWW0c=");
_c = FlowCanvas;
const __TURBOPACK__default__export__ = FlowCanvas;
var _c;
__turbopack_context__.k.register(_c, "FlowCanvas");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/flow/edgeStyles.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FLOW_EDGE_COLORS",
    ()=>FLOW_EDGE_COLORS,
    "edgeStyle",
    ()=>edgeStyle
]);
/**
 * Shared ReactFlow edge palette + styling, extracted verbatim from
 * `ProviderTopology.tsx` (U0). Reused by the Combo/Routing Studio (Tela B) and
 * the Compression Studio (Tela A) so all three flow graphs speak the same
 * color language: green = active, red = error, amber = last-used, muted = idle.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$statusColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/statusColors.ts [app-client] (ecmascript)");
;
const FLOW_EDGE_COLORS = {
    active: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$statusColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_HEX"].success,
    error: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$statusColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_HEX"].error,
    last: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$statusColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS_HEX"].warning,
    idle: "var(--color-text-muted)"
};
function edgeStyle(active, last, error, healthy = false) {
    if (error) return {
        stroke: FLOW_EDGE_COLORS.error,
        strokeWidth: 2,
        opacity: 0.85
    };
    if (active) return {
        stroke: FLOW_EDGE_COLORS.active,
        strokeWidth: 2.5,
        opacity: 1
    };
    if (last) return {
        stroke: FLOW_EDGE_COLORS.last,
        strokeWidth: 1.5,
        opacity: 0.6
    };
    if (healthy) return {
        stroke: FLOW_EDGE_COLORS.active,
        strokeWidth: 1.5,
        opacity: 0.4
    };
    return {
        stroke: FLOW_EDGE_COLORS.idle,
        strokeWidth: 1,
        opacity: 0.3
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/flow/StatusDot.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatusDot",
    ()=>StatusDot,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/flow/edgeStyles.ts [app-client] (ecmascript)");
;
;
function StatusDot({ color, error = false, sizeClass = "size-1.5", pulse = true }) {
    const dotColor = error ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].error : color;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `relative flex ${sizeClass} shrink-0`,
        children: [
            pulse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "animate-ping absolute inline-flex h-full w-full rounded-full opacity-70",
                style: {
                    backgroundColor: dotColor
                }
            }, void 0, false, {
                fileName: "[project]/src/shared/components/flow/StatusDot.tsx",
                lineNumber: 36,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `relative inline-flex rounded-full ${sizeClass}`,
                style: {
                    backgroundColor: dotColor
                }
            }, void 0, false, {
                fileName: "[project]/src/shared/components/flow/StatusDot.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/flow/StatusDot.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c = StatusDot;
const __TURBOPACK__default__export__ = StatusDot;
var _c;
__turbopack_context__.k.register(_c, "StatusDot");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/providerFallbackColor.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Deterministic fallback color for provider ids that are not present in the static
 * AI_PROVIDERS registry — e.g. user-defined `openai-compatible-*` / `anthropic-compatible-*`
 * providers backed by the `provider_nodes` table. Without this, every such custom provider
 * rendered as the same anonymous gray node in the Topology view, indistinguishable from any
 * other custom provider even though its label was already resolved correctly. See #8328.
 */ // Small palette of visually distinguishable, saturated colors — spread far enough apart in
// hue to stay distinguishable side-by-side on both light and dark topology backgrounds.
__turbopack_context__.s([
    "FALLBACK_COLOR_PALETTE",
    ()=>FALLBACK_COLOR_PALETTE,
    "getFallbackProviderColor",
    ()=>getFallbackProviderColor
]);
const FALLBACK_COLOR_PALETTE = [
    "#0ea5e9",
    "#a855f7",
    "#f59e0b",
    "#10b981",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
    "#f97316"
];
/** FNV-1a hash — fast, deterministic, and well-distributed for short id strings. */ function hashProviderId(value) {
    let hash = 0x811c9dc5;
    for(let i = 0; i < value.length; i++){
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}
function getFallbackProviderColor(providerId) {
    if (!providerId) return FALLBACK_COLOR_PALETTE[0];
    const index = hashProviderId(providerId) % FALLBACK_COLOR_PALETTE.length;
    return FALLBACK_COLOR_PALETTE[index];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/home/topologyLabel.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Resolve the display label for a provider node in the home topology graph (#3198).
 *
 * The parent (HomePageClient) pre-resolves a friendly name into `entry.name` via
 * `getProviderDisplayLabel` (which knows custom provider nodes). `getProviderConfig`
 * only knows built-in providers and falls back to `{ name: providerId }` for unknown
 * ids — so for a custom provider (`openai-compatible-chat-<uuid>`) its `name` is the
 * raw UUID. The pre-resolved `entry.name` must therefore win over the config fallback;
 * otherwise the topology renders the UUID instead of the user's provider name.
 */ __turbopack_context__.s([
    "resolveTopologyNodeLabel",
    ()=>resolveTopologyNodeLabel
]);
function resolveTopologyNodeLabel(entryName, configName, providerId) {
    return entryName && entryName.trim() || configName && configName.trim() || providerId;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/home/ProviderTopology.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProviderTopology
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ProviderIcon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$FlowCanvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/flow/FlowCanvas.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$StatusDot$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/flow/StatusDot.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/flow/edgeStyles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerFallbackColor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/providerFallbackColor.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$home$2f$topologyLabel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/home/topologyLabel.ts [app-client] (ecmascript)");
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
// Rings: [capacity, rx, ry]. Each successive ring fits ~6 more nodes.
const RINGS = [
    [
        8,
        210,
        132
    ],
    [
        14,
        370,
        233
    ],
    [
        20,
        530,
        334
    ],
    [
        26,
        690,
        435
    ],
    [
        32,
        850,
        536
    ],
    [
        38,
        1010,
        637
    ]
];
function getProviderConfig(providerId) {
    // Predefined providers keep their registry color/name untouched. Anything else (custom
    // openai-compatible-*/anthropic-compatible-* provider_nodes) gets a deterministic,
    // per-id fallback color instead of one shared gray — see #8328.
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AI_PROVIDERS"][providerId] || {
        color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerFallbackColor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFallbackProviderColor"])(providerId),
        name: providerId
    };
}
function ProviderNode({ data }) {
    const { label, color, providerId, active, error, healthy, last } = data;
    const GREEN = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].active;
    const RED = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].error;
    const AMBER = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].last;
    // "Last routed" is a traffic annotation, not a health state: the border keeps saying
    // whether the connection is up, and only the dot turns amber to mark recency.
    const dotColor = active ? color : last ? AMBER : GREEN;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border-2 transition-all duration-300 bg-bg cursor-pointer hover:scale-105 active:scale-95 shadow-sm hover:shadow-md",
        style: {
            borderColor: error ? RED : active ? color : healthy ? GREEN : "var(--color-border)",
            boxShadow: error ? `0 0 12px ${RED}30` : active ? `0 0 12px ${color}30` : healthy ? `0 0 10px ${GREEN}20` : "none",
            minWidth: "136px"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "target",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Top,
                id: "top",
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "target",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Bottom,
                id: "bottom",
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "target",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Left,
                id: "left",
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "target",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Right,
                id: "right",
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "size-6 rounded flex items-center justify-center shrink-0",
                style: {
                    backgroundColor: `${color}18`
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    providerId: providerId,
                    size: 16,
                    type: "color"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-medium truncate flex-1",
                style: {
                    color: active ? color : error ? RED : healthy ? GREEN : "var(--color-text-main)"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            (active || error || healthy || last) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$StatusDot$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatusDot"], {
                color: dotColor,
                error: error,
                pulse: active || error
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 117,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
_c = ProviderNode;
function RouterNode({ data }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-primary bg-primary/8 shadow-lg min-w-[140px] justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Top,
                id: "top",
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Bottom,
                id: "bottom",
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Left,
                id: "left",
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 140,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Right,
                id: "right",
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center size-7 rounded-md bg-primary/15 shrink-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-primary text-[16px]",
                    children: "route"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                    lineNumber: 154,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 153,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm font-bold text-primary",
                children: "OmniRoute"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 156,
                columnNumber: 7
            }, this),
            data.activeCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "ml-1 px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold leading-none",
                children: data.activeCount
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                lineNumber: 158,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
_c1 = RouterNode;
const nodeTypes = {
    provider: ProviderNode,
    router: RouterNode
};
function getHandles(angle, cx) {
    const rel = ((angle + Math.PI / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    if (rel < Math.PI / 4 || rel > 7 * Math.PI / 4) return {
        sourceHandle: "top",
        targetHandle: "bottom"
    };
    if (rel > 3 * Math.PI / 4 && rel < 5 * Math.PI / 4) return {
        sourceHandle: "bottom",
        targetHandle: "top"
    };
    return cx > 0 ? {
        sourceHandle: "right",
        targetHandle: "left"
    } : {
        sourceHandle: "left",
        targetHandle: "right"
    };
}
function buildLayout(providers, activeSet, lastSet, errorSet) {
    const nodeW = 156;
    const nodeH = 28;
    const routerW = 148;
    const routerH = 44;
    const nodes = [];
    const edges = [];
    nodes.push({
        id: "router",
        type: "router",
        position: {
            x: -routerW / 2,
            y: -routerH / 2
        },
        data: {
            activeCount: activeSet.size
        },
        draggable: false
    });
    if (providers.length === 0) return {
        nodes,
        edges
    };
    // Sort: active → error → last-used → healthy(connected) → rest (alpha within groups)
    const sorted = [
        ...providers
    ].sort((a, b)=>{
        const rank = (p)=>{
            const id = p.provider.toLowerCase();
            if (activeSet.has(id)) return 0;
            if (errorSet.has(id) || p.status === "error") return 1;
            if (lastSet.has(id)) return 2;
            if (p.status === "active") return 3;
            return 4;
        };
        const d = rank(a) - rank(b);
        return d !== 0 ? d : a.provider.toLowerCase().localeCompare(b.provider.toLowerCase()); // ASCII kasıtlı
    });
    let provIdx = 0;
    for(let ri = 0; ri < RINGS.length && provIdx < sorted.length; ri++){
        const [cap, rx, ry] = RINGS[ri];
        const count = Math.min(cap, sorted.length - provIdx);
        for(let i = 0; i < count; i++){
            const p = sorted[provIdx++];
            const pid = p.provider.toLowerCase();
            const active = activeSet.has(pid);
            // Traffic signals (live/recent request) take precedence; connection health is the
            // base state shown when a provider has no in-flight or recent traffic, so the map
            // still reflects "what is connected" at rest instead of going blank after a restart.
            const trafficError = !active && errorSet.has(pid);
            const last = !active && !trafficError && lastSet.has(pid);
            // Health is orthogonal to recency: having just served a request does not make a
            // connection any less connected. `last` used to suppress `healthy`/`healthError`,
            // and because the node had no `last` visual it fell all the way through to the idle
            // grey — so the provider you had just used rendered *less* connected than an idle
            // peer, while its edge was amber. Health drives the border, `last` only the dot.
            const healthError = !active && !trafficError && p.status === "error";
            const healthy = !active && !trafficError && !healthError && p.status === "active";
            const error = trafficError || healthError;
            const config = getProviderConfig(p.provider);
            const nodeId = `provider-${p.provider}`;
            const angle = -Math.PI / 2 + 2 * Math.PI * i / count;
            const cx = rx * Math.cos(angle);
            const cy = ry * Math.sin(angle);
            const { sourceHandle, targetHandle } = getHandles(angle, cx);
            nodes.push({
                id: nodeId,
                type: "provider",
                position: {
                    x: cx - nodeW / 2,
                    y: cy - nodeH / 2
                },
                data: {
                    label: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$home$2f$topologyLabel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveTopologyNodeLabel"])(p.name, config.name, p.provider),
                    color: config.color || "#6b7280",
                    providerId: p.provider,
                    active,
                    error,
                    healthy,
                    last
                },
                draggable: false
            });
            edges.push({
                id: `e-${nodeId}`,
                source: "router",
                sourceHandle,
                target: nodeId,
                targetHandle,
                animated: active,
                style: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["edgeStyle"])(active, last, error, healthy)
            });
        }
    }
    return {
        nodes,
        edges
    };
}
function ProviderTopology({ providers = [], activeRequests = [], lastProvider = "", errorProvider = "" }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const activeKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderTopology.useMemo[activeKey]": ()=>activeRequests.map({
                "ProviderTopology.useMemo[activeKey]": (r)=>r.provider?.toLowerCase()
            }["ProviderTopology.useMemo[activeKey]"]).filter(Boolean).sort().join(",")
    }["ProviderTopology.useMemo[activeKey]"], [
        activeRequests
    ]);
    const lastKey = lastProvider.toLowerCase();
    const errorKey = errorProvider.toLowerCase();
    const activeSet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderTopology.useMemo[activeSet]": ()=>new Set(activeKey ? activeKey.split(",") : [])
    }["ProviderTopology.useMemo[activeSet]"], [
        activeKey
    ]);
    const lastSet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderTopology.useMemo[lastSet]": ()=>new Set(lastKey ? [
                lastKey
            ] : [])
    }["ProviderTopology.useMemo[lastSet]"], [
        lastKey
    ]);
    const errorSet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderTopology.useMemo[errorSet]": ()=>new Set(errorKey ? [
                errorKey
            ] : [])
    }["ProviderTopology.useMemo[errorSet]"], [
        errorKey
    ]);
    const { nodes, edges } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderTopology.useMemo": ()=>buildLayout(providers, activeSet, lastSet, errorSet)
    }["ProviderTopology.useMemo"], // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        providers,
        activeSet,
        lastKey,
        errorKey
    ]);
    const providersKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderTopology.useMemo[providersKey]": ()=>providers.map({
                "ProviderTopology.useMemo[providersKey]": (p)=>p.provider
            }["ProviderTopology.useMemo[providersKey]"]).sort().join(",")
    }["ProviderTopology.useMemo[providersKey]"], [
        providers
    ]);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const handleNodeClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderTopology.useCallback[handleNodeClick]": (_event, node)=>{
            if (node.type !== "provider") return;
            const providerId = node.data?.providerId || node.id.replace(/^provider-/, "");
            if (providerId) {
                router.push(`/dashboard/providers/${providerId}`);
            }
        }
    }["ProviderTopology.useCallback[handleNodeClick]"], [
        router
    ]);
    const containerClass = "h-[300px] w-full min-w-0 rounded-xl border border-border bg-bg-subtle/20 overflow-hidden sm:h-[420px]";
    if (providers.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `${containerClass} flex flex-col items-center justify-center gap-2 text-text-muted`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[32px]",
                    children: "device_hub"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                    lineNumber: 355,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm",
                    children: t("providerTopologyEmpty")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
                    lineNumber: 356,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
            lineNumber: 352,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$FlowCanvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlowCanvas"], {
        nodes: nodes,
        edges: edges,
        nodeTypes: nodeTypes,
        fitKey: providersKey,
        className: containerClass,
        onNodeClick: handleNodeClick
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/home/ProviderTopology.tsx",
        lineNumber: 362,
        columnNumber: 5
    }, this);
}
_s(ProviderTopology, "IlTgEO8NCbhv+6DulbfDeTFA/Rs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c2 = ProviderTopology;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ProviderNode");
__turbopack_context__.k.register(_c1, "RouterNode");
__turbopack_context__.k.register(_c2, "ProviderTopology");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/home/ProviderTopology.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(dashboard)/home/ProviderTopology.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_0quy356._.js.map