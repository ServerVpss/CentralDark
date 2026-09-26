(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FeatureFlagCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const CATEGORY_STYLES = {
    security: {
        bg: "bg-red-50 dark:bg-red-500/15",
        border: "border-red-200 dark:border-red-500/20",
        text: "text-red-700 dark:text-red-300"
    },
    network: {
        bg: "bg-sky-50 dark:bg-blue-500/15",
        border: "border-sky-200 dark:border-blue-500/20",
        text: "text-sky-700 dark:text-blue-300"
    },
    policies: {
        bg: "bg-amber-50 dark:bg-amber-500/15",
        border: "border-amber-200 dark:border-amber-500/20",
        text: "text-amber-700 dark:text-amber-300"
    },
    runtime: {
        bg: "bg-violet-50 dark:bg-purple-500/15",
        border: "border-violet-200 dark:border-purple-500/20",
        text: "text-violet-700 dark:text-purple-300"
    },
    cli: {
        bg: "bg-emerald-50 dark:bg-green-500/15",
        border: "border-emerald-200 dark:border-green-500/20",
        text: "text-emerald-700 dark:text-green-300"
    },
    health: {
        bg: "bg-cyan-50 dark:bg-cyan-500/15",
        border: "border-cyan-200 dark:border-cyan-500/20",
        text: "text-cyan-700 dark:text-cyan-300"
    }
};
const SOURCE_STYLES = {
    db: {
        bg: "bg-sky-50 dark:bg-blue-500/20",
        border: "border-sky-200 dark:border-blue-500/30",
        text: "text-sky-700 dark:text-blue-300",
        label: "DB"
    },
    env: {
        bg: "bg-amber-50 dark:bg-amber-500/20",
        border: "border-amber-200 dark:border-amber-500/30",
        text: "text-amber-700 dark:text-amber-300",
        label: "ENV"
    },
    default: {
        bg: "bg-slate-100 dark:bg-slate-500/20",
        border: "border-slate-200 dark:border-slate-500/30",
        text: "text-slate-600 dark:text-slate-300",
        label: "DEF"
    }
};
function isEnabled(value) {
    return value === "true" || value === "1" || value === "yes";
}
function Spinner() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-text-primary",
        "aria-hidden": "true"
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
_c = Spinner;
/**
 * `EXPOSE_CC_DISCOVERY_ALIASES` resolves with env-wins-over-db precedence (see
 * db/ccDiscoveryAliases.ts::getCcAliasGlobalState), the opposite of every other
 * flag — so a plain ENV badge could be misread as "toggle it off here" when the
 * environment variable is what is actually forcing it on. Renders nothing for
 * any other flag or source.
 */ function EnvPrecedenceWarning({ flag, text }) {
    if (flag.key !== "EXPOSE_CC_DISCOVERY_ALIASES" || flag.source !== "env") return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "mb-3 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
        children: text
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
        lineNumber: 112,
        columnNumber: 5
    }, this);
}
_c1 = EnvPrecedenceWarning;
function FeatureFlagCard({ flag, onToggle, onReset, saving = false }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("featureFlags");
    const enabled = flag.type === "boolean" ? isEnabled(flag.effectiveValue) : false;
    const category = CATEGORY_STYLES[flag.category];
    const source = SOURCE_STYLES[flag.source];
    const cardBorder = flag.type === "boolean" && enabled ? "border-emerald-300 shadow-emerald-500/10 dark:border-green-500/30" : "border-border";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "group",
        "aria-label": flag.label,
        className: `rounded-xl border bg-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-px hover:border-black/15 hover:bg-bg-subtle/60 hover:shadow-elevated dark:hover:border-white/15 dark:hover:bg-surface ${cardBorder}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-label": t("categoryLabel", {
                            category: t(`categories.${flag.category}`)
                        }),
                        className: `inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${category.bg} ${category.border} ${category.text}`,
                        children: t(`categories.${flag.category}`)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            saving && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Spinner, {}, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                                lineNumber: 150,
                                columnNumber: 22
                            }, this),
                            flag.type === "boolean" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                role: "switch",
                                "aria-checked": enabled,
                                "aria-label": flag.label,
                                disabled: saving,
                                onClick: ()=>onToggle(flag.key, enabled ? "false" : "true"),
                                className: `relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20"}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0.5"}`,
                                    "aria-hidden": "true"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                                    lineNumber: 163,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                "aria-label": flag.label,
                                disabled: saving,
                                value: flag.effectiveValue,
                                onChange: (e)=>onToggle(flag.key, e.target.value),
                                className: "rounded-md border border-border bg-bg-subtle px-2 py-0.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
                                children: (flag.enumValues ?? []).map((val)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: val,
                                        className: "bg-card text-text-primary",
                                        children: t.has(`enumValues.${val}`) ? t(`enumValues.${val}`) : val
                                    }, val, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                                        lineNumber: 179,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                                lineNumber: 171,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                        lineNumber: 149,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                lineNumber: 141,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 mb-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex-1 truncate font-mono text-xs font-semibold text-text-primary",
                        children: flag.key
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this),
                    flag.warningLevel === "caution" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-amber-500 dark:text-amber-300",
                        "aria-label": t("caution"),
                        children: "⚠️"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                        lineNumber: 195,
                        columnNumber: 11
                    }, this),
                    flag.warningLevel === "danger" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm animate-pulse",
                        "aria-label": t("danger"),
                        children: "🔴"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                        lineNumber: 200,
                        columnNumber: 11
                    }, this),
                    flag.requiresRestart && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded border border-slate-300 bg-slate-50 px-1 text-[10px] text-slate-600 dark:border-slate-400/30 dark:bg-transparent dark:text-slate-300",
                        title: t("requiresRestart"),
                        "aria-label": t("requiresRestart"),
                        children: "restart"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                        lineNumber: 205,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                lineNumber: 189,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mb-3 line-clamp-2 text-xs text-text-muted",
                children: flag.description
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                lineNumber: 216,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EnvPrecedenceWarning, {
                flag: flag,
                text: t("ccDiscoveryAliasesEnvWarning")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                lineNumber: 218,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-text-muted",
                                children: [
                                    t("source"),
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-xs font-medium ${source.bg} ${source.border} ${source.text}`,
                                children: source.label
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                                lineNumber: 224,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this),
                    flag.source === "db" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        "aria-label": t("resetFlag", {
                            label: flag.label
                        }),
                        disabled: saving,
                        onClick: ()=>onReset(flag.key),
                        className: "inline-flex items-center gap-1 rounded text-xs text-text-muted transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[14px]",
                                "aria-hidden": "true",
                                children: "refresh"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                                lineNumber: 238,
                                columnNumber: 13
                            }, this),
                            t("reset")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                        lineNumber: 232,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
                lineNumber: 221,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx",
        lineNumber: 135,
        columnNumber: 5
    }, this);
}
_s(FeatureFlagCard, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c2 = FeatureFlagCard;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "Spinner");
__turbopack_context__.k.register(_c1, "EnvPrecedenceWarning");
__turbopack_context__.k.register(_c2, "FeatureFlagCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FeatureFlagsGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/turkishText.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$settings$2f$components$2f$FeatureFlagCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagCard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const ACTIVE_VALUES = new Set([
    "true",
    "1",
    "yes"
]);
function isActiveFlagValue(value) {
    return ACTIVE_VALUES.has(value);
}
const CATEGORIES = [
    {
        value: "all",
        labelKey: "all"
    },
    {
        value: "security",
        labelKey: "security"
    },
    {
        value: "network",
        labelKey: "network"
    },
    {
        value: "policies",
        labelKey: "policies"
    },
    {
        value: "runtime",
        labelKey: "runtime"
    },
    {
        value: "cli",
        labelKey: "cli"
    },
    {
        value: "health",
        labelKey: "health"
    },
    // Synthetic "category" that filters by requiresRestart=true regardless of
    // real category — surfaces flags that need a process restart to take effect.
    {
        value: "__restart",
        labelKey: "requiresRestart"
    }
];
function FeatureFlagsGrid() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("featureFlags");
    const [flags, setFlags] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [summary, setSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [category, setCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [savingKeys, setSavingKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [resettingAll, setResettingAll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showResetConfirm, setShowResetConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [debouncedSearch, setDebouncedSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Set of flag keys whose DB override was changed in this session without
    // a subsequent restart. Used to surface the restart banner.
    const [pendingRestartKeys, setPendingRestartKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [restarting, setRestarting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showRestartConfirm, setShowRestartConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const loadFlags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FeatureFlagsGrid.useCallback[loadFlags]": async ()=>{
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/settings/feature-flags");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setFlags(data.flags);
                setSummary(data.summary);
            } catch (err) {
                setError(err instanceof Error ? err.message : t("loadFailed"));
            } finally{
                setLoading(false);
            }
        }
    }["FeatureFlagsGrid.useCallback[loadFlags]"], [
        t
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FeatureFlagsGrid.useEffect": ()=>{
            const timer = window.setTimeout({
                "FeatureFlagsGrid.useEffect.timer": ()=>void loadFlags()
            }["FeatureFlagsGrid.useEffect.timer"], 0);
            return ({
                "FeatureFlagsGrid.useEffect": ()=>window.clearTimeout(timer)
            })["FeatureFlagsGrid.useEffect"];
        }
    }["FeatureFlagsGrid.useEffect"], [
        loadFlags
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FeatureFlagsGrid.useEffect": ()=>{
            const timer = setTimeout({
                "FeatureFlagsGrid.useEffect.timer": ()=>setDebouncedSearch(search)
            }["FeatureFlagsGrid.useEffect.timer"], 300);
            return ({
                "FeatureFlagsGrid.useEffect": ()=>clearTimeout(timer)
            })["FeatureFlagsGrid.useEffect"];
        }
    }["FeatureFlagsGrid.useEffect"], [
        search
    ]);
    const applyFlagResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FeatureFlagsGrid.useCallback[applyFlagResult]": (key, result)=>{
            const wasActive = isActiveFlagValue(result.previousValue);
            const isNowActive = isActiveFlagValue(result.effectiveValue);
            const wasDb = result.previousSource === "db";
            const isNowDb = result.source === "db";
            const wasEnv = result.previousSource === "env";
            const isNowEnv = result.source === "env";
            setFlags({
                "FeatureFlagsGrid.useCallback[applyFlagResult]": (prev)=>prev.map({
                        "FeatureFlagsGrid.useCallback[applyFlagResult]": (f)=>f.key === key ? {
                                ...f,
                                effectiveValue: result.effectiveValue,
                                source: result.source
                            } : f
                    }["FeatureFlagsGrid.useCallback[applyFlagResult]"])
            }["FeatureFlagsGrid.useCallback[applyFlagResult]"]);
            setSummary({
                "FeatureFlagsGrid.useCallback[applyFlagResult]": (s)=>s ? {
                        ...s,
                        active: s.active + (isNowActive ? 1 : 0) - (wasActive ? 1 : 0),
                        inactive: s.inactive + (isNowActive ? 0 : 1) - (wasActive ? 0 : 1),
                        overriddenByDb: s.overriddenByDb + (isNowDb ? 1 : 0) - (wasDb ? 1 : 0),
                        overriddenByEnv: s.overriddenByEnv + (isNowEnv ? 1 : 0) - (wasEnv ? 1 : 0)
                    } : s
            }["FeatureFlagsGrid.useCallback[applyFlagResult]"]);
        }
    }["FeatureFlagsGrid.useCallback[applyFlagResult]"], []);
    const filteredFlags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FeatureFlagsGrid.useMemo[filteredFlags]": ()=>{
            return flags.filter({
                "FeatureFlagsGrid.useMemo[filteredFlags]": (f)=>{
                    if (category === "all") return true;
                    if (category === "__restart") return f.requiresRestart;
                    return f.category === category;
                }
            }["FeatureFlagsGrid.useMemo[filteredFlags]"]).filter({
                "FeatureFlagsGrid.useMemo[filteredFlags]": (f)=>debouncedSearch === "" || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["matchesSearch"])(f.key, debouncedSearch) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["matchesSearch"])(f.description, debouncedSearch) || t.has(`definitions.${f.key}.description`) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["matchesSearch"])(t(`definitions.${f.key}.description`), debouncedSearch)
            }["FeatureFlagsGrid.useMemo[filteredFlags]"]);
        }
    }["FeatureFlagsGrid.useMemo[filteredFlags]"], [
        flags,
        debouncedSearch,
        category,
        t
    ]);
    const handleToggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FeatureFlagsGrid.useCallback[handleToggle]": async (key, newValue)=>{
            setSavingKeys({
                "FeatureFlagsGrid.useCallback[handleToggle]": (prev)=>new Set(prev).add(key)
            }["FeatureFlagsGrid.useCallback[handleToggle]"]);
            try {
                const res = await fetch("/api/settings/feature-flags", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        key,
                        value: newValue
                    })
                });
                if (!res.ok) {
                    setError(t("updateFailedHttp", {
                        status: res.status
                    }));
                    return;
                }
                const result = await res.json();
                applyFlagResult(key, result);
                if (result.requiresRestart) {
                    setPendingRestartKeys({
                        "FeatureFlagsGrid.useCallback[handleToggle]": (prev)=>new Set(prev).add(key)
                    }["FeatureFlagsGrid.useCallback[handleToggle]"]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : t("updateFailed"));
            } finally{
                setSavingKeys({
                    "FeatureFlagsGrid.useCallback[handleToggle]": (prev)=>{
                        const next = new Set(prev);
                        next.delete(key);
                        return next;
                    }
                }["FeatureFlagsGrid.useCallback[handleToggle]"]);
            }
        }
    }["FeatureFlagsGrid.useCallback[handleToggle]"], [
        applyFlagResult,
        t
    ]);
    const handleReset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FeatureFlagsGrid.useCallback[handleReset]": async (key)=>{
            setSavingKeys({
                "FeatureFlagsGrid.useCallback[handleReset]": (prev)=>new Set(prev).add(key)
            }["FeatureFlagsGrid.useCallback[handleReset]"]);
            try {
                const res = await fetch("/api/settings/feature-flags", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        key
                    })
                });
                if (!res.ok) {
                    setError(t("updateFailedHttp", {
                        status: res.status
                    }));
                    return;
                }
                const result = await res.json();
                applyFlagResult(key, result);
                if (result.requiresRestart) {
                    setPendingRestartKeys({
                        "FeatureFlagsGrid.useCallback[handleReset]": (prev)=>new Set(prev).add(key)
                    }["FeatureFlagsGrid.useCallback[handleReset]"]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : t("updateFailed"));
            } finally{
                setSavingKeys({
                    "FeatureFlagsGrid.useCallback[handleReset]": (prev)=>{
                        const next = new Set(prev);
                        next.delete(key);
                        return next;
                    }
                }["FeatureFlagsGrid.useCallback[handleReset]"]);
            }
        }
    }["FeatureFlagsGrid.useCallback[handleReset]"], [
        applyFlagResult,
        t
    ]);
    const handleRestart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FeatureFlagsGrid.useCallback[handleRestart]": async ()=>{
            setRestarting(true);
            try {
                const res = await fetch("/api/restart", {
                    method: "POST"
                });
                if (!res.ok) {
                    setError(t("restartFailedHttp", {
                        status: res.status
                    }));
                    setShowRestartConfirm(false);
                    setRestarting(false);
                    return;
                }
                // Server is going down — wait for it to come back, then reload.
                const stillUp = {
                    "FeatureFlagsGrid.useCallback[handleRestart].stillUp": async ()=>{
                        try {
                            const r = await fetch("/api/health/ping", {
                                cache: "no-store"
                            });
                            return r.ok;
                        } catch  {
                            return false;
                        }
                    }
                }["FeatureFlagsGrid.useCallback[handleRestart].stillUp"];
                const waitDown = setInterval({
                    "FeatureFlagsGrid.useCallback[handleRestart].waitDown": async ()=>{
                        if (!await stillUp()) {
                            clearInterval(waitDown);
                            const waitUp = setInterval({
                                "FeatureFlagsGrid.useCallback[handleRestart].waitDown.waitUp": async ()=>{
                                    if (await stillUp()) {
                                        clearInterval(waitUp);
                                        setPendingRestartKeys(new Set());
                                        window.location.reload();
                                    }
                                }
                            }["FeatureFlagsGrid.useCallback[handleRestart].waitDown.waitUp"], 1000);
                        }
                    }
                }["FeatureFlagsGrid.useCallback[handleRestart].waitDown"], 500);
            } catch (err) {
                setError(err instanceof Error ? err.message : t("restartFailed"));
                setShowRestartConfirm(false);
                setRestarting(false);
            }
        }
    }["FeatureFlagsGrid.useCallback[handleRestart]"], [
        t
    ]);
    const handleResetAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FeatureFlagsGrid.useCallback[handleResetAll]": async ()=>{
            setResettingAll(true);
            try {
                const res = await fetch("/api/settings/feature-flags", {
                    method: "DELETE"
                });
                if (!res.ok) {
                    setError(t("resetOverridesFailedHttp", {
                        status: res.status
                    }));
                    setShowResetConfirm(false);
                    return;
                }
                await loadFlags();
                setShowResetConfirm(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : t("resetOverridesFailed"));
                setShowResetConfirm(false);
            } finally{
                setResettingAll(false);
            }
        }
    }["FeatureFlagsGrid.useCallback[handleResetAll]"], [
        loadFlags,
        t
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-semibold text-text-primary",
                                children: t("title")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                lineNumber: 269,
                                columnNumber: 11
                            }, this),
                            summary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium text-emerald-700 dark:text-emerald-300",
                                        children: t("activeCount", {
                                            count: summary.active
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                        lineNumber: 272,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-text-muted/60",
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                        lineNumber: 275,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-text-muted",
                                        children: t("inactiveCount", {
                                            count: summary.inactive
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                        lineNumber: 276,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-text-muted/60",
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                        lineNumber: 279,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium text-sky-700 dark:text-sky-300",
                                        children: t("dbOverrideCount", {
                                            count: summary.overriddenByDb
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                        lineNumber: 280,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                lineNumber: 271,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                        lineNumber: 268,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex w-full flex-col gap-2 sm:w-auto sm:flex-row",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined absolute left-2.5 top-2 text-sm text-text-muted",
                                        children: "search"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                        lineNumber: 291,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: t("searchPlaceholder"),
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value),
                                        className: "w-full rounded-lg border border-border bg-bg-subtle py-1.5 pl-8 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 sm:w-64"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                        lineNumber: 294,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                lineNumber: 290,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: category,
                                onChange: (e)=>setCategory(e.target.value),
                                className: "w-full rounded-lg border border-border bg-bg-subtle px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 sm:w-auto",
                                children: CATEGORIES.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: cat.value,
                                        className: "bg-card text-text-primary",
                                        children: t(`categories.${cat.labelKey}`)
                                    }, cat.value, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                        lineNumber: 310,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                lineNumber: 304,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                        lineNumber: 288,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                lineNumber: 267,
                columnNumber: 7
            }, this),
            pendingRestartKeys.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-amber-600 dark:text-amber-300",
                                    children: "restart_alt"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                    lineNumber: 324,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-amber-900 dark:text-amber-200",
                                            children: t("restartRequiredCount", {
                                                count: pendingRestartKeys.size
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                            lineNumber: 328,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-0.5 text-xs text-amber-800/80 dark:text-amber-200/80",
                                            children: t("restartRequiredDescription")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                            lineNumber: 331,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                    lineNumber: 327,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                            lineNumber: 323,
                            columnNumber: 13
                        }, this),
                        !showRestartConfirm ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setShowRestartConfirm(true),
                            className: "shrink-0 rounded-lg border border-amber-300 bg-white/70 px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-400/40 dark:bg-transparent dark:text-amber-300 dark:hover:bg-amber-500/20",
                            children: t("restartServer")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                            lineNumber: 337,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowRestartConfirm(false),
                                    className: "text-sm text-amber-800/80 hover:text-amber-950 dark:text-amber-300/80 dark:hover:text-amber-200",
                                    disabled: restarting,
                                    children: t("cancel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                    lineNumber: 345,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleRestart,
                                    disabled: restarting,
                                    className: "rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 dark:bg-amber-500/30 dark:text-amber-200 dark:hover:bg-amber-500/40",
                                    children: restarting ? t("restarting") : t("confirmRestart")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                    lineNumber: 352,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                            lineNumber: 344,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                    lineNumber: 322,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                lineNumber: 321,
                columnNumber: 9
            }, this),
            category === "__restart" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-sky-600 dark:text-blue-300",
                            children: "info"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                            lineNumber: 369,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: t.rich("restartViewDescription", {
                                strong: (chunks)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: chunks
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                        lineNumber: 371,
                                        columnNumber: 71
                                    }, this)
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                            lineNumber: 370,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                    lineNumber: 368,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                lineNumber: 367,
                columnNumber: 9
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4",
                style: {
                    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))"
                },
                children: Array.from({
                    length: 9
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-36 animate-pulse rounded-xl bg-black/[0.04] dark:bg-white/5"
                    }, i, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                        lineNumber: 384,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                lineNumber: 379,
                columnNumber: 9
            }, this),
            !loading && error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-red-700 dark:text-red-300",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                        lineNumber: 395,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: loadFlags,
                        className: "text-sm font-medium text-red-700 underline hover:no-underline dark:text-red-300",
                        children: t("retry")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                        lineNumber: 396,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                lineNumber: 394,
                columnNumber: 9
            }, this),
            !loading && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    filteredFlags.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "py-16 text-center text-text-muted",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-4xl",
                                children: "search_off"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                lineNumber: 410,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-sm",
                                children: t("noSearchResults")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                lineNumber: 411,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                        lineNumber: 409,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-4",
                        style: {
                            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))"
                        },
                        children: filteredFlags.map((flag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$settings$2f$components$2f$FeatureFlagCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                flag: {
                                    ...flag,
                                    label: t.has(`definitions.${flag.key}.label`) ? t(`definitions.${flag.key}.label`) : flag.label,
                                    description: t.has(`definitions.${flag.key}.description`) ? t(`definitions.${flag.key}.description`) : flag.description
                                },
                                onToggle: handleToggle,
                                onReset: handleReset,
                                saving: savingKeys.has(flag.key)
                            }, flag.key, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                lineNumber: 419,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                        lineNumber: 414,
                        columnNumber: 13
                    }, this),
                    summary && summary.overriddenByDb > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-end border-t border-border pt-4",
                        children: !showResetConfirm ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setShowResetConfirm(true),
                            className: "rounded-lg border border-red-200 bg-red-50/60 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-500/40 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10",
                            children: t("resetAllOverrides")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                            lineNumber: 442,
                            columnNumber: 17
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted",
                                    children: t("confirmResetOverrides", {
                                        count: summary.overriddenByDb
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                    lineNumber: 450,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowResetConfirm(false),
                                    className: "text-sm text-text-muted hover:text-text-primary",
                                    children: t("cancel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                    lineNumber: 453,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleResetAll,
                                    disabled: resettingAll,
                                    className: "rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30",
                                    children: resettingAll ? t("resetting") : t("confirmReset")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                                    lineNumber: 459,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                            lineNumber: 449,
                            columnNumber: 17
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
                        lineNumber: 440,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx",
        lineNumber: 265,
        columnNumber: 5
    }, this);
}
_s(FeatureFlagsGrid, "N1+Zu+LTv78MGO/pn3NPANEbjuE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = FeatureFlagsGrid;
var _c;
__turbopack_context__.k.register(_c, "FeatureFlagsGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/settings/feature-flags/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FeatureFlagsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$settings$2f$components$2f$FeatureFlagsGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/settings/components/FeatureFlagsGrid.tsx [app-client] (ecmascript)");
"use client";
;
;
function FeatureFlagsPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$settings$2f$components$2f$FeatureFlagsGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/settings/feature-flags/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = FeatureFlagsPage;
var _c;
__turbopack_context__.k.register(_c, "FeatureFlagsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_15964x9._.js.map