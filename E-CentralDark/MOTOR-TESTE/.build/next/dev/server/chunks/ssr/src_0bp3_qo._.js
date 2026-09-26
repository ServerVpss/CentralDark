module.exports = [
"[project]/src/shared/components/compression/EngineConfigForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EngineConfigForm",
    ()=>EngineConfigForm,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function EngineConfigForm({ schema, value, onChange }) {
    const set = (k, v)=>onChange({
            ...value,
            [k]: v
        });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3",
        children: schema.map((f)=>{
            const v = value[f.key] ?? f.defaultValue;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex flex-col gap-1 text-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-medium",
                        children: f.label
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigForm.tsx",
                        lineNumber: 18,
                        columnNumber: 13
                    }, this),
                    f.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-text-muted",
                        children: f.description
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigForm.tsx",
                        lineNumber: 19,
                        columnNumber: 31
                    }, this),
                    f.type === "boolean" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        checked: !!v,
                        onChange: (e)=>set(f.key, e.target.checked)
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigForm.tsx",
                        lineNumber: 21,
                        columnNumber: 15
                    }, this),
                    f.type === "number" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "number",
                        value: v,
                        min: f.min,
                        max: f.max,
                        onChange: (e)=>set(f.key, Number(e.target.value)),
                        className: "border border-border rounded px-2 py-1"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigForm.tsx",
                        lineNumber: 24,
                        columnNumber: 15
                    }, this),
                    f.type === "string" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: v ?? "",
                        onChange: (e)=>set(f.key, e.target.value),
                        className: "border border-border rounded px-2 py-1"
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigForm.tsx",
                        lineNumber: 34,
                        columnNumber: 15
                    }, this),
                    f.type === "select" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: v,
                        onChange: (e)=>set(f.key, e.target.value),
                        className: "border border-border rounded px-2 py-1",
                        children: (f.options ?? []).map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: o.value,
                                children: o.label
                            }, o.value, false, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigForm.tsx",
                                lineNumber: 48,
                                columnNumber: 19
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigForm.tsx",
                        lineNumber: 42,
                        columnNumber: 15
                    }, this),
                    f.type === "multiselect" && (f.options ?? []).map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex items-center gap-2 text-xs",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: Array.isArray(v) && v.includes(o.value),
                                    onChange: (e)=>{
                                        const arr = Array.isArray(v) ? [
                                            ...v
                                        ] : [];
                                        set(f.key, e.target.checked ? [
                                            ...arr,
                                            o.value
                                        ] : arr.filter((x)=>x !== o.value));
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/compression/EngineConfigForm.tsx",
                                    lineNumber: 57,
                                    columnNumber: 19
                                }, this),
                                o.label
                            ]
                        }, o.value, true, {
                            fileName: "[project]/src/shared/components/compression/EngineConfigForm.tsx",
                            lineNumber: 56,
                            columnNumber: 17
                        }, this))
                ]
            }, f.key, true, {
                fileName: "[project]/src/shared/components/compression/EngineConfigForm.tsx",
                lineNumber: 17,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/shared/components/compression/EngineConfigForm.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = EngineConfigForm;
}),
"[project]/src/shared/components/compression/EngineConfigPage.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EngineConfigPage",
    ()=>EngineConfigPage,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$compression$2f$EngineConfigForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/compression/EngineConfigForm.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
// Engines whose detailed config has a dedicated sub-object in the compression
// settings store. The on/off + level for ALL engines now live in the panel
// (/dashboard/context/settings, the `engines` map); only these have a place to
// persist the extra per-engine fields edited on this page. session-dedup and ccr
// joined headroom in #8388 (they previously rendered a real, editable detail form
// with no Save affordance — edits vanished on reload). Other structural engines
// (lite, llmlingua, relevance) still have no dedicated sub-object — their page
// keeps the detail form + preview but has nothing extra to persist yet.
const SETTINGS_SUBOBJECT = {
    aggressive: "aggressive",
    ultra: "ultra",
    headroom: "headroom",
    "session-dedup": "sessionDedup",
    ccr: "ccr"
};
// ── Default preview sample ────────────────────────────────────────────────
const ENGINE_ICON_ALIASES = {
    brain: "psychology"
};
// ── Sub-components ────────────────────────────────────────────────────────
function StatCard({ label, value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-0.5 rounded-lg border border-border bg-surface p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-text-muted",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-lg font-semibold text-text",
                children: value
            }, void 0, false, {
                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
function renderDiffSegment(segment, index, translateLabel) {
    const label = segment.type ?? "change";
    const text = segment.value ?? segment.text ?? segment.content ?? [
        segment.original ?? segment.before,
        segment.compressed ?? segment.after
    ].filter(Boolean).join(" → ") ?? "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded border border-border bg-background p-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "mr-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted",
                children: translateLabel(label)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "whitespace-pre-wrap break-words text-text",
                children: text
            }, void 0, false, {
                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this)
        ]
    }, `${label}-${index}`, true, {
        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
        lineNumber: 103,
        columnNumber: 5
    }, this);
}
function EngineConfigPage({ engineId }) {
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLocale"])();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("compressionEngineConfig");
    // ── Data state ──────────────────────────────────────────────────────────
    const [engine, setEngine] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [configState, setConfigState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [analytics, setAnalytics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // ── Preview state ───────────────────────────────────────────────────────
    const [previewText, setPreviewText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>t("previewSample"));
    const [preview, setPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [previewError, setPreviewError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [previewLoading, setPreviewLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Action state ────────────────────────────────────────────────────────
    const [saveError, setSaveError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Initial load ────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        async function load() {
            setLoading(true);
            setLoadError(null);
            // Fire the three independent reads in parallel — load time is the slowest
            // single request, not their sum. Each resolves to null on failure (fail-soft).
            const asJson = (r)=>r.ok ? r.json() : null;
            const [enginesData, settingsData, analyticsData] = await Promise.all([
                fetch("/api/compression/engines").then(asJson).catch(()=>null),
                fetch("/api/settings/compression").then(asJson).catch(()=>null),
                fetch(`/api/context/analytics/engine?engineId=${engineId}&days=7`).then(asJson).catch(()=>null)
            ]);
            let foundEngine = null;
            if (enginesData) {
                foundEngine = enginesData.engines?.find((e)=>e.id === engineId) ?? null;
            } else {
                setLoadError(t("loadFailed"));
            }
            // Detailed config lives in the engine's settings sub-object (when it has one);
            // the on/off + level moved to the panel. 404/null/missing = schema defaults.
            const subKey = SETTINGS_SUBOBJECT[engineId];
            const stored = subKey ? settingsData?.[subKey] : undefined;
            const currentConfig = stored && typeof stored === "object" ? stored : {};
            if (!cancelled) {
                if (analyticsData) setAnalytics(analyticsData);
                setEngine(foundEngine);
                // Seed configState from defaultValues then override with the stored sub-object.
                const defaults = {};
                for (const field of foundEngine?.configSchema ?? []){
                    defaults[field.key] = field.defaultValue;
                }
                setConfigState({
                    ...defaults,
                    ...currentConfig
                });
                setLoading(false);
            }
        }
        void load();
        return ()=>{
            cancelled = true;
        };
    }, [
        engineId,
        t
    ]);
    // ── Handlers ─────────────────────────────────────────────────────────────
    // Persist the engine's DETAILED config to its settings sub-object. The on/off +
    // level are owned by the panel (the `engines` map) and are NOT written here — so
    // this page never touches the deprecated /api/context/combos/default route.
    async function handleSave() {
        const subKey = SETTINGS_SUBOBJECT[engineId];
        if (!subKey) {
            // Structural engines have no detail store yet — nothing to persist this phase.
            setSaveError(null);
            return;
        }
        // Strip the `enabled` key — engine on/off is the panel's responsibility.
        const { enabled: _ignored, ...detail } = configState;
        void _ignored;
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch("/api/settings/compression", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    [subKey]: detail
                })
            });
            if (!res.ok) {
                setSaveError(t("saveFailed"));
            }
        } catch  {
            setSaveError(t("saveFailed"));
        } finally{
            setSaving(false);
        }
    }
    async function handlePreview() {
        setPreviewLoading(true);
        setPreviewError(null);
        setPreview(null);
        try {
            // Pass the form's current detail (e.g. headroom.minRows) so preview honors
            // unsaved edits and the persisted sub-object after save (#8056).
            const detailConfig = engineId === "headroom" ? {
                headroom: {
                    ...typeof configState.minRows === "number" ? {
                        minRows: configState.minRows
                    } : {}
                }
            } : engineId === "aggressive" ? {
                aggressive: {
                    ...configState
                }
            } : engineId === "ultra" ? {
                ultra: {
                    ...configState
                }
            } : undefined;
            const res = await fetch("/api/compression/preview", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    engineId,
                    messages: [
                        {
                            role: "user",
                            content: previewText
                        }
                    ],
                    ...detailConfig ? {
                        config: detailConfig
                    } : {}
                })
            });
            if (res.ok) {
                const data = await res.json();
                setPreview(data);
            } else {
                setPreviewError(t("previewFailed"));
            }
        } catch  {
            setPreviewError(t("previewFailed"));
        } finally{
            setPreviewLoading(false);
        }
    }
    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center p-12 text-text-muted text-sm",
            children: t("loading")
        }, void 0, false, {
            fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
            lineNumber: 270,
            columnNumber: 7
        }, this);
    }
    if (!engine) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-6 text-sm text-text-muted",
            children: loadError ?? t("engineNotFound", {
                engine: engineId
            })
        }, void 0, false, {
            fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
            lineNumber: 278,
            columnNumber: 7
        }, this);
    }
    const engineNameKey = `engines.${engineId}.name`;
    const engineDescriptionKey = `engines.${engineId}.description`;
    const engineName = t.has(engineNameKey) ? t(engineNameKey) : engine.name;
    const rawSubtitle = engine.metadata?.description ?? engine.description;
    const subtitle = t.has(engineDescriptionKey) ? t(engineDescriptionKey) : rawSubtitle;
    const visibleConfigSchema = engine.configSchema.filter((field)=>field.key !== "enabled").map((field)=>{
        const engineFieldPrefix = `engineFields.${engineId}.${field.key}`;
        const fieldPrefix = `fields.${field.key}`;
        const labelKey = t.has(`${engineFieldPrefix}.label`) ? `${engineFieldPrefix}.label` : `${fieldPrefix}.label`;
        const descriptionKey = t.has(`${engineFieldPrefix}.description`) ? `${engineFieldPrefix}.description` : `${fieldPrefix}.description`;
        return {
            ...field,
            label: t.has(labelKey) ? t(labelKey) : field.label,
            description: field.description && t.has(descriptionKey) ? t(descriptionKey) : field.description,
            options: field.options?.map((option)=>{
                const optionKey = `options.${field.key}.${option.value}`;
                return {
                    ...option,
                    label: t.has(optionKey) ? t(optionKey) : option.label
                };
            })
        };
    });
    // Only engines with a dedicated settings sub-object can persist their detail here.
    const persistable = Boolean(SETTINGS_SUBOBJECT[engineId]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-6 p-6 max-w-3xl",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            engine.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[28px] leading-none text-text-muted",
                                "aria-hidden": "true",
                                children: ENGINE_ICON_ALIASES[engine.icon] || engine.icon
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                lineNumber: 321,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold text-text",
                                children: engineName
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                lineNumber: 328,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 319,
                        columnNumber: 9
                    }, this),
                    subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted",
                        children: subtitle
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 330,
                        columnNumber: 22
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                lineNumber: 318,
                columnNumber: 7
            }, this),
            loadError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-destructive border border-destructive/30 rounded px-3 py-2",
                children: loadError
            }, void 0, false, {
                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                lineNumber: 334,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1 rounded-lg border border-border bg-surface p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-text-muted",
                    "data-testid": "panel-pointer-notice",
                    children: [
                        t("panelPointerPrefix"),
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "/dashboard/context/settings",
                            className: "underline hover:text-text",
                            children: t("compressionSettings")
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                            lineNumber: 343,
                            columnNumber: 11
                        }, this),
                        t("panelPointerSuffix")
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                    lineNumber: 341,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                lineNumber: 340,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 rounded-lg border border-border bg-surface p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-text",
                        children: t("configuration")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 352,
                        columnNumber: 9
                    }, this),
                    visibleConfigSchema.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$compression$2f$EngineConfigForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EngineConfigForm"], {
                        schema: visibleConfigSchema,
                        value: configState,
                        onChange: setConfigState
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 354,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted",
                        children: t("noAdditionalConfiguration")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 360,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 pt-1",
                        children: [
                            persistable ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSave,
                                disabled: saving,
                                className: "px-4 py-1.5 rounded bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50",
                                children: saving ? t("saving") : t("save")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                lineNumber: 364,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted",
                                "data-testid": "no-detail-store-notice",
                                children: t("globalSettingsOnly")
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                lineNumber: 372,
                                columnNumber: 13
                            }, this),
                            saveError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-destructive",
                                children: saveError
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                lineNumber: 376,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 362,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                lineNumber: 351,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 rounded-lg border border-border bg-surface p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-text",
                        children: t("preview")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 382,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        className: "border border-border rounded px-3 py-2 text-sm text-text bg-background resize-y min-h-[80px]",
                        value: previewText,
                        onChange: (e)=>setPreviewText(e.target.value),
                        "aria-label": t("previewInput")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 383,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handlePreview,
                            disabled: previewLoading,
                            className: "px-4 py-1.5 rounded bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50",
                            children: previewLoading ? t("processing") : t("preview")
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                            lineNumber: 390,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 389,
                        columnNumber: 9
                    }, this),
                    previewError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-destructive",
                        children: previewError
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 398,
                        columnNumber: 26
                    }, this),
                    preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-3 pt-1 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-text-muted",
                                        children: [
                                            t("originalTokens"),
                                            ":",
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                className: "text-text",
                                                children: preview.originalTokens
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                                lineNumber: 404,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                        lineNumber: 402,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-text-muted",
                                        children: [
                                            t("compressedTokens"),
                                            ":",
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                className: "text-text",
                                                children: preview.compressedTokens
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                                lineNumber: 408,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                        lineNumber: 406,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-text-muted",
                                        children: [
                                            t("savings"),
                                            ":",
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                className: "text-primary",
                                                children: [
                                                    preview.savingsPct.toFixed(1),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                                lineNumber: 412,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                        lineNumber: 410,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                lineNumber: 401,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid gap-3 md:grid-cols-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xs font-semibold uppercase tracking-wide text-text-muted",
                                                children: t("original")
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                                lineNumber: 417,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                className: "max-h-72 overflow-auto rounded border border-border bg-background p-3 whitespace-pre-wrap break-words text-text",
                                                children: preview.original ?? ""
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                                lineNumber: 420,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                        lineNumber: 416,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xs font-semibold uppercase tracking-wide text-text-muted",
                                                children: t("compressed")
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                                lineNumber: 425,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                className: "max-h-72 overflow-auto rounded border border-border bg-background p-3 whitespace-pre-wrap break-words text-text",
                                                children: preview.compressed ?? ""
                                            }, void 0, false, {
                                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                                lineNumber: 428,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                        lineNumber: 424,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                lineNumber: 415,
                                columnNumber: 13
                            }, this),
                            preview.diff && preview.diff.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2",
                                "data-testid": "compression-preview-diff",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-semibold uppercase tracking-wide text-text-muted",
                                        children: t("diff")
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                        lineNumber: 435,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex max-h-72 flex-col gap-2 overflow-auto rounded border border-border p-2",
                                        children: preview.diff.map((segment, index)=>renderDiffSegment(segment, index, (label)=>{
                                                const key = `diffLabels.${label}`;
                                                return t.has(key) ? t(key) : label;
                                            }))
                                    }, void 0, false, {
                                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                        lineNumber: 438,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                lineNumber: 434,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 400,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                lineNumber: 381,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 rounded-lg border border-border bg-surface p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-text",
                        children: t("last7Days")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 454,
                        columnNumber: 9
                    }, this),
                    analytics && analytics.runs === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted",
                        children: t("noDataYet")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 456,
                        columnNumber: 11
                    }, this) : analytics ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-3 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: t("runs"),
                                value: analytics.runs.toLocaleString(locale)
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                lineNumber: 459,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: t("tokensSaved"),
                                value: analytics.tokensSaved.toLocaleString(locale)
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                lineNumber: 460,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: t("averageSavings"),
                                value: `${analytics.avgSavingsPercent.toFixed(1)}%`
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                                lineNumber: 464,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 458,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-text-muted",
                        children: t("noDataYet")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                        lineNumber: 470,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
                lineNumber: 453,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/compression/EngineConfigPage.tsx",
        lineNumber: 316,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = EngineConfigPage;
}),
"[project]/src/app/(dashboard)/dashboard/context/session-dedup/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SessionDedupPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$compression$2f$EngineConfigPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/compression/EngineConfigPage.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function SessionDedupPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$compression$2f$EngineConfigPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EngineConfigPage"], {
        engineId: "session-dedup"
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/context/session-dedup/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=src_0bp3_qo._.js.map