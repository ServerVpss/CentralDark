(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/RiskNoticeBanner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RiskNoticeBanner",
    ()=>RiskNoticeBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const STORAGE_KEY = "omniroute-agentbridge-risk-dismissed";
// Same-tab signal for the dismiss button, since writing localStorage doesn't
// fire a "storage" event in the tab that wrote it.
const DISMISS_EVENT = "omniroute:agentbridge-risk-dismissed";
function isNotDismissed() {
    try {
        return !localStorage.getItem(STORAGE_KEY);
    } catch  {
        return true;
    }
}
function subscribe(callback) {
    window.addEventListener(DISMISS_EVENT, callback);
    return ()=>window.removeEventListener(DISMISS_EVENT, callback);
}
// SSR has no localStorage, so the server always renders the banner visible;
// useSyncExternalStore reconciles that against the real client-side value
// right after hydration, with no hydration mismatch and no setState-in-effect.
function getServerSnapshot() {
    return true;
}
function RiskNoticeBanner() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    const visible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribe, isNotDismissed, getServerSnapshot);
    const dismiss = ()=>{
        try {
            localStorage.setItem(STORAGE_KEY, "true");
        } catch  {
        // ignore
        }
        window.dispatchEvent(new Event(DISMISS_EVENT));
    };
    if (!visible) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "alert",
        className: "flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "material-symbols-outlined text-amber-500 shrink-0 mt-0.5",
                children: "warning"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/RiskNoticeBanner.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-semibold text-amber-700 dark:text-amber-400",
                        children: t("riskBannerTitle") || "Use at your own risk"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/RiskNoticeBanner.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-amber-600/80 dark:text-amber-300/70 mt-0.5",
                        children: t("riskBannerBody") || "AgentBridge intercepts HTTPS traffic from IDE agents. By activating it you accept responsibility for compliance with the terms of service of each agent. Never use on devices or networks where TLS inspection is prohibited."
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/RiskNoticeBanner.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/RiskNoticeBanner.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: dismiss,
                "aria-label": t("riskBannerDismiss") || "Dismiss",
                className: "shrink-0 text-amber-500 hover:text-amber-400 transition-colors",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[18px]",
                    children: "close"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/RiskNoticeBanner.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/RiskNoticeBanner.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/RiskNoticeBanner.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_s(RiskNoticeBanner, "5jrpTgCSj7SO6aMGcamljGi/j/Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"]
    ];
});
_c = RiskNoticeBanner;
var _c;
__turbopack_context__.k.register(_c, "RiskNoticeBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/CertStatusIcon.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CertStatusIcon",
    ()=>CertStatusIcon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function CertStatusIcon({ trusted, size = 16 }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    return trusted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "material-symbols-outlined text-emerald-500",
        style: {
            fontSize: size
        },
        title: t("certTrusted"),
        children: "verified_user"
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/CertStatusIcon.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "material-symbols-outlined text-zinc-400",
        style: {
            fontSize: size
        },
        title: t("certNotTrusted"),
        children: "lock_open"
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/CertStatusIcon.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_s(CertStatusIcon, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = CertStatusIcon;
var _c;
__turbopack_context__.k.register(_c, "CertStatusIcon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UpstreamCaField",
    ()=>UpstreamCaField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function UpstreamCaField({ value, onChange, onSave }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    const [testing, setTesting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [testResult, setTestResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleTest = async ()=>{
        if (!value.trim()) return;
        setTesting(true);
        setTestResult(null);
        try {
            const res = await fetch("/api/tools/agent-bridge/upstream-ca/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    path: value.trim()
                })
            });
            setTestResult(res.ok ? "ok" : "error");
        } catch  {
            setTestResult("error");
        } finally{
            setTesting(false);
        }
    };
    const handleSave = async ()=>{
        await onSave(value.trim());
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "text-xs font-medium text-text-muted",
                children: t("upstreamCaLabel") || "Upstream CA Certificate (corporate)"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        className: "flex-1 rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                        placeholder: t("upstreamCaPlaceholder") || "/etc/ssl/certs/corp-ca.pem",
                        value: value,
                        onChange: (e)=>onChange(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleTest,
                        disabled: testing || !value.trim(),
                        className: "shrink-0 rounded-lg border border-border/50 bg-card px-3 py-2 text-xs font-medium hover:bg-surface transition-colors disabled:opacity-50",
                        children: testing ? "Testing…" : t("upstreamCaTest") || "Test TLS"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleSave,
                        disabled: !value.trim(),
                        className: "shrink-0 rounded-lg bg-primary/10 text-primary px-3 py-2 text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50",
                        children: t("save") || "Save"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            testResult === "ok" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-emerald-500",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px] mr-1",
                        children: "check_circle"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this),
                    t("upstreamCaTestOk") || "TLS test passed"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx",
                lineNumber: 74,
                columnNumber: 9
            }, this),
            testResult === "error" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-red-500",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px] mr-1",
                        children: "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx",
                        lineNumber: 81,
                        columnNumber: 11
                    }, this),
                    t("upstreamCaTestError") || "TLS test failed — check the path and CA file"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_s(UpstreamCaField, "O/1mkQr8/eWXfrS0ryFPAumxFf4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = UpstreamCaField;
var _c;
__turbopack_context__.k.register(_c, "UpstreamCaField");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BypassListEditor",
    ()=>BypassListEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const DEFAULT_BYPASS_PATTERNS = [
    "*.bank.*",
    "*.gov.*",
    "*.okta.com",
    "*.auth0.com"
];
function BypassListEditor({ patterns, onSave }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    const [userInput, setUserInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(patterns.join("\n"));
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSave = async ()=>{
        setSaving(true);
        try {
            const parsed = userInput.split("\n").map((l)=>l.trim()).filter(Boolean);
            await onSave(parsed);
        } finally{
            setSaving(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-medium text-text-muted mb-1.5",
                        children: t("bypassDefaultsLabel") || "Default bypass patterns (read-only)"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-1.5",
                        children: DEFAULT_BYPASS_PATTERNS.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center px-2 py-0.5 rounded-full bg-surface text-xs text-text-muted border border-border/40",
                                children: p
                            }, p, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx",
                                lineNumber: 48,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-medium text-text-muted mb-1.5 block",
                        children: t("bypassUserLabel") || "Custom bypass patterns (one per line, glob or regex)"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        className: "w-full min-h-[80px] rounded-lg border border-border/50 bg-card px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50",
                        placeholder: "*.internal.corp sso.example.com",
                        value: userInput,
                        onChange: (e)=>setUserInput(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-end",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: handleSave,
                    disabled: saving,
                    className: "rounded-lg bg-primary/10 text-primary px-4 py-2 text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50",
                    children: saving ? t("saving") || "Saving…" : t("saveBypassList") || "Save bypass list"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(BypassListEditor, "Mte4650eN252oOc8vvWCgcgZVe4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = BypassListEditor;
var _c;
__turbopack_context__.k.register(_c, "BypassListEditor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgentBridgeServerCard",
    ()=>AgentBridgeServerCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$shared$2f$CertStatusIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/CertStatusIcon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$UpstreamCaField$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/UpstreamCaField.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$BypassListEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/BypassListEditor.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function AgentBridgeServerCard({ serverState, onAction, onUpstreamCaSave, onBypassSave, bypassPatterns }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [upstreamCa, setUpstreamCa] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(serverState.upstreamCa ?? "");
    const runAction = async (action)=>{
        setLoading(action);
        try {
            await onAction(action);
        } finally{
            setLoading(null);
        }
    };
    const isRunning = serverState.running;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-border/60 bg-card overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between px-5 py-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-2 rounded-lg bg-primary/10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[20px] text-primary",
                                    children: "link"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                    lineNumber: 51,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-sm font-semibold text-text-main flex items-center gap-2",
                                        children: [
                                            t("serverCardTitle") || "AgentBridge Server",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isRunning ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `h-1.5 w-1.5 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                                        lineNumber: 63,
                                                        columnNumber: 17
                                                    }, this),
                                                    isRunning ? t("statusRunning") || "Running" : t("statusStopped") || "Stopped"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                                lineNumber: 56,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                        lineNumber: 54,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 mt-0.5 text-xs text-text-muted",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    t("serverPort") || "Port",
                                                    ": ",
                                                    serverState.port ?? 443
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                                lineNumber: 70,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$shared$2f$CertStatusIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CertStatusIcon"], {
                                                trusted: serverState.certTrusted ?? false
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                                lineNumber: 73,
                                                columnNumber: 15
                                            }, this),
                                            serverState.activeConns !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    t("serverConns") || "Connections",
                                                    ": ",
                                                    serverState.activeConns
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                                lineNumber: 75,
                                                columnNumber: 17
                                            }, this),
                                            serverState.interceptedCount !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    t("serverIntercepted") || "Intercepted",
                                                    ": ",
                                                    serverState.interceptedCount.toLocaleString()
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                                lineNumber: 80,
                                                columnNumber: 17
                                            }, this),
                                            serverState.lastStartedAt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    t("serverLastStarted") || "Last started",
                                                    ":",
                                                    " ",
                                                    new Date(serverState.lastStartedAt).toLocaleTimeString()
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                                lineNumber: 85,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                        lineNumber: 69,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setExpanded((v)=>!v),
                        className: "text-text-muted hover:text-text-main transition-colors",
                        "aria-label": expanded ? "Collapse" : "Expand",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[18px]",
                            children: expanded ? "expand_less" : "expand_more"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                            lineNumber: 100,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-2 px-5 pb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>runAction("start"),
                        disabled: isRunning || loading !== null,
                        "aria-label": t("startServer"),
                        className: "inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 px-3 py-1.5 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "play_arrow"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, this),
                            loading === "start" ? t("starting") || "Starting…" : t("startServer") || "Start"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>runAction("stop"),
                        disabled: !isRunning || loading !== null,
                        "aria-label": t("stopServer"),
                        className: "inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 text-red-600 px-3 py-1.5 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "stop"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                lineNumber: 126,
                                columnNumber: 11
                            }, this),
                            loading === "stop" ? t("stopping") || "Stopping…" : t("stopServer") || "Stop"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>runAction("restart"),
                        disabled: loading !== null,
                        "aria-label": t("restartServer"),
                        className: "inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 text-amber-600 px-3 py-1.5 text-xs font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "refresh"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this),
                            loading === "restart" ? t("restarting") || "Restarting…" : t("restartServer") || "Restart"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>runAction("trust-cert"),
                        disabled: loading !== null,
                        "aria-label": t("trustCert"),
                        className: "inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 text-blue-600 px-3 py-1.5 text-xs font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "security"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                lineNumber: 148,
                                columnNumber: 11
                            }, this),
                            loading === "trust-cert" ? t("trusting") || "Trusting…" : t("trustCert") || "Trust Cert"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/api/tools/agent-bridge/cert/download",
                        download: true,
                        "aria-label": t("downloadCert"),
                        className: "inline-flex items-center gap-1.5 rounded-lg bg-violet-500/10 text-violet-600 px-3 py-1.5 text-xs font-medium hover:bg-violet-500/20 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "download"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                lineNumber: 158,
                                columnNumber: 11
                            }, this),
                            t("downloadCert") || "Download Cert"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                        lineNumber: 152,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>runAction("regenerate-cert"),
                        disabled: loading !== null,
                        "aria-label": t("regenerateCert"),
                        className: "inline-flex items-center gap-1.5 rounded-lg bg-zinc-500/10 text-text-muted px-3 py-1.5 text-xs font-medium hover:bg-zinc-500/20 transition-colors disabled:opacity-50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "autorenew"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                lineNumber: 169,
                                columnNumber: 11
                            }, this),
                            loading === "regenerate-cert" ? t("regenerating") || "Regenerating…" : t("regenerateCert") || "Regenerate Cert"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-5 pb-5 border-t border-border/30 pt-4 flex flex-col gap-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$UpstreamCaField$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UpstreamCaField"], {
                        value: upstreamCa,
                        onChange: setUpstreamCa,
                        onSave: onUpstreamCaSave
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                        lineNumber: 179,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-xs font-semibold text-text-main mb-2",
                                children: t("bypassSectionTitle") || "Bypass List"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                lineNumber: 185,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted mb-3",
                                children: t("bypassSectionDesc") || "Hosts matching these patterns are tunneled directly (no TLS decryption). Defaults include banks, .gov, and corporate SSO."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                lineNumber: 188,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$BypassListEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BypassListEditor"], {
                                patterns: bypassPatterns,
                                onSave: onBypassSave
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                                lineNumber: 192,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                        lineNumber: 184,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
                lineNumber: 178,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_s(AgentBridgeServerCard, "NdRFzOvSwvPoie6c5UUCvNIe/Vg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = AgentBridgeServerCard;
var _c;
__turbopack_context__.k.register(_c, "AgentBridgeServerCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/Modal.tsx [app-client] (ecmascript) <export default as Modal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-client] (ecmascript)");
}),
"[project]/src/lib/inspector/agentBridgeMaintenanceApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Client-side fetch helpers for the AgentBridge maintenance & diagnostics card.
 *
 * These drive backend routes that already shipped but had no UI:
 *   - GET  /api/tools/agent-bridge/diagnose  (#4093, Gap 12) — capture self-test
 *   - DELETE /api/tools/agent-bridge/cert    (#4084, Gap 9)  — untrust the root CA
 *   - POST /api/tools/agent-bridge/repair    (#4084, Gap 7)  — undo orphaned state
 *   - GET/POST /api/tools/agent-bridge/config (#4094, Gap 4) — portable config
 *
 * Kept DOM-free (the download/upload glue lives in the component) so the
 * request/response/error handling is unit-testable by stubbing global.fetch.
 * Types are imported type-only from the server modules so this client bundle
 * never pulls their DB dependencies.
 */ __turbopack_context__.s([
    "fetchAgentBridgeConfig",
    ()=>fetchAgentBridgeConfig,
    "importAgentBridgeConfig",
    ()=>importAgentBridgeConfig,
    "removeCaCert",
    ()=>removeCaCert,
    "repairMitmState",
    ()=>repairMitmState,
    "runDiagnose",
    ()=>runDiagnose
]);
/** Extract the sanitized server error message, falling back to the status. */ async function errorMessage(res) {
    const body = await res.json().catch(()=>null);
    return body?.error?.message ?? `HTTP ${res.status}`;
}
async function requestJson(url, init) {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(await errorMessage(res));
    return await res.json();
}
function runDiagnose(agentId) {
    const url = agentId ? `/api/tools/agent-bridge/diagnose?agentId=${encodeURIComponent(agentId)}` : "/api/tools/agent-bridge/diagnose";
    return requestJson(url);
}
function removeCaCert(sudoPassword) {
    return requestJson("/api/tools/agent-bridge/cert", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(sudoPassword ? {
            sudoPassword
        } : {})
    });
}
function repairMitmState(sudoPassword) {
    return requestJson("/api/tools/agent-bridge/repair", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(sudoPassword ? {
            sudoPassword
        } : {})
    });
}
function fetchAgentBridgeConfig() {
    return requestJson("/api/tools/agent-bridge/config");
}
function importAgentBridgeConfig(config) {
    return requestJson("/api/tools/agent-bridge/config", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(config)
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgentBridgeMaintenanceCard",
    ()=>AgentBridgeMaintenanceCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-client] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-client] (ecmascript) <export default as Modal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$inspector$2f$agentBridgeMaintenanceApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/inspector/agentBridgeMaintenanceApi.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function downloadJson(data, filename) {
    const blob = new Blob([
        JSON.stringify(data, null, 2)
    ], {
        type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
function AgentBridgeMaintenanceCard({ orphanedStateDetected, certTrusted, hasCachedPassword, needsSudoPassword, isWin, onError, onRefresh }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    const tCli = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("cliTools");
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [report, setReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [notice, setNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [confirmRemoveCa, setConfirmRemoveCa] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPasswordModal, setShowPasswordModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingPrivilegedAction, setPendingPrivilegedAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [sudoPassword, setSudoPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [passwordModalError, setPasswordModalError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canRunWithoutPassword = isWin || hasCachedPassword || !needsSudoPassword;
    const run = async (action, fn)=>{
        setBusy(action);
        onError(null);
        setNotice(null);
        try {
            await fn();
        } catch (err) {
            onError(err instanceof Error ? err.message : "Action failed");
        } finally{
            setBusy(null);
        }
    };
    const handleDiagnose = ()=>run("diagnose", async ()=>{
            setReport(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$inspector$2f$agentBridgeMaintenanceApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runDiagnose"])());
        });
    const handleRepair = async (password = "")=>{
        const { repaired } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$inspector$2f$agentBridgeMaintenanceApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["repairMitmState"])(password || undefined);
        setNotice(repaired.length === 0 ? t("repairNothing") || "Nothing to repair — system state is clean." : (t("repairDone") || "Repaired: {items}").replace("{items}", repaired.join(", ")));
        await onRefresh();
    };
    const handleRemoveCa = async (password = "")=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$inspector$2f$agentBridgeMaintenanceApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["removeCaCert"])(password || undefined);
        setConfirmRemoveCa(false);
        setNotice(t("removeCaDone") || "MITM root CA removed from the OS trust store.");
        await onRefresh();
    };
    const runPrivilegedAction = async (action, password = "")=>{
        if (action === "repair") {
            await run("repair", ()=>handleRepair(password));
            return;
        }
        await run("remove-ca", ()=>handleRemoveCa(password));
    };
    const requestPrivilegedAction = (action)=>{
        if (canRunWithoutPassword) {
            void runPrivilegedAction(action);
            return;
        }
        setPendingPrivilegedAction(action);
        setPasswordModalError(null);
        setSudoPassword("");
        setShowPasswordModal(true);
    };
    const handleConfirmPassword = ()=>{
        if (!sudoPassword.trim()) {
            setPasswordModalError(tCli("sudoPasswordRequiredError"));
            return;
        }
        const action = pendingPrivilegedAction;
        if (!action) return;
        setShowPasswordModal(false);
        setPendingPrivilegedAction(null);
        const password = sudoPassword;
        setSudoPassword("");
        setPasswordModalError(null);
        void runPrivilegedAction(action, password);
    };
    const onRepairClick = ()=>requestPrivilegedAction("repair");
    const onRemoveCaClick = ()=>requestPrivilegedAction("remove-ca");
    const closePasswordModal = ()=>{
        setShowPasswordModal(false);
        setPendingPrivilegedAction(null);
        setSudoPassword("");
        setPasswordModalError(null);
    };
    const handleExport = ()=>run("export", async ()=>{
            const config = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$inspector$2f$agentBridgeMaintenanceApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAgentBridgeConfig"])();
            downloadJson(config, `agent-bridge-config-${Date.now()}.json`);
        });
    const handleImportFile = async (e)=>{
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-selecting the same file
        if (!file) return;
        await run("import", async ()=>{
            let parsed;
            try {
                parsed = JSON.parse(await file.text());
            } catch  {
                throw new Error(t("importInvalidJson") || "The selected file is not valid JSON.");
            }
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$inspector$2f$agentBridgeMaintenanceApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["importAgentBridgeConfig"])(parsed);
            setNotice((t("importDone") || "Imported {bypass} bypass · {hosts} hosts · {agents} agents").replace("{bypass}", String(result.bypassPatterns)).replace("{hosts}", String(result.customHosts)).replace("{agents}", String(result.agents)));
            await onRefresh();
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-border/60 bg-card overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 px-5 py-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-2 rounded-lg bg-primary/10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[20px] text-primary",
                                    children: "build"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                    lineNumber: 189,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 188,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-sm font-semibold text-text-main",
                                        children: t("maintenanceTitle") || "Maintenance & Diagnostics"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 192,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-text-muted mt-0.5",
                                        children: t("maintenanceSubtitle") || "Self-test the capture pipeline, undo leftover system state, and move your setup between machines."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 195,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 191,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                        lineNumber: 187,
                        columnNumber: 7
                    }, this),
                    orphanedStateDetected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-5 mb-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[16px]",
                                children: "warning"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 205,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: t("orphanedStateWarning") || "A previous session left system state behind (DNS spoof, CA, or system proxy). Run Repair to clean it up."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 206,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                        lineNumber: 204,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2 px-5 pb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleDiagnose,
                                disabled: busy !== null,
                                className: "inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 text-blue-600 px-3 py-1.5 text-xs font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: "troubleshoot"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 221,
                                        columnNumber: 11
                                    }, this),
                                    busy === "diagnose" ? t("diagnosing") || "Diagnosing…" : t("diagnose") || "Diagnose"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 215,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: onRepairClick,
                                disabled: busy !== null,
                                className: `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${orphanedStateDetected ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30" : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: "cleaning_services"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 235,
                                        columnNumber: 11
                                    }, this),
                                    busy === "repair" ? t("repairing") || "Repairing…" : t("repair") || "Repair"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 225,
                                columnNumber: 9
                            }, this),
                            certTrusted && (confirmRemoveCa ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-1 rounded-lg bg-red-500/5 border border-red-500/30 px-2 py-1 text-xs",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-red-600 dark:text-red-400",
                                        children: t("removeCaConfirm") || "Remove CA?"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 242,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: onRemoveCaClick,
                                        disabled: busy !== null,
                                        className: "rounded bg-red-500/15 text-red-600 px-2 py-0.5 font-medium hover:bg-red-500/25 disabled:opacity-50",
                                        children: busy === "remove-ca" ? t("removing") || "Removing…" : t("confirm") || "Confirm"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 243,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setConfirmRemoveCa(false),
                                        disabled: busy !== null,
                                        className: "rounded text-text-muted px-2 py-0.5 hover:text-text-main disabled:opacity-50",
                                        children: t("cancel") || "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 251,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 241,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setConfirmRemoveCa(true),
                                disabled: busy !== null,
                                className: "inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 text-red-600 px-3 py-1.5 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: "gpp_bad"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 267,
                                        columnNumber: 15
                                    }, this),
                                    t("removeCa") || "Remove CA"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 261,
                                columnNumber: 13
                            }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleExport,
                                disabled: busy !== null,
                                className: "inline-flex items-center gap-1.5 rounded-lg bg-zinc-500/10 text-text-muted px-3 py-1.5 text-xs font-medium hover:bg-zinc-500/20 transition-colors disabled:opacity-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: "download"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 278,
                                        columnNumber: 11
                                    }, this),
                                    busy === "export" ? t("exporting") || "Exporting…" : t("exportConfig") || "Export config"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 272,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>fileInputRef.current?.click(),
                                disabled: busy !== null,
                                className: "inline-flex items-center gap-1.5 rounded-lg bg-zinc-500/10 text-text-muted px-3 py-1.5 text-xs font-medium hover:bg-zinc-500/20 transition-colors disabled:opacity-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: "upload"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 288,
                                        columnNumber: 11
                                    }, this),
                                    busy === "import" ? t("importing") || "Importing…" : t("importConfig") || "Import config"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 282,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: fileInputRef,
                                type: "file",
                                accept: "application/json,.json",
                                onChange: handleImportFile,
                                className: "hidden",
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 291,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                        lineNumber: 214,
                        columnNumber: 7
                    }, this),
                    notice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-5 mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[16px]",
                                children: "check_circle"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 304,
                                columnNumber: 11
                            }, this),
                            notice
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                        lineNumber: 303,
                        columnNumber: 9
                    }, this),
                    report && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-5 mb-4 rounded-lg border border-border/40 bg-bg-subtle/40 p-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-2 text-xs font-medium",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined text-[16px] ${report.healthy ? "text-emerald-500" : "text-red-500"}`,
                                        children: report.healthy ? "check_circle" : "error"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 313,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: report.healthy ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                                        children: report.healthy ? t("diagnoseHealthy") || "Capture pipeline is healthy." : t("diagnoseUnhealthy") || "Capture pipeline has problems:"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 320,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-auto text-text-muted font-mono",
                                        children: [
                                            ":",
                                            report.port
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 325,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 312,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "flex flex-col gap-1.5",
                                children: report.checks.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `material-symbols-outlined text-[14px] ${c.ok ? "text-emerald-500" : "text-red-500"}`,
                                                        children: c.ok ? "check" : "close"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                                        lineNumber: 331,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-text-main",
                                                        children: c.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                                        lineNumber: 338,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                                lineNumber: 330,
                                                columnNumber: 17
                                            }, this),
                                            !c.ok && c.hint && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "ml-5 text-text-muted",
                                                children: c.hint
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                                lineNumber: 340,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, c.name, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                        lineNumber: 329,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                lineNumber: 327,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                        lineNumber: 311,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                lineNumber: 186,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
                isOpen: showPasswordModal,
                onClose: closePasswordModal,
                title: tCli("sudoPasswordRequiredTitle"),
                size: "sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[20px] text-yellow-500",
                                    children: "warning"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                    lineNumber: 356,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: tCli("sudoPasswordHint")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                    lineNumber: 357,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                            lineNumber: 355,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                            type: "password",
                            placeholder: tCli("enterSudoPassword"),
                            value: sudoPassword,
                            onChange: (event)=>setSudoPassword(event.target.value),
                            onKeyDown: (event)=>{
                                if (event.key === "Enter" && busy === null) handleConfirmPassword();
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                            lineNumber: 360,
                            columnNumber: 11
                        }, this),
                        passwordModalError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 rounded bg-red-500/10 px-2 py-1.5 text-xs text-red-600",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: "error"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                    lineNumber: 372,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: passwordModalError
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                    lineNumber: 373,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                            lineNumber: 371,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-end gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    variant: "ghost",
                                    size: "sm",
                                    onClick: closePasswordModal,
                                    disabled: busy !== null,
                                    children: tCli("cancel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                    lineNumber: 378,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    size: "sm",
                                    onClick: handleConfirmPassword,
                                    disabled: busy !== null,
                                    children: tCli("confirm")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                                    lineNumber: 386,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                            lineNumber: 377,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                    lineNumber: 354,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx",
                lineNumber: 348,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(AgentBridgeMaintenanceCard, "UvKf+IvU7JHfCHYjhalabdaK2IE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = AgentBridgeMaintenanceCard;
var _c;
__turbopack_context__.k.register(_c, "AgentBridgeMaintenanceCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/AgentIcon.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgentIcon",
    ()=>AgentIcon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function AgentIcon({ icon, color, size = 20 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-center rounded-lg shrink-0",
        style: {
            backgroundColor: `${color}20`,
            width: size + 12,
            height: size + 12
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "material-symbols-outlined",
            style: {
                fontSize: size,
                color
            },
            children: icon
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/AgentIcon.tsx",
            lineNumber: 19,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/AgentIcon.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = AgentIcon;
var _c;
__turbopack_context__.k.register(_c, "AgentIcon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/DnsStatusBadge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DnsStatusBadge",
    ()=>DnsStatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function DnsStatusBadge({ enabled }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${enabled ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `h-1.5 w-1.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-zinc-400"}`
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/DnsStatusBadge.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            enabled ? "DNS on" : "DNS off"
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/DnsStatusBadge.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = DnsStatusBadge;
var _c;
__turbopack_context__.k.register(_c, "DnsStatusBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/turkishText.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compareTr",
    ()=>compareTr,
    "matchesAnyToken",
    ()=>matchesAnyToken,
    "matchesSearch",
    ()=>matchesSearch,
    "normalizeForSearch",
    ()=>normalizeForSearch
]);
/**
 * Türkçe-güvenli metin normalizasyonu, arama ve sıralama yardımcıları.
 *
 * JavaScript'in locale-bağımsız `toLowerCase()`'i Türkçe `İ/I/ı/i`
 * karakterlerini bozar: `"İ".toLowerCase()` → `"i̇"` (U+0069 U+0307
 * combining dot above). Bu, `toLowerCase().includes()` tabanlı aramada
 * Türkçe girdileri eşleşmez kılar.
 *
 * Saf fonksiyonlar — yan etki ve bağımlılık yok.
 *
 * @module shared/utils/turkishText
 */ /** NFD ile katlanmayan Türkçe harfler için açık eşleme. */ const TR_FOLD = {
    ı: "i",
    ş: "s",
    ğ: "g",
    ü: "u",
    ö: "o",
    ç: "c"
};
function normalizeForSearch(input) {
    if (!input) return "";
    let s = input.toLocaleLowerCase("tr"); // İ→i, I→ı (Türkçe-güvenli)
    s = s.replace(/[ışğüöç]/g, (ch)=>TR_FOLD[ch] ?? ch); // açık Türkçe fold
    s = s.normalize("NFD").replace(/[̀-ͯ]/g, ""); // kalan aksanları sil
    return s.trim();
}
function matchesSearch(text, query) {
    const q = normalizeForSearch(query);
    if (!q) return true;
    return normalizeForSearch(text).includes(q);
}
function matchesAnyToken(text, query) {
    const q = normalizeForSearch(query);
    if (!q) return true;
    const normalizedText = normalizeForSearch(text);
    if (normalizedText.includes(q)) return true;
    return q.split(/\s+/).filter(Boolean).some((token)=>normalizedText.includes(token));
}
const trCollator = new Intl.Collator("tr", {
    sensitivity: "base",
    numeric: true
});
function compareTr(a, b) {
    return trCollator.compare(a ?? "", b ?? "");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModelSelectorModal",
    ()=>ModelSelectorModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/turkishText.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function ModelSelectorModal({ open, currentModel, onSelect, onClose }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const [models, setModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const loadModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ModelSelectorModal.useCallback[loadModels]": async ()=>{
            setLoading(true);
            try {
                const r = await fetch("/api/v1/models");
                const d = await r.json();
                setModels(Array.isArray(d.data) ? d.data : []);
            } catch  {
                setModels([]);
            } finally{
                setLoading(false);
            }
        }
    }["ModelSelectorModal.useCallback[loadModels]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ModelSelectorModal.useEffect": ()=>{
            if (!open) return;
            loadModels();
        }
    }["ModelSelectorModal.useEffect"], [
        open,
        loadModels
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ModelSelectorModal.useEffect": ()=>{
            if (!open) return;
            const handler = {
                "ModelSelectorModal.useEffect.handler": (e)=>{
                    if (e.key === "Escape") onClose();
                }
            }["ModelSelectorModal.useEffect.handler"];
            document.addEventListener("keydown", handler);
            return ({
                "ModelSelectorModal.useEffect": ()=>document.removeEventListener("keydown", handler)
            })["ModelSelectorModal.useEffect"];
        }
    }["ModelSelectorModal.useEffect"], [
        open,
        onClose
    ]);
    if (!open) return null;
    const filtered = models.filter((model)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["matchesSearch"])(model.id, search) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["matchesSearch"])(model.name, search));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        role: "dialog",
        "aria-modal": "true",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-sm rounded-xl border border-border/60 bg-card shadow-xl flex flex-col max-h-[70vh]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/30",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-sm font-semibold text-text-main",
                            children: t("modelSelectorTitle")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                            lineNumber: 75,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            "aria-label": tc("close"),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[18px] text-text-muted hover:text-text-main",
                                children: "close"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                                lineNumber: 77,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                            lineNumber: 76,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-4 py-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        autoFocus: true,
                        className: "w-full rounded-lg border border-border/50 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                        placeholder: t("modelSelectorSearch"),
                        value: search,
                        onChange: (e)=>setSearch(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                        lineNumber: 84,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-1",
                    children: [
                        loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted py-4 text-center",
                            children: t("loading")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                            lineNumber: 95,
                            columnNumber: 23
                        }, this),
                        !loading && filtered.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted py-4 text-center",
                            children: t("noModelsFound")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                            lineNumber: 97,
                            columnNumber: 13
                        }, this),
                        filtered.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>onSelect(m.id),
                                className: `w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${m.id === currentModel ? "bg-primary/10 text-primary font-medium" : "hover:bg-surface text-text-main"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-mono text-xs",
                                        children: m.id
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                                        lineNumber: 110,
                                        columnNumber: 15
                                    }, this),
                                    m.name !== m.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-2 text-text-muted text-xs",
                                        children: m.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                                        lineNumber: 111,
                                        columnNumber: 35
                                    }, this)
                                ]
                            }, m.id, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
            lineNumber: 73,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_s(ModelSelectorModal, "BgjDOuerrtaLxgHDcgjalEKhJd8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = ModelSelectorModal;
var _c;
__turbopack_context__.k.register(_c, "ModelSelectorModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModelMappingTable",
    ()=>ModelMappingTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$ModelSelectorModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelSelectorModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function ModelMappingTable({ agentId, mappings, onSave }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    const [rows, setRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(mappings);
    const [selectorOpen, setSelectorOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const updateTarget = (index, target)=>{
        setRows((prev)=>prev.map((r, i)=>i === index ? {
                    ...r,
                    target
                } : r));
        setSelectorOpen(null);
    };
    const addMapping = ()=>{
        setRows((prev)=>[
                ...prev,
                {
                    source: "",
                    target: ""
                }
            ]);
    };
    const removeMapping = (index)=>{
        setRows((prev)=>prev.filter((_, i)=>i !== index));
    };
    const updateSource = (index, source)=>{
        setRows((prev)=>prev.map((r, i)=>i === index ? {
                    ...r,
                    source
                } : r));
    };
    const handleSave = async ()=>{
        setSaving(true);
        try {
            await onSave(agentId, rows);
        } finally{
            setSaving(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3",
        children: [
            rows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-lg border border-border/40 bg-surface/30 px-4 py-6 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted mb-3",
                        children: t("noMappingsDesc") || "No model mappings configured yet. Add mappings to route agent requests through OmniRoute."
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: addMapping,
                        className: "inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary/20 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "add"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                lineNumber: 66,
                                columnNumber: 13
                            }, this),
                            t("addMapping") || "Add mapping"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                lineNumber: 56,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-lg border border-border/40 overflow-hidden bg-surface",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-b border-border/40 bg-surface/60",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-3 py-2 text-left text-xs font-medium text-text-muted",
                                                children: t("sourceModel") || "Source model (agent native)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                lineNumber: 76,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-3 py-2 text-left text-xs font-medium text-text-muted",
                                                children: t("targetModel") || "Target model (OmniRoute)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                lineNumber: 79,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-3 py-2 w-12"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                lineNumber: 82,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                        lineNumber: 75,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                    lineNumber: 74,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: rows.map((row, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "border-b border-border/20 last:border-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: row.source,
                                                        onChange: (e)=>updateSource(i, e.target.value),
                                                        placeholder: "e.g., gpt-4",
                                                        className: "w-full rounded border border-border/40 bg-card px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                        lineNumber: 89,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                    lineNumber: 88,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>setSelectorOpen(i),
                                                        className: "inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-card px-2.5 py-1 text-xs hover:bg-surface transition-colors font-mono w-full justify-between",
                                                        children: [
                                                            row.target || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-text-muted italic",
                                                                children: t("selectModel") || "Select…"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                                lineNumber: 104,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "material-symbols-outlined text-[12px] text-text-muted",
                                                                children: "expand_more"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                                lineNumber: 108,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                        lineNumber: 98,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                    lineNumber: 97,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-3 py-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>removeMapping(i),
                                                        className: "text-text-muted hover:text-red-500 transition-colors",
                                                        "aria-label": "Remove mapping",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[16px]",
                                                            children: "delete"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                            lineNumber: 120,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                        lineNumber: 114,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                                    lineNumber: 113,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                            lineNumber: 87,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                    lineNumber: 85,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                            lineNumber: 73,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: addMapping,
                                className: "inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-card px-3 py-1.5 text-xs font-medium hover:bg-surface transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: "add"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                        lineNumber: 135,
                                        columnNumber: 15
                                    }, this),
                                    t("addMapping") || "Add mapping"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                lineNumber: 130,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleSave,
                                disabled: saving,
                                className: "rounded-lg bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50",
                                children: saving ? t("saving") || "Saving…" : t("saveMappings") || "Save mappings"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                                lineNumber: 138,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                        lineNumber: 129,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            selectorOpen !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$ModelSelectorModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ModelSelectorModal"], {
                open: true,
                currentModel: rows[selectorOpen]?.target ?? "",
                onSelect: (model)=>updateTarget(selectorOpen, model),
                onClose: ()=>setSelectorOpen(null)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
                lineNumber: 151,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
_s(ModelMappingTable, "5dYD7esMN1L1mIL/WMVknjp6ISA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = ModelMappingTable;
var _c;
__turbopack_context__.k.register(_c, "ModelMappingTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SetupWizard",
    ()=>SetupWizard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function SetupWizard({ target, agentState, serverRunning, serverState, currentMappings, onClose, onDnsToggle, onMappingsSave }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("verify");
    const [enablingDns, setEnablingDns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [detectedModels, setDetectedModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingModels, setLoadingModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedModels, setSelectedModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SetupWizard.useEffect": ()=>{
            const handler = {
                "SetupWizard.useEffect.handler": (e)=>{
                    if (e.key === "Escape") onClose();
                }
            }["SetupWizard.useEffect.handler"];
            document.addEventListener("keydown", handler);
            return ({
                "SetupWizard.useEffect": ()=>document.removeEventListener("keydown", handler)
            })["SetupWizard.useEffect"];
        }
    }["SetupWizard.useEffect"], [
        onClose
    ]);
    // Fetch detected models when we reach the mappings step
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SetupWizard.useEffect": ()=>{
            if (step === "mappings") {
                setLoadingModels(true);
                fetch(`/api/tools/agent-bridge/agents/${target.id}/detected-models`).then({
                    "SetupWizard.useEffect": (res)=>res.json()
                }["SetupWizard.useEffect"]).then({
                    "SetupWizard.useEffect": (data)=>{
                        setDetectedModels(data.detectedModels || []);
                    }
                }["SetupWizard.useEffect"]).catch({
                    "SetupWizard.useEffect": ()=>{
                        setDetectedModels([]);
                    }
                }["SetupWizard.useEffect"]).finally({
                    "SetupWizard.useEffect": ()=>{
                        setLoadingModels(false);
                    }
                }["SetupWizard.useEffect"]);
            }
        }
    }["SetupWizard.useEffect"], [
        step,
        target.id
    ]);
    // Fix #8656 Issue A: Use server-level cert trust as fallback
    const certTrusted = agentState?.cert_trusted ?? serverState.certTrusted ?? false;
    const dnsEnabled = agentState?.dns_enabled ?? false;
    const handleEnableDns = async ()=>{
        setEnablingDns(true);
        try {
            await onDnsToggle(target.id, true);
            setStep("mappings");
        } finally{
            setEnablingDns(false);
        }
    };
    const toggleModelSelection = (model)=>{
        setSelectedModels((prev)=>{
            const next = new Set(prev);
            if (next.has(model)) {
                next.delete(model);
            } else {
                next.add(model);
            }
            return next;
        });
    };
    const handleAddSelectedModels = async ()=>{
        if (selectedModels.size === 0) return;
        // Merge detected models with existing mappings instead of replacing
        // Filter out models that already exist in current mappings
        const existingSources = new Set(currentMappings.map((m)=>m.source));
        const newMappings = Array.from(selectedModels).filter((source)=>!existingSources.has(source)) // Only add new ones
        .map((source)=>({
                source,
                target: ""
            }));
        // Combine existing + new mappings
        const allMappings = [
            ...currentMappings,
            ...newMappings
        ];
        try {
            await onMappingsSave(target.id, allMappings);
            // Wait a bit for the parent to refresh state before closing
            await new Promise((resolve)=>setTimeout(resolve, 300));
            onClose();
        } catch  {
        // Error handling in parent component
        }
    };
    const steps = [
        {
            id: "verify",
            label: t("wizardStep1Label")
        },
        {
            id: "dns",
            label: t("wizardStep2Label")
        },
        {
            id: "mappings",
            label: t("wizardStep3Label")
        }
    ];
    const stepIndex = steps.findIndex((s)=>s.id === step);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        role: "dialog",
        "aria-modal": "true",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-lg rounded-xl border border-border/60 bg-card shadow-xl flex flex-col",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/30",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[20px]",
                                    style: {
                                        color: target.color
                                    },
                                    children: target.icon
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 147,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-sm font-semibold text-text-main",
                                            children: [
                                                t("wizardTitle"),
                                                " — ",
                                                target.name
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 151,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: t("wizardSubtitle")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 154,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 150,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                            lineNumber: 146,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            "aria-label": tc("close"),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[18px] text-text-muted hover:text-text-main",
                                children: "close"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                lineNumber: 158,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                            lineNumber: 157,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                    lineNumber: 145,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex px-5 pt-4 gap-2",
                    children: steps.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1.5 flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium shrink-0 ${i < stepIndex ? "bg-emerald-500 text-white" : i === stepIndex ? "bg-primary text-white" : "bg-surface text-text-muted border border-border/50"}`,
                                    children: i < stepIndex ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[12px]",
                                        children: "check"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                        lineNumber: 178,
                                        columnNumber: 19
                                    }, this) : i + 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 168,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-xs ${i === stepIndex ? "text-text-main font-medium" : "text-text-muted"}`,
                                    children: s.label
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 183,
                                    columnNumber: 15
                                }, this),
                                i < steps.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 h-px bg-border/30 ml-1"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 188,
                                    columnNumber: 40
                                }, this)
                            ]
                        }, s.id, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                            lineNumber: 167,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                    lineNumber: 165,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-5 py-5 flex flex-col gap-4 min-h-[180px]",
                    children: [
                        step === "verify" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted",
                                    children: t("wizardStep1Desc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 197,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 text-sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[16px] ${serverRunning ? "text-emerald-500" : "text-red-500"}`,
                                                    children: serverRunning ? "check_circle" : "cancel"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                                    lineNumber: 200,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        t("wizardServerCheck"),
                                                        " ",
                                                        serverRunning ? t("wizardRunning") : t("wizardNotRunning")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                                    lineNumber: 205,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 199,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 text-sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[16px] ${certTrusted ? "text-emerald-500" : "text-amber-500"}`,
                                                    children: certTrusted ? "verified_user" : "warning"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                                    lineNumber: 211,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        t("wizardCertCheck"),
                                                        " ",
                                                        certTrusted ? t("wizardTrusted") : t("wizardNotTrusted")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                                    lineNumber: 216,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 210,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 198,
                                    columnNumber: 15
                                }, this),
                                target.setupTutorial.steps.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 p-3 rounded-lg bg-surface/50 border border-border/30",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-medium text-text-muted mb-2",
                                            children: t("wizardTutorialTitle")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 226,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                                            className: "flex flex-col gap-1",
                                            children: target.setupTutorial.steps.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "text-xs text-text-muted flex items-start gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "shrink-0 text-primary font-medium",
                                                            children: [
                                                                i + 1,
                                                                "."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                                            lineNumber: 232,
                                                            columnNumber: 25
                                                        }, this),
                                                        step
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                                    lineNumber: 231,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 229,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 225,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                            lineNumber: 196,
                            columnNumber: 13
                        }, this),
                        step === "dns" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted",
                                    children: t("wizardStep2Desc")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 244,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg bg-surface/50 border border-border/30 p-3 font-mono text-xs flex flex-col gap-1",
                                    children: target.hosts.map((host)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-text-muted",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-primary",
                                                    children: "127.0.0.1"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                                    lineNumber: 248,
                                                    columnNumber: 21
                                                }, this),
                                                " ",
                                                host
                                            ]
                                        }, host, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 247,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 245,
                                    columnNumber: 15
                                }, this),
                                dnsEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 text-sm text-emerald-500",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[16px]",
                                            children: "check_circle"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 254,
                                            columnNumber: 19
                                        }, this),
                                        t("wizardDnsAlreadyEnabled")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 253,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                            lineNumber: 243,
                            columnNumber: 13
                        }, this),
                        step === "mappings" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 text-emerald-500",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[20px]",
                                            children: "check_circle"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 264,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium",
                                            children: t("wizardStep3Success")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 265,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 263,
                                    columnNumber: 15
                                }, this),
                                loadingModels ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 text-sm text-text-muted",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[16px] animate-spin",
                                            children: "progress_activity"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 270,
                                            columnNumber: 19
                                        }, this),
                                        "Detecting models from intercepted traffic..."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 269,
                                    columnNumber: 17
                                }, this) : detectedModels.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-text-muted",
                                            children: [
                                                "Found ",
                                                detectedModels.length,
                                                " model",
                                                detectedModels.length !== 1 ? "s" : "",
                                                " in intercepted traffic. Select the ones you want to add:"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 275,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-border/40 bg-surface p-3 flex flex-col gap-2 max-h-[200px] overflow-y-auto",
                                            children: detectedModels.map((model)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "flex items-center gap-2 cursor-pointer hover:bg-surface/50 p-2 rounded transition-colors",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: selectedModels.has(model),
                                                            onChange: ()=>toggleModelSelection(model),
                                                            className: "rounded border-border/50 text-primary focus:ring-2 focus:ring-primary/50"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                                            lineNumber: 284,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-mono text-xs text-text-main",
                                                            children: model
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                                            lineNumber: 290,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, model, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                                    lineNumber: 280,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 278,
                                            columnNumber: 19
                                        }, this),
                                        selectedModels.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: [
                                                selectedModels.size,
                                                " model",
                                                selectedModels.size !== 1 ? "s" : "",
                                                "selected. You'll map them to OmniRoute models in the next screen."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 295,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 274,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg border border-border/40 bg-surface/30 p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-text-muted",
                                            children: [
                                                "No models detected yet. Use ",
                                                target.name,
                                                " to make a request, then run this wizard again to auto-detect models from traffic."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 302,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted mt-2",
                                            children: "Or close this wizard and add mappings manually in the agent card."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 305,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 301,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                            lineNumber: 262,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                    lineNumber: 194,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between px-5 pb-5 pt-0 border-t border-border/30 mt-0 pt-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>{
                                if (step === "dns") setStep("verify");
                                else if (step === "mappings") setStep("dns");
                                else onClose();
                            },
                            className: "rounded-lg border border-border/50 bg-card px-4 py-2 text-sm text-text-muted hover:bg-surface transition-colors",
                            children: step === "verify" ? t("cancel") : t("back")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                            lineNumber: 316,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                step === "verify" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setStep("dns"),
                                    className: "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors",
                                    children: [
                                        t("next"),
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px] ml-1",
                                            children: "arrow_forward"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                            lineNumber: 336,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                    lineNumber: 330,
                                    columnNumber: 15
                                }, this),
                                step === "dns" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: dnsEnabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setStep("mappings"),
                                        className: "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors",
                                        children: t("next")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                        lineNumber: 343,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleEnableDns,
                                        disabled: enablingDns,
                                        className: "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50",
                                        children: enablingDns ? t("enablingDns") : t("wizardEnableDns")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                        lineNumber: 351,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false),
                                step === "mappings" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: detectedModels.length > 0 && selectedModels.size > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleAddSelectedModels,
                                        className: "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors",
                                        children: [
                                            "Add ",
                                            selectedModels.size,
                                            " model",
                                            selectedModels.size !== 1 ? "s" : ""
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                        lineNumber: 366,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: onClose,
                                        className: "rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 transition-colors",
                                        children: t("done")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                                        lineNumber: 374,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                            lineNumber: 328,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
                    lineNumber: 315,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
            lineNumber: 143,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx",
        lineNumber: 138,
        columnNumber: 5
    }, this);
}
_s(SetupWizard, "RC7J19lJ8gFwTQHKeRBFXh/yA+8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = SetupWizard;
var _c;
__turbopack_context__.k.register(_c, "SetupWizard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/RiskNoticeModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RiskNoticeModal",
    ()=>RiskNoticeModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function RiskNoticeModal({ open, title, body, dontShowAgainKey, onAccept, onCancel }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RiskNoticeModal.useEffect": ()=>{
            if (!open) return;
            const handler = {
                "RiskNoticeModal.useEffect.handler": (e)=>{
                    if (e.key === "Escape") onCancel();
                }
            }["RiskNoticeModal.useEffect.handler"];
            document.addEventListener("keydown", handler);
            return ({
                "RiskNoticeModal.useEffect": ()=>document.removeEventListener("keydown", handler)
            })["RiskNoticeModal.useEffect"];
        }
    }["RiskNoticeModal.useEffect"], [
        open,
        onCancel
    ]);
    if (!open) return null;
    const handleAccept = ()=>{
        try {
            localStorage.setItem(dontShowAgainKey, "true");
        } catch  {
        // ignore storage errors
        }
        onAccept();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "risk-modal-title",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-md rounded-xl border border-amber-500/30 bg-card p-6 shadow-xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-3 mb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[20px]",
                                children: "warning"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/RiskNoticeModal.tsx",
                                lineNumber: 60,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/RiskNoticeModal.tsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            id: "risk-modal-title",
                            className: "text-base font-semibold text-text-main pt-1",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/RiskNoticeModal.tsx",
                            lineNumber: 62,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/RiskNoticeModal.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-text-muted mb-6 leading-relaxed",
                    children: body
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/RiskNoticeModal.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-3 justify-end",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            variant: "ghost",
                            onClick: onCancel,
                            children: t("cancel") || "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/RiskNoticeModal.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            variant: "primary",
                            onClick: handleAccept,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px] mr-1",
                                    children: "check"
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/RiskNoticeModal.tsx",
                                    lineNumber: 74,
                                    columnNumber: 13
                                }, this),
                                t("understand") || "I understand"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/shared/components/RiskNoticeModal.tsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/RiskNoticeModal.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/RiskNoticeModal.tsx",
            lineNumber: 57,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/shared/components/RiskNoticeModal.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_s(RiskNoticeModal, "etYYvAa+NcFbn1DAUOfsAwohSEY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = RiskNoticeModal;
var _c;
__turbopack_context__.k.register(_c, "RiskNoticeModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgentCard",
    ()=>AgentCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$shared$2f$AgentIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/AgentIcon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$shared$2f$DnsStatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/shared/DnsStatusBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$ModelMappingTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/ModelMappingTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$SetupWizard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/SetupWizard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$RiskNoticeModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/RiskNoticeModal.tsx [app-client] (ecmascript)");
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
const RISK_STORAGE_KEY_PREFIX = "omniroute-agentbridge-risk-dismissed-";
function hasAcceptedRisk(agentId) {
    try {
        return localStorage.getItem(RISK_STORAGE_KEY_PREFIX + agentId) === "true";
    } catch  {
        return false;
    }
}
function AgentCard({ target, agentState, serverRunning, serverState, mappings, onDnsToggle, onMappingsSave }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [wizardOpen, setWizardOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dnsLoading, setDnsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [riskModalOpen, setRiskModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dnsEnabled = agentState?.dns_enabled ?? false;
    const setupCompleted = agentState?.setup_completed ?? false;
    // Fix #8656 Issue A: Use server-level cert trust as fallback
    // (one server cert applies to all agents; agentState.cert_trusted is never written to DB)
    const certTrusted = agentState?.cert_trusted ?? serverState.certTrusted ?? false;
    const isInvestigating = target.viability === "investigating";
    const getStatusBadge = ()=>{
        if (isInvestigating) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 text-xs font-medium",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: "search"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this),
                    t("statusInvestigating") || "Investigating"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                lineNumber: 62,
                columnNumber: 9
            }, this);
        }
        if (setupCompleted && dnsEnabled) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "h-1.5 w-1.5 rounded-full bg-emerald-500"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this),
                    t("statusActive") || "Active"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                lineNumber: 70,
                columnNumber: 9
            }, this);
        }
        if (!setupCompleted) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 text-xs font-medium",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: "settings"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this),
                    t("statusSetupRequired") || "Setup required"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                lineNumber: 78,
                columnNumber: 9
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[12px]",
                    children: "warning"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this),
                t("statusDnsOff") || "DNS off"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
            lineNumber: 85,
            columnNumber: 7
        }, this);
    };
    const reallyToggleDns = async (enabled)=>{
        setDnsLoading(true);
        try {
            await onDnsToggle(target.id, enabled);
        } finally{
            setDnsLoading(false);
        }
    };
    const handleDnsToggle = async ()=>{
        const enabling = !dnsEnabled;
        if (enabling && !hasAcceptedRisk(target.id)) {
            setRiskModalOpen(true);
            return;
        }
        await reallyToggleDns(enabling);
    };
    const handleRiskAccept = async ()=>{
        setRiskModalOpen(false);
        await reallyToggleDns(true);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-border/50 bg-card overflow-hidden transition-all hover:border-border/80",
                style: {
                    borderLeftWidth: 3,
                    borderLeftColor: target.color
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface/30 transition-colors",
                        onClick: ()=>setExpanded((v)=>!v),
                        "aria-expanded": expanded,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$shared$2f$AgentIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AgentIcon"], {
                                        icon: target.icon,
                                        color: target.color,
                                        size: 18
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 129,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium text-text-main truncate",
                                                children: target.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                                lineNumber: 131,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-text-muted truncate",
                                                children: [
                                                    target.hosts.slice(0, 2).join(", "),
                                                    target.hosts.length > 2 && ` +${target.hosts.length - 2}`
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                                lineNumber: 132,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 130,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                lineNumber: 128,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 shrink-0",
                                children: [
                                    getStatusBadge(),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$shared$2f$DnsStatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DnsStatusBadge"], {
                                        enabled: dnsEnabled
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 141,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px] text-text-muted",
                                        children: expanded ? "expand_less" : "expand_more"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 142,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this),
                    expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-4 pb-4 border-t border-border/20 pt-4 flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-medium text-text-muted mb-1.5",
                                        children: t("agentHosts") || "Intercepted hosts"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 153,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-1.5",
                                        children: target.hosts.map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex items-center px-2 py-0.5 rounded-full bg-surface text-xs font-mono text-text-muted border border-border/40",
                                                children: h
                                            }, h, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                                lineNumber: 158,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 156,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                lineNumber: 152,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 text-xs text-text-muted",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined text-[14px] ${certTrusted ? "text-emerald-500" : "text-zinc-400"}`,
                                        children: certTrusted ? "verified_user" : "lock_open"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 170,
                                        columnNumber: 15
                                    }, this),
                                    certTrusted ? t("certTrusted") || "Certificate trusted" : t("certNotTrusted") || "Certificate not trusted"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                lineNumber: 169,
                                columnNumber: 13
                            }, this),
                            isInvestigating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-zinc-500/20 bg-zinc-500/5 p-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted",
                                    children: t("investigatingNotice") || "This agent is under investigation. Hosts and API surface are still being confirmed. Setup will be available once the upstream API is documented."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                    lineNumber: 183,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                lineNumber: 182,
                                columnNumber: 15
                            }, this),
                            !isInvestigating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-medium text-text-muted mb-2",
                                        children: t("modelMappingsLabel") || "Model mappings"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 193,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$ModelMappingTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ModelMappingTable"], {
                                        agentId: target.id,
                                        mappings: mappings,
                                        onSave: onMappingsSave
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 196,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                lineNumber: 192,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2",
                                children: [
                                    !isInvestigating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setWizardOpen(true),
                                        className: "inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary/20 transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[14px]",
                                                children: "play_arrow"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                                lineNumber: 212,
                                                columnNumber: 19
                                            }, this),
                                            t("setupWizard") || "Setup wizard"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 207,
                                        columnNumber: 17
                                    }, this),
                                    !isInvestigating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleDnsToggle,
                                        disabled: dnsLoading,
                                        className: `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${dnsEnabled ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[14px]",
                                                children: dnsEnabled ? "stop" : "play_arrow"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                                lineNumber: 228,
                                                columnNumber: 19
                                            }, this),
                                            dnsLoading ? t("toggling") || "Toggling…" : dnsEnabled ? t("stopDns") || "Stop DNS" : t("startDns") || "Start DNS"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 218,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: `/dashboard/tools/traffic-inspector?agent=${target.id}`,
                                        className: "inline-flex items-center gap-1.5 rounded-lg bg-zinc-500/10 text-text-muted px-3 py-1.5 text-xs font-medium hover:bg-zinc-500/20 transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[14px]",
                                                children: "network_check"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                                lineNumber: 243,
                                                columnNumber: 17
                                            }, this),
                                            t("viewTraffic") || "View traffic"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                        lineNumber: 239,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                                lineNumber: 205,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                        lineNumber: 150,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                lineNumber: 117,
                columnNumber: 7
            }, this),
            wizardOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$SetupWizard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SetupWizard"], {
                target: target,
                agentState: agentState,
                serverRunning: serverRunning,
                serverState: serverState,
                currentMappings: mappings,
                onClose: ()=>setWizardOpen(false),
                onDnsToggle: onDnsToggle,
                onMappingsSave: onMappingsSave
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                lineNumber: 252,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$RiskNoticeModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RiskNoticeModal"], {
                open: riskModalOpen,
                title: t("riskNoticeTitle"),
                body: t("riskNoticeBody"),
                dontShowAgainKey: RISK_STORAGE_KEY_PREFIX + target.id,
                onAccept: handleRiskAccept,
                onCancel: ()=>setRiskModalOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx",
                lineNumber: 264,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(AgentCard, "SX21MTNNxZDNItm0us5HH4OwqWI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = AgentCard;
var _c;
__turbopack_context__.k.register(_c, "AgentCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgentList",
    ()=>AgentList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$AgentCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentCard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function AgentList({ targets, agentStates, serverRunning, serverState, mappingsMap, onDnsToggle, onMappingsSave }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const stateByAgent = Object.fromEntries(agentStates.map((s)=>[
            s.agent_id,
            s
        ]));
    const filtered = targets.filter((target)=>{
        // Search filter
        if (search) {
            const q = search.toLowerCase();
            if (!target.name.toLowerCase().includes(q) && !target.id.toLowerCase().includes(q) && !target.hosts.some((h)=>h.toLowerCase().includes(q))) {
                return false;
            }
        }
        const state = stateByAgent[target.id];
        // Setup status filter
        if (filter === "active") {
            return state?.dns_enabled && state?.setup_completed;
        }
        if (filter === "setup-required") {
            return !state?.setup_completed && target.viability !== "investigating";
        }
        if (filter === "investigating") {
            return target.viability === "investigating";
        }
        return true;
    });
    const filterOptions = [
        {
            id: "all",
            label: t("filterAll") || "All"
        },
        {
            id: "active",
            label: t("filterActive") || "Active"
        },
        {
            id: "setup-required",
            label: t("filterSetupRequired") || "Setup required"
        },
        {
            id: "investigating",
            label: t("filterInvestigating") || "Investigating"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-border/60 bg-card overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border/30",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-text-main mr-auto",
                        children: [
                            t("agentListTitle") || "IDE Agents",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-text-muted font-normal",
                                children: [
                                    "(",
                                    targets.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1",
                        children: filterOptions.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setFilter(opt.id),
                                className: `px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filter === opt.id ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text-main hover:bg-surface"}`,
                                children: opt.label
                            }, opt.id, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                                lineNumber: 93,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[16px] text-text-muted pointer-events-none",
                                children: "search"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                                lineNumber: 110,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                className: "rounded-lg border border-border/50 bg-surface pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50",
                                placeholder: t("searchAgents") || "Search agents…",
                                value: search,
                                onChange: (e)=>setSearch(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-5 flex flex-col gap-3",
                children: filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "py-8 text-center text-text-muted",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[36px] block mb-2 text-text-muted/40",
                            children: "search_off"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                            lineNumber: 127,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm",
                            children: t("noAgentsMatch") || "No agents match the current filter"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                            lineNumber: 130,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                    lineNumber: 126,
                    columnNumber: 11
                }, this) : filtered.map((target)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$AgentCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AgentCard"], {
                        target: target,
                        agentState: stateByAgent[target.id],
                        serverRunning: serverRunning,
                        serverState: serverState,
                        mappings: mappingsMap[target.id] ?? [],
                        onDnsToggle: onDnsToggle,
                        onMappingsSave: onMappingsSave
                    }, target.id, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                        lineNumber: 134,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
_s(AgentList, "WNxu4n7IHukLdXGqeWGzh5KJY5Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = AgentList;
var _c;
__turbopack_context__.k.register(_c, "AgentList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/EmptyStateNoProviders.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmptyStateNoProviders",
    ()=>EmptyStateNoProviders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function EmptyStateNoProviders() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/50 px-8 py-14 text-center gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 rounded-2xl bg-primary/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[48px] text-primary",
                    children: "dns"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/EmptyStateNoProviders.tsx",
                    lineNumber: 16,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/EmptyStateNoProviders.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-base font-semibold text-text-main mb-1",
                        children: t("emptyNoProvidersTitle") || "No providers configured yet"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/EmptyStateNoProviders.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted max-w-sm",
                        children: t("emptyNoProvidersBody") || "To use AgentBridge, first connect at least one provider. It will be the destination where IDE requests are routed."
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/EmptyStateNoProviders.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/EmptyStateNoProviders.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/dashboard/providers",
                className: "inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[16px]",
                        children: "arrow_forward"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/EmptyStateNoProviders.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    t("emptyGoToProviders") || "Go to Providers"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/EmptyStateNoProviders.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/EmptyStateNoProviders.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_s(EmptyStateNoProviders, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = EmptyStateNoProviders;
var _c;
__turbopack_context__.k.register(_c, "EmptyStateNoProviders");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/normalizeState.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_AGENT_BRIDGE_STATE",
    ()=>DEFAULT_AGENT_BRIDGE_STATE,
    "normalizeAgentBridgeState",
    ()=>normalizeAgentBridgeState
]);
function defaultServerState() {
    return {
        running: false,
        port: 443,
        certTrusted: false,
        upstreamCa: null,
        lastStartedAt: null,
        activeConns: 0,
        interceptedCount: 0,
        dnsConfigured: false,
        orphanedStateDetected: false
    };
}
const DEFAULT_AGENT_BRIDGE_STATE = {
    serverState: defaultServerState(),
    agentStates: [],
    bypassPatterns: [],
    mappings: {}
};
function isRecord(v) {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}
function normalizeAgentBridgeState(raw) {
    if (!isRecord(raw)) return {
        ...DEFAULT_AGENT_BRIDGE_STATE,
        serverState: defaultServerState()
    };
    const serverState = defaultServerState();
    const source = isRecord(raw.serverState) ? raw.serverState : isRecord(raw.server) ? raw.server : undefined;
    if (source) {
        if (typeof source.running === "boolean") serverState.running = source.running;
        if (typeof source.port === "number") serverState.port = source.port;
        // accept both the canonical `certTrusted` and the legacy `certExists`
        if (typeof source.certTrusted === "boolean") serverState.certTrusted = source.certTrusted;
        else if (typeof source.certExists === "boolean") serverState.certTrusted = source.certExists;
        if (typeof source.upstreamCa === "string") serverState.upstreamCa = source.upstreamCa;
        if (typeof source.lastStartedAt === "string") serverState.lastStartedAt = source.lastStartedAt;
        if (typeof source.activeConns === "number") serverState.activeConns = source.activeConns;
        if (typeof source.interceptedCount === "number") {
            serverState.interceptedCount = source.interceptedCount;
        }
        if (typeof source.dnsConfigured === "boolean") serverState.dnsConfigured = source.dnsConfigured;
        if (typeof source.orphanedStateDetected === "boolean") {
            serverState.orphanedStateDetected = source.orphanedStateDetected;
        }
        if (typeof source.hasCachedPassword === "boolean") {
            serverState.hasCachedPassword = source.hasCachedPassword;
        }
        if (typeof source.needsSudoPassword === "boolean") {
            serverState.needsSudoPassword = source.needsSudoPassword;
        }
        if (typeof source.isWin === "boolean") {
            serverState.isWin = source.isWin;
        }
    }
    return {
        serverState,
        agentStates: Array.isArray(raw.agentStates) ? raw.agentStates : [],
        bypassPatterns: Array.isArray(raw.bypassPatterns) ? raw.bypassPatterns : [],
        mappings: isRecord(raw.mappings) ? raw.mappings : {}
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useAgentBridgeState.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAgentBridgeState",
    ()=>useAgentBridgeState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$normalizeState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/normalizeState.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function useAgentBridgeState({ initialData, pollingInterval = 5000 }) {
    _s();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const abortRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const refresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAgentBridgeState.useCallback[refresh]": async ()=>{
            abortRef.current?.abort();
            const ctrl = new AbortController();
            abortRef.current = ctrl;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/tools/agent-bridge/state", {
                    signal: ctrl.signal
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                // #3318: normalize the /state response so a key mismatch can't leave
                // serverState undefined and crash the page on the next render.
                const json = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$normalizeState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeAgentBridgeState"])(await res.json());
                if (!ctrl.signal.aborted) setData(json);
            } catch (err) {
                if (!ctrl.signal.aborted) {
                    setError(err instanceof Error ? err.message : "Unknown error");
                }
            } finally{
                if (!ctrl.signal.aborted) setLoading(false);
            }
        }
    }["useAgentBridgeState.useCallback[refresh]"], []);
    // Auto-poll
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useAgentBridgeState.useEffect": ()=>{
            if (!pollingInterval || pollingInterval <= 0) return;
            const id = setInterval({
                "useAgentBridgeState.useEffect.id": ()=>{
                    refresh().catch({
                        "useAgentBridgeState.useEffect.id": ()=>{}
                    }["useAgentBridgeState.useEffect.id"]);
                }
            }["useAgentBridgeState.useEffect.id"], pollingInterval);
            return ({
                "useAgentBridgeState.useEffect": ()=>clearInterval(id)
            })["useAgentBridgeState.useEffect"];
        }
    }["useAgentBridgeState.useEffect"], [
        pollingInterval,
        refresh
    ]);
    // Cleanup on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useAgentBridgeState.useEffect": ()=>{
            return ({
                "useAgentBridgeState.useEffect": ()=>{
                    abortRef.current?.abort();
                }
            })["useAgentBridgeState.useEffect"];
        }
    }["useAgentBridgeState.useEffect"], []);
    return {
        data,
        loading,
        error,
        refresh
    };
}
_s(useAgentBridgeState, "uqQTwLy3k/ZNLCvrs2rdJHIvaBQ=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MitmSudoPasswordModal",
    ()=>MitmSudoPasswordModal,
    "useMitmSudoPrompt",
    ()=>useMitmSudoPrompt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-client] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-client] (ecmascript) <export default as Modal>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
function MitmSudoPasswordModal({ isOpen, onClose, onConfirm, busy = false, error = null }) {
    _s();
    const tCli = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("cliTools");
    const [sudoPassword, setSudoPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [localError, setLocalError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleClose = ()=>{
        setSudoPassword("");
        setLocalError(null);
        onClose();
    };
    const handleConfirm = ()=>{
        if (!sudoPassword.trim()) {
            setLocalError(tCli("sudoPasswordRequiredError"));
            return;
        }
        const password = sudoPassword;
        setSudoPassword("");
        setLocalError(null);
        onConfirm(password);
    };
    const displayError = error ?? localError;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
        isOpen: isOpen,
        onClose: handleClose,
        title: tCli("sudoPasswordRequiredTitle"),
        size: "sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[20px] text-yellow-500",
                            children: "warning"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-text-muted",
                            children: tCli("sudoPasswordHint")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                    type: "password",
                    placeholder: tCli("enterSudoPassword"),
                    value: sudoPassword,
                    onChange: (event)=>setSudoPassword(event.target.value),
                    onKeyDown: (event)=>{
                        if (event.key === "Enter" && !busy) handleConfirm();
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this),
                displayError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 rounded bg-red-500/10 px-2 py-1.5 text-xs text-red-600",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[14px]",
                            children: "error"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
                            lineNumber: 69,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: displayError
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
                            lineNumber: 70,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
                    lineNumber: 68,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-end gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            variant: "ghost",
                            size: "sm",
                            onClick: handleClose,
                            disabled: busy,
                            children: tCli("cancel")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
                            lineNumber: 75,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            size: "sm",
                            onClick: handleConfirm,
                            disabled: busy,
                            children: tCli("confirm")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
            lineNumber: 51,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_s(MitmSudoPasswordModal, "TuzmFME49tzQnuugb3Mt01dZmyU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = MitmSudoPasswordModal;
function useMitmSudoPrompt({ hasCachedPassword, needsSudoPassword, isWin }) {
    _s1();
    const pendingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [showPasswordModal, setShowPasswordModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [modalError, setModalError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const canRunWithoutPassword = isWin || hasCachedPassword || !needsSudoPassword;
    const closePasswordModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMitmSudoPrompt.useCallback[closePasswordModal]": ()=>{
            setShowPasswordModal(false);
            pendingRef.current = null;
            setModalError(null);
        }
    }["useMitmSudoPrompt.useCallback[closePasswordModal]"], []);
    const runPrivileged = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMitmSudoPrompt.useCallback[runPrivileged]": async (fn)=>{
            if (canRunWithoutPassword) {
                await fn("");
                return;
            }
            setModalError(null);
            pendingRef.current = fn;
            setShowPasswordModal(true);
        }
    }["useMitmSudoPrompt.useCallback[runPrivileged]"], [
        canRunWithoutPassword
    ]);
    const confirmPassword = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMitmSudoPrompt.useCallback[confirmPassword]": async (password)=>{
            const action = pendingRef.current;
            if (!action) return;
            setShowPasswordModal(false);
            pendingRef.current = null;
            setBusy(true);
            setModalError(null);
            try {
                await action(password);
            } catch (err) {
                pendingRef.current = action;
                setModalError(err instanceof Error ? err.message : "Action failed");
                setShowPasswordModal(true);
            } finally{
                setBusy(false);
            }
        }
    }["useMitmSudoPrompt.useCallback[confirmPassword]"], []);
    return {
        runPrivileged,
        sudoModalProps: {
            isOpen: showPasswordModal,
            onClose: closePasswordModal,
            onConfirm: confirmPassword,
            busy,
            error: modalError
        }
    };
}
_s1(useMitmSudoPrompt, "RBIHYZzS7sEd+i8y3c2rwpfx23c=");
var _c;
__turbopack_context__.k.register(_c, "MitmSudoPasswordModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AgentBridgePageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$RiskNoticeBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/RiskNoticeBanner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$AgentBridgeServerCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeServerCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$AgentBridgeMaintenanceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentBridgeMaintenanceCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$AgentList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/AgentList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$EmptyStateNoProviders$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/components/EmptyStateNoProviders.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$hooks$2f$useAgentBridgeState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useAgentBridgeState.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$hooks$2f$useMitmSudoPrompt$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/hooks/useMitmSudoPrompt.tsx [app-client] (ecmascript)");
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
function AgentBridgePageClient({ initialData, targets, hasProviders }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("agentBridge");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const { data, refresh } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$hooks$2f$useAgentBridgeState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAgentBridgeState"])({
        initialData
    });
    const [actionError, setActionError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [certGuide, setCertGuide] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const { runPrivileged, sudoModalProps } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$hooks$2f$useMitmSudoPrompt$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMitmSudoPrompt"])({
        hasCachedPassword: data.serverState.hasCachedPassword === true,
        needsSudoPassword: data.serverState.needsSudoPassword === true,
        isWin: data.serverState.isWin === true
    });
    const postServerAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AgentBridgePageClient.useCallback[postServerAction]": async (action, sudoPassword)=>{
            const res = await fetch("/api/tools/agent-bridge/server", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(sudoPassword ? {
                    action,
                    sudoPassword
                } : {
                    action
                })
            });
            const payload = await res.json().catch({
                "AgentBridgePageClient.useCallback[postServerAction]": ()=>({})
            }["AgentBridgePageClient.useCallback[postServerAction]"]);
            if (!res.ok) {
                throw new Error(payload.error?.message ?? `HTTP ${res.status}`);
            }
            if (payload.skippable && payload.manualGuide) {
                setCertGuide(payload.manualGuide);
            } else if (action === "trust-cert") {
                setCertGuide(null);
            }
            await refresh();
        }
    }["AgentBridgePageClient.useCallback[postServerAction]"], [
        refresh
    ]);
    // ── Server actions ────────────────────────────────────────────────────────
    const handleServerAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AgentBridgePageClient.useCallback[handleServerAction]": async (action)=>{
            setActionError(null);
            if (action === "trust-cert") {
                await runPrivileged({
                    "AgentBridgePageClient.useCallback[handleServerAction]": async (password)=>{
                        await postServerAction("trust-cert", password || undefined);
                    }
                }["AgentBridgePageClient.useCallback[handleServerAction]"]);
                return;
            }
            try {
                await postServerAction(action);
            } catch (err) {
                setActionError(err instanceof Error ? err.message : t("unknownError"));
            }
        }
    }["AgentBridgePageClient.useCallback[handleServerAction]"], [
        postServerAction,
        runPrivileged,
        t
    ]);
    // ── Upstream CA ───────────────────────────────────────────────────────────
    const handleUpstreamCaSave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AgentBridgePageClient.useCallback[handleUpstreamCaSave]": async (path)=>{
            setActionError(null);
            try {
                const res = await fetch("/api/tools/agent-bridge/upstream-ca", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        path
                    })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                await refresh();
            } catch (err) {
                setActionError(err instanceof Error ? err.message : t("unknownError"));
            }
        }
    }["AgentBridgePageClient.useCallback[handleUpstreamCaSave]"], [
        refresh,
        t
    ]);
    // ── Bypass list ───────────────────────────────────────────────────────────
    const handleBypassSave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AgentBridgePageClient.useCallback[handleBypassSave]": async (patterns)=>{
            setActionError(null);
            try {
                const res = await fetch("/api/tools/agent-bridge/bypass", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        patterns
                    })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                await refresh();
            } catch (err) {
                setActionError(err instanceof Error ? err.message : t("unknownError"));
            }
        }
    }["AgentBridgePageClient.useCallback[handleBypassSave]"], [
        refresh,
        t
    ]);
    // ── DNS toggle ────────────────────────────────────────────────────────────
    const handleDnsToggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AgentBridgePageClient.useCallback[handleDnsToggle]": async (agentId, enabled)=>{
            setActionError(null);
            try {
                await runPrivileged({
                    "AgentBridgePageClient.useCallback[handleDnsToggle]": async (password)=>{
                        const res = await fetch(`/api/tools/agent-bridge/agents/${agentId}/dns`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(password ? {
                                enabled,
                                sudoPassword: password
                            } : {
                                enabled
                            })
                        });
                        if (!res.ok) {
                            const payload = await res.json().catch({
                                "AgentBridgePageClient.useCallback[handleDnsToggle]": ()=>({})
                            }["AgentBridgePageClient.useCallback[handleDnsToggle]"]);
                            throw new Error(payload.error?.message ?? `HTTP ${res.status}`);
                        }
                        await refresh();
                    }
                }["AgentBridgePageClient.useCallback[handleDnsToggle]"]);
            } catch (err) {
                setActionError(err instanceof Error ? err.message : t("unknownError"));
            }
        }
    }["AgentBridgePageClient.useCallback[handleDnsToggle]"], [
        refresh,
        runPrivileged,
        t
    ]);
    // ── Mappings save ─────────────────────────────────────────────────────────
    const handleMappingsSave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AgentBridgePageClient.useCallback[handleMappingsSave]": async (agentId, mappings)=>{
            setActionError(null);
            try {
                const res = await fetch(`/api/tools/agent-bridge/agents/${agentId}/mappings`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        mappings
                    })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                await refresh();
            } catch (err) {
                setActionError(err instanceof Error ? err.message : t("unknownError"));
            }
        }
    }["AgentBridgePageClient.useCallback[handleMappingsSave]"], [
        refresh,
        t
    ]);
    // ── Render ────────────────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$RiskNoticeBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RiskNoticeBanner"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                lineNumber: 229,
                columnNumber: 7
            }, this),
            actionError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "alert",
                className: "flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[16px]",
                        children: "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                        lineNumber: 237,
                        columnNumber: 11
                    }, this),
                    actionError,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActionError(null),
                        className: "ml-auto text-red-500 hover:text-red-400",
                        "aria-label": tc("dismissNotification"),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[16px]",
                            children: "close"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                            lineNumber: 245,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                        lineNumber: 239,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                lineNumber: 233,
                columnNumber: 9
            }, this),
            certGuide && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "status",
                className: "rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 font-medium",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[16px]",
                                children: "info"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                                lineNumber: 257,
                                columnNumber: 13
                            }, this),
                            t("certManualTitle"),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setCertGuide(null),
                                className: "ml-auto text-amber-600 hover:text-amber-500",
                                "aria-label": tc("dismissNotification"),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[16px]",
                                    children: "close"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                                    lineNumber: 265,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                                lineNumber: 259,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                        lineNumber: 256,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        className: "mt-2 list-decimal pl-6 space-y-1",
                        children: certGuide.steps.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "font-mono text-xs break-all",
                                children: step
                            }, i, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                                lineNumber: 270,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                        lineNumber: 268,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: certGuide.downloadUrl,
                        download: true,
                        className: "mt-2 inline-flex items-center gap-1.5 text-xs font-medium underline hover:no-underline",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "download"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                                lineNumber: 280,
                                columnNumber: 13
                            }, this),
                            t("downloadCert")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                        lineNumber: 275,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                lineNumber: 252,
                columnNumber: 9
            }, this),
            !hasProviders ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$EmptyStateNoProviders$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyStateNoProviders"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                lineNumber: 288,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$AgentBridgeServerCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AgentBridgeServerCard"], {
                        serverState: data.serverState,
                        onAction: handleServerAction,
                        onUpstreamCaSave: handleUpstreamCaSave,
                        onBypassSave: handleBypassSave,
                        bypassPatterns: data.bypassPatterns
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                        lineNumber: 292,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$AgentBridgeMaintenanceCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AgentBridgeMaintenanceCard"], {
                        orphanedStateDetected: data.serverState.orphanedStateDetected,
                        certTrusted: data.serverState.certTrusted,
                        hasCachedPassword: data.serverState.hasCachedPassword === true,
                        needsSudoPassword: data.serverState.needsSudoPassword === true,
                        isWin: data.serverState.isWin === true,
                        onError: setActionError,
                        onRefresh: refresh
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                        lineNumber: 301,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$components$2f$AgentList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AgentList"], {
                        targets: targets,
                        agentStates: data.agentStates,
                        serverRunning: data.serverState.running,
                        serverState: data.serverState,
                        mappingsMap: data.mappings,
                        onDnsToggle: handleDnsToggle,
                        onMappingsSave: handleMappingsSave
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                        lineNumber: 312,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl border border-border/40 bg-card px-5 py-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide",
                                children: t("quickLinks")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                                lineNumber: 324,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/dashboard/providers",
                                        className: "inline-flex items-center gap-1.5 text-sm text-primary hover:underline",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[14px]",
                                                children: "dns"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                                                lineNumber: 332,
                                                columnNumber: 17
                                            }, this),
                                            t("quickLinkProviders")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                                        lineNumber: 328,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/dashboard/tools/traffic-inspector",
                                        className: "inline-flex items-center gap-1.5 text-sm text-primary hover:underline",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[14px]",
                                                children: "network_check"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                                                lineNumber: 339,
                                                columnNumber: 17
                                            }, this),
                                            t("quickLinkInspector")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                                        lineNumber: 335,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                                lineNumber: 327,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                        lineNumber: 323,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$hooks$2f$useMitmSudoPrompt$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MitmSudoPasswordModal"], {
                ...sudoModalProps
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
                lineNumber: 347,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/tools/agent-bridge/AgentBridgePageClient.tsx",
        lineNumber: 227,
        columnNumber: 5
    }, this);
}
_s(AgentBridgePageClient, "3dsgcBapse0dtmUBQNNwzlkzK+Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$hooks$2f$useAgentBridgeState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAgentBridgeState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$tools$2f$agent$2d$bridge$2f$hooks$2f$useMitmSudoPrompt$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMitmSudoPrompt"]
    ];
});
_c = AgentBridgePageClient;
var _c;
__turbopack_context__.k.register(_c, "AgentBridgePageClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1upvx7a._.js.map