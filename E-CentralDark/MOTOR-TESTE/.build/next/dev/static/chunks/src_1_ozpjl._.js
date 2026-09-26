(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/shared/components/Modal.tsx [app-client] (ecmascript) <export default as Modal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-client] (ecmascript)");
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/IntegrationCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IntegrationCard",
    ()=>IntegrationCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
const KIND_ICONS = {
    slack: "chat",
    telegram: "send",
    discord: "forum",
    custom: "webhook",
    email: "email",
    pagerduty: "notifications_active",
    teams: "groups"
};
const KIND_COLORS = {
    slack: "text-emerald-500",
    telegram: "text-blue-500",
    discord: "text-violet-500",
    custom: "text-amber-500",
    email: "text-text-muted",
    pagerduty: "text-text-muted",
    teams: "text-text-muted"
};
function IntegrationCard({ kind, name, description, selected, onSelect, disabled, comingSoonLabel }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: !disabled && onSelect ? ()=>onSelect(kind) : undefined,
        disabled: disabled,
        className: `relative flex w-full flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${disabled ? "border-border bg-surface" : selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-surface hover:border-primary/40 hover:bg-primary/5"}`,
        children: [
            comingSoonLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute right-2 top-2 rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-muted ring-1 ring-border",
                children: comingSoonLabel
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/IntegrationCard.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `material-symbols-outlined text-[28px] ${KIND_COLORS[kind]}`,
                children: KIND_ICONS[kind]
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/IntegrationCard.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-semibold text-text-main",
                        children: name
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/IntegrationCard.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-0.5 text-xs text-text-muted",
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/IntegrationCard.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/IntegrationCard.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            selected && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "ml-auto mt-auto flex size-5 items-center justify-center rounded-full bg-primary",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[14px] text-white",
                    children: "check"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/IntegrationCard.tsx",
                    lineNumber: 73,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/IntegrationCard.tsx",
                lineNumber: 72,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/IntegrationCard.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_c = IntegrationCard;
var _c;
__turbopack_context__.k.register(_c, "IntegrationCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step1ChooseIntegration.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Step1ChooseIntegration",
    ()=>Step1ChooseIntegration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$IntegrationCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/IntegrationCard.tsx [app-client] (ecmascript)");
"use client";
;
;
const KINDS = [
    "slack",
    "telegram",
    "discord",
    "custom"
];
const COMING_SOON = [
    "email",
    "pagerduty",
    "teams"
];
function Step1ChooseIntegration({ selected, onSelect, t }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-text-muted",
                children: t("wizard.step1Desc")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step1ChooseIntegration.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 gap-3",
                children: [
                    KINDS.map((kind)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$IntegrationCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IntegrationCard"], {
                            kind: kind,
                            name: t(`kinds.${kind}`),
                            description: t(`kinds.${kind}Desc`),
                            selected: selected === kind,
                            onSelect: onSelect
                        }, kind, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step1ChooseIntegration.tsx",
                            lineNumber: 20,
                            columnNumber: 11
                        }, this)),
                    COMING_SOON.map((kind)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$IntegrationCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IntegrationCard"], {
                            kind: kind,
                            name: t(`kinds.${kind}`),
                            description: t(`kinds.${kind}Desc`),
                            selected: false,
                            disabled: true,
                            comingSoonLabel: t("kinds.comingSoon")
                        }, kind, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step1ChooseIntegration.tsx",
                            lineNumber: 30,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step1ChooseIntegration.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step1ChooseIntegration.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_c = Step1ChooseIntegration;
var _c;
__turbopack_context__.k.register(_c, "Step1ChooseIntegration");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SlackConfigForm",
    ()=>SlackConfigForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function SlackConfigForm({ value, onChange, t }) {
    _s();
    const [urlState, setUrlState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SlackConfigForm.useEffect": ()=>{
            const url = value.webhookUrl.trim();
            const controller = new AbortController();
            const delay = url ? 600 : 0;
            const timer = setTimeout({
                "SlackConfigForm.useEffect.timer": async ()=>{
                    if (!url) {
                        setUrlState("idle");
                        return;
                    }
                    setUrlState("checking");
                    try {
                        const res = await fetch("/api/webhooks/validate-url", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                url
                            }),
                            signal: controller.signal
                        });
                        const data = await res.json().catch({
                            "SlackConfigForm.useEffect.timer": ()=>({})
                        }["SlackConfigForm.useEffect.timer"]);
                        setUrlState(data.valid ? "ok" : data.reason === "blocked_private" ? "blocked" : "invalid");
                    } catch  {
                        if (!controller.signal.aborted) setUrlState("invalid");
                    }
                }
            }["SlackConfigForm.useEffect.timer"], delay);
            return ({
                "SlackConfigForm.useEffect": ()=>{
                    clearTimeout(timer);
                    controller.abort();
                }
            })["SlackConfigForm.useEffect"];
        }
    }["SlackConfigForm.useEffect"], [
        value.webhookUrl
    ]);
    const urlHint = urlState === "checking" ? t("validateUrl.checking") : urlState === "ok" ? t("validateUrl.ok") : urlState === "blocked" ? t("validateUrl.blockedPrivate") : urlState === "invalid" && value.webhookUrl.trim() ? t("validateUrl.invalidUrl") : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-medium uppercase tracking-wider text-text-muted",
                        children: t("slack.webhookUrl")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: value.webhookUrl,
                        onChange: (e)=>onChange({
                                webhookUrl: e.target.value
                            }),
                        placeholder: t("slack.webhookUrlPlaceholder"),
                        className: "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    urlHint && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `mt-1 text-xs ${urlState === "ok" ? "text-emerald-500" : urlState === "checking" ? "text-text-muted" : "text-red-500"}`,
                        children: urlHint
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs text-text-muted",
                        children: t("slack.webhookUrlHint")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                className: "rounded-lg border border-border bg-sidebar p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                        className: "cursor-pointer text-xs font-medium text-text-muted hover:text-text-main",
                        children: t("slack.tutorial")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        className: "mt-3 space-y-1.5 text-xs text-text-muted",
                        children: [
                            1,
                            2,
                            3,
                            4
                        ].map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold text-primary",
                                        children: [
                                            n,
                                            "."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx",
                                        lineNumber: 88,
                                        columnNumber: 15
                                    }, this),
                                    t(`slack.tutorialStep${n}`)
                                ]
                            }, n, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx",
                                lineNumber: 87,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
_s(SlackConfigForm, "Ciwa0yu0WnfXj568XnMZNV67GZ8=");
_c = SlackConfigForm;
var _c;
__turbopack_context__.k.register(_c, "SlackConfigForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TelegramConfigForm",
    ()=>TelegramConfigForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function TelegramConfigForm({ value, onChange, t, isEditing }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-medium uppercase tracking-wider text-text-muted",
                        children: t("telegram.botToken")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "password",
                        value: value.botToken,
                        onChange: (e)=>onChange({
                                ...value,
                                botToken: e.target.value
                            }),
                        placeholder: isEditing ? t("secretEditPlaceholder") : t("telegram.botTokenPlaceholder"),
                        autoComplete: "new-password",
                        className: "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs text-text-muted",
                        children: t("telegram.botTokenHint")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-medium uppercase tracking-wider text-text-muted",
                        children: t("telegram.chatId")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: value.chatId,
                        onChange: (e)=>onChange({
                                ...value,
                                chatId: e.target.value
                            }),
                        placeholder: t("telegram.chatIdPlaceholder"),
                        className: "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs text-text-muted",
                        children: t("telegram.chatIdHint")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                className: "rounded-lg border border-border bg-sidebar p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                        className: "cursor-pointer text-xs font-medium text-text-muted hover:text-text-main",
                        children: t("telegram.tutorial")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        className: "mt-3 space-y-1.5 text-xs text-text-muted",
                        children: [
                            1,
                            2,
                            3,
                            4
                        ].map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold text-primary",
                                        children: [
                                            n,
                                            "."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                                        lineNumber: 51,
                                        columnNumber: 15
                                    }, this),
                                    t(`telegram.tutorialStep${n}`)
                                ]
                            }, n, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                                lineNumber: 50,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = TelegramConfigForm;
var _c;
__turbopack_context__.k.register(_c, "TelegramConfigForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DiscordConfigForm",
    ()=>DiscordConfigForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function DiscordConfigForm({ value, onChange, t }) {
    _s();
    const [urlState, setUrlState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DiscordConfigForm.useEffect": ()=>{
            const url = value.webhookUrl.trim();
            const controller = new AbortController();
            const delay = url ? 600 : 0;
            const timer = setTimeout({
                "DiscordConfigForm.useEffect.timer": async ()=>{
                    if (!url) {
                        setUrlState("idle");
                        return;
                    }
                    setUrlState("checking");
                    try {
                        const res = await fetch("/api/webhooks/validate-url", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                url
                            }),
                            signal: controller.signal
                        });
                        const data = await res.json().catch({
                            "DiscordConfigForm.useEffect.timer": ()=>({})
                        }["DiscordConfigForm.useEffect.timer"]);
                        setUrlState(data.valid ? "ok" : data.reason === "blocked_private" ? "blocked" : "invalid");
                    } catch  {
                        if (!controller.signal.aborted) setUrlState("invalid");
                    }
                }
            }["DiscordConfigForm.useEffect.timer"], delay);
            return ({
                "DiscordConfigForm.useEffect": ()=>{
                    clearTimeout(timer);
                    controller.abort();
                }
            })["DiscordConfigForm.useEffect"];
        }
    }["DiscordConfigForm.useEffect"], [
        value.webhookUrl
    ]);
    const urlHint = urlState === "checking" ? t("validateUrl.checking") : urlState === "ok" ? t("validateUrl.ok") : urlState === "blocked" ? t("validateUrl.blockedPrivate") : urlState === "invalid" && value.webhookUrl.trim() ? t("validateUrl.invalidUrl") : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-medium uppercase tracking-wider text-text-muted",
                        children: t("discord.webhookUrl")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: value.webhookUrl,
                        onChange: (e)=>onChange({
                                webhookUrl: e.target.value
                            }),
                        placeholder: t("discord.webhookUrlPlaceholder"),
                        className: "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    urlHint && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `mt-1 text-xs ${urlState === "ok" ? "text-emerald-500" : urlState === "checking" ? "text-text-muted" : "text-red-500"}`,
                        children: urlHint
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs text-text-muted",
                        children: t("discord.webhookUrlHint")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                className: "rounded-lg border border-border bg-sidebar p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                        className: "cursor-pointer text-xs font-medium text-text-muted hover:text-text-main",
                        children: t("discord.tutorial")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        className: "mt-3 space-y-1.5 text-xs text-text-muted",
                        children: [
                            1,
                            2,
                            3
                        ].map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold text-primary",
                                        children: [
                                            n,
                                            "."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx",
                                        lineNumber: 88,
                                        columnNumber: 15
                                    }, this),
                                    t(`discord.tutorialStep${n}`)
                                ]
                            }, n, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx",
                                lineNumber: 87,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
_s(DiscordConfigForm, "Ciwa0yu0WnfXj568XnMZNV67GZ8=");
_c = DiscordConfigForm;
var _c;
__turbopack_context__.k.register(_c, "DiscordConfigForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/HmacRecipeBlock.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HmacRecipeBlock",
    ()=>HmacRecipeBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function HmacRecipeBlock({ code, title, snippets }) {
    _s();
    const tabs = snippets ?? (code ? [
        {
            label: "Node.js",
            code
        }
    ] : []);
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const copy = async ()=>{
        await navigator.clipboard.writeText(tabs[active]?.code ?? "");
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    };
    if (tabs.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-1",
        children: [
            title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-medium uppercase tracking-wider text-text-muted",
                children: title
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/HmacRecipeBlock.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this),
            tabs.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-1",
                children: tabs.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActive(i),
                        className: `rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${i === active ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-sidebar hover:text-text-main"}`,
                        children: s.label
                    }, s.label, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/HmacRecipeBlock.tsx",
                        lineNumber: 39,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/HmacRecipeBlock.tsx",
                lineNumber: 37,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        className: "overflow-x-auto rounded-lg bg-sidebar p-3 pr-10 text-xs text-text-main",
                        children: tabs[active]?.code
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/HmacRecipeBlock.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>void copy(),
                        title: copied ? "Copied!" : "Copy",
                        className: "absolute right-2 top-2 rounded p-1 text-text-muted transition-colors hover:bg-surface hover:text-text-main",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[14px]",
                            children: copied ? "check" : "content_copy"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/HmacRecipeBlock.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/HmacRecipeBlock.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/HmacRecipeBlock.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/HmacRecipeBlock.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_s(HmacRecipeBlock, "KQ5Gpxy+hyNobJQM9ma6F28+n7A=");
_c = HmacRecipeBlock;
var _c;
__turbopack_context__.k.register(_c, "HmacRecipeBlock");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CustomConfigForm",
    ()=>CustomConfigForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$HmacRecipeBlock$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/HmacRecipeBlock.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function CustomConfigForm({ value, onChange, t, isEditing }) {
    _s();
    const [urlState, setUrlState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomConfigForm.useEffect": ()=>{
            const url = value.endpointUrl.trim();
            const controller = new AbortController();
            const delay = url ? 600 : 0;
            const timer = setTimeout({
                "CustomConfigForm.useEffect.timer": async ()=>{
                    if (!url) {
                        setUrlState("idle");
                        return;
                    }
                    setUrlState("checking");
                    try {
                        const res = await fetch("/api/webhooks/validate-url", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                url
                            }),
                            signal: controller.signal
                        });
                        const data = await res.json().catch({
                            "CustomConfigForm.useEffect.timer": ()=>({})
                        }["CustomConfigForm.useEffect.timer"]);
                        setUrlState(data.valid ? "ok" : data.reason === "blocked_private" ? "blocked" : "invalid");
                    } catch  {
                        if (!controller.signal.aborted) setUrlState("invalid");
                    }
                }
            }["CustomConfigForm.useEffect.timer"], delay);
            return ({
                "CustomConfigForm.useEffect": ()=>{
                    clearTimeout(timer);
                    controller.abort();
                }
            })["CustomConfigForm.useEffect"];
        }
    }["CustomConfigForm.useEffect"], [
        value.endpointUrl
    ]);
    const urlHint = urlState === "checking" ? t("validateUrl.checking") : urlState === "ok" ? t("validateUrl.ok") : urlState === "blocked" ? t("validateUrl.blockedPrivate") : urlState === "invalid" && value.endpointUrl.trim() ? t("validateUrl.invalidUrl") : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-medium uppercase tracking-wider text-text-muted",
                        children: t("custom.endpointUrl")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: value.endpointUrl,
                        onChange: (e)=>onChange({
                                ...value,
                                endpointUrl: e.target.value
                            }),
                        placeholder: t("custom.endpointUrlPlaceholder"),
                        className: "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    urlHint && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `mt-1 text-xs ${urlState === "ok" ? "text-emerald-500" : urlState === "checking" ? "text-text-muted" : "text-red-500"}`,
                        children: urlHint
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx",
                        lineNumber: 76,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-medium uppercase tracking-wider text-text-muted",
                        children: t("custom.secretKey")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "password",
                        value: value.secretKey,
                        onChange: (e)=>onChange({
                                ...value,
                                secretKey: e.target.value
                            }),
                        placeholder: isEditing ? t("secretEditPlaceholder") : t("custom.secretKeyPlaceholder"),
                        autoComplete: "new-password",
                        className: "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs text-text-muted",
                        children: t("custom.secretKeyHint")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$HmacRecipeBlock$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HmacRecipeBlock"], {
                title: t("howItWorks.hmacRecipeTitle"),
                snippets: [
                    {
                        label: "Node.js",
                        code: t("howItWorks.hmacRecipe")
                    },
                    {
                        label: "Python",
                        code: t("howItWorks.hmacRecipePython")
                    },
                    {
                        label: "Bash",
                        code: t("howItWorks.hmacRecipeBash")
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
_s(CustomConfigForm, "Ciwa0yu0WnfXj568XnMZNV67GZ8=");
_c = CustomConfigForm;
var _c;
__turbopack_context__.k.register(_c, "CustomConfigForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step2ConfigureIntegration.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Step2ConfigureIntegration",
    ()=>Step2ConfigureIntegration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$integrations$2f$SlackConfigForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/SlackConfigForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$integrations$2f$TelegramConfigForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/TelegramConfigForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$integrations$2f$DiscordConfigForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/DiscordConfigForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$integrations$2f$CustomConfigForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/integrations/CustomConfigForm.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function Step2ConfigureIntegration({ kind, slack, telegram, discord, custom, onChangeSlack, onChangeTelegram, onChangeDiscord, onChangeCustom, t, isEditing }) {
    if (kind === "slack") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$integrations$2f$SlackConfigForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SlackConfigForm"], {
        value: slack,
        onChange: onChangeSlack,
        t: t
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step2ConfigureIntegration.tsx",
        lineNumber: 36,
        columnNumber: 32
    }, this);
    if (kind === "telegram") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$integrations$2f$TelegramConfigForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TelegramConfigForm"], {
        value: telegram,
        onChange: onChangeTelegram,
        t: t,
        isEditing: isEditing
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step2ConfigureIntegration.tsx",
        lineNumber: 39,
        columnNumber: 7
    }, this);
    if (kind === "discord") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$integrations$2f$DiscordConfigForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiscordConfigForm"], {
        value: discord,
        onChange: onChangeDiscord,
        t: t
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step2ConfigureIntegration.tsx",
        lineNumber: 47,
        columnNumber: 12
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$integrations$2f$CustomConfigForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CustomConfigForm"], {
        value: custom,
        onChange: onChangeCustom,
        t: t,
        isEditing: isEditing
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step2ConfigureIntegration.tsx",
        lineNumber: 48,
        columnNumber: 10
    }, this);
}
_c = Step2ConfigureIntegration;
var _c;
__turbopack_context__.k.register(_c, "Step2ConfigureIntegration");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/EventChecklist.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EventChecklist",
    ()=>EventChecklist
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
const WEBHOOK_EVENTS = [
    "request.completed",
    "request.failed",
    "provider.error",
    "provider.recovered",
    "quota.exceeded",
    "combo.switched",
    "test.ping"
];
function EventChecklist({ selected, onChange, allEventsLabel = "All events" }) {
    const isAll = selected.includes("*");
    const toggle = (event)=>{
        if (event === "*") {
            onChange([
                "*"
            ]);
            return;
        }
        const without = selected.filter((e)=>e !== "*");
        const next = without.includes(event) ? without.filter((e)=>e !== event) : [
            ...without,
            event
        ];
        onChange(next.length > 0 ? next : [
            "*"
        ]);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>toggle("*"),
                className: `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${isAll ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-surface text-text-muted hover:text-text-main"}`,
                children: allEventsLabel
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/EventChecklist.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            WEBHOOK_EVENTS.map((ev)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>toggle(ev),
                    className: `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${isAll || selected.includes(ev) ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-surface text-text-muted hover:text-text-main"}`,
                    children: ev
                }, ev, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/EventChecklist.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/EventChecklist.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_c = EventChecklist;
var _c;
__turbopack_context__.k.register(_c, "EventChecklist");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/PayloadPreview.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PayloadPreview",
    ()=>PayloadPreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function PayloadPreview({ payload, label }) {
    if (!payload) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-1",
        children: [
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-medium uppercase tracking-wider text-text-muted",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/PayloadPreview.tsx",
                lineNumber: 13,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                className: "overflow-x-auto rounded-lg bg-sidebar p-3 text-xs text-text-main",
                children: JSON.stringify(payload, null, 2)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/PayloadPreview.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/PayloadPreview.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = PayloadPreview;
var _c;
__turbopack_context__.k.register(_c, "PayloadPreview");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Step3EventsAndTest",
    ()=>Step3EventsAndTest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$EventChecklist$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/EventChecklist.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$PayloadPreview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/PayloadPreview.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Step3EventsAndTest({ webhookId, events, enabled, description, onChangeEvents, onChangeEnabled, onChangeDescription, t }) {
    _s();
    const [testState, setTestState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [testResult, setTestResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const sendTest = async ()=>{
        if (!webhookId) return;
        setTestState("sending");
        setTestResult(null);
        try {
            const res = await fetch(`/api/webhooks/${webhookId}/test`, {
                method: "POST"
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok || data.delivered === false) {
                throw new Error(data.error || t("testFailed"));
            }
            setTestResult(data);
            setTestState("ok");
        } catch (err) {
            setTestState("fail");
            setTestResult((prev)=>({
                    delivered: false,
                    status: 0,
                    latencyMs: 0,
                    payloadSent: prev?.payloadSent ?? null,
                    responseBody: prev?.responseBody ?? "",
                    error: err instanceof Error ? err.message : t("testFailed")
                }));
        }
    };
    const parseResponseBody = (raw)=>{
        try {
            return JSON.parse(raw);
        } catch  {
            return raw ? {
                raw
            } : null;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-medium uppercase tracking-wider text-text-muted",
                        children: t("name")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: description,
                        onChange: (e)=>onChangeDescription(e.target.value),
                        placeholder: t("namePlaceholder"),
                        className: "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "mb-2 block text-xs font-medium uppercase tracking-wider text-text-muted",
                        children: t("events")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$EventChecklist$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EventChecklist"], {
                        selected: events,
                        onChange: onChangeEvents,
                        allEventsLabel: t("allEvents")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-3 rounded-lg border border-border p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        checked: enabled,
                        onChange: (e)=>onChangeEnabled(e.target.checked),
                        className: "size-4 accent-primary"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block text-sm font-medium text-text-main",
                                children: t("enabled")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block text-xs text-text-muted",
                                children: t("enabledDesc")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            webhookId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-lg border border-border p-4 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium text-text-main",
                        children: t("testWebhook")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>void sendTest(),
                        disabled: testState === "sending",
                        className: "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-main transition-colors hover:bg-sidebar disabled:opacity-40",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `material-symbols-outlined text-[18px] ${testState === "sending" ? "animate-spin" : ""}`,
                                children: testState === "sending" ? "sync" : "send"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, this),
                            t("testWebhook")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this),
                    testState === "ok" && testResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-medium text-emerald-500",
                                children: [
                                    "✅ ",
                                    testResult.status,
                                    " · ",
                                    testResult.latencyMs,
                                    "ms · ",
                                    t("testSuccess")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                                lineNumber: 132,
                                columnNumber: 15
                            }, this),
                            testResult.payloadSent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$PayloadPreview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PayloadPreview"], {
                                payload: testResult.payloadSent,
                                label: t("testPayloadSent")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                                lineNumber: 136,
                                columnNumber: 17
                            }, this),
                            testResult.responseBody && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$PayloadPreview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PayloadPreview"], {
                                payload: parseResponseBody(testResult.responseBody),
                                label: t("testResponse")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                                lineNumber: 139,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                        lineNumber: 131,
                        columnNumber: 13
                    }, this),
                    testState === "fail" && testResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-red-500",
                                children: testResult.error ?? t("testFailed")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                                lineNumber: 149,
                                columnNumber: 15
                            }, this),
                            testResult.payloadSent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$PayloadPreview$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PayloadPreview"], {
                                payload: testResult.payloadSent,
                                label: t("testPayloadSent")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                                lineNumber: 151,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                        lineNumber: 148,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
                lineNumber: 112,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s(Step3EventsAndTest, "CcncSAFREyvpYYGlE+uqQlHjaM8=");
_c = Step3EventsAndTest;
var _c;
__turbopack_context__.k.register(_c, "Step3EventsAndTest");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HowItWorksSidebar",
    ()=>HowItWorksSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$HmacRecipeBlock$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/HmacRecipeBlock.tsx [app-client] (ecmascript)");
"use client";
;
;
function HowItWorksSidebar({ t, showCustomNote }) {
    const steps = [
        t("howItWorks.step1"),
        t("howItWorks.step2"),
        t("howItWorks.step3"),
        t("howItWorks.step4")
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "space-y-4 rounded-xl border border-border bg-surface p-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "flex items-center gap-2 text-sm font-semibold text-text-main",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[18px] text-primary",
                        children: "info"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this),
                    t("howItWorks.title")
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                className: "space-y-3",
                children: steps.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex gap-3 text-xs text-text-muted",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary",
                                children: i + 1
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                                lineNumber: 27,
                                columnNumber: 13
                            }, this),
                            step
                        ]
                    }, i, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            showCustomNote && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3 border-t border-border pt-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted",
                        children: t("howItWorks.customOnly")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                        lineNumber: 36,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$HmacRecipeBlock$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HmacRecipeBlock"], {
                        title: t("howItWorks.hmacRecipeTitle"),
                        code: t("howItWorks.hmacRecipe")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                        lineNumber: 37,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                lineNumber: 35,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-1.5 border-t border-border pt-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted",
                        children: t("howItWorks.timeoutNote")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted",
                        children: t("howItWorks.retryNote")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "https://docs.omniroute.app/webhooks",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "inline-flex items-center gap-1 text-xs text-primary hover:underline",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                children: "menu_book"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this),
                            t("howItWorks.docsLink")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_c = HowItWorksSidebar;
var _c;
__turbopack_context__.k.register(_c, "HowItWorksSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AddWebhookWizard",
    ()=>AddWebhookWizard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-client] (ecmascript) <export default as Modal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$Step1ChooseIntegration$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step1ChooseIntegration.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$Step2ConfigureIntegration$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step2ConfigureIntegration.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$Step3EventsAndTest$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/steps/Step3EventsAndTest.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$HowItWorksSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const STEPS = [
    1,
    2,
    3
];
const INITIAL = {
    kind: "slack",
    slack: {
        webhookUrl: ""
    },
    telegram: {
        botToken: "",
        chatId: ""
    },
    discord: {
        webhookUrl: ""
    },
    custom: {
        endpointUrl: "",
        secretKey: ""
    },
    events: [
        "*"
    ],
    enabled: true,
    description: ""
};
function stateFromWebhook(webhook) {
    if (!webhook) return INITIAL;
    return {
        kind: webhook.kind,
        slack: {
            webhookUrl: webhook.kind === "slack" ? webhook.url : ""
        },
        telegram: {
            botToken: "",
            chatId: webhook.kind === "telegram" ? webhook.url : ""
        },
        discord: {
            webhookUrl: webhook.kind === "discord" ? webhook.url : ""
        },
        custom: {
            endpointUrl: webhook.kind === "custom" ? webhook.url : "",
            secretKey: ""
        },
        events: webhook.events.length > 0 ? webhook.events : [
            "*"
        ],
        enabled: webhook.enabled,
        description: webhook.description
    };
}
function step2Valid(state, isEditing) {
    const { kind } = state;
    if (kind === "slack") return state.slack.webhookUrl.trim().length > 0;
    if (kind === "telegram") {
        return state.telegram.chatId.trim().length > 0 && (isEditing || state.telegram.botToken.trim().length > 0);
    }
    if (kind === "discord") return state.discord.webhookUrl.trim().length > 0;
    if (kind === "custom") return state.custom.endpointUrl.trim().length > 0;
    return false;
}
function AddWebhookWizard({ isOpen, onClose, onCreated, t, editingWebhook }) {
    _s();
    const isEditing = Boolean(editingWebhook);
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(INITIAL);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [createdId, setCreatedId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddWebhookWizard.useEffect": ()=>{
            if (!isOpen) return;
            setStep(1);
            setState(stateFromWebhook(editingWebhook));
            setError(null);
            setCreatedId(editingWebhook?.id ?? null);
        }
    }["AddWebhookWizard.useEffect"], [
        editingWebhook,
        isOpen
    ]);
    const handleClose = ()=>{
        if (saving) return;
        setStep(1);
        setState(INITIAL);
        setError(null);
        setCreatedId(null);
        onClose();
    };
    // Builds the config payload (URL + kind + metadata) — sent when entering step 3.
    const buildConfigPayload = ()=>{
        const { kind } = state;
        if (kind === "slack") return {
            kind,
            url: state.slack.webhookUrl
        };
        if (kind === "discord") return {
            kind,
            url: state.discord.webhookUrl
        };
        if (kind === "telegram") {
            const payload = {
                kind,
                url: state.telegram.chatId
            };
            if (state.telegram.botToken.trim()) {
                payload.metadata = {
                    botToken: state.telegram.botToken
                };
            }
            return payload;
        }
        const payload = {
            kind,
            url: state.custom.endpointUrl
        };
        if (state.custom.secretKey.trim()) payload.secret = state.custom.secretKey.trim();
        return payload;
    };
    // Called when Next is clicked on step 2: create (or update) the webhook so the
    // test button is available at step 3 before the user clicks Finish.
    const handleNextFromStep2 = async ()=>{
        setSaving(true);
        setError(null);
        try {
            if (createdId) {
                const res = await fetch(`/api/webhooks/${createdId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(buildConfigPayload())
                });
                const data = await res.json().catch(()=>({}));
                if (!res.ok) throw new Error(data.error || t("saveFailed"));
            } else {
                const res = await fetch("/api/webhooks", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(buildConfigPayload())
                });
                const data = await res.json().catch(()=>({}));
                if (!res.ok) throw new Error(data.error || t("saveFailed"));
                setCreatedId(data.webhook?.id ?? null);
            }
            setStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : t("saveFailed"));
        } finally{
            setSaving(false);
        }
    };
    // Finish: update events/enabled/description on the already-created webhook.
    const finish = async ()=>{
        if (!createdId) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/webhooks/${createdId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...buildConfigPayload(),
                    events: state.events,
                    enabled: state.enabled,
                    description: state.description
                })
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) throw new Error(data.error || t("saveFailed"));
            onCreated();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : t("saveFailed"));
        } finally{
            setSaving(false);
        }
    };
    const canGoNext = step === 1 ? true : step === 2 ? step2Valid(state, isEditing) : true;
    const stepTitle = step === 1 ? t("wizard.step1Title") : step === 2 ? t("wizard.step2Title") : t("wizard.step3Title");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Modal$3e$__["Modal"], {
        isOpen: isOpen,
        onClose: handleClose,
        title: `${t(isEditing ? "editWebhook" : "addWebhook")} — ${stepTitle}`,
        size: "xl",
        footer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex w-full items-center justify-between",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-1",
                    children: STEPS.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `inline-block size-2 rounded-full transition-colors ${s === step ? "bg-primary" : s < step ? "bg-primary/40" : "bg-border"}`
                        }, s, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                            lineNumber: 205,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                    lineNumber: 203,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: handleClose,
                            disabled: saving,
                            className: "rounded-lg px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-sidebar hover:text-text-main disabled:opacity-40",
                            children: t("wizard.cancel")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                            lineNumber: 214,
                            columnNumber: 13
                        }, this),
                        step > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setStep((s)=>s - 1),
                            disabled: saving,
                            className: "rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-main transition-colors hover:bg-sidebar disabled:opacity-40",
                            children: t("wizard.back")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                            lineNumber: 223,
                            columnNumber: 15
                        }, this),
                        step < 3 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>step === 2 ? void handleNextFromStep2() : setStep((s)=>s + 1),
                            disabled: !canGoNext || saving,
                            className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-40",
                            children: [
                                saving && step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined animate-spin text-[16px]",
                                    children: "sync"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                                    lineNumber: 240,
                                    columnNumber: 19
                                }, this),
                                t("wizard.next")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                            lineNumber: 233,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>void finish(),
                            disabled: saving,
                            className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-40",
                            children: [
                                saving && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined animate-spin text-[16px]",
                                    children: "sync"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                                    lineNumber: 252,
                                    columnNumber: 19
                                }, this),
                                t("wizard.finish")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                            lineNumber: 245,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                    lineNumber: 213,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
            lineNumber: 202,
            columnNumber: 9
        }, this),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex gap-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "min-w-0 flex-1",
                    children: [
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                            lineNumber: 264,
                            columnNumber: 13
                        }, this),
                        step === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$Step1ChooseIntegration$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Step1ChooseIntegration"], {
                            selected: state.kind,
                            onSelect: (kind)=>setState((s)=>({
                                        ...s,
                                        kind
                                    })),
                            t: t
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                            lineNumber: 269,
                            columnNumber: 13
                        }, this),
                        step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$Step2ConfigureIntegration$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Step2ConfigureIntegration"], {
                            kind: state.kind,
                            slack: state.slack,
                            telegram: state.telegram,
                            discord: state.discord,
                            custom: state.custom,
                            onChangeSlack: (v)=>setState((s)=>({
                                        ...s,
                                        slack: v
                                    })),
                            onChangeTelegram: (v)=>setState((s)=>({
                                        ...s,
                                        telegram: v
                                    })),
                            onChangeDiscord: (v)=>setState((s)=>({
                                        ...s,
                                        discord: v
                                    })),
                            onChangeCustom: (v)=>setState((s)=>({
                                        ...s,
                                        custom: v
                                    })),
                            t: t,
                            isEditing: isEditing
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                            lineNumber: 276,
                            columnNumber: 13
                        }, this),
                        step === 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$steps$2f$Step3EventsAndTest$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Step3EventsAndTest"], {
                            webhookId: createdId ?? undefined,
                            events: state.events,
                            enabled: state.enabled,
                            description: state.description,
                            onChangeEvents: (events)=>setState((s)=>({
                                        ...s,
                                        events
                                    })),
                            onChangeEnabled: (enabled)=>setState((s)=>({
                                        ...s,
                                        enabled
                                    })),
                            onChangeDescription: (description)=>setState((s)=>({
                                        ...s,
                                        description
                                    })),
                            t: t
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                            lineNumber: 291,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                    lineNumber: 262,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-64 shrink-0 hidden lg:block",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$HowItWorksSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HowItWorksSidebar"], {
                        t: t,
                        showCustomNote: state.kind === "custom"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                        lineNumber: 304,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
                    lineNumber: 303,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
            lineNumber: 261,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx",
        lineNumber: 196,
        columnNumber: 5
    }, this);
}
_s(AddWebhookWizard, "OTpFtX/Wg9MweU8bOrArnT11UPU=");
_c = AddWebhookWizard;
var _c;
__turbopack_context__.k.register(_c, "AddWebhookWizard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/DeliveryStatusBadge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DeliveryStatusBadge",
    ()=>DeliveryStatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function DeliveryStatusBadge({ status, httpStatus }) {
    const isSuccess = status === "success";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${isSuccess ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "material-symbols-outlined text-[12px]",
                children: isSuccess ? "check_circle" : "error"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/DeliveryStatusBadge.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            httpStatus ? httpStatus : isSuccess ? "OK" : "ERR"
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/DeliveryStatusBadge.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = DeliveryStatusBadge;
var _c;
__turbopack_context__.k.register(_c, "DeliveryStatusBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebhookDeliveriesPanel",
    ()=>WebhookDeliveriesPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$DeliveryStatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/shared/DeliveryStatusBadge.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function WebhookDeliveriesPanel({ webhookId, t }) {
    _s();
    const [deliveries, setDeliveries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebhookDeliveriesPanel.useCallback[load]": async ()=>{
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/webhooks/${webhookId}/deliveries?limit=5`);
                const data = await res.json().catch({
                    "WebhookDeliveriesPanel.useCallback[load]": ()=>({})
                }["WebhookDeliveriesPanel.useCallback[load]"]);
                if (!res.ok) throw new Error(data.error || t("deliveries.loadFailed"));
                setDeliveries(Array.isArray(data.deliveries) ? data.deliveries : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : t("deliveries.loadFailed"));
            } finally{
                setLoading(false);
            }
        }
    }["WebhookDeliveriesPanel.useCallback[load]"], [
        webhookId,
        t
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WebhookDeliveriesPanel.useEffect": ()=>{
            void load();
        }
    }["WebhookDeliveriesPanel.useEffect"], [
        load
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "py-4 text-center text-xs text-text-muted",
            children: t("loading")
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
            lineNumber: 46,
            columnNumber: 12
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "py-4 text-center text-xs text-red-500",
            children: error
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
            lineNumber: 50,
            columnNumber: 12
        }, this);
    }
    if (deliveries.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "py-4 text-center text-xs text-text-muted",
            children: t("deliveries.empty")
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
            lineNumber: 54,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "overflow-x-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "w-full text-left text-xs",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    className: "border-b border-border text-text-muted",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "py-2 pr-3 font-medium",
                                children: t("deliveries.status")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                                lineNumber: 62,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "py-2 pr-3 font-medium",
                                children: t("deliveries.event")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                                lineNumber: 63,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "py-2 pr-3 font-medium",
                                children: t("deliveries.latency")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                                lineNumber: 64,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "py-2 font-medium",
                                children: t("deliveries.at")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    className: "divide-y divide-border",
                    children: deliveries.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "py-2 pr-3",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$shared$2f$DeliveryStatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DeliveryStatusBadge"], {
                                        status: d.status,
                                        httpStatus: d.http_status
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                                        lineNumber: 72,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                                    lineNumber: 71,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "py-2 pr-3 font-mono text-text-main",
                                    children: d.event_type
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                                    lineNumber: 74,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "py-2 pr-3 text-text-muted",
                                    children: d.latency_ms != null ? `${d.latency_ms}ms` : "—"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                                    lineNumber: 75,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "py-2 text-text-muted",
                                    children: [
                                        new Date(d.created_at).toLocaleString(),
                                        d.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-0.5 truncate text-red-400",
                                            title: d.error,
                                            children: d.error
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                                            lineNumber: 81,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                                    lineNumber: 78,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, d.id, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                            lineNumber: 70,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
                    lineNumber: 68,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_s(WebhookDeliveriesPanel, "n5ZXzEQ3x79JtxaeBGhH452kiKY=");
_c = WebhookDeliveriesPanel;
var _c;
__turbopack_context__.k.register(_c, "WebhookDeliveriesPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebhookCard",
    ()=>WebhookCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$WebhookDeliveriesPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookDeliveriesPanel.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const KIND_ICONS = {
    slack: "chat",
    telegram: "send",
    discord: "forum",
    custom: "webhook"
};
const KIND_COLORS = {
    slack: "text-emerald-500",
    telegram: "text-blue-500",
    discord: "text-violet-500",
    custom: "text-amber-500"
};
function getStatus(wh) {
    if (!wh.enabled) return "inactive";
    if (wh.failure_count > 0 || wh.last_status !== null && wh.last_status >= 400) return "errored";
    return "active";
}
function WebhookCard({ webhook, t, testingId, onTest, onToggleEnabled, onEdit, onDelete }) {
    _s();
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const status = getStatus(webhook);
    const isTesting = testingId === webhook.id;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-border bg-surface transition-shadow hover:shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `material-symbols-outlined shrink-0 text-[22px] ${KIND_COLORS[webhook.kind]}`,
                        children: KIND_ICONS[webhook.kind]
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "truncate text-sm font-semibold text-text-main",
                                children: webhook.description || t("unnamedWebhook")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "truncate text-xs text-text-muted",
                                children: webhook.url
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                lineNumber: 78,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${status === "active" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : status === "errored" ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300" : "border-border bg-sidebar text-text-muted"}`,
                        children: t(status)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex shrink-0 items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>onTest(webhook),
                                disabled: isTesting,
                                title: t("testWebhook"),
                                className: "rounded-lg p-2 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-40",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `material-symbols-outlined text-[18px] ${isTesting ? "animate-spin" : ""}`,
                                    children: isTesting ? "sync" : "send"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>onToggleEnabled(webhook),
                                title: webhook.enabled ? t("disable") : t("enable"),
                                className: "rounded-lg p-2 text-text-muted transition-colors hover:bg-surface/60 hover:text-text-main",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[18px]",
                                    children: webhook.enabled ? "toggle_on" : "toggle_off"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                lineNumber: 105,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>onEdit(webhook),
                                title: t("edit"),
                                className: "rounded-lg p-2 text-text-muted transition-colors hover:bg-surface/60 hover:text-text-main",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[18px]",
                                    children: "edit"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                    lineNumber: 121,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>onDelete(webhook),
                                title: t("delete"),
                                className: "rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[18px]",
                                    children: "delete"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                    lineNumber: 129,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                lineNumber: 123,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setExpanded((v)=>!v),
                                title: expanded ? "Collapse" : "Expand",
                                className: "rounded-lg p-2 text-text-muted transition-colors hover:bg-surface/60 hover:text-text-main",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[18px]",
                                    children: expanded ? "expand_less" : "expand_more"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                    lineNumber: 137,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-border px-4 pb-4 pt-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3 flex flex-wrap gap-1",
                        children: webhook.events.map((ev)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full border border-border bg-sidebar px-2 py-0.5 text-xs text-text-muted",
                                children: ev === "*" ? t("allEvents") : ev
                            }, ev, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                                lineNumber: 148,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                        lineNumber: 146,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2 text-xs font-medium uppercase tracking-wider text-text-muted",
                        children: t("deliveries.title")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                        lineNumber: 156,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$WebhookDeliveriesPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WebhookDeliveriesPanel"], {
                        webhookId: webhook.id,
                        t: t
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                        lineNumber: 159,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
                lineNumber: 145,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
_s(WebhookCard, "DuL5jiiQQFgbn7gBKAyxwS/H4Ek=");
_c = WebhookCard;
var _c;
__turbopack_context__.k.register(_c, "WebhookCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhooksList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebhooksList",
    ()=>WebhooksList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$WebhookCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhookCard.tsx [app-client] (ecmascript)");
"use client";
;
;
function WebhooksList({ webhooks, loading, testingId, t, onTest, onToggleEnabled, onEdit, onDelete }) {
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "py-10 text-center text-sm text-text-muted",
            children: t("loading")
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhooksList.tsx",
            lineNumber: 27,
            columnNumber: 12
        }, this);
    }
    if (webhooks.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center gap-3 py-14 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[48px] text-text-muted",
                    children: "webhook"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhooksList.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-text-muted",
                    children: t("noWebhooks")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhooksList.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhooksList.tsx",
            lineNumber: 32,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: webhooks.map((wh)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$WebhookCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WebhookCard"], {
                webhook: wh,
                t: t,
                testingId: testingId,
                onTest: onTest,
                onToggleEnabled: onToggleEnabled,
                onEdit: onEdit,
                onDelete: onDelete
            }, wh.id, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhooksList.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhooksList.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_c = WebhooksList;
var _c;
__turbopack_context__.k.register(_c, "WebhooksList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebhooksPageClient",
    ()=>WebhooksPageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$AddWebhookWizard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/AddWebhookWizard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$HowItWorksSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/HowItWorksSidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$WebhooksList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/webhooks/components/WebhooksList.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function getStatus(wh) {
    if (!wh.enabled) return "inactive";
    if (wh.failure_count > 0 || wh.last_status !== null && wh.last_status >= 400) return "errored";
    return "active";
}
function WebhooksPageClient() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("webhooks");
    const [webhooks, setWebhooks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [testingId, setTestingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [feedback, setFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [wizardOpen, setWizardOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingWebhook, setEditingWebhook] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deleteTarget, setDeleteTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deleting, setDeleting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebhooksPageClient.useCallback[load]": async ()=>{
            setLoading(true);
            try {
                const res = await fetch("/api/webhooks");
                const data = await res.json().catch({
                    "WebhooksPageClient.useCallback[load]": ()=>({})
                }["WebhooksPageClient.useCallback[load]"]);
                if (!res.ok) throw new Error(data.error || t("loadFailed"));
                setWebhooks(Array.isArray(data.webhooks) ? data.webhooks : []);
            } catch (err) {
                setFeedback({
                    type: "error",
                    message: err instanceof Error ? err.message : t("loadFailed")
                });
            } finally{
                setLoading(false);
            }
        }
    }["WebhooksPageClient.useCallback[load]"], [
        t
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WebhooksPageClient.useEffect": ()=>{
            void load();
        }
    }["WebhooksPageClient.useEffect"], [
        load
    ]);
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WebhooksPageClient.useMemo[stats]": ()=>webhooks.reduce({
                "WebhooksPageClient.useMemo[stats]": (acc, wh)=>{
                    acc.total += 1;
                    acc[getStatus(wh)] += 1;
                    return acc;
                }
            }["WebhooksPageClient.useMemo[stats]"], {
                total: 0,
                active: 0,
                inactive: 0,
                errored: 0
            })
    }["WebhooksPageClient.useMemo[stats]"], [
        webhooks
    ]);
    const handleTest = async (wh)=>{
        setTestingId(wh.id);
        setFeedback(null);
        try {
            const res = await fetch(`/api/webhooks/${wh.id}/test`, {
                method: "POST"
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok || data.delivered === false) throw new Error(data.error || t("testFailed"));
            setFeedback({
                type: "success",
                message: t("testSuccess")
            });
            await load();
        } catch (err) {
            setFeedback({
                type: "error",
                message: err instanceof Error ? err.message : t("testFailed")
            });
        } finally{
            setTestingId(null);
        }
    };
    const handleToggleEnabled = async (wh)=>{
        setFeedback(null);
        try {
            const res = await fetch(`/api/webhooks/${wh.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    enabled: !wh.enabled
                })
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) throw new Error(data.error || t("saveFailed"));
            setWebhooks((prev)=>prev.map((item)=>item.id === wh.id ? {
                        ...item,
                        enabled: !wh.enabled
                    } : item));
        } catch (err) {
            setFeedback({
                type: "error",
                message: err instanceof Error ? err.message : t("saveFailed")
            });
        }
    };
    const handleAddWebhook = ()=>{
        setEditingWebhook(null);
        setWizardOpen(true);
    };
    const handleEditWebhook = (webhook)=>{
        setEditingWebhook(webhook);
        setWizardOpen(true);
    };
    const handleCloseWizard = ()=>{
        setWizardOpen(false);
        setEditingWebhook(null);
    };
    const handleDelete = async ()=>{
        if (!deleteTarget) return;
        setDeleting(true);
        setFeedback(null);
        try {
            const res = await fetch(`/api/webhooks/${deleteTarget.id}`, {
                method: "DELETE"
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) throw new Error(data.error || t("deleteFailed"));
            setWebhooks((prev)=>prev.filter((w)=>w.id !== deleteTarget.id));
            setDeleteTarget(null);
            setFeedback({
                type: "success",
                message: t("deleteSuccess")
            });
        } catch (err) {
            setFeedback({
                type: "error",
                message: err instanceof Error ? err.message : t("deleteFailed")
            });
        } finally{
            setDeleting(false);
        }
    };
    const tFn = (key, opts)=>opts ? t(key, opts) : t(key);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-xl font-semibold text-text-main",
                                children: t("title")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                lineNumber: 148,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-sm text-text-muted",
                                children: t("description")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                lineNumber: 149,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleAddWebhook,
                        className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[18px]",
                                children: "add"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                lineNumber: 156,
                                columnNumber: 11
                            }, this),
                            t("addWebhook")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                        lineNumber: 151,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            feedback && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `rounded-lg border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300"}`,
                children: feedback.message
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                lineNumber: 162,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-6 lg:grid-cols-[1fr_280px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
                                children: [
                                    {
                                        label: t("total"),
                                        value: stats.total,
                                        icon: "webhook",
                                        tone: "text-primary"
                                    },
                                    {
                                        label: t("active"),
                                        value: stats.active,
                                        icon: "check_circle",
                                        tone: "text-emerald-500"
                                    },
                                    {
                                        label: t("inactive"),
                                        value: stats.inactive,
                                        icon: "pause_circle",
                                        tone: "text-text-muted"
                                    },
                                    {
                                        label: t("errored"),
                                        value: stats.errored,
                                        icon: "error",
                                        tone: "text-red-500"
                                    }
                                ].map((stat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                                        className: "p-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs font-medium uppercase tracking-wider text-text-muted",
                                                            children: stat.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                                            lineNumber: 195,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-1 text-2xl font-semibold text-text-main",
                                                            children: stat.value
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                                            lineNumber: 198,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                                    lineNumber: 194,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `material-symbols-outlined text-[24px] ${stat.tone}`,
                                                    children: stat.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                                    lineNumber: 200,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                            lineNumber: 193,
                                            columnNumber: 17
                                        }, this)
                                    }, stat.label, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                        lineNumber: 192,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                lineNumber: 175,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                                className: "overflow-hidden",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border-b border-border p-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                            className: "text-base font-semibold text-text-main",
                                                            children: t("configuredWebhooks")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                                            lineNumber: 212,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-1 text-xs text-text-muted",
                                                            children: t("configuredWebhooksDesc")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                                            lineNumber: 215,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                                    lineNumber: 211,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>void load(),
                                                    disabled: loading,
                                                    title: t("refresh"),
                                                    className: "rounded-lg border border-border p-2 text-text-muted transition-colors hover:bg-surface/60 hover:text-text-main disabled:opacity-40",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`,
                                                        children: "refresh"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                                        lineNumber: 224,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                                    lineNumber: 217,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                            lineNumber: 210,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                        lineNumber: 209,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$WebhooksList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WebhooksList"], {
                                            webhooks: webhooks,
                                            loading: loading,
                                            testingId: testingId,
                                            t: tFn,
                                            onTest: (wh)=>void handleTest(wh),
                                            onToggleEnabled: (wh)=>void handleToggleEnabled(wh),
                                            onEdit: handleEditWebhook,
                                            onDelete: setDeleteTarget
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                            lineNumber: 233,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                        lineNumber: 232,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                lineNumber: 208,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                        lineNumber: 174,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "hidden lg:block",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sticky top-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$HowItWorksSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HowItWorksSidebar"], {
                                t: tFn
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                                lineNumber: 249,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                            lineNumber: 248,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                        lineNumber: 247,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                lineNumber: 173,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$webhooks$2f$components$2f$AddWebhookWizard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AddWebhookWizard"], {
                isOpen: wizardOpen,
                onClose: handleCloseWizard,
                onCreated: async ()=>{
                    await load();
                },
                t: tFn,
                editingWebhook: editingWebhook
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                lineNumber: 254,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfirmModal"], {
                isOpen: deleteTarget !== null,
                onClose: ()=>setDeleteTarget(null),
                onConfirm: handleDelete,
                title: t("delete"),
                message: t("deleteConfirm"),
                confirmText: t("delete"),
                cancelText: t("wizard.cancel"),
                loading: deleting
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
                lineNumber: 264,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/webhooks/WebhooksPageClient.tsx",
        lineNumber: 145,
        columnNumber: 5
    }, this);
}
_s(WebhooksPageClient, "1CmNG1tH0viwOEd4JlYyuuhyyt4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = WebhooksPageClient;
var _c;
__turbopack_context__.k.register(_c, "WebhooksPageClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1_ozpjl._.js.map