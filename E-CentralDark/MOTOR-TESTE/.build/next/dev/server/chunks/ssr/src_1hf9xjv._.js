module.exports = [
"[project]/src/shared/components/flow/FlowCanvas.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FlowCanvas",
    ()=>FlowCanvas,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
"use client";
;
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
    const rfInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Bumped on every onInit so queued fitView calls can be invalidated when
    // a new ReactFlow instance mounts (e.g. via fitKey change).
    const generationRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const onInit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((instance)=>{
        const generation = ++generationRef.current;
        rfInstance.current = instance;
        // Defer fitView until ReactFlow has measured its viewport, but guard
        // against the instance being replaced (generation mismatch) before the
        // timer fires — see Bug #4 in the audit report.
        setTimeout(()=>{
            if (generationRef.current === generation) {
                instance.fitView(FIT_VIEW_OPTIONS);
            }
        }, REFIT_DELAY_MS);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(()=>{
            rfInstance.current?.fitView(FIT_VIEW_OPTIONS);
        });
        ro.observe(el);
        return ()=>ro.disconnect();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Snapshot the generation so a queued callback that fires after a
        // remount is silently dropped (no fitView on stale instance).
        const generation = generationRef.current;
        const id = setTimeout(()=>{
            if (generationRef.current === generation) {
                rfInstance.current?.fitView(FIT_VIEW_OPTIONS);
            }
        }, REFIT_DELAY_MS);
        return ()=>clearTimeout(id);
    }, [
        nodes.length
    ]);
    // Clear the ref on unmount so a late-arriving callback (e.g. a ResizeObserver
    // tick fired just before the React tree unmounted) cannot reach into a
    // disposed ReactFlow instance.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            rfInstance.current = null;
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: className,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlow"], {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Controls"], {
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
const __TURBOPACK__default__export__ = FlowCanvas;
}),
"[project]/src/shared/components/flow/edgeStyles.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$statusColors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/statusColors.ts [app-ssr] (ecmascript)");
;
const FLOW_EDGE_COLORS = {
    active: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$statusColors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STATUS_HEX"].success,
    error: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$statusColors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STATUS_HEX"].error,
    last: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$statusColors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STATUS_HEX"].warning,
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
}),
"[project]/src/app/(dashboard)/dashboard/combos/live/comboFlowModel.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * comboFlowModel — pure reducer and flow builder for Combo/Routing Studio (Tela B).
 *
 * Pure functions: no React, no side effects, no Date.now() calls.
 * Converts a stream of `combo.target.*` WS events into:
 *   1. A `ComboRunModel` (typed, serialisable model for UI).
 *   2. A ReactFlow `{ nodes, edges }` graph (left→right cascade view).
 *
 * Design choices:
 * - `ComboEventInput` is a minimal structural type covering the fields we use
 *   (kind/type, provider, model, targetIndex, strategy, latencyMs, error). It is
 *   intentionally compatible with `LiveComboEvent` from `useLiveDashboard.ts`, but
 *   adds the optional `strategy` field that the actual WS payload (`ComboTargetAttemptPayload`)
 *   carries. This avoids importing a "use client" hook file into a pure module.
 * - `classifyFailKind` checks `/circuit/i` first so a combined message like
 *   "circuit open after 429" maps to `circuit-open`, not `rate-limit`.
 * - Targets are kept sorted by `targetIndex`. A `Map<number, TargetNodeModel>` is
 *   used internally and converted to an array on each return — cheap at this scale.
 * - When an `attempt` event arrives for a `targetIndex` that already exists in the run
 *   (rare but possible), it idempotently sets the state back to `attempting`.
 * - Events whose `comboName` does not match the run's are silently ignored so the
 *   caller can safely fan-in all events to a single reducer without filtering.
 * - `comboRunToFlow` produces N+3 nodes: request → strategy → [target×N] → response.
 *   Edge style is derived via `edgeStyle` from the shared flow palette; the edge
 *   *into* each target node carries the target's state colour.
 */ __turbopack_context__.s([
    "classifyFailKind",
    ()=>classifyFailKind,
    "comboRunToFlow",
    ()=>comboRunToFlow,
    "enrichRunWithBreakers",
    ()=>enrichRunWithBreakers,
    "enrichRunWithConnectionCooldown",
    ()=>enrichRunWithConnectionCooldown,
    "reduceComboEvent",
    ()=>reduceComboEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/flow/edgeStyles.ts [app-ssr] (ecmascript)");
;
function classifyFailKind(error) {
    if (!error) return undefined;
    if (/circuit/i.test(error)) return "circuit-open";
    if (/429|rate/i.test(error)) return "rate-limit";
    if (/cooldown/i.test(error)) return "cooldown";
    return "other";
}
function reduceComboEvent(run, ev) {
    // Ignore mismatched combo events
    if (run !== null && ev.comboName !== run.comboName) {
        return run;
    }
    switch(ev.type){
        case "attempt":
            {
                const existingTargets = run ? new Map(run.targets.map((t)=>[
                        t.targetIndex,
                        t
                    ])) : new Map();
                const updatedTarget = {
                    targetIndex: ev.targetIndex,
                    provider: ev.provider,
                    model: ev.model,
                    state: "attempting"
                };
                existingTargets.set(ev.targetIndex, updatedTarget);
                const sortedTargets = [
                    ...existingTargets.values()
                ].sort((a, b)=>a.targetIndex - b.targetIndex);
                return {
                    comboName: ev.comboName,
                    strategy: run?.strategy || ev.strategy || "",
                    targets: sortedTargets,
                    outcome: run?.outcome === "succeeded" ? "succeeded" : "running",
                    startedAt: run?.startedAt ?? ev.timestamp,
                    finishedAt: run?.finishedAt
                };
            }
        case "failed":
            {
                if (!run) {
                    // Defensive: failed without a prior run — create a minimal one
                    const target = {
                        targetIndex: ev.targetIndex,
                        provider: ev.provider,
                        model: ev.model,
                        state: "failed",
                        latencyMs: ev.latencyMs,
                        error: ev.error,
                        failKind: classifyFailKind(ev.error)
                    };
                    return {
                        comboName: ev.comboName,
                        strategy: "",
                        targets: [
                            target
                        ],
                        outcome: "running",
                        startedAt: ev.timestamp
                    };
                }
                const updatedTargets = run.targets.map((t)=>t.targetIndex === ev.targetIndex ? {
                        ...t,
                        state: "failed",
                        latencyMs: ev.latencyMs,
                        error: ev.error,
                        failKind: classifyFailKind(ev.error)
                    } : t);
                return {
                    ...run,
                    targets: updatedTargets
                };
            }
        case "succeeded":
            {
                if (!run) {
                    const target = {
                        targetIndex: ev.targetIndex,
                        provider: ev.provider,
                        model: ev.model,
                        state: "succeeded",
                        latencyMs: ev.latencyMs
                    };
                    return {
                        comboName: ev.comboName,
                        strategy: "",
                        targets: [
                            target
                        ],
                        outcome: "succeeded",
                        startedAt: ev.timestamp,
                        finishedAt: ev.timestamp
                    };
                }
                const updatedTargets = run.targets.map((t)=>t.targetIndex === ev.targetIndex ? {
                        ...t,
                        state: "succeeded",
                        latencyMs: ev.latencyMs
                    } : t);
                return {
                    ...run,
                    targets: updatedTargets,
                    outcome: "succeeded",
                    finishedAt: ev.timestamp
                };
            }
    }
}
function comboRunToFlow(run) {
    const nodes = [];
    const edges = [];
    const X_STEP = 220;
    // ── Request node ─────────────────────────────────────────────────────────
    const requestId = "request";
    nodes.push({
        id: requestId,
        type: "request",
        position: {
            x: 0,
            y: 0
        },
        data: {
            label: "Request",
            comboName: run.comboName
        }
    });
    // ── Strategy node ─────────────────────────────────────────────────────────
    const strategyId = "strategy";
    nodes.push({
        id: strategyId,
        type: "strategy",
        position: {
            x: X_STEP,
            y: 0
        },
        data: {
            label: run.strategy || "combo",
            strategy: run.strategy,
            targetCount: run.targets.length
        }
    });
    // Edge: request → strategy (always active/idle depending on run state)
    const runActive = run.outcome === "running";
    const reqStratStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["edgeStyle"])(runActive, !runActive, false);
    edges.push({
        id: `e-${requestId}-${strategyId}`,
        source: requestId,
        target: strategyId,
        style: reqStratStyle
    });
    // ── Target nodes ──────────────────────────────────────────────────────────
    let prevId = strategyId;
    for(let i = 0; i < run.targets.length; i++){
        const t = run.targets[i];
        const nodeId = `target-${t.targetIndex}`;
        nodes.push({
            id: nodeId,
            type: "target",
            position: {
                x: (i + 2) * X_STEP,
                y: 0
            },
            data: {
                label: `${t.provider}/${t.model}`,
                provider: t.provider,
                model: t.model,
                state: t.state,
                latencyMs: t.latencyMs,
                error: t.error,
                failKind: t.failKind,
                targetIndex: t.targetIndex,
                cbState: t.cbState,
                cbRetryAfterMs: t.cbRetryAfterMs,
                cooldownCount: t.cooldownCount,
                cooldownTotal: t.cooldownTotal,
                cooldownRetryAfterMs: t.cooldownRetryAfterMs
            }
        });
        // Edge styled by this target's state
        const isError = t.state === "failed";
        const isActive = t.state === "succeeded";
        const isLast = t.state === "attempting";
        const targetEdgeStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["edgeStyle"])(isActive, isLast, isError);
        edges.push({
            id: `e-${prevId}-${nodeId}`,
            source: prevId,
            target: nodeId,
            style: targetEdgeStyle
        });
        prevId = nodeId;
    }
    // ── Response node ─────────────────────────────────────────────────────────
    const responseId = "response";
    nodes.push({
        id: responseId,
        type: "response",
        position: {
            x: (run.targets.length + 2) * X_STEP,
            y: 0
        },
        data: {
            label: "Response",
            outcome: run.outcome,
            finishedAt: run.finishedAt
        }
    });
    // Edge: last target → response — green if succeeded, muted otherwise
    const succeeded = run.outcome === "succeeded";
    const responseEdgeStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["edgeStyle"])(succeeded, false, false);
    edges.push({
        id: `e-${prevId}-${responseId}`,
        source: prevId,
        target: responseId,
        style: responseEdgeStyle
    });
    return {
        nodes,
        edges
    };
}
function normalizeCbState(state) {
    if (typeof state !== "string") return undefined;
    const up = state.toUpperCase();
    if (up === "OPEN" || up === "HALF_OPEN" || up === "DEGRADED" || up === "CLOSED") {
        return up;
    }
    return undefined;
}
function enrichRunWithBreakers(run, providerHealth) {
    if (!run) return null;
    if (!providerHealth) return run;
    let changed = false;
    const targets = run.targets.map((target)=>{
        const snapshot = providerHealth[target.provider];
        const cbState = normalizeCbState(snapshot?.state);
        if (cbState && cbState !== "CLOSED") {
            if (target.cbState === cbState && target.cbRetryAfterMs === snapshot?.retryAfterMs) {
                return target;
            }
            changed = true;
            return {
                ...target,
                cbState,
                cbRetryAfterMs: snapshot?.retryAfterMs
            };
        }
        // Healthy / unknown / absent → strip any stale breaker badge.
        if (target.cbState !== undefined || target.cbRetryAfterMs !== undefined) {
            changed = true;
            const { cbState: _cbState, cbRetryAfterMs: _cbRetryAfterMs, ...rest } = target;
            return rest;
        }
        return target;
    });
    return changed ? {
        ...run,
        targets
    } : run;
}
function enrichRunWithConnectionCooldown(run, connectionHealth) {
    if (!run) return null;
    if (!connectionHealth) return run;
    let changed = false;
    const targets = run.targets.map((target)=>{
        const snapshot = connectionHealth[target.provider];
        const coolingDown = typeof snapshot?.coolingDown === "number" ? snapshot.coolingDown : 0;
        if (coolingDown > 0) {
            const total = typeof snapshot?.total === "number" ? snapshot.total : coolingDown;
            const retryAfterMs = snapshot?.soonestRetryAfterMs;
            if (target.cooldownCount === coolingDown && target.cooldownTotal === total && target.cooldownRetryAfterMs === retryAfterMs) {
                return target;
            }
            changed = true;
            return {
                ...target,
                cooldownCount: coolingDown,
                cooldownTotal: total,
                cooldownRetryAfterMs: retryAfterMs
            };
        }
        // No cooldown → strip any stale cooldown badge.
        if (target.cooldownCount !== undefined || target.cooldownTotal !== undefined || target.cooldownRetryAfterMs !== undefined) {
            changed = true;
            const { cooldownCount: _c, cooldownTotal: _t, cooldownRetryAfterMs: _r, ...rest } = target;
            return rest;
        }
        return target;
    });
    return changed ? {
        ...run,
        targets
    } : run;
}
}),
"[project]/src/app/(dashboard)/dashboard/combos/live/fleetAggregation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * fleetAggregation — pure aggregation for Combo/Routing Studio fleet mode (U2).
 *
 * Pure functions: no React, no side effects, no Date.now() calls.
 * `now` is always passed as a parameter so this module is trivially unit-testable.
 *
 * `aggregateComboEventsToSets` classifies providers into three mutually-exclusive
 * sets based on their most recent event within a rolling time window:
 *
 *   error  — most recent event within windowMs was `failed`
 *   active — most recent event within windowMs was `attempt` or `succeeded`
 *   last   — most recent event is older than windowMs (or no events)
 *
 * A provider appears in exactly one set (latest-event wins; error/active only for
 * events within the window; everything else lands in `last`).
 *
 * This mirrors the three-state fleet colouring of `ProviderTopology.tsx` (the
 * `activeSet / errorSet / lastSet` pattern) so the fleet view of Tela B uses the
 * same visual language as the home dashboard.
 */ __turbopack_context__.s([
    "aggregateComboEventsToSets",
    ()=>aggregateComboEventsToSets
]);
function aggregateComboEventsToSets(events, windowMs, now) {
    // Build a map of provider → {latestTimestamp, latestType}
    // We only care about the most recent event per provider.
    const latestByProvider = new Map();
    for (const ev of events){
        const existing = latestByProvider.get(ev.provider);
        if (!existing || ev.timestamp > existing.timestamp) {
            latestByProvider.set(ev.provider, {
                timestamp: ev.timestamp,
                type: ev.type
            });
        }
    }
    const error = new Set();
    const active = new Set();
    const last = new Set();
    for (const [provider, { timestamp, type }] of latestByProvider){
        const age = now - timestamp;
        const withinWindow = age < windowMs;
        if (withinWindow && type === "failed") {
            error.add(provider);
        } else if (withinWindow && (type === "attempt" || type === "succeeded")) {
            active.add(provider);
        } else {
            last.add(provider);
        }
    }
    return {
        error,
        active,
        last
    };
}
}),
"[project]/src/app/(dashboard)/dashboard/combos/live/nodes/StrategyNode.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StrategyNode",
    ()=>StrategyNode,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-ssr] (ecmascript)");
"use client";
;
;
// ── Strategy color map ────────────────────────────────────────────────────
const STRATEGY_COLORS = {
    priority: "#3b82f6",
    weighted: "#8b5cf6",
    "round-robin": "#06b6d4",
    "fill-first": "#f59e0b",
    p2c: "#10b981",
    random: "#6b7280",
    "least-used": "#84cc16",
    "cost-optimized": "#22c55e",
    "reset-aware": "#f97316",
    "reset-window": "#f97316",
    "strict-random": "#a855f7",
    auto: "#6366f1",
    lkgp: "#ec4899",
    "context-optimized": "#14b8a6",
    "context-relay": "#0ea5e9"
};
function getStrategyColor(strategy) {
    return STRATEGY_COLORS[strategy] ?? "#6b7280";
}
function StrategyNode({ data }) {
    const { strategy, targetCount } = data;
    const color = getStrategyColor(strategy);
    const label = strategy || "combo";
    const count = targetCount;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center gap-1 px-3 py-2 rounded-full border-2 bg-bg transition-all duration-300",
        style: {
            borderColor: color,
            boxShadow: `0 0 10px ${color}30`,
            minWidth: "110px"
        },
        "data-testid": "strategy-node",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "target",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Left,
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/StrategyNode.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Right,
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/StrategyNode.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-semibold uppercase tracking-wide truncate",
                style: {
                    color
                },
                "data-testid": "strategy-label",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/StrategyNode.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            count > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-mono px-1.5 rounded-full",
                style: {
                    backgroundColor: `${color}20`,
                    color
                },
                "data-testid": "strategy-target-count",
                children: [
                    count,
                    " target",
                    count !== 1 ? "s" : ""
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/StrategyNode.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/StrategyNode.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = StrategyNode;
}),
"[project]/src/shared/components/flow/StatusDot.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatusDot",
    ()=>StatusDot,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/flow/edgeStyles.ts [app-ssr] (ecmascript)");
;
;
function StatusDot({ color, error = false, sizeClass = "size-1.5", pulse = true }) {
    const dotColor = error ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].error : color;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `relative flex ${sizeClass} shrink-0`,
        children: [
            pulse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "animate-ping absolute inline-flex h-full w-full rounded-full opacity-70",
                style: {
                    backgroundColor: dotColor
                }
            }, void 0, false, {
                fileName: "[project]/src/shared/components/flow/StatusDot.tsx",
                lineNumber: 36,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
const __TURBOPACK__default__export__ = StatusDot;
}),
"[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProviderCascadeNode",
    ()=>ProviderCascadeNode,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ProviderIcon.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$StatusDot$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/flow/StatusDot.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/flow/edgeStyles.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
// ── State → visual mapping ────────────────────────────────────────────────
function getStateBorderColor(state) {
    switch(state){
        case "attempting":
            return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].last; // amber
        case "failed":
            return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].error; // red
        case "succeeded":
            return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].active; // green
        case "idle":
        case "skipped":
        default:
            return "var(--color-border)";
    }
}
function getStateGlow(state) {
    switch(state){
        case "attempting":
            return `0 0 12px ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].last}40`;
        case "failed":
            return `0 0 12px ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].error}40`;
        case "succeeded":
            return `0 0 12px ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].active}40`;
        default:
            return "none";
    }
}
const FAIL_KIND_LABELS = {
    "rate-limit": "rate-limit",
    "circuit-open": "circuit-open",
    cooldown: "cooldown",
    other: "error"
};
// Non-healthy circuit-breaker states → badge colour (U1b). OPEN is the hard
// stop (red); HALF_OPEN/DEGRADED are recovering/partial (amber).
const CB_BADGE_COLORS = {
    OPEN: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].error,
    HALF_OPEN: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].last,
    DEGRADED: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].last
};
/** Connection-cooldown badge colour (U1b Slice 2) — amber: a partial/recovering state. */ const COOLDOWN_BADGE_COLOR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].last;
/** Format a relative duration as "28s" or "1m05s"; "" when unknown/elapsed. */ function formatRetryHint(retryAfterMs) {
    if (typeof retryAfterMs !== "number" || !Number.isFinite(retryAfterMs) || retryAfterMs <= 0) {
        return "";
    }
    const seconds = Math.round(retryAfterMs / 1000);
    return seconds >= 60 ? `${Math.floor(seconds / 60)}m${seconds % 60}s` : `${seconds}s`;
}
/** "CB: OPEN · 41s" — the retry hint is omitted when unknown/elapsed. */ function formatCbBadge(cbState, retryAfterMs) {
    const hint = formatRetryHint(retryAfterMs);
    return hint ? `CB: ${cbState} · ${hint}` : `CB: ${cbState}`;
}
/** "cooldown 2/3 · 28s" — N of M connections cooling down; retry hint omitted when unknown. */ function formatCooldownBadge(count, total, retryAfterMs) {
    const ratio = typeof total === "number" && total > 0 ? `${count}/${total}` : `${count}`;
    const hint = formatRetryHint(retryAfterMs);
    return hint ? `cooldown ${ratio} · ${hint}` : `cooldown ${ratio}`;
}
function ProviderCascadeNode({ data }) {
    const { provider, model, state, latencyMs, failKind, targetIndex, cbState, cbRetryAfterMs, cooldownCount, cooldownTotal, cooldownRetryAfterMs } = data;
    const borderColor = getStateBorderColor(state);
    const glow = getStateGlow(state);
    const isAttempting = state === "attempting";
    const isFailed = state === "failed";
    const isSucceeded = state === "succeeded";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col rounded-lg border-2 bg-bg transition-all duration-300 min-w-[150px] max-w-[190px]",
        style: {
            borderColor,
            boxShadow: glow
        },
        "data-testid": `provider-cascade-node-${targetIndex}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "target",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Left,
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                lineNumber: 140,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Right,
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 px-2.5 pt-2 pb-1",
                style: {
                    borderBottom: "1px solid var(--color-border)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        providerId: provider,
                        size: 14
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-semibold truncate flex-1",
                        title: provider,
                        "data-testid": "provider-name",
                        children: provider
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this),
                    isAttempting && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$StatusDot$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusDot"], {
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].last,
                        sizeClass: "size-1.5"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                        lineNumber: 164,
                        columnNumber: 26
                    }, this),
                    isFailed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$StatusDot$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StatusDot"], {
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].error,
                        error: true,
                        sizeClass: "size-1.5"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                        lineNumber: 165,
                        columnNumber: 22
                    }, this),
                    isSucceeded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] font-bold",
                        style: {
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].active
                        },
                        children: "✓"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                        lineNumber: 167,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-2.5 py-1.5 flex flex-col gap-0.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-muted font-mono truncate",
                        title: model,
                        "data-testid": "model-name",
                        children: model
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this),
                    latencyMs != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-muted",
                        children: [
                            latencyMs.toFixed(0),
                            "ms"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                        lineNumber: 183,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            isFailed && failKind && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-2.5 pb-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[9px] font-semibold px-1.5 py-0.5 rounded",
                    style: {
                        backgroundColor: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].error}20`,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].error
                    },
                    "data-testid": "fail-kind-badge",
                    children: FAIL_KIND_LABELS[failKind]
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                    lineNumber: 190,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                lineNumber: 189,
                columnNumber: 9
            }, this),
            cbState && CB_BADGE_COLORS[cbState] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-2.5 pb-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[9px] font-semibold px-1.5 py-0.5 rounded",
                    style: {
                        backgroundColor: `${CB_BADGE_COLORS[cbState]}20`,
                        color: CB_BADGE_COLORS[cbState]
                    },
                    "data-testid": "cb-state-badge",
                    children: formatCbBadge(cbState, cbRetryAfterMs)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                    lineNumber: 207,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                lineNumber: 206,
                columnNumber: 9
            }, this),
            typeof cooldownCount === "number" && cooldownCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-2.5 pb-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[9px] font-semibold px-1.5 py-0.5 rounded",
                    style: {
                        backgroundColor: `${COOLDOWN_BADGE_COLOR}20`,
                        color: COOLDOWN_BADGE_COLOR
                    },
                    "data-testid": "cooldown-badge",
                    children: formatCooldownBadge(cooldownCount, cooldownTotal, cooldownRetryAfterMs)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                    lineNumber: 225,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
                lineNumber: 224,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx",
        lineNumber: 135,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = ProviderCascadeNode;
}),
"[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ResponseNode.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ResponseNode",
    ()=>ResponseNode,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/flow/edgeStyles.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
// ── Helpers ───────────────────────────────────────────────────────────────
function getOutcomeColor(outcome) {
    switch(outcome){
        case "succeeded":
            return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].active;
        case "exhausted":
            return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].error;
        case "running":
        default:
            return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$edgeStyles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FLOW_EDGE_COLORS"].last;
    }
}
const OUTCOME_LABELS = {
    succeeded: "succeeded",
    exhausted: "exhausted",
    running: "running…"
};
function ResponseNode({ data }) {
    const { outcome, finishedAt } = data;
    const color = getOutcomeColor(outcome);
    const outcomeLabel = OUTCOME_LABELS[outcome] ?? outcome;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg border-2 bg-bg transition-all duration-300",
        style: {
            borderColor: color,
            boxShadow: `0 0 10px ${color}30`,
            minWidth: "100px"
        },
        "data-testid": "response-node",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "target",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Left,
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ResponseNode.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-semibold uppercase tracking-wide",
                style: {
                    color
                },
                "data-testid": "response-outcome",
                children: outcomeLabel
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ResponseNode.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            finishedAt != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[9px] text-muted font-mono",
                "data-testid": "response-finished-at",
                children: new Date(finishedAt).toLocaleTimeString()
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ResponseNode.tsx",
                lineNumber: 78,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-bold",
                style: {
                    color
                },
                children: "Response"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ResponseNode.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ResponseNode.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = ResponseNode;
}),
"[project]/src/app/(dashboard)/dashboard/combos/live/nodes/RequestNode.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RequestNode",
    ()=>RequestNode,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-ssr] (ecmascript)");
"use client";
;
;
function RequestNode({ data }) {
    const { comboName } = data;
    const color = "#6366f1"; // indigo — matches IoNode input color
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border-2 bg-bg px-4 py-3 min-w-[110px] text-center transition-all duration-200",
        style: {
            borderColor: color,
            boxShadow: `0 0 12px ${color}25`
        },
        "data-testid": "request-node",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                type: "source",
                position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Position"].Right,
                className: "!bg-transparent !border-0 !w-0 !h-0"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/RequestNode.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[10px] font-semibold uppercase tracking-wider mb-1",
                style: {
                    color
                },
                children: "Request"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/RequestNode.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[11px] font-mono text-muted truncate max-w-[130px]",
                title: comboName,
                children: comboName
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/RequestNode.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/nodes/RequestNode.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = RequestNode;
}),
"[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ComboLiveStudio",
    ()=>ComboLiveStudio,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$FlowCanvas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/flow/FlowCanvas.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$comboFlowModel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/live/comboFlowModel.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$fleetAggregation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/live/fleetAggregation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$nodes$2f$StrategyNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/live/nodes/StrategyNode.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$nodes$2f$ProviderCascadeNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ProviderCascadeNode.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$nodes$2f$ResponseNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/live/nodes/ResponseNode.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$nodes$2f$RequestNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/live/nodes/RequestNode.tsx [app-ssr] (ecmascript)");
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
// ── Node type map ─────────────────────────────────────────────────────────
//
// comboRunToFlow (comboFlowModel.ts) emits exactly these `type` strings:
//   "request"  → entry node (RequestNode)
//   "strategy" → routing strategy pill (StrategyNode)
//   "target"   → one per combo target (ProviderCascadeNode)
//   "response" → terminal outcome node (ResponseNode)
const NODE_TYPES = {
    request: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$nodes$2f$RequestNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RequestNode"],
    strategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$nodes$2f$StrategyNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StrategyNode"],
    target: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$nodes$2f$ProviderCascadeNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProviderCascadeNode"],
    response: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$nodes$2f$ResponseNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponseNode"]
};
// ── Fleet overview ────────────────────────────────────────────────────────
const FLEET_WINDOW_MS = 60_000; // 1-minute rolling window
function FleetOverview({ comboEvents }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    // `now` must advance, or the 60s rolling window freezes at mount and aging
    // events are never re-classified out of "active". A low-frequency tick rolls it.
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>Date.now());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const id = setInterval(()=>setNow(Date.now()), 5_000);
        return ()=>clearInterval(id);
    }, []);
    const sets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$fleetAggregation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aggregateComboEventsToSets"])(comboEvents, FLEET_WINDOW_MS, now), [
        comboEvents,
        now
    ]);
    const total = sets.active.size + sets.error.size + sets.last.size;
    if (total === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center h-full gap-2 text-muted",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-2xl opacity-40",
                    children: "⌁"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm",
                    children: t("liveNoProviders")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs opacity-60",
                    children: t("liveFleetDataHint")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
            lineNumber: 64,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3 p-4 h-full overflow-auto",
        "data-testid": "fleet-overview",
        children: [
            sets.active.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5",
                        children: t("liveActiveCount", {
                            count: sets.active.size
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                        lineNumber: 76,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-1.5",
                        children: [
                            ...sets.active
                        ].map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] px-2 py-0.5 rounded-full font-medium",
                                style: {
                                    backgroundColor: "#22c55e20",
                                    color: "#22c55e"
                                },
                                children: p
                            }, p, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                                lineNumber: 81,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                lineNumber: 75,
                columnNumber: 9
            }, this),
            sets.error.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5",
                        children: t("liveErrorCount", {
                            count: sets.error.size
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-1.5",
                        children: [
                            ...sets.error
                        ].map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] px-2 py-0.5 rounded-full font-medium",
                                style: {
                                    backgroundColor: "#ef444420",
                                    color: "#ef4444"
                                },
                                children: p
                            }, p, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                                lineNumber: 99,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                        lineNumber: 97,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                lineNumber: 93,
                columnNumber: 9
            }, this),
            sets.last.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[10px] font-semibold uppercase tracking-wide text-muted mb-1.5",
                        children: t("liveInactiveCount", {
                            count: sets.last.size
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                        lineNumber: 112,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-1.5",
                        children: [
                            ...sets.last
                        ].map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] px-2 py-0.5 rounded-full",
                                style: {
                                    backgroundColor: "var(--color-border)",
                                    color: "var(--color-text-muted)"
                                },
                                children: p
                            }, p, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                                lineNumber: 117,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                        lineNumber: 115,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                lineNumber: 111,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center h-full gap-3 text-muted",
        "data-testid": "combo-live-studio-empty",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-3xl opacity-40",
                children: "⌁"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                lineNumber: 144,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm",
                children: t("liveNoRun")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs opacity-60",
                children: t("liveDataHint")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
// ── Disconnected banner ───────────────────────────────────────────────────
function DisconnectedBanner() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-bg/80 text-xs text-muted shrink-0",
        "data-testid": "combo-disconnected-banner",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-amber-500 font-semibold",
                children: "●"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: t("liveDisconnected")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
        lineNumber: 156,
        columnNumber: 5
    }, this);
}
function ComboLiveStudio({ run: runProp, comboEvents = [], combos: combosProp, isConnected = true, providerHealth, connectionHealth }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("single");
    const [selectedCombo, setSelectedCombo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    // Derive combo list from events when not supplied explicitly
    const comboOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (combosProp) return combosProp;
        const seen = new Set();
        for (const ev of comboEvents)seen.add(ev.comboName);
        return [
            ...seen
        ];
    }, [
        combosProp,
        comboEvents
    ]);
    // Build the displayed run: static prop wins; otherwise fold live events.
    // Finally overlay real circuit-breaker state (U1b) — a no-op when no health.
    const displayRun = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let baseRun;
        if (runProp !== undefined) {
            baseRun = runProp ?? null;
        } else if (!selectedCombo) {
            baseRun = null;
        } else {
            const eventsForCombo = comboEvents.filter((e)=>e.comboName === selectedCombo).sort((a, b)=>a.timestamp - b.timestamp);
            baseRun = eventsForCombo.length === 0 ? null : eventsForCombo.reduce((acc, ev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$comboFlowModel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reduceComboEvent"])(acc, ev), null);
        }
        // Compose overlays: breaker state first, then connection cooldown. Both are
        // pure no-ops when their health map is absent, and they touch disjoint fields.
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$comboFlowModel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["enrichRunWithConnectionCooldown"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$comboFlowModel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["enrichRunWithBreakers"])(baseRun, providerHealth), connectionHealth);
    }, [
        runProp,
        selectedCombo,
        comboEvents,
        providerHealth,
        connectionHealth
    ]);
    // Build ReactFlow graph from the current run
    const { nodes, edges } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!displayRun) return {
            nodes: [],
            edges: []
        };
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$comboFlowModel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["comboRunToFlow"])(displayRun);
    }, [
        displayRun
    ]);
    const fitKey = displayRun ? `${displayRun.comboName}-${displayRun.targets.length}-${displayRun.outcome}` : "empty";
    // Whether to show the combo selector (hidden when a static run prop is given)
    const showSelector = runProp === undefined;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full gap-2",
        "data-testid": "combo-live-studio",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-bg/60 shrink-0 flex-wrap",
                children: [
                    showSelector && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "text-xs border border-border rounded px-2 py-1 bg-bg text-muted",
                        value: selectedCombo,
                        onChange: (e)=>setSelectedCombo(e.target.value),
                        "aria-label": t("liveSelectCombo"),
                        "data-testid": "combo-selector",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: t("liveSelectComboPlaceholder")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                                lineNumber: 296,
                                columnNumber: 13
                            }, this),
                            comboOptions.map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: name,
                                    children: name
                                }, name, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                                    lineNumber: 298,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                        lineNumber: 289,
                        columnNumber: 11
                    }, this),
                    displayRun && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-mono text-muted truncate",
                                children: displayRun.comboName
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                                lineNumber: 307,
                                columnNumber: 13
                            }, this),
                            displayRun.strategy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                                style: {
                                    backgroundColor: "#6366f120",
                                    color: "#6366f1"
                                },
                                children: displayRun.strategy
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                                lineNumber: 309,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-muted",
                                children: t("liveTargetCount", {
                                    count: displayRun.targets.length
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                                lineNumber: 316,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-bold",
                                style: {
                                    color: displayRun.outcome === "succeeded" ? "#22c55e" : displayRun.outcome === "exhausted" ? "#ef4444" : "#f59e0b"
                                },
                                "data-testid": "run-outcome",
                                children: displayRun.outcome
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                                lineNumber: 319,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ml-auto flex items-center border border-border rounded overflow-hidden text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "px-2.5 py-1 transition-colors",
                                style: {
                                    background: mode === "single" ? "var(--color-primary)" : "transparent",
                                    color: mode === "single" ? "#fff" : "var(--color-text-muted)"
                                },
                                onClick: ()=>setMode("single"),
                                "data-testid": "mode-single",
                                children: t("liveSingle")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                                lineNumber: 338,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "px-2.5 py-1 transition-colors",
                                style: {
                                    background: mode === "fleet" ? "var(--color-primary)" : "transparent",
                                    color: mode === "fleet" ? "#fff" : "var(--color-text-muted)"
                                },
                                onClick: ()=>setMode("fleet"),
                                "data-testid": "mode-fleet",
                                children: t("liveFleet")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                                lineNumber: 349,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                        lineNumber: 337,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                lineNumber: 287,
                columnNumber: 7
            }, this),
            !isConnected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DisconnectedBanner, {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                lineNumber: 364,
                columnNumber: 24
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-h-0 rounded-lg overflow-hidden border border-border",
                children: mode === "fleet" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FleetOverview, {
                    comboEvents: comboEvents
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                    lineNumber: 369,
                    columnNumber: 11
                }, this) : displayRun ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$flow$2f$FlowCanvas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FlowCanvas"], {
                    nodes: nodes,
                    edges: edges,
                    nodeTypes: NODE_TYPES,
                    fitKey: fitKey,
                    className: "h-full w-full"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                    lineNumber: 371,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EmptyState, {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                    lineNumber: 379,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
                lineNumber: 367,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx",
        lineNumber: 285,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = ComboLiveStudio;
}),
"[project]/src/shared/utils/wsPath.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Derive the live WebSocket path from `NEXT_PUBLIC_LIVE_WS_PUBLIC_URL`.
 *
 * Only `ws://` or `wss://` URLs are accepted (mirrors the scheme guard in
 * `getLivePublicUrl()`). The pathname is extracted and used as the WS upgrade
 * path; if the URL has no pathname (or is `/`), falls back to `/live-ws`.
 *
 * Used by:
 * - `src/app/api/v1/ws/route.ts` — handshake response `path` field
 * - `src/hooks/useLiveDashboard.ts` — build-time path constant + runtime discovery
 *
 * No env var is introduced — this reads the existing `NEXT_PUBLIC_LIVE_WS_PUBLIC_URL`.
 */ __turbopack_context__.s([
    "deriveLiveWsPath",
    ()=>deriveLiveWsPath,
    "getLiveWsPath",
    ()=>getLiveWsPath
]);
function deriveLiveWsPath(publicUrl) {
    if (!publicUrl) return "/live-ws";
    if (!publicUrl.startsWith("ws://") && !publicUrl.startsWith("wss://")) return "/live-ws";
    try {
        const parsed = new URL(publicUrl);
        const pathname = parsed.pathname;
        return pathname && pathname !== "/" ? pathname : "/live-ws";
    } catch  {
        return "/live-ws";
    }
}
function getLiveWsPath() {
    return deriveLiveWsPath(process.env.NEXT_PUBLIC_LIVE_WS_PUBLIC_URL);
}
}),
"[project]/src/hooks/useLiveDashboard.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLiveComboStatus",
    ()=>useLiveComboStatus,
    "useLiveConnectionStatus",
    ()=>useLiveConnectionStatus,
    "useLiveDashboard",
    ()=>useLiveDashboard,
    "useLiveRequests",
    ()=>useLiveRequests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$wsPath$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/wsPath.ts [app-ssr] (ecmascript)");
/**
 * useLiveDashboard — React hooks for real-time dashboard WebSocket
 *
 * Provides hooks for connecting to the live dashboard WebSocket server
 * and subscribing to event channels.
 *
 * Usage:
 *   const { requests, isConnected } = useLiveRequests();
 *   const { comboEvents, lastComboEvent } = useLiveComboStatus();
 */ "use client";
;
;
// ── Config ────────────────────────────────────────────────────────────────
const WS_RECONNECT_DELAYS = [
    1000,
    2000,
    4000,
    8000,
    16000,
    30000
];
/** Only accept ws:// or wss:// URLs (mirrors the guard in src/app/api/v1/ws/route.ts). */ function sanitizeWsPublicUrl(url) {
    if (typeof url !== "string" || url.length === 0) return null;
    return url.startsWith("ws://") || url.startsWith("wss://") ? url : null;
}
// Build-time inlined value (Docker/npm prebuilt images won't have this — the
// runtime value is discovered via the /api/v1/ws?handshake=1 handshake below).
const BUILD_TIME_PUBLIC_WS_URL = sanitizeWsPublicUrl(process.env.NEXT_PUBLIC_LIVE_WS_PUBLIC_URL);
const BUILD_TIME_WS_PATH = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$wsPath$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deriveLiveWsPath"])(process.env.NEXT_PUBLIC_LIVE_WS_PUBLIC_URL);
function getDefaultWsUrl() {
    if (BUILD_TIME_PUBLIC_WS_URL) return BUILD_TIME_PUBLIC_WS_URL;
    if ("TURBOPACK compile-time truthy", 1) return `ws://localhost:20132${BUILD_TIME_WS_PATH}`;
    //TURBOPACK unreachable
    ;
    const protocol = undefined;
    const hostname = undefined;
}
const DEFAULT_WS_URL = getDefaultWsUrl();
function useLiveDashboard({ wsUrl, enabled = true, apiKey, channels = [
    "requests",
    "combo",
    "credentials"
], autoReconnect = true, onEvent } = {}) {
    const [connection, setConnection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        isConnected: false,
        isConnecting: false,
        error: null,
        reconnectAttempt: 0
    });
    // Runtime discovery of the public WS URL via the handshake endpoint.
    // NEXT_PUBLIC_* env vars are inlined at build time, so prebuilt Docker/npm
    // images never see a runtime NEXT_PUBLIC_LIVE_WS_PUBLIC_URL — the server
    // echoes it in the /api/v1/ws?handshake=1 response instead.
    // Skipped when the caller passes an explicit wsUrl or the env was inlined.
    const needsHandshake = !wsUrl && !BUILD_TIME_PUBLIC_WS_URL && ("TURBOPACK compile-time value", "undefined") !== "undefined";
    const [handshakeUrl, setHandshakeUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [handshakePath, setHandshakePath] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [wsUrlResolved, setWsUrlResolved] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(!needsHandshake);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        let cancelled;
    }, [
        needsHandshake,
        wsUrlResolved
    ]);
    const effectiveWsUrl = (()=>{
        if (wsUrl) return wsUrl;
        if (handshakeUrl) return handshakeUrl;
        if (handshakePath && handshakePath !== BUILD_TIME_WS_PATH) {
            try {
                const url = new URL(DEFAULT_WS_URL);
                url.pathname = handshakePath;
                return url.toString();
            } catch  {
                return DEFAULT_WS_URL;
            }
        }
        return DEFAULT_WS_URL;
    })();
    const [events, setEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const wsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const reconnectTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mountedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    const maxEvents = 500;
    const onEventRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(onEvent);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        onEventRef.current = onEvent;
    }, [
        onEvent
    ]);
    const connect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!mountedRef.current) return;
        if (wsRef.current?.readyState === WebSocket.OPEN) return;
        setConnection((prev)=>({
                ...prev,
                isConnecting: true,
                error: null
            }));
        try {
            const wsUrlWithAuth = apiKey ? `${effectiveWsUrl}?token=${encodeURIComponent(apiKey)}` : effectiveWsUrl;
            const ws = new WebSocket(wsUrlWithAuth);
            wsRef.current = ws;
            ws.onopen = ()=>{
                if (!mountedRef.current) return;
                setConnection({
                    isConnected: true,
                    isConnecting: false,
                    error: null,
                    reconnectAttempt: 0
                });
                // Subscribe to channels
                ws.send(JSON.stringify({
                    type: "subscribe",
                    channels
                }));
            };
            ws.onmessage = (event)=>{
                if (!mountedRef.current) return;
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === "event") {
                        const payload = {
                            event: msg.event,
                            channel: msg.channel,
                            data: msg.data,
                            timestamp: msg.timestamp || Date.now()
                        };
                        setEvents((prev)=>{
                            const next = [
                                ...prev,
                                payload
                            ];
                            return next.length > maxEvents ? next.slice(-maxEvents) : next;
                        });
                        onEventRef.current?.(payload);
                    } else if (msg.type === "pong") {
                    // Heartbeat response
                    } else if (msg.type === "welcome") {
                        // Send backlog
                        if (Array.isArray(msg.data)) {
                            setEvents((prev)=>{
                                const next = [
                                    ...prev,
                                    ...msg.data
                                ];
                                return next.length > maxEvents ? next.slice(-maxEvents) : next;
                            });
                            for (const item of msg.data){
                                const payload = {
                                    event: item.event,
                                    channel: item.channel,
                                    data: item.data,
                                    timestamp: item.timestamp || Date.now()
                                };
                                onEventRef.current?.(payload);
                            }
                        }
                    } else if (msg.type === "error") {
                        console.error("[LiveWS] Server error:", msg.code, msg.message);
                    }
                } catch  {
                // Ignore parse errors
                }
            };
            ws.onclose = ()=>{
                if (!mountedRef.current) return;
                wsRef.current = null;
                setConnection((prev)=>({
                        ...prev,
                        isConnected: false,
                        isConnecting: false
                    }));
                if (autoReconnect) {
                    const attempt = connection.reconnectAttempt;
                    const delay = WS_RECONNECT_DELAYS[Math.min(attempt, WS_RECONNECT_DELAYS.length - 1)];
                    reconnectTimeoutRef.current = setTimeout(()=>{
                        setConnection((prev)=>({
                                ...prev,
                                reconnectAttempt: prev.reconnectAttempt + 1
                            }));
                    }, delay);
                }
            };
            ws.onerror = ()=>{
                if (!mountedRef.current) return;
                setConnection((prev)=>({
                        ...prev,
                        isConnecting: false,
                        error: "Connection failed"
                    }));
            };
        } catch (err) {
            setConnection((prev)=>({
                    ...prev,
                    isConnecting: false,
                    error: err instanceof Error ? err.message : "Connection failed"
                }));
        }
    }, [
        effectiveWsUrl,
        apiKey,
        channels.join(","),
        autoReconnect,
        connection.reconnectAttempt
    ]);
    // Connect on mount and on reconnect trigger
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mountedRef.current = true;
        if (!enabled) {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            wsRef.current?.close();
            wsRef.current = null;
            setConnection({
                isConnected: false,
                isConnecting: false,
                error: null,
                reconnectAttempt: 0
            });
            return;
        }
        // Wait for the handshake URL resolution before opening the socket, so we
        // never connect to the hardcoded default and then flap to the public URL.
        if (!wsUrlResolved) return;
        connect();
        return ()=>{
            mountedRef.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            wsRef.current?.close();
        };
    }, [
        connect,
        enabled,
        wsUrlResolved
    ]);
    // Connect (for manual retry)
    const reconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        wsRef.current?.close();
        setConnection((prev)=>({
                ...prev,
                reconnectAttempt: prev.reconnectAttempt + 1
            }));
    }, []);
    return {
        connection,
        events,
        reconnect,
        /** Filter events by channel */ getEventsByChannel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((channel)=>events.filter((e)=>e.channel === channel), [
            events
        ]),
        /** Filter events by name */ getEventsByName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((eventName)=>events.filter((e)=>e.event === eventName), [
            events
        ]),
        /** Clear event history */ clearEvents: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>setEvents([]), [])
    };
}
function useLiveRequests(options) {
    const [requestState, setRequestState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        active: new Map(),
        completed: []
    });
    const maxCompleted = 100;
    const handleEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((event)=>{
        if (event.channel !== "requests") return;
        if (event.event === "request.started") {
            const data = event.data;
            setRequestState((prev)=>{
                const active = new Map(prev.active);
                active.set(data.id, {
                    id: data.id,
                    model: data.model,
                    provider: data.provider,
                    timestamp: data.timestamp,
                    status: "pending",
                    comboName: data.comboName
                });
                return {
                    active,
                    completed: prev.completed
                };
            });
        } else if (event.event === "request.streaming") {
            const data = event.data;
            setRequestState((prev)=>{
                const active = new Map(prev.active);
                const existing = active.get(data.id);
                if (existing) {
                    active.set(data.id, {
                        ...existing,
                        status: "running"
                    });
                }
                return {
                    active,
                    completed: prev.completed
                };
            });
        } else if (event.event === "request.completed") {
            const data = event.data;
            setRequestState((prev)=>{
                const active = new Map(prev.active);
                const existing = active.get(data.id);
                if (existing) {
                    active.delete(data.id);
                    const done = {
                        ...existing,
                        status: data.status === "success" ? "success" : "error",
                        tokensInput: data.tokensInput,
                        tokensOutput: data.tokensOutput,
                        latencyMs: data.latencyMs,
                        error: data.error
                    };
                    const completed = [
                        done,
                        ...prev.completed
                    ].slice(0, maxCompleted);
                    return {
                        active,
                        completed
                    };
                }
                return prev;
            });
        } else if (event.event === "request.failed") {
            const data = event.data;
            setRequestState((prev)=>{
                const active = new Map(prev.active);
                const existing = active.get(data.id);
                if (existing) {
                    active.delete(data.id);
                    const done = {
                        ...existing,
                        status: "error",
                        error: data.error,
                        latencyMs: data.latencyMs
                    };
                    const completed = [
                        done,
                        ...prev.completed
                    ].slice(0, maxCompleted);
                    return {
                        active,
                        completed
                    };
                }
                return prev;
            });
        }
    }, []);
    const { connection, reconnect } = useLiveDashboard({
        channels: [
            "requests"
        ],
        onEvent: handleEvent,
        ...options
    });
    return {
        activeRequests: Array.from(requestState.active.values()),
        completedRequests: requestState.completed,
        activeCount: requestState.active.size,
        isConnected: connection.isConnected,
        reconnect
    };
}
function useLiveComboStatus(options) {
    const [comboEvents, setComboEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const maxComboEvents = 200;
    const handleEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((event)=>{
        if (event.channel !== "combo") return;
        const data = event.data;
        let comboEvent = null;
        if (event.event === "combo.target.attempt") {
            comboEvent = {
                comboName: data.comboName,
                targetIndex: data.targetIndex,
                provider: data.provider,
                model: data.model,
                type: "attempt",
                strategy: data.strategy,
                timestamp: event.timestamp
            };
        } else if (event.event === "combo.target.succeeded") {
            comboEvent = {
                comboName: data.comboName,
                targetIndex: data.targetIndex,
                provider: data.provider,
                model: data.model,
                type: "succeeded",
                latencyMs: data.latencyMs,
                timestamp: event.timestamp
            };
        } else if (event.event === "combo.target.failed") {
            comboEvent = {
                comboName: data.comboName,
                targetIndex: data.targetIndex,
                provider: data.provider,
                model: data.model,
                type: "failed",
                error: data.error,
                latencyMs: data.latencyMs,
                timestamp: event.timestamp
            };
        }
        if (comboEvent) {
            setComboEvents((prev)=>[
                    comboEvent,
                    ...prev
                ].slice(0, maxComboEvents));
        }
    }, []);
    const { connection, reconnect } = useLiveDashboard({
        channels: [
            "combo"
        ],
        onEvent: handleEvent,
        ...options
    });
    /** Get events for a specific combo */ const getComboHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((comboName)=>comboEvents.filter((e)=>e.comboName === comboName), [
        comboEvents
    ]);
    /** Get the last event for a specific combo */ const getLastComboEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((comboName)=>comboEvents.find((e)=>e.comboName === comboName), [
        comboEvents
    ]);
    return {
        comboEvents,
        activeCombos: new Set(comboEvents.map((e)=>e.comboName)),
        isConnected: connection.isConnected,
        getComboHistory,
        getLastComboEvent,
        reconnect
    };
}
function useLiveConnectionStatus(options) {
    const { connection, reconnect } = useLiveDashboard({
        channels: [],
        ...options
    });
    return {
        ...connection,
        reconnect
    };
}
}),
"[project]/src/hooks/useProviderBreakerHealth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useProviderBreakerHealth",
    ()=>useProviderBreakerHealth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const DEFAULT_POLL_MS = 5000;
const POLL_TIMEOUT_MS = 8000;
const EMPTY = {
    providerHealth: {},
    connectionHealth: {}
};
function useProviderBreakerHealth(pollMs = DEFAULT_POLL_MS) {
    const [snapshot, setSnapshot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(EMPTY);
    const inFlightRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        const poll = async ()=>{
            if (inFlightRef.current) return;
            const controller = new AbortController();
            inFlightRef.current = controller;
            const timeoutId = setTimeout(()=>controller.abort("Provider breaker health timeout"), POLL_TIMEOUT_MS);
            try {
                const res = await fetch("/api/monitoring/health", {
                    signal: controller.signal,
                    cache: "no-store"
                });
                if (!res.ok) return;
                const json = await res.json();
                if (cancelled || !json || typeof json !== "object") return;
                setSnapshot({
                    providerHealth: typeof json.providerHealth === "object" && json.providerHealth ? json.providerHealth : {},
                    connectionHealth: typeof json.connectionHealth === "object" && json.connectionHealth ? json.connectionHealth : {}
                });
            } catch  {
            // Fail-soft: keep the previous snapshot; cascade degrades to no badges.
            } finally{
                clearTimeout(timeoutId);
                if (inFlightRef.current === controller) {
                    inFlightRef.current = null;
                }
            }
        };
        poll();
        const id = setInterval(poll, pollMs);
        return ()=>{
            cancelled = true;
            inFlightRef.current?.abort("Provider breaker health unmounted");
            inFlightRef.current = null;
            clearInterval(id);
        };
    }, [
        pollMs
    ]);
    return snapshot;
}
}),
"[project]/src/app/(dashboard)/dashboard/combos/live/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ComboLiveStudioPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$ComboLiveStudio$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/live/ComboLiveStudio.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useLiveDashboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useLiveDashboard.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProviderBreakerHealth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useProviderBreakerHealth.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function ComboLiveStudioPage() {
    const { comboEvents, activeCombos, isConnected } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useLiveDashboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLiveComboStatus"])();
    const { providerHealth, connectionHealth } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProviderBreakerHealth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProviderBreakerHealth"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 h-[calc(100dvh-6rem)] min-h-[480px]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$live$2f$ComboLiveStudio$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ComboLiveStudio"], {
            comboEvents: comboEvents,
            combos: [
                ...activeCombos
            ],
            isConnected: isConnected,
            providerHealth: providerHealth,
            connectionHealth: connectionHealth
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/page.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/live/page.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_1hf9xjv._.js.map