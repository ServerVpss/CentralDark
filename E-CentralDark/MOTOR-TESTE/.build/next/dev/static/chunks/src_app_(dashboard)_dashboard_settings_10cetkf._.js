(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CacheSettingsTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const DEFAULT_TTL_MS = 1500;
const MIN_TTL_MS = 100;
const MAX_TTL_MS = 60000;
function CacheSettingsTab() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("settings");
    const [value, setValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(String(DEFAULT_TTL_MS));
    const [savedValue, setSavedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(String(DEFAULT_TTL_MS));
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CacheSettingsTab.useEffect": ()=>{
            let active = true;
            fetch("/api/settings/cache-config").then({
                "CacheSettingsTab.useEffect": (response)=>{
                    if (!response.ok) throw new Error(`Cache config API returned ${response.status}`);
                    return response.json();
                }
            }["CacheSettingsTab.useEffect"]).then({
                "CacheSettingsTab.useEffect": (config)=>{
                    if (!active) return;
                    const ms = config.modelCatalogCacheTtlMs ?? DEFAULT_TTL_MS;
                    const str = typeof ms === "number" && Number.isFinite(ms) ? String(ms) : String(DEFAULT_TTL_MS);
                    setValue(str);
                    setSavedValue(str);
                }
            }["CacheSettingsTab.useEffect"]).catch({
                "CacheSettingsTab.useEffect": (error)=>{
                    console.error("Failed to load cache config:", error);
                    if (active) setMessage({
                        type: "error",
                        text: t("cacheConfigLoadFailed")
                    });
                }
            }["CacheSettingsTab.useEffect"]).finally({
                "CacheSettingsTab.useEffect": ()=>{
                    if (active) setLoading(false);
                }
            }["CacheSettingsTab.useEffect"]);
            return ({
                "CacheSettingsTab.useEffect": ()=>{
                    active = false;
                }
            })["CacheSettingsTab.useEffect"];
        }
    }["CacheSettingsTab.useEffect"], [
        t
    ]);
    const dirty = value.trim() !== savedValue;
    const saveTtl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CacheSettingsTab.useCallback[saveTtl]": async ()=>{
            if (!dirty) return;
            const parsed = Number(value.trim());
            if (!Number.isInteger(parsed)) return;
            if (parsed < MIN_TTL_MS || parsed > MAX_TTL_MS) return;
            setSaving(true);
            setMessage(null);
            try {
                const response = await fetch("/api/settings/cache-config", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        modelCatalogCacheTtlMs: parsed
                    })
                });
                if (!response.ok) throw new Error(`Cache config API returned ${response.status}`);
                const config = await response.json();
                const saved = String(config.modelCatalogCacheTtlMs ?? parsed);
                setValue(saved);
                setSavedValue(saved);
                setMessage({
                    type: "success",
                    text: t("cacheConfigSaveSuccess")
                });
            } catch (error) {
                console.error("Failed to save cache config:", error);
                setMessage({
                    type: "error",
                    text: t("cacheConfigSaveFailed")
                });
            } finally{
                setSaving(false);
            }
        }
    }["CacheSettingsTab.useCallback[saveTtl]"], [
        dirty,
        t,
        value
    ]);
    const validationError = (()=>{
        const trimmed = value.trim();
        if (!trimmed) return "Required";
        const parsed = Number(trimmed);
        if (!Number.isInteger(parsed)) return t("modelCatalogTtlWholeNumberError");
        if (parsed < MIN_TTL_MS) return t("modelCatalogTtlMinimumError", {
            min: MIN_TTL_MS
        });
        if (parsed > MAX_TTL_MS) return t("modelCatalogTtlMaximumError", {
            max: MAX_TTL_MS
        });
        return null;
    })();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        className: "p-6 mt-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "font-medium",
                            children: t("modelCatalogCacheTtl")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
                            lineNumber: 102,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-text-muted mt-1",
                            children: t("modelCatalogCacheTtlDescription")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
                            lineNumber: 103,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
                    lineNumber: 101,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            htmlFor: "model-catalog-ttl-ms",
                            className: "sr-only",
                            children: t("modelCatalogCacheTtlLabel")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
                            lineNumber: 106,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            id: "model-catalog-ttl-ms",
                            type: "number",
                            min: MIN_TTL_MS,
                            max: MAX_TTL_MS,
                            step: 100,
                            value: value,
                            onChange: (event)=>{
                                setValue(event.target.value);
                                setMessage(null);
                            },
                            onKeyDown: (event)=>{
                                if (event.key === "Enter" && dirty) void saveTtl();
                            },
                            className: "w-32 px-3 py-1.5 rounded bg-surface-2 border border-border text-sm text-text-primary",
                            disabled: loading || saving
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
                            lineNumber: 109,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-text-muted",
                            children: "ms"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
                            lineNumber: 126,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            size: "sm",
                            variant: "primary",
                            disabled: loading || Boolean(validationError) || !dirty,
                            onClick: saveTtl,
                            children: saving ? t("modelCatalogCacheTtlSaving") : t("modelCatalogCacheTtlSave")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
                            lineNumber: 127,
                            columnNumber: 11
                        }, this),
                        dirty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-text-muted",
                            children: t("modelCatalogCacheTtlCurrent", {
                                value: savedValue
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
                            lineNumber: 136,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this),
                validationError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-red-500",
                    children: validationError
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
                    lineNumber: 141,
                    columnNumber: 29
                }, this),
                message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: `text-xs ${message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`,
                    children: message.text
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
                    lineNumber: 143,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
            lineNumber: 100,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx",
        lineNumber: 99,
        columnNumber: 5
    }, this);
}
_s(CacheSettingsTab, "M4uCRMB+b538bm8JIwGTf/8sQR8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = CacheSettingsTab;
var _c;
__turbopack_context__.k.register(_c, "CacheSettingsTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/settings/cache/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SettingsCachePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$settings$2f$components$2f$CacheSettingsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/settings/components/CacheSettingsTab.tsx [app-client] (ecmascript)");
"use client";
;
;
function SettingsCachePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$settings$2f$components$2f$CacheSettingsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/settings/cache/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = SettingsCachePage;
var _c;
__turbopack_context__.k.register(_c, "SettingsCachePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_%28dashboard%29_dashboard_settings_10cetkf._.js.map