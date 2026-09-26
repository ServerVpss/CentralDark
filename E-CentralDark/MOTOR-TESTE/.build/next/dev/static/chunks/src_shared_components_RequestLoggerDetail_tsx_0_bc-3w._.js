(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/shared/components/RequestLoggerDetail.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RequestLoggerDetail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
// ─── Payload Code Block ─────────────────────────────────────────────────────
function PayloadSection({ title, json, onCopy, collapsible = true, defaultOpen = true }) {
    _s();
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultOpen);
    const handleCopy = async ()=>{
        const success = await onCopy();
        if (success !== false) {
            setCopied(true);
            setTimeout(()=>setCopied(false), 2000);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-[11px] text-text-muted uppercase tracking-wider font-bold",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 30,
                                columnNumber: 11
                            }, this),
                            collapsible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setOpen((v)=>!v),
                                className: "p-1 rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors",
                                "aria-label": open ? `Collapse ${title}` : `Expand ${title}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[16px]",
                                    children: open ? "expand_less" : "expand_more"
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                    lineNumber: 39,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 34,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleCopy,
                        className: "flex items-center gap-1 px-2 py-1 text-xs text-text-muted hover:text-text-primary transition-colors",
                        "aria-label": `Copy ${title}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: copied ? "check" : "content_copy"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            copied ? "Copied!" : "Copy"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                className: "p-4 rounded-xl bg-black/5 dark:bg-black/30 border border-border overflow-x-auto text-xs font-mono text-text-main max-h-150 overflow-y-auto leading-relaxed whitespace-pre-wrap break-words",
                children: json
            }, void 0, false, {
                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                lineNumber: 57,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(PayloadSection, "krchEz+DXwQ8ceFVVQIul8o1X64=");
_c = PayloadSection;
// ─── Stream section + Detail Modal ───────────────────────────────────────────────────────────
function StreamSection({ title, json, onCopy }) {
    _s1();
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [autoscroll, setAutoscroll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "StreamSection.useState": ()=>{
            try {
                const v = localStorage.getItem("pref:stream:autoscroll");
                return v == null ? true : v === "1";
            } catch  {
                return true;
            }
        }
    }["StreamSection.useState"]);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleCopy = async ()=>{
        const success = await onCopy();
        if (success !== false) {
            setCopied(true);
            setTimeout(()=>setCopied(false), 2000);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StreamSection.useEffect": ()=>{
            if (!autoscroll || !open) return;
            const el = ref.current;
            if (!el) return;
            // scroll on next animation frame to avoid layout thrash
            requestAnimationFrame({
                "StreamSection.useEffect": ()=>{
                    try {
                        el.scrollTop = el.scrollHeight;
                    } catch  {}
                }
            }["StreamSection.useEffect"]);
        }
    }["StreamSection.useEffect"], [
        json,
        autoscroll,
        open
    ]);
    const toggleAutoscroll = ()=>{
        const next = !autoscroll;
        setAutoscroll(next);
        try {
            localStorage.setItem("pref:stream:autoscroll", next ? "1" : "0");
        } catch  {}
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-[11px] text-text-muted uppercase tracking-wider font-bold",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 112,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setOpen((v)=>!v),
                                className: "p-1 rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors",
                                "aria-label": open ? `Collapse ${title}` : `Expand ${title}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[16px]",
                                    children: open ? "expand_less" : "expand_more"
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                    lineNumber: 120,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: toggleAutoscroll,
                                title: autoscroll ? "Autoscroll: on" : "Autoscroll: off",
                                className: `p-1 rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors ${autoscroll ? "text-primary" : ""}`,
                                "aria-pressed": autoscroll,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[18px]",
                                    children: "vertical_align_bottom"
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 126,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleCopy,
                                className: "flex items-center gap-1 px-2 py-1 text-xs text-text-muted hover:text-text-primary transition-colors",
                                "aria-label": `Copy ${title}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: copied ? "check" : "content_copy"
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 139,
                                        columnNumber: 13
                                    }, this),
                                    copied ? "Copied!" : "Copy"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 134,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: ref,
                className: "p-4 rounded-xl bg-black/5 dark:bg-black/30 border border-border overflow-x-auto text-xs font-mono text-text-main max-h-150 overflow-y-auto leading-relaxed whitespace-pre-wrap break-words",
                children: json
            }, void 0, false, {
                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                lineNumber: 147,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
_s1(StreamSection, "8xV/NDMLZjpZOxmFf89xun0EQ0o=");
_c1 = StreamSection;
function getCodexAccountRotation(detail) {
    const sources = [
        detail?.requestBody,
        detail?.responseBody
    ];
    for (const source of sources){
        const meta = source?._omniroute;
        const rotation = meta?.codexAccountRotation;
        if (rotation && typeof rotation.initialConnectionId === "string" && typeof rotation.finalConnectionId === "string" && rotation.initialConnectionId !== rotation.finalConnectionId) {
            return rotation;
        }
    }
    return null;
}
function formatConnectionId(value) {
    if (typeof value !== "string" || value.length === 0) return "-";
    return value.length > 8 ? `${value.slice(0, 8)}...` : value;
}
function RequestLoggerDetail({ log, detail, loading, debugEnabled, emailsVisible = false, onClose, onCopy, onPrevious, onNext, relatedLogs = [], onSelectRelated }) {
    _s2();
    // Close on Escape key
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RequestLoggerDetail.useEffect": ()=>{
            const handler = {
                "RequestLoggerDetail.useEffect.handler": (e)=>{
                    if (e.key === "Escape") onClose();
                }
            }["RequestLoggerDetail.useEffect.handler"];
            globalThis.addEventListener("keydown", handler);
            return ({
                "RequestLoggerDetail.useEffect": ()=>globalThis.removeEventListener("keydown", handler)
            })["RequestLoggerDetail.useEffect"];
        }
    }["RequestLoggerDetail.useEffect"], [
        onClose
    ]);
    const statusStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getHttpStatusStyle"])(log.status);
    const protocolKey = log.sourceFormat || log.provider;
    const protocol = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProtocolColor"])(protocolKey, log.provider);
    const providerColor = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_COLORS"][log.provider] || {
        bg: "#374151",
        text: "#fff",
        label: (log.provider || "-").toUpperCase()
    };
    const providerLabel = log.providerDisplay || providerColor.label;
    const [unblocking, setUnblocking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [cleared, setCleared] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // #7920 gave this component formatErrorForDisplay for structured error objects, but the
    // #8213 combo/cooldown checks below went straight to the raw field and call
    // .toLowerCase() on it — which throws the moment `error` is an object. Same helper,
    // same normalization, one source of truth.
    const errorText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatErrorForDisplay"])(detail?.error || log.error) ?? "";
    const isCombo503 = log.status === 503 && errorText.toLowerCase().includes("all targets exhausted");
    const isModelCooldown = !isCombo503 && errorText.toLowerCase().includes("cooling down");
    const [unblockAllBusy, setUnblockAllBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleUnblockModel = async ()=>{
        if (!log.provider || !log.model) return;
        setUnblocking(true);
        try {
            const res = await fetch("/api/resilience/model-cooldowns", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    provider: log.provider,
                    model: log.model
                })
            });
            if (res.ok) setCleared(true);
        } catch  {
        /* ignore */ } finally{
            setUnblocking(false);
        }
    };
    const handleUnblockAll = async ()=>{
        setUnblockAllBusy(true);
        try {
            const res = await fetch("/api/resilience/model-cooldowns", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    all: true
                })
            });
            if (res.ok) setCleared(true);
        } catch  {
        /* ignore */ } finally{
            setUnblockAllBusy(false);
        }
    };
    const providerStatus = detail?.pipelinePayloads?.providerResponse?.status;
    const hasStatusDiscrepancy = providerStatus && providerStatus !== log.status;
    const formatDate = (iso)=>{
        if (iso == null) return "\u2014";
        try {
            const d = new Date(iso);
            if (!Number.isFinite(d.getTime())) return "\u2014";
            return d.toLocaleDateString("pt-BR") + ", " + d.toLocaleTimeString("en-US", {
                hour12: false
            });
        } catch  {
            return "\u2014";
        }
    };
    const toPrettyJson = (payload)=>{
        if (payload === null || payload === undefined) return null;
        try {
            return JSON.stringify(payload, null, 2);
        } catch  {
            return String(payload);
        }
    };
    const pipelinePayloads = detail?.pipelinePayloads || null;
    const payloadSections = pipelinePayloads ? [
        [
            "clientRawRequest",
            "Client Raw Request"
        ],
        [
            "clientRequest",
            "Client Request"
        ],
        [
            "openaiRequest",
            "OpenAI Request"
        ],
        [
            "providerRequest",
            "Provider Request"
        ],
        [
            "providerResponse",
            "Provider Response"
        ],
        [
            "clientResponse",
            "Client Response"
        ],
        [
            "error",
            "Pipeline Error"
        ]
    ].map(([key, title])=>({
            key,
            title,
            json: toPrettyJson(pipelinePayloads[key])
        })).filter((section)=>section.json) : [];
    const requestJson = detail?.requestBody ? toPrettyJson(detail.requestBody) : null;
    const responseJson = detail?.responseBody ? toPrettyJson(detail.responseBody) : null;
    const streamChunks = (()=>{
        if (!debugEnabled || !detail?.pipelinePayloads?.streamChunks) return null;
        let chunks = detail.pipelinePayloads.streamChunks;
        if (typeof chunks === "string") {
            try {
                chunks = JSON.parse(chunks);
            } catch  {
                return null;
            }
        }
        if (chunks && typeof chunks === "object") return chunks;
        return null;
    })();
    const detailIssue = detail?.detailState === "missing" ? "Detailed payload artifact is no longer available for this log entry." : detail?.detailState === "corrupt" ? "Detailed payload artifact could not be parsed." : null;
    const tokenStats = {
        totalIn: detail?.tokens?.in ?? log.tokens?.in ?? null,
        totalOut: detail?.tokens?.out ?? log.tokens?.out ?? null,
        cacheRead: detail?.tokens?.cacheRead ?? log.tokens?.cacheRead,
        cacheWrite: detail?.tokens?.cacheWrite ?? log.tokens?.cacheWrite,
        reasoning: detail?.tokens?.reasoning ?? log.tokens?.reasoning,
        compressed: detail?.tokens?.compressed ?? log.tokens?.compressed
    };
    const formatTokenValue = (value)=>value != null ? value.toLocaleString() : "N/A";
    const cacheSource = detail?.cacheSource || log.cacheSource || "upstream";
    const cacheSourceLabel = cacheSource === "semantic" ? "Semantic (OmniRoute)" : "Upstream (Provider)";
    const cacheSourceClassName = cacheSource === "semantic" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : "bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30";
    const accountLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maskAccount"])(detail?.account || log.account, emailsVisible);
    const codexAccountRotation = getCodexAccountRotation(detail);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-start justify-center pt-[5vh]",
        onClick: onClose,
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Request log detail",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/60 backdrop-blur-sm"
            }, void 0, false, {
                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                lineNumber: 357,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-bg-primary border border-border rounded-xl w-full max-w-225 max-h-[90vh] overflow-y-auto shadow-2xl",
                onClick: (e)=>e.stopPropagation(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-bg-primary/95 backdrop-blur-sm rounded-t-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    log.active ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                            lineNumber: 369,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 368,
                                                        columnNumber: 19
                                                    }, this) : log.status === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-block px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
                                                        children: "Completed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 372,
                                                        columnNumber: 19
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-block px-2.5 py-1 rounded text-xs font-bold",
                                                        style: {
                                                            backgroundColor: statusStyle.bg,
                                                            color: statusStyle.text
                                                        },
                                                        children: log.status
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 376,
                                                        columnNumber: 19
                                                    }, this),
                                                    hasStatusDiscrepancy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] font-bold px-2 py-0.5 rounded bg-bg-subtle border border-border text-text-muted",
                                                        children: [
                                                            "Upstream: ",
                                                            providerStatus
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 384,
                                                        columnNumber: 19
                                                    }, this),
                                                    log.method && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold text-lg",
                                                        children: log.method
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 388,
                                                        columnNumber: 32
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 366,
                                                columnNumber: 15
                                            }, this),
                                            hasStatusDiscrepancy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5",
                                                children: [
                                                    "OmniRoute returned ",
                                                    log.status,
                                                    " even though provider returned ",
                                                    providerStatus
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 391,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 365,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-text-muted font-mono text-sm self-center ml-2",
                                        children: log.path
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 396,
                                        columnNumber: 13
                                    }, this),
                                    log.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-text-muted/50 font-mono self-center ml-2 px-1.5 py-0.5 rounded bg-bg-subtle border border-border/40 select-all",
                                        children: log.id
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 398,
                                        columnNumber: 15
                                    }, this),
                                    log.correlationId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-text-muted/50 font-mono self-center ml-2 px-1.5 py-0.5 rounded bg-bg-subtle border border-border/40 select-all",
                                        title: "Correlation ID",
                                        children: [
                                            "cid: ",
                                            log.correlationId
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 403,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 364,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onPrevious,
                                        disabled: !onPrevious,
                                        className: "p-1.5 rounded-lg hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none",
                                        "aria-label": "Previous request",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[18px]",
                                            children: "chevron_left"
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                            lineNumber: 418,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 412,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onNext,
                                        disabled: !onNext,
                                        className: "p-1.5 rounded-lg hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none",
                                        "aria-label": "Next request",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[18px]",
                                            children: "chevron_right"
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                            lineNumber: 426,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 420,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onClose,
                                        className: "p-1.5 rounded-lg hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors",
                                        "aria-label": "Close detail modal",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined",
                                            children: "close"
                                        }, void 0, false, {
                                            fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                            lineNumber: 433,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 428,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 411,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                        lineNumber: 363,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 flex flex-col gap-6",
                        children: [
                            log.active ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-4 p-4 bg-bg-subtle rounded-xl border border-border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-[140px] flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Started At"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 443,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium",
                                                children: formatDate(log.timestamp)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 446,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 442,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-[100px] flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Duration"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 449,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDuration"])(log.duration)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 452,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 448,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-[140px] flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Model"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 455,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium text-primary font-mono",
                                                children: log.model
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 458,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 454,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-[120px] flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Provider"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 461,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase",
                                                style: {
                                                    backgroundColor: providerColor.bg,
                                                    color: providerColor.text
                                                },
                                                children: providerLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 464,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 460,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-[120px] flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Account"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 472,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium",
                                                children: accountLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 475,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 471,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 441,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-bg-subtle rounded-xl border border-border",
                                "data-testid": "request-log-metadata-grid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Started At"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 484,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium",
                                                children: (()=>{
                                                    try {
                                                        const ts = new Date(log.timestamp).getTime();
                                                        if (!Number.isFinite(ts)) return "\u2014";
                                                        return formatDate(new Date(ts - (log.duration || 0)).toISOString());
                                                    } catch  {
                                                        return "\u2014";
                                                    }
                                                })()
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 487,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 483,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Ended At"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 500,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium",
                                                children: formatDate(log.timestamp)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 503,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 499,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Duration"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 506,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDuration"])(log.duration)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 509,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 505,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Input"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 512,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap items-center gap-1.5",
                                                "data-testid": "token-group-input",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold",
                                                        children: [
                                                            "Total In: ",
                                                            formatTokenValue(tokenStats.totalIn)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 519,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "px-2 py-0.5 rounded bg-sky-500/20 text-sky-700 dark:text-sky-400 text-xs font-bold",
                                                        children: [
                                                            "Cache Read: ",
                                                            formatTokenValue(tokenStats.cacheRead)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 522,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold",
                                                        children: [
                                                            "Cache Write: ",
                                                            formatTokenValue(tokenStats.cacheWrite)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 525,
                                                        columnNumber: 19
                                                    }, this),
                                                    tokenStats.compressed != null && tokenStats.compressed > 0 && (()=>{
                                                        const fromTokens = tokenStats.compressed + Math.max(0, tokenStats.totalIn);
                                                        const saved = Math.min(tokenStats.compressed, fromTokens);
                                                        const pct = fromTokens > 0 ? Math.max(0, Math.min(100, Math.round(saved / fromTokens * 100))) : 100;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold",
                                                            children: [
                                                                "Compressed: ",
                                                                fromTokens.toLocaleString(),
                                                                " →",
                                                                " ",
                                                                Math.max(0, tokenStats.totalIn).toLocaleString(),
                                                                " (",
                                                                pct,
                                                                "% saved)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                            lineNumber: 538,
                                                            columnNumber: 25
                                                        }, this);
                                                    })()
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 515,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 511,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Output"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 547,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap items-center gap-1.5",
                                                "data-testid": "token-group-output",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold",
                                                        children: [
                                                            "Total Out: ",
                                                            formatTokenValue(tokenStats.totalOut)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 554,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "px-2 py-0.5 rounded bg-violet-500/20 text-violet-700 dark:text-violet-400 text-xs font-bold",
                                                        children: [
                                                            "Reasoning: ",
                                                            formatTokenValue(tokenStats.reasoning)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 557,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 550,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 546,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Model"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 563,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium text-primary font-mono",
                                                children: log.model
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 566,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 562,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Requested Model"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 569,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-sm font-medium font-mono ${(detail?.requestedModel || log.requestedModel) && (detail?.requestedModel || log.requestedModel) !== log.model ? "text-amber-600 dark:text-amber-400" : "text-text-muted"}`,
                                                children: detail?.requestedModel || log.requestedModel || "\u2014"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 572,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 568,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Provider"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 584,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase",
                                                style: {
                                                    backgroundColor: providerColor.bg,
                                                    color: providerColor.text
                                                },
                                                children: providerLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 587,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 583,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Req Protocol"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 595,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase",
                                                style: {
                                                    backgroundColor: protocol.bg,
                                                    color: protocol.text
                                                },
                                                children: protocol.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 598,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 594,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Cache Source"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 606,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `inline-block px-2.5 py-1 rounded text-[10px] font-bold border ${cacheSourceClassName}`,
                                                children: cacheSourceLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 609,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 605,
                                        columnNumber: 15
                                    }, this),
                                    (detail?.modelPinned || log.modelPinned) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Model Pinning"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 617,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/25",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "w-3 h-3",
                                                        viewBox: "0 0 16 16",
                                                        fill: "currentColor",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            d: "M4.5 2A1.5 1.5 0 003 3.5v1.9l-1.4 2.8A.5.5 0 002 9h4v4.5a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V9h4a.5.5 0 00.44-.73L13 5.4V3.5A1.5 1.5 0 0011.5 2h-7z"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                            lineNumber: 622,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 621,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Active — model selected via session pinning"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 620,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 616,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Account"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 629,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium",
                                                children: accountLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 632,
                                                columnNumber: 17
                                            }, this),
                                            codexAccountRotation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono",
                                                title: `${codexAccountRotation.initialConnectionId} -> ${codexAccountRotation.finalConnectionId}`,
                                                children: [
                                                    "Rotated: ",
                                                    formatConnectionId(codexAccountRotation.initialConnectionId),
                                                    " ->",
                                                    " ",
                                                    formatConnectionId(codexAccountRotation.finalConnectionId)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 634,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 628,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "API Key"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 644,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium",
                                                title: detail?.apiKeyName || detail?.apiKeyId || log.apiKeyName || log.apiKeyId || "No API key",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatApiKeyLabel"])(detail?.apiKeyName || log.apiKeyName, detail?.apiKeyId || log.apiKeyId)
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 647,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 643,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-text-muted uppercase tracking-wider mb-1",
                                                children: "Combo"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 664,
                                                columnNumber: 17
                                            }, this),
                                            detail?.comboName || log.comboName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30",
                                                children: detail?.comboName || log.comboName
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 668,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-text-muted",
                                                children: "\\u2014"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 672,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 663,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 479,
                                columnNumber: 13
                            }, this),
                            (detail?.error || log.error) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 rounded-xl bg-red-500/10 border border-red-500/30",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-red-600 dark:text-red-400 uppercase tracking-wider font-bold",
                                                children: "Error"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 682,
                                                columnNumber: 17
                                            }, this),
                                            isCombo503 && !cleared && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleUnblockAll,
                                                disabled: unblockAllBusy,
                                                className: "flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg   bg-amber-500/10 border border-amber-500/30 text-amber-600   hover:bg-amber-500/15 hover:border-amber-500/50   dark:text-amber-400 transition-all duration-200   disabled:opacity-50 disabled:cursor-not-allowed",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "12",
                                                        height: "12",
                                                        viewBox: "0 0 16 16",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                                x: "3",
                                                                y: "6",
                                                                width: "10",
                                                                height: "8",
                                                                rx: "1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                                lineNumber: 703,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                d: "M5 6V4a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                                lineNumber: 704,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                cx: "8",
                                                                cy: "10",
                                                                r: "1",
                                                                fill: "currentColor",
                                                                stroke: "none"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                                lineNumber: 705,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 695,
                                                        columnNumber: 21
                                                    }, this),
                                                    unblockAllBusy ? "..." : "Unblock all"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 686,
                                                columnNumber: 19
                                            }, this),
                                            isCombo503 && cleared && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "10",
                                                        height: "10",
                                                        viewBox: "0 0 16 16",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "2",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                            points: "4 8 7 11 12 4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                            lineNumber: 720,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 712,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Cleared"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 711,
                                                columnNumber: 19
                                            }, this),
                                            isModelCooldown && !cleared && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleUnblockModel,
                                                disabled: unblocking,
                                                className: "flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg   bg-amber-500/10 border border-amber-500/30 text-amber-600   hover:bg-amber-500/15 hover:border-amber-500/50   dark:text-amber-400 transition-all duration-200   disabled:opacity-50 disabled:cursor-not-allowed",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "12",
                                                        height: "12",
                                                        viewBox: "0 0 16 16",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                                x: "3",
                                                                y: "6",
                                                                width: "10",
                                                                height: "8",
                                                                rx: "1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                                lineNumber: 743,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                d: "M5 6V4a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                                lineNumber: 744,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                cx: "8",
                                                                cy: "10",
                                                                r: "1",
                                                                fill: "currentColor",
                                                                stroke: "none"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                                lineNumber: 745,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 735,
                                                        columnNumber: 21
                                                    }, this),
                                                    unblocking ? "..." : "Unblock"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 726,
                                                columnNumber: 19
                                            }, this),
                                            isModelCooldown && cleared && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "10",
                                                        height: "10",
                                                        viewBox: "0 0 16 16",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "2",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                            points: "4 8 7 11 12 4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                            lineNumber: 760,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 752,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Cleared"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 751,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 681,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-red-600 dark:text-red-300 font-mono whitespace-pre-wrap break-words",
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatErrorForDisplay"])(detail?.error || log.error)
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 766,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 680,
                                columnNumber: 13
                            }, this),
                            relatedLogs.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 rounded-xl bg-bg-subtle border border-border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[10px] text-text-muted uppercase tracking-wider mb-2 font-bold",
                                        children: [
                                            "Related Requests (",
                                            relatedLogs.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 775,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                            ...relatedLogs
                                        ].sort((a, b)=>{
                                            const aStart = new Date(a.timestamp).getTime() - (a.duration || 0);
                                            const bStart = new Date(b.timestamp).getTime() - (b.duration || 0);
                                            return aStart - bStart;
                                        }).map((r)=>{
                                            const rStatusStyle = r.active ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getHttpStatusStyle"])(r.status);
                                            const isCurrent = r.id === log.id;
                                            const startTime = new Date(new Date(r.timestamp).getTime() - (r.duration || 0));
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>!isCurrent && onSelectRelated?.(r),
                                                disabled: isCurrent,
                                                className: `flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${isCurrent ? "bg-primary/10 border border-primary/30 cursor-default" : "hover:bg-bg-hover cursor-pointer"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-block px-1.5 py-0.5 rounded text-[9px] font-bold min-w-[28px] text-center",
                                                        style: rStatusStyle ? {
                                                            backgroundColor: rStatusStyle.bg,
                                                            color: rStatusStyle.text
                                                        } : {
                                                            backgroundColor: "#374151",
                                                            color: "#fff"
                                                        },
                                                        children: r.status || "..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 800,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-text-muted",
                                                        children: r.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 810,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted",
                                                        children: r.model
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 811,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted text-[10px]",
                                                        children: startTime.toLocaleTimeString("en-US", {
                                                            hour12: false
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 812,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-text-muted ml-auto",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDuration"])(r.duration)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 815,
                                                        columnNumber: 25
                                                    }, this),
                                                    isCurrent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[9px] text-primary font-bold ml-1",
                                                        children: "current"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                        lineNumber: 819,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, r.id, true, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 790,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 778,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 774,
                                columnNumber: 13
                            }, this),
                            detailIssue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 rounded-xl bg-amber-500/10 border border-amber-500/30",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1 font-bold",
                                        children: "Detail Status"
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 830,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-amber-700 dark:text-amber-200",
                                        children: detailIssue
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 833,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 829,
                                columnNumber: 13
                            }, this),
                            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-8 text-center text-text-muted animate-pulse",
                                children: "Loading request details..."
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                lineNumber: 838,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    streamChunks && streamChunks.provider && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StreamSection, {
                                        title: "Provider Event Stream",
                                        json: Array.isArray(streamChunks.provider) ? streamChunks.provider.join("") : String(streamChunks.provider),
                                        onCopy: ()=>onCopy(Array.isArray(streamChunks.provider) ? streamChunks.provider.join("") : String(streamChunks.provider))
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 844,
                                        columnNumber: 17
                                    }, this),
                                    streamChunks && streamChunks.client && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StreamSection, {
                                        title: "Client Event Stream",
                                        json: Array.isArray(streamChunks.client) ? streamChunks.client.join("") : String(streamChunks.client),
                                        onCopy: ()=>onCopy(Array.isArray(streamChunks.client) ? streamChunks.client.join("") : String(streamChunks.client))
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 862,
                                        columnNumber: 17
                                    }, this),
                                    streamChunks && streamChunks.openai && !streamChunks.provider && !streamChunks.client && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StreamSection, {
                                        title: "Event Stream",
                                        json: Array.isArray(streamChunks.openai) ? streamChunks.openai.join("") : String(streamChunks.openai),
                                        onCopy: ()=>onCopy(Array.isArray(streamChunks.openai) ? streamChunks.openai.join("") : String(streamChunks.openai))
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 883,
                                        columnNumber: 19
                                    }, this),
                                    payloadSections.length > 0 && payloadSections.map((section)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PayloadSection, {
                                            title: section.title,
                                            json: section.json,
                                            onCopy: ()=>onCopy(section.json)
                                        }, section.key, false, {
                                            fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                            lineNumber: 902,
                                            columnNumber: 19
                                        }, this)),
                                    payloadSections.length === 0 && responseJson && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PayloadSection, {
                                        title: "Response Payload (Legacy)",
                                        json: responseJson,
                                        onCopy: ()=>onCopy(responseJson)
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 911,
                                        columnNumber: 17
                                    }, this),
                                    payloadSections.length === 0 && requestJson && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PayloadSection, {
                                        title: "Request Payload (Legacy)",
                                        json: requestJson,
                                        onCopy: ()=>onCopy(requestJson)
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 919,
                                        columnNumber: 17
                                    }, this),
                                    payloadSections.length === 0 && !requestJson && !responseJson && !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-6 text-center text-text-muted",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[32px] mb-2 block opacity-40",
                                                children: "info"
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 928,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm",
                                                children: "No payload data available for this log entry."
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 931,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs mt-1",
                                                children: "Enable detailed logging first if you want the four-stage client/provider payload view for new requests."
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                                lineNumber: 932,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                                        lineNumber: 927,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                        lineNumber: 438,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
                lineNumber: 358,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/RequestLoggerDetail.tsx",
        lineNumber: 350,
        columnNumber: 5
    }, this);
}
_s2(RequestLoggerDetail, "pMiAnRcHMemV6SZe5V+iWh2kQ1o=");
_c2 = RequestLoggerDetail;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "PayloadSection");
__turbopack_context__.k.register(_c1, "StreamSection");
__turbopack_context__.k.register(_c2, "RequestLoggerDetail");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_shared_components_RequestLoggerDetail_tsx_0_bc-3w._.js.map