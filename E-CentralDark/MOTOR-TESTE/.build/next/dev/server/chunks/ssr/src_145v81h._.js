module.exports = [
"[project]/src/shared/components/Tooltip.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Tooltip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function Tooltip({ children, content, position = "top", className = "", delayMs = 200, usePortal = true, multiline = false }) {
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const tooltipId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    const timeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const tooltipRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const show = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(()=>setVisible(true), delayMs);
    }, [
        delayMs
    ]);
    const hide = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        clearTimeout(timeoutRef.current);
        setVisible(false);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            clearTimeout(timeoutRef.current);
        };
    }, []);
    // Position the portal-rendered tooltip relative to the trigger by writing
    // directly to the DOM ref instead of round-tripping through React state.
    // Touching .style here is the canonical React-portal positioning pattern
    // and avoids the cascading-render warning we'd get from setCoords inside
    // a layout effect.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        if (!visible || !usePortal) return;
        const wrap = wrapperRef.current;
        const tt = tooltipRef.current;
        if (!wrap || !tt) return;
        const rect = wrap.getBoundingClientRect();
        const tRect = tt.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        let top = 0;
        let left = 0;
        switch(position){
            case "bottom":
                top = rect.bottom + scrollY + 8;
                left = rect.left + scrollX + rect.width / 2 - tRect.width / 2;
                break;
            case "left":
                top = rect.top + scrollY + rect.height / 2 - tRect.height / 2;
                left = rect.left + scrollX - tRect.width - 8;
                break;
            case "right":
                top = rect.top + scrollY + rect.height / 2 - tRect.height / 2;
                left = rect.right + scrollX + 8;
                break;
            case "top":
            default:
                top = rect.top + scrollY - tRect.height - 8;
                left = rect.left + scrollX + rect.width / 2 - tRect.width / 2;
                break;
        }
        // Clamp horizontally inside the viewport so a trigger near the right
        // edge does not produce a tooltip that bleeds off the screen.
        const margin = 8;
        const maxLeft = window.innerWidth + scrollX - tRect.width - margin;
        const minLeft = scrollX + margin;
        if (left > maxLeft) left = maxLeft;
        if (left < minLeft) left = minLeft;
        tt.style.top = `${top}px`;
        tt.style.left = `${left}px`;
        tt.style.visibility = "visible";
    }, [
        visible,
        usePortal,
        position,
        content
    ]);
    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2"
    };
    const describedById = content ? tooltipId : undefined;
    const trigger = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"])(children) ? (()=>{
        const child = children;
        const existingDescribedBy = child.props["aria-describedby"];
        const mergedDescribedBy = [
            existingDescribedBy,
            describedById
        ].filter(Boolean).join(" ");
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"])(child, {
            "aria-describedby": mergedDescribedBy || undefined
        });
    })() : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        tabIndex: 0,
        "aria-describedby": describedById,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/shared/components/Tooltip.tsx",
        lineNumber: 146,
        columnNumber: 5
    }, this);
    const widthClass = multiline ? "max-w-xs whitespace-normal break-words" : "whitespace-nowrap";
    const baseTooltipClass = "z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900/95 rounded-md shadow-lg pointer-events-none animate-in fade-in duration-150 motion-reduce:transition-none motion-reduce:animate-none border border-white/10";
    const portalEnabled = usePortal && ("TURBOPACK compile-time value", "undefined") !== "undefined";
    const tooltipEl = visible && content ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        ref: tooltipRef,
        id: tooltipId,
        role: "tooltip",
        className: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : `absolute ${baseTooltipClass} ${widthClass} ${positionClasses[position] || positionClasses.top}`,
        // For portal-rendered tooltips, mount off-screen + hidden so the
        // layout effect can measure dimensions before the user sees a flash.
        // The useLayoutEffect above promotes visibility once coords are set.
        style: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : undefined,
        children: content
    }, void 0, false, {
        fileName: "[project]/src/shared/components/Tooltip.tsx",
        lineNumber: 159,
        columnNumber: 7
    }, this) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        ref: wrapperRef,
        className: `relative inline-flex ${className}`,
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
        onKeyDown: (event)=>{
            if (event.key === "Escape") hide();
        },
        children: [
            trigger,
            ("TURBOPACK compile-time falsy", 0) ? /*#__PURE__*/ "TURBOPACK unreachable" : tooltipEl
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/Tooltip.tsx",
        lineNumber: 178,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/shared/components/compression/ComboCompressionModeSelect.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ComboCompressionModeSelect",
    ()=>ComboCompressionModeSelect,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const OPTIONS = [
    {
        value: "",
        label: "Default"
    },
    {
        value: "off",
        label: "Off"
    },
    {
        value: "lite",
        label: "Lite"
    },
    {
        value: "standard",
        label: "Standard"
    },
    {
        value: "aggressive",
        label: "Aggressive"
    },
    {
        value: "ultra",
        label: "Ultra"
    },
    {
        value: "codex-responses",
        label: "Responses tool output"
    }
];
function getInitialCompressionMode(combo) {
    const hasRuntimeConfig = combo?.config && typeof combo.config === "object";
    if (typeof combo?.config?.compressionMode === "string") {
        return combo.config.compressionMode;
    }
    return hasRuntimeConfig ? "" : combo.compressionOverride || "";
}
function ComboCompressionModeSelect({ combo, disabled, title, className, onSaved }) {
    const initialCompressionMode = getInitialCompressionMode(combo);
    const [compressionOverride, setCompressionOverride] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialCompressionMode);
    const [isSaving, setIsSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setCompressionOverride(initialCompressionMode);
    }, [
        initialCompressionMode
    ]);
    const handleChange = async (value)=>{
        setCompressionOverride(value);
        setIsSaving(true);
        const nextConfig = {
            ...combo.config || {}
        };
        if (value) {
            nextConfig.compressionMode = value;
        } else {
            delete nextConfig.compressionMode;
        }
        try {
            const response = await fetch(`/api/combos/${combo.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    config: nextConfig
                })
            });
            if (!response.ok) {
                console.error("Failed to update compression override");
                setCompressionOverride(initialCompressionMode);
                return;
            }
            onSaved?.(nextConfig);
        } catch (error) {
            console.error("Error updating compression override:", error);
            setCompressionOverride(initialCompressionMode);
        } finally{
            setIsSaving(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
        value: compressionOverride,
        onChange: (e)=>handleChange(e.target.value),
        disabled: disabled || isSaving,
        className: className || "text-xs py-1 px-2 rounded border border-black/10 dark:border-white/10 bg-surface text-text-main focus:border-primary focus:outline-none transition-colors disabled:opacity-50",
        title: title,
        children: OPTIONS.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                value: option.value,
                className: "bg-surface text-text-main",
                children: option.label
            }, option.value, false, {
                fileName: "[project]/src/shared/components/compression/ComboCompressionModeSelect.tsx",
                lineNumber: 101,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/shared/components/compression/ComboCompressionModeSelect.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = ComboCompressionModeSelect;
}),
"[project]/src/app/(dashboard)/dashboard/combos/FieldLabelWithHelp.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FieldLabelWithHelp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Tooltip.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function FieldLabelWithHelp({ label, help, showHelp = true, htmlFor }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-1 mb-0.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: htmlFor,
                className: "text-[10px] text-text-muted",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/FieldLabelWithHelp.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            showHelp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                position: "bottom",
                content: help,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[12px] text-text-muted cursor-help",
                    children: "help"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/FieldLabelWithHelp.tsx",
                    lineNumber: 25,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/FieldLabelWithHelp.tsx",
                lineNumber: 24,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/FieldLabelWithHelp.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WeightTotalBar,
    "effectiveSharePercent",
    ()=>effectiveSharePercent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
"use client";
;
;
const WEIGHT_COLORS = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-indigo-500"
];
function effectiveSharePercent(weight, total) {
    if (!weight || weight <= 0) return 0;
    if (!total || total <= 0) return 0;
    return weight / total * 100;
}
function WeightTotalBar({ models }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    const total = models.reduce((sum, m)=>sum + (m.weight || 0), 0);
    const isValid = total === 100;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-1.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden flex",
                children: models.map((m, i)=>{
                    if (!m.weight) return null;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${WEIGHT_COLORS[i % WEIGHT_COLORS.length]} transition-all duration-300`,
                        style: {
                            width: `${Math.min(m.weight, 100)}%`
                        }
                    }, i, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx",
                        lineNumber: 51,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mt-0.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1",
                        children: models.map((m, i)=>m.weight > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-0.5 text-[9px] text-text-muted",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `inline-block w-1.5 h-1.5 rounded-full ${WEIGHT_COLORS[i % WEIGHT_COLORS.length]}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx",
                                        lineNumber: 65,
                                        columnNumber: 19
                                    }, this),
                                    m.weight,
                                    "%",
                                    total > 0 && total !== 100 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-text-muted/70",
                                        title: t("effectiveRoutingShare"),
                                        children: [
                                            " → ",
                                            Math.round(effectiveSharePercent(m.weight, total)),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx",
                                        lineNumber: 71,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx",
                                lineNumber: 64,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `text-[10px] font-medium ${isValid ? "text-emerald-500" : total > 100 ? "text-red-500" : "text-amber-500"}`,
                        children: [
                            total,
                            "%",
                            !isValid && total > 0 && " ≠ 100%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/combos/parts.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/FieldLabelWithHelp.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$WeightTotalBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx [app-ssr] (ecmascript)");
;
;
}),
"[project]/src/app/(dashboard)/dashboard/combos/FieldLabelWithHelp.tsx [app-ssr] (ecmascript) <export default as FieldLabelWithHelp>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FieldLabelWithHelp",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/FieldLabelWithHelp.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx [app-ssr] (ecmascript) <export default as WeightTotalBar>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WeightTotalBar",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$WeightTotalBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$WeightTotalBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/app/(dashboard)/dashboard/combos/useComboProxyAssignments.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseComboProxyAssignmentIds",
    ()=>parseComboProxyAssignmentIds,
    "useComboProxyAssignments",
    ()=>useComboProxyAssignments
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
function parseComboProxyAssignmentIds(data) {
    const items = data?.items;
    if (!Array.isArray(items)) return [];
    return items.filter((entry)=>!!entry?.scopeId && !!entry?.proxyId).map((entry)=>entry.scopeId);
}
function useComboProxyAssignments() {
    const [comboProxyAssignedIds, setComboProxyAssignedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const fetchComboProxyAssignments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        fetch("/api/settings/proxies/assignments?scope=combo").then((r)=>r.ok ? r.json() : null).then((data)=>setComboProxyAssignedIds(new Set(parseComboProxyAssignmentIds(data)))).catch(()=>{});
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchComboProxyAssignments();
    }, [
        fetchComboProxyAssignments
    ]);
    return {
        comboProxyAssignedIds,
        fetchComboProxyAssignments
    };
}
}),
"[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ResponseValidationEditor",
    ()=>ResponseValidationEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function tr(t, key, fallback) {
    if (!t) return fallback;
    try {
        const v = t(key);
        return v && v !== key ? v : fallback;
    } catch  {
        return fallback;
    }
}
const linesToArray = (text)=>text.split("\n").map((s)=>s.trim()).filter(Boolean);
const arrayToLines = (arr)=>(arr ?? []).join("\n");
const INPUT_CLASS = "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none";
const LABEL_CLASS = "text-[11px] font-medium text-text-muted block mb-0.5";
const CONDITIONS = [
    "exists",
    "nonEmpty",
    "equals",
    "notEquals"
];
function ResponseValidationEditor({ value, onChange, t }) {
    const v = value && typeof value === "object" ? value : {};
    const emit = (draft)=>{
        const cleaned = {};
        if (draft.forbiddenSubstrings && draft.forbiddenSubstrings.length) cleaned.forbiddenSubstrings = draft.forbiddenSubstrings;
        if (draft.requiredSubstrings && draft.requiredSubstrings.length) cleaned.requiredSubstrings = draft.requiredSubstrings;
        if (typeof draft.minContentLength === "number" && draft.minContentLength > 0) cleaned.minContentLength = draft.minContentLength;
        if (draft.jsonPathPredicates && draft.jsonPathPredicates.length) cleaned.jsonPathPredicates = draft.jsonPathPredicates;
        onChange(Object.keys(cleaned).length ? cleaned : undefined);
    };
    const predicates = v.jsonPathPredicates ?? [];
    const updatePredicate = (index, patch)=>{
        const next = predicates.map((p, i)=>i === index ? {
                ...p,
                ...patch
            } : p);
        emit({
            ...v,
            jsonPathPredicates: next
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-2",
        "data-testid": "response-validation-editor",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[10px] text-text-muted",
                children: tr(t, "responseValidationHelp", "Fail over to the next target when a 200 OK body fails these checks (assistant content).")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: LABEL_CLASS,
                        children: tr(t, "responseValidationForbidden", "Forbidden substrings (one per line)")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        rows: 2,
                        value: arrayToLines(v.forbiddenSubstrings),
                        onChange: (e)=>emit({
                                ...v,
                                forbiddenSubstrings: linesToArray(e.target.value)
                            }),
                        placeholder: "I cannot help\nas an AI",
                        "data-testid": "rv-forbidden",
                        className: INPUT_CLASS + " font-mono"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: LABEL_CLASS,
                        children: tr(t, "responseValidationRequired", "Required substrings (one per line)")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        rows: 2,
                        value: arrayToLines(v.requiredSubstrings),
                        onChange: (e)=>emit({
                                ...v,
                                requiredSubstrings: linesToArray(e.target.value)
                            }),
                        "data-testid": "rv-required",
                        className: INPUT_CLASS + " font-mono"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: LABEL_CLASS,
                        children: tr(t, "responseValidationMinLength", "Minimum content length (chars)")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "number",
                        min: 0,
                        value: typeof v.minContentLength === "number" ? v.minContentLength : "",
                        onChange: (e)=>{
                            const n = parseInt(e.target.value, 10);
                            emit({
                                ...v,
                                minContentLength: Number.isFinite(n) && n > 0 ? n : undefined
                            });
                        },
                        "data-testid": "rv-min-length",
                        className: INPUT_CLASS
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: LABEL_CLASS,
                        children: tr(t, "responseValidationJsonPaths", "JSON-path checks")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1.5",
                        children: [
                            predicates.map((predicate, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-1.5",
                                    "data-testid": "rv-predicate-row",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: predicate.path,
                                            onChange: (e)=>updatePredicate(index, {
                                                    path: e.target.value
                                                }),
                                            placeholder: "choices[0].message.content",
                                            "data-testid": "rv-predicate-path",
                                            className: INPUT_CLASS + " font-mono flex-1 min-w-[140px]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                                            lineNumber: 138,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: predicate.condition,
                                            onChange: (e)=>updatePredicate(index, {
                                                    condition: e.target.value
                                                }),
                                            "data-testid": "rv-predicate-condition",
                                            className: INPUT_CLASS + " w-auto",
                                            children: CONDITIONS.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: c,
                                                    children: c
                                                }, c, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                                                    lineNumber: 155,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                                            lineNumber: 146,
                                            columnNumber: 15
                                        }, this),
                                        (predicate.condition === "equals" || predicate.condition === "notEquals") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: predicate.value === undefined ? "" : String(predicate.value),
                                            onChange: (e)=>updatePredicate(index, {
                                                    value: e.target.value
                                                }),
                                            placeholder: "value",
                                            "data-testid": "rv-predicate-value",
                                            className: INPUT_CLASS + " w-auto"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                                            lineNumber: 161,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>emit({
                                                    ...v,
                                                    jsonPathPredicates: predicates.filter((_, i)=>i !== index)
                                                }),
                                            "data-testid": "rv-predicate-remove",
                                            className: "text-[10px] px-1.5 py-1 rounded border border-black/10 dark:border-white/10 text-text-muted hover:text-red-500",
                                            children: "✕"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                                            lineNumber: 170,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                                    lineNumber: 137,
                                    columnNumber: 13
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>emit({
                                        ...v,
                                        jsonPathPredicates: [
                                            ...predicates,
                                            {
                                                path: "",
                                                condition: "exists"
                                            }
                                        ]
                                    }),
                                "data-testid": "rv-predicate-add",
                                className: "self-start text-[10px] px-2 py-1 rounded border border-black/10 dark:border-white/10 text-text-muted hover:text-primary",
                                children: tr(t, "responseValidationAddCheck", "+ Add check")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                                lineNumber: 182,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(dashboard)/dashboard/combos/ReasoningTokenBufferToggle.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReasoningTokenBufferToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Tooltip.tsx [app-ssr] (ecmascript)");
;
;
function getI18nOrFallback(t, key, fallback) {
    try {
        if (typeof t.has === "function" && t.has(key)) return t(key);
    } catch  {}
    return fallback;
}
function ReasoningTokenBufferToggle({ config, setConfig, t }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2 py-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "checkbox",
                id: "reasoningTokenBufferEnabled",
                "data-testid": "combo-reasoning-token-buffer-enabled",
                checked: config.reasoningTokenBufferEnabled !== false,
                onChange: (e)=>setConfig({
                        ...config,
                        reasoningTokenBufferEnabled: e.target.checked
                    }),
                className: "w-3.5 h-3.5 rounded border border-black/20 dark:border-white/20 accent-primary cursor-pointer"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/ReasoningTokenBufferToggle.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "reasoningTokenBufferEnabled",
                className: "text-xs text-text-muted cursor-pointer select-none",
                children: getI18nOrFallback(t, "reasoningTokenBuffer", "Reasoning token buffer")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/ReasoningTokenBufferToggle.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                position: "bottom",
                content: getI18nOrFallback(t, "advancedHelp.reasoningTokenBuffer", "When enabled (default), OmniRoute may increase max_tokens for reasoning-capable models so they have headroom to think. Turn this off if you need this combo to preserve the client's exact max_tokens."),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[12px] text-text-muted cursor-help",
                    children: "help"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/ReasoningTokenBufferToggle.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/ReasoningTokenBufferToggle.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/ReasoningTokenBufferToggle.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/shared/constants/routingStrategies.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ACCOUNT_FALLBACK_STRATEGY_VALUES",
    ()=>ACCOUNT_FALLBACK_STRATEGY_VALUES,
    "AUTO_ROUTING_STRATEGY_VALUES",
    ()=>AUTO_ROUTING_STRATEGY_VALUES,
    "INTERNAL_ROUTING_STRATEGY_VALUES",
    ()=>INTERNAL_ROUTING_STRATEGY_VALUES,
    "ROUTING_STRATEGIES",
    ()=>ROUTING_STRATEGIES,
    "ROUTING_STRATEGY_VALUES",
    ()=>ROUTING_STRATEGY_VALUES,
    "SETTINGS_FALLBACK_STRATEGY_VALUES",
    ()=>SETTINGS_FALLBACK_STRATEGY_VALUES,
    "normalizeRoutingStrategy",
    ()=>normalizeRoutingStrategy
]);
const ROUTING_STRATEGY_VALUES = [
    "priority",
    "weighted",
    "round-robin",
    "context-relay",
    "fill-first",
    "p2c",
    "random",
    "least-used",
    "cost-optimized",
    "reset-aware",
    "reset-window",
    "headroom",
    "strict-random",
    "auto",
    "lkgp",
    "context-optimized",
    "cache-optimized",
    "fusion",
    "pipeline"
];
const INTERNAL_ROUTING_STRATEGY_VALUES = [
    "quota-share"
];
const AUTO_ROUTING_STRATEGY_VALUES = [
    "rules",
    "cost",
    "eco",
    "latency",
    "fast",
    "sla-aware",
    "sla",
    "lkgp"
];
const ACCOUNT_FALLBACK_STRATEGY_VALUES = [
    "priority",
    "weighted",
    "fill-first",
    "round-robin",
    "p2c",
    "random",
    "least-used",
    "cost-optimized",
    "strict-random"
];
function normalizeRoutingStrategy(value) {
    if (typeof value !== "string") return "priority";
    const normalized = value.trim().toLowerCase();
    if (normalized === "usage") return "least-used";
    if (normalized === "context") return "context-optimized";
    if (normalized === "weekly-reset" || normalized === "reset-window-order") return "reset-window";
    // Internal strategies (e.g. quota-share) are preserved verbatim, never stripped
    // to "priority", so system-minted combos resolve to their dedicated dispatch.
    if (INTERNAL_ROUTING_STRATEGY_VALUES.includes(normalized)) return normalized;
    return ROUTING_STRATEGY_VALUES.includes(normalized) ? normalized : "priority";
}
const ROUTING_STRATEGIES = [
    {
        value: "priority",
        labelKey: "priority",
        combosDescKey: "priorityDesc",
        settingsDescKey: "priorityDesc",
        icon: "sort"
    },
    {
        value: "weighted",
        labelKey: "weighted",
        combosDescKey: "weightedDesc",
        settingsDescKey: "weightedDesc",
        icon: "percent"
    },
    {
        value: "round-robin",
        labelKey: "roundRobin",
        combosDescKey: "roundRobinDesc",
        settingsDescKey: "roundRobinDesc",
        icon: "autorenew"
    },
    {
        value: "context-relay",
        labelKey: "contextRelay",
        combosDescKey: "contextRelayDesc",
        settingsDescKey: "contextRelayDesc",
        icon: "sync_alt"
    },
    {
        value: "fill-first",
        labelKey: "fillFirst",
        combosDescKey: "fillFirstDesc",
        settingsDescKey: "fillFirstDesc",
        icon: "vertical_align_top"
    },
    {
        value: "p2c",
        labelKey: "p2c",
        combosDescKey: "p2cDesc",
        settingsDescKey: "p2cDesc",
        icon: "balance"
    },
    {
        value: "random",
        labelKey: "random",
        combosDescKey: "randomDesc",
        settingsDescKey: "randomDesc",
        icon: "shuffle"
    },
    {
        value: "least-used",
        labelKey: "leastUsed",
        combosDescKey: "leastUsedDesc",
        settingsDescKey: "leastUsedDesc",
        icon: "low_priority"
    },
    {
        value: "cost-optimized",
        labelKey: "costOpt",
        combosDescKey: "costOptimizedDesc",
        settingsDescKey: "costOptDesc",
        icon: "savings"
    },
    {
        value: "reset-aware",
        labelKey: "resetAware",
        combosDescKey: "resetAwareDesc",
        settingsDescKey: "resetAwareDesc",
        icon: "event_repeat"
    },
    {
        value: "reset-window",
        labelKey: "resetWindow",
        combosDescKey: "resetWindowDesc",
        settingsDescKey: "resetWindowDesc",
        icon: "schedule"
    },
    {
        value: "headroom",
        labelKey: "headroom",
        combosDescKey: "headroomDesc",
        settingsDescKey: "headroomDesc",
        icon: "battery_charging_full"
    },
    {
        value: "strict-random",
        labelKey: "strictRandom",
        combosDescKey: "strictRandomDesc",
        settingsDescKey: "strictRandomDesc",
        icon: "casino"
    },
    {
        value: "auto",
        labelKey: "auto",
        combosDescKey: "autoDesc",
        settingsDescKey: "autoDesc",
        icon: "auto_awesome"
    },
    {
        value: "lkgp",
        labelKey: "lkgp",
        combosDescKey: "lkgpDesc",
        settingsDescKey: "lkgpDesc",
        icon: "verified"
    },
    {
        value: "context-optimized",
        labelKey: "contextOpt",
        combosDescKey: "contextOptimizedDesc",
        settingsDescKey: "contextOptDesc",
        icon: "text_snippet"
    },
    {
        value: "cache-optimized",
        labelKey: "cacheOpt",
        combosDescKey: "cacheOptimizedDesc",
        settingsDescKey: "cacheOptDesc",
        icon: "cached"
    },
    {
        value: "fusion",
        labelKey: "fusion",
        combosDescKey: "fusionDesc",
        settingsDescKey: "fusionDesc",
        icon: "hub"
    },
    {
        value: "pipeline",
        labelKey: "pipeline",
        combosDescKey: "pipelineDesc",
        settingsDescKey: "pipelineDesc",
        icon: "linear_scale"
    }
];
const SETTINGS_FALLBACK_STRATEGY_VALUES = ACCOUNT_FALLBACK_STRATEGY_VALUES;
}),
"[project]/src/lib/combos/builderDraft.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COMBO_BUILDER_AUTO_CONNECTION",
    ()=>COMBO_BUILDER_AUTO_CONNECTION,
    "COMBO_BUILDER_STAGES",
    ()=>COMBO_BUILDER_STAGES,
    "buildManualComboModelStep",
    ()=>buildManualComboModelStep,
    "buildPrecisionComboModelStep",
    ()=>buildPrecisionComboModelStep,
    "canAccessComboBuilderStage",
    ()=>canAccessComboBuilderStage,
    "computeBatchAddModelSteps",
    ()=>computeBatchAddModelSteps,
    "computeBatchDeselectModelSteps",
    ()=>computeBatchDeselectModelSteps,
    "findNextSuggestedConnectionId",
    ()=>findNextSuggestedConnectionId,
    "getComboBuilderStageChecks",
    ()=>getComboBuilderStageChecks,
    "getComboBuilderStages",
    ()=>getComboBuilderStages,
    "getExactModelStepSignature",
    ()=>getExactModelStepSignature,
    "getNextComboBuilderStage",
    ()=>getNextComboBuilderStage,
    "getPreviousComboBuilderStage",
    ()=>getPreviousComboBuilderStage,
    "hasExactModelStepDuplicate",
    ()=>hasExactModelStepDuplicate,
    "isEligibleActiveConnection",
    ()=>isEligibleActiveConnection,
    "isIntelligentBuilderStrategy",
    ()=>isIntelligentBuilderStrategy,
    "parseQualifiedModel",
    ()=>parseQualifiedModel,
    "resolveComboBuilderProviderId",
    ()=>resolveComboBuilderProviderId
]);
const COMBO_BUILDER_AUTO_CONNECTION = "__auto__";
const COMBO_BUILDER_STAGES = [
    "basics",
    "steps",
    "strategy",
    "intelligent",
    "review"
];
function isIntelligentBuilderStrategy(strategy) {
    return strategy === "auto" || strategy === "lkgp";
}
function isEligibleActiveConnection(connection) {
    if (connection.isActive === false) return false;
    const testStatus = connection.testStatus;
    if (!testStatus) return true;
    return testStatus === "active" || testStatus === "success" || testStatus === "unknown";
}
function getComboBuilderStages(options = {}) {
    if (isIntelligentBuilderStrategy(options.strategy)) {
        return [
            ...COMBO_BUILDER_STAGES
        ];
    }
    return COMBO_BUILDER_STAGES.filter((stage)=>stage !== "intelligent");
}
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function toTrimmedString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function parseQualifiedModel(value) {
    const qualifiedModel = toTrimmedString(value);
    if (!qualifiedModel) return null;
    const firstSlashIndex = qualifiedModel.indexOf("/");
    if (firstSlashIndex <= 0 || firstSlashIndex >= qualifiedModel.length - 1) return null;
    return {
        providerId: qualifiedModel.slice(0, firstSlashIndex),
        modelId: qualifiedModel.slice(firstSlashIndex + 1)
    };
}
function buildPrecisionComboModelStep({ providerId, modelId, connectionId = null, connectionLabel, allowedConnectionIds = null, weight = 0 }) {
    const normalizedProviderId = toTrimmedString(providerId) || "provider";
    const normalizedModelId = toTrimmedString(modelId) || "model";
    const normalizedConnectionId = toTrimmedString(connectionId);
    const normalizedConnectionLabel = toTrimmedString(connectionLabel);
    // A pinned single connection wins over an allowlist, so only carry the allowlist
    // when the step is auto-selecting (no forced connectionId).
    const normalizedAllowed = !normalizedConnectionId && Array.isArray(allowedConnectionIds) ? Array.from(new Set(allowedConnectionIds.map((id)=>toTrimmedString(id)).filter((id)=>!!id))) : [];
    return {
        kind: "model",
        providerId: normalizedProviderId,
        model: `${normalizedProviderId}/${normalizedModelId}`,
        ...normalizedConnectionId ? {
            connectionId: normalizedConnectionId
        } : {},
        ...normalizedConnectionLabel ? {
            label: normalizedConnectionLabel
        } : {},
        ...normalizedAllowed.length > 0 ? {
            allowedConnectionIds: normalizedAllowed
        } : {},
        weight: Number.isFinite(weight) ? Math.max(0, Math.min(100, Number(weight))) : 0
    };
}
function resolveComboBuilderProviderId(providerIdOrAlias, providers = []) {
    const normalizedProviderId = toTrimmedString(providerIdOrAlias);
    if (!normalizedProviderId) return null;
    const matchedProvider = providers.find((provider)=>{
        const providerId = toTrimmedString(provider.providerId);
        const alias = toTrimmedString(provider.alias);
        const prefix = toTrimmedString(provider.prefix);
        return providerId === normalizedProviderId || alias === normalizedProviderId || prefix === normalizedProviderId;
    });
    return toTrimmedString(matchedProvider?.providerId) || null;
}
function buildManualComboModelStep({ value, providers = [], weight = 0 }) {
    const parsed = parseQualifiedModel(value);
    if (!parsed) return null;
    const providerId = resolveComboBuilderProviderId(parsed.providerId, providers);
    if (!providerId) return null;
    return buildPrecisionComboModelStep({
        providerId,
        modelId: parsed.modelId,
        weight
    });
}
function getExactModelStepSignature(entry) {
    if (!isRecord(entry) || entry.kind === "combo-ref") return null;
    const modelValue = toTrimmedString(entry.model);
    const parsed = parseQualifiedModel(modelValue);
    if (!parsed) return null;
    const normalizedProviderId = toTrimmedString(entry.providerId) || parsed.providerId;
    const normalizedConnectionId = toTrimmedString(entry.connectionId) || COMBO_BUILDER_AUTO_CONNECTION;
    return `model:${normalizedProviderId}:${parsed.modelId}:${normalizedConnectionId}`;
}
function hasExactModelStepDuplicate(entries, candidate) {
    const candidateSignature = getExactModelStepSignature(candidate);
    if (!candidateSignature) return false;
    return entries.some((entry)=>getExactModelStepSignature(entry) === candidateSignature);
}
function findNextSuggestedConnectionId(entries, providerId, modelId, connections = []) {
    for (const connection of connections){
        const connectionId = toTrimmedString(connection?.id);
        if (!connectionId) continue;
        const step = buildPrecisionComboModelStep({
            providerId,
            modelId,
            connectionId
        });
        if (!hasExactModelStepDuplicate(entries, step)) {
            return connectionId;
        }
    }
    return COMBO_BUILDER_AUTO_CONNECTION;
}
function getComboBuilderStageChecks({ name, nameError, modelsCount, hasInvalidWeightedTotal, hasCostOptimizedWithoutPricing }) {
    return {
        basics: Boolean(toTrimmedString(name)) && !toTrimmedString(nameError),
        steps: modelsCount > 0,
        strategy: !Boolean(hasInvalidWeightedTotal) && !Boolean(hasCostOptimizedWithoutPricing),
        review: false
    };
}
function canAccessComboBuilderStage(stage, checks, options = {}) {
    const availableStages = getComboBuilderStages(options);
    if (!availableStages.includes(stage)) return false;
    if (stage === "basics") return true;
    if (stage === "steps") return checks.basics;
    if (stage === "strategy") return checks.basics && checks.steps;
    if (stage === "intelligent") return checks.basics && checks.steps && checks.strategy;
    if (stage === "review") return checks.basics && checks.steps;
    return false;
}
function getNextComboBuilderStage(stage, options = {}) {
    const stages = getComboBuilderStages(options);
    const stageIndex = stages.indexOf(stage);
    if (stageIndex === -1 || stageIndex >= stages.length - 1) {
        return "review";
    }
    return stages[stageIndex + 1];
}
function getPreviousComboBuilderStage(stage, options = {}) {
    const stages = getComboBuilderStages(options);
    const stageIndex = stages.indexOf(stage);
    if (stageIndex <= 0) return "basics";
    return stages[stageIndex - 1];
}
/**
 * Resolve the providerId for one "Select all" candidate: an exact/alias/prefix
 * match in `builderProviders` wins, falling back to whatever provider prefix
 * the qualified model string itself carries. Split out of
 * `computeBatchAddModelSteps` to keep that loop under the complexity budget.
 */ function resolveBatchCandidateProviderId(model, parsedModel, builderProviders) {
    return resolveComboBuilderProviderId(model?.providerId, builderProviders) || resolveComboBuilderProviderId(parsedModel?.providerId, builderProviders) || typeof model?.providerId === "string" && model.providerId.trim() || parsedModel?.providerId || null;
}
function computeBatchAddModelSteps(models, selected, builderProviders = []) {
    if (!Array.isArray(selected) || selected.length === 0) {
        return {
            next: models,
            addedAny: false
        };
    }
    const next = [
        ...models
    ];
    let addedAny = false;
    for (const model of selected){
        const qualifiedModel = typeof model?.value === "string" ? model.value : "";
        if (!qualifiedModel) continue;
        const parsedModel = parseQualifiedModel(qualifiedModel);
        const resolvedProviderId = resolveBatchCandidateProviderId(model, parsedModel, builderProviders);
        const nextEntry = {
            model: qualifiedModel,
            ...resolvedProviderId ? {
                providerId: resolvedProviderId
            } : {},
            weight: 0
        };
        if (hasExactModelStepDuplicate(next, nextEntry)) continue;
        next.push(nextEntry);
        addedAny = true;
    }
    return {
        next,
        addedAny
    };
}
function computeBatchDeselectModelSteps(models, toRemove) {
    if (!Array.isArray(toRemove) || toRemove.length === 0) return models;
    const values = new Set(toRemove.map((model)=>typeof model?.value === "string" ? model.value : typeof model === "string" ? model : "").filter(Boolean));
    if (values.size === 0) return models;
    return models.filter((m)=>!values.has(m.model));
}
}),
"[project]/src/shared/constants/comboConfigMode.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COMBO_CONFIG_MODES",
    ()=>COMBO_CONFIG_MODES,
    "COMBO_CONFIG_MODE_SETTING_KEY",
    ()=>COMBO_CONFIG_MODE_SETTING_KEY,
    "normalizeComboConfigMode",
    ()=>normalizeComboConfigMode
]);
const COMBO_CONFIG_MODE_SETTING_KEY = "comboConfigMode";
const COMBO_CONFIG_MODES = [
    "guided",
    "expert"
];
function normalizeComboConfigMode(value) {
    return value === "expert" ? "expert" : "guided";
}
}),
"[project]/src/domain/assessment/types.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Assessment Engine Types
 *
 * Type definitions for the auto-assessment, categorization,
 * and self-healing system.
 *
 * @module domain/assessment/types
 */ // ── Model Assessment ────────────────────────────────────────────────────────
/** Assessment status for a model/provider pair */ __turbopack_context__.s([
    "AUTO_COMBO_TEMPLATES",
    ()=>AUTO_COMBO_TEMPLATES,
    "DEFAULT_ASSESSMENT_CONFIG",
    ()=>DEFAULT_ASSESSMENT_CONFIG,
    "PROBE_MAX_TOKENS",
    ()=>PROBE_MAX_TOKENS,
    "PROBE_MESSAGES",
    ()=>PROBE_MESSAGES
]);
const DEFAULT_ASSESSMENT_CONFIG = {
    quickProbeIntervalMs: 5 * 60 * 1000,
    standardProbeIntervalMs: 30 * 60 * 1000,
    deepProbeIntervalMs: 6 * 60 * 60 * 1000,
    probeTimeoutMs: 30 * 1000,
    brokenThreshold: 3,
    restoreThreshold: 2,
    maxWeightReduction: 0.5,
    minimumWeight: 5,
    selfHealEnabled: true,
    autoGenerateEnabled: true,
    skipBrokenModels: true
};
const PROBE_MESSAGES = {
    quick: [
        {
            role: "user",
            content: "ok"
        }
    ],
    standard: [
        {
            role: "user",
            content: "Write a function that adds two numbers. Reply with just the function."
        }
    ],
    deep: [
        {
            role: "user",
            content: "What is 17 * 23? Reply with just the number."
        }
    ]
};
const PROBE_MAX_TOKENS = {
    quick: 3,
    standard: 100,
    deep: 50
};
const AUTO_COMBO_TEMPLATES = [
    {
        name: "auto/best-coding",
        displayName: "Best Coding",
        categories: [
            "coding"
        ],
        tiers: [
            "premium",
            "balanced"
        ],
        strategy: "weighted",
        systemMessage: "You are an expert coding assistant. Write clean, efficient, well-documented code."
    },
    {
        name: "auto/best-reasoning",
        displayName: "Best Reasoning",
        categories: [
            "reasoning_deep",
            "reasoning"
        ],
        tiers: [
            "premium"
        ],
        strategy: "weighted",
        systemMessage: "You are a deep reasoning assistant. Think carefully step by step."
    },
    {
        name: "auto/best-fast",
        displayName: "Best Fast",
        categories: [
            "fast"
        ],
        tiers: [
            "fast",
            "balanced"
        ],
        strategy: "weighted"
    },
    {
        name: "auto/best-vision",
        displayName: "Best Vision",
        categories: [
            "vision"
        ],
        tiers: [
            "premium",
            "balanced"
        ],
        strategy: "weighted"
    },
    {
        name: "auto/best-chat",
        displayName: "Best Chat",
        categories: [
            "chat"
        ],
        tiers: [
            "balanced",
            "premium"
        ],
        strategy: "weighted"
    },
    {
        name: "auto/best-coding-fast",
        displayName: "Best Coding Fast",
        categories: [
            "coding",
            "fast"
        ],
        tiers: [
            "fast",
            "balanced"
        ],
        strategy: "weighted"
    },
    {
        name: "auto/pro-coding",
        displayName: "Pro Coding",
        categories: [
            "coding"
        ],
        tiers: [
            "premium"
        ],
        strategy: "priority",
        systemMessage: "You are an expert coding assistant. Write clean, efficient, well-documented code."
    },
    {
        name: "auto/pro-reasoning",
        displayName: "Pro Reasoning",
        categories: [
            "reasoning_deep"
        ],
        tiers: [
            "premium"
        ],
        strategy: "priority",
        systemMessage: "You are a deep reasoning assistant. Think carefully step by step."
    },
    {
        name: "auto/pro-vision",
        displayName: "Pro Vision",
        categories: [
            "vision"
        ],
        tiers: [
            "premium"
        ],
        strategy: "priority"
    },
    {
        name: "auto/pro-chat",
        displayName: "Pro Chat",
        categories: [
            "chat"
        ],
        tiers: [
            "premium"
        ],
        strategy: "priority"
    },
    {
        name: "auto/pro-fast",
        displayName: "Pro Fast",
        categories: [
            "fast"
        ],
        tiers: [
            "fast"
        ],
        strategy: "priority"
    },
    {
        name: "auto/coding",
        displayName: "Coding",
        categories: [
            "coding"
        ],
        tiers: [
            "balanced",
            "fast",
            "premium"
        ],
        strategy: "weighted"
    },
    {
        name: "auto/fast",
        displayName: "Fast",
        categories: [
            "fast"
        ],
        tiers: [
            "fast"
        ],
        strategy: "weighted"
    },
    {
        name: "auto/chat",
        displayName: "Chat",
        categories: [
            "chat"
        ],
        tiers: [
            "balanced",
            "fast"
        ],
        strategy: "weighted"
    },
    {
        name: "auto/claude-opus",
        displayName: "Claude Opus",
        categories: [
            "reasoning_deep",
            "coding",
            "reasoning"
        ],
        tiers: [
            "premium"
        ],
        strategy: "priority"
    },
    {
        name: "auto/claude-sonnet",
        displayName: "Claude Sonnet",
        categories: [
            "coding",
            "reasoning",
            "chat"
        ],
        tiers: [
            "premium",
            "balanced"
        ],
        strategy: "priority"
    },
    {
        name: "auto/best-free",
        displayName: "Best Free",
        categories: [
            "coding",
            "chat",
            "fast"
        ],
        tiers: [
            "free"
        ],
        strategy: "weighted",
        systemMessage: "You are a helpful coding assistant. Write clean, efficient code."
    }
];
}),
"[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>AutoComboCatalog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$assessment$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/assessment/types.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
function AutoComboCatalog() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        className: "p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setOpen((prev)=>!prev),
                className: "flex w-full items-start justify-between gap-3 text-left",
                "aria-expanded": open,
                "aria-label": open ? t("autoCatalogCollapse") : t("autoCatalogExpand"),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-xl text-primary",
                                        children: "auto_awesome"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                        lineNumber: 29,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-base font-bold text-text-main",
                                        children: t("autoCatalogTitle")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                        lineNumber: 30,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary",
                                        children: t("autoCatalogTemplateCount", {
                                            count: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$assessment$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AUTO_COMBO_TEMPLATES"].length
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                        lineNumber: 31,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                lineNumber: 28,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-text-muted",
                                children: t("autoCatalogDescription")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                lineNumber: 35,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-base text-text-muted",
                        children: open ? "expand_less" : "expand_more"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$assessment$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AUTO_COMBO_TEMPLATES"].map((tpl)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-lg border border-border bg-bg-subtle p-3 text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "font-mono text-sm text-text-main",
                                        children: tpl.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                        lineNumber: 50,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded bg-black/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-text-muted dark:bg-white/5",
                                        children: tpl.strategy
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                        lineNumber: 51,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                lineNumber: 49,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-[11px] font-semibold text-text-main",
                                children: tpl.displayName
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                lineNumber: 55,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex flex-wrap gap-1",
                                children: [
                                    tpl.categories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary",
                                            children: cat
                                        }, cat, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                            lineNumber: 58,
                                            columnNumber: 19
                                        }, this)),
                                    tpl.tiers.map((tier)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "rounded-full bg-black/[0.04] px-2 py-0.5 text-[10px] text-text-muted dark:bg-white/[0.04]",
                                            children: tier
                                        }, tier, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                            lineNumber: 66,
                                            columnNumber: 19
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                lineNumber: 56,
                                columnNumber: 15
                            }, this),
                            tpl.systemMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-[10px] italic text-text-muted line-clamp-2",
                                children: tpl.systemMessage
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                                lineNumber: 75,
                                columnNumber: 17
                            }, this)
                        ]
                    }, tpl.name, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                        lineNumber: 45,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
                lineNumber: 43,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/combos/KimiComboPresetCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>KimiComboPresetCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
function KimiComboPresetCard({ alreadyCreated, creating, onCreate }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    if (alreadyCreated) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
        padding: "sm",
        className: "border-2 border-[#1783FF]/70 bg-[#1783FF]/[0.04] shadow-[0_2px_10px_-4px_rgba(23,131,255,0.45)]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-wrap items-center justify-between gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex min-w-0 items-start gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#1783FF]/10",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[20px] text-[#1067CC] dark:text-[#7CB8FF]",
                                children: "bolt"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/KimiComboPresetCard.tsx",
                                lineNumber: 39,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/KimiComboPresetCard.tsx",
                            lineNumber: 38,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-semibold text-text-main",
                                    children: t("kimiPresetTitle")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/KimiComboPresetCard.tsx",
                                    lineNumber: 44,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-0.5 text-xs text-text-muted",
                                    children: t("kimiPresetDescription")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/KimiComboPresetCard.tsx",
                                    lineNumber: 45,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/KimiComboPresetCard.tsx",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/KimiComboPresetCard.tsx",
                    lineNumber: 37,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                    size: "sm",
                    icon: "add",
                    loading: creating,
                    onClick: onCreate,
                    className: "shrink-0",
                    children: t("kimiPresetCta")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/KimiComboPresetCard.tsx",
                    lineNumber: 48,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/combos/KimiComboPresetCard.tsx",
            lineNumber: 36,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/KimiComboPresetCard.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/combos/kimiComboPreset.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Kimi Coding combo preset — pure data, split out of KimiComboPresetCard.tsx
// so it can be unit-tested with node:test (no DOM/next-intl needed), mirroring
// kimiSponsorBanner.ts.
//
// There is no generic preset/template picker in the combo builder today —
// AUTO_COMBO_TEMPLATES (src/domain/assessment/types.ts, surfaced by
// AutoComboCatalog.tsx) is a different mechanism: category/tier-scored
// zero-config routing, not a named provider+model pin, so it cannot express
// "kimi-k3 primary, kimi-coding/kimi-web fallback". KimiComboPresetCard.tsx is
// the minimal idiomatic addition instead: a one-click "create" card that POSTs
// this exact payload via the same handleCreate() path as every other combo.
//
// Model ids differ per provider even for the "same" underlying model:
//  - moonshot (Moonshot API):         "kimi-k3"
//  - kimi-coding (OAuth coding plan): "k3"
//  - kimi-web (web session):          "k3"
// See open-sse/config/providers/registry/{moonshot,kimi/coding,kimi/web}.
__turbopack_context__.s([
    "KIMI_CODING_PRESET",
    ()=>KIMI_CODING_PRESET,
    "KIMI_CODING_PRESET_NAME",
    ()=>KIMI_CODING_PRESET_NAME,
    "hasKimiCodingPreset",
    ()=>hasKimiCodingPreset
]);
const KIMI_CODING_PRESET_NAME = "Kimi Coding";
const KIMI_CODING_PRESET = {
    name: KIMI_CODING_PRESET_NAME,
    strategy: "priority",
    models: [
        {
            provider: "moonshot",
            model: "kimi-k3",
            weight: 100
        },
        {
            provider: "kimi-coding",
            model: "k3",
            weight: 100
        },
        {
            provider: "kimi-web",
            model: "k3",
            weight: 100
        }
    ]
};
function hasKimiCodingPreset(combos) {
    return combos.some((combo)=>combo?.name === KIMI_CODING_PRESET_NAME);
}
}),
"[project]/src/lib/combos/intelligentRouting.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_INTELLIGENT_WEIGHTS",
    ()=>DEFAULT_INTELLIGENT_WEIGHTS,
    "FACTOR_LABELS",
    ()=>FACTOR_LABELS,
    "INTELLIGENT_ROUTING_FILTERS",
    ()=>INTELLIGENT_ROUTING_FILTERS,
    "INTELLIGENT_STRATEGIES",
    ()=>INTELLIGENT_STRATEGIES,
    "MODE_PACK_OPTIONS",
    ()=>MODE_PACK_OPTIONS,
    "ROUTER_STRATEGY_OPTIONS",
    ()=>ROUTER_STRATEGY_OPTIONS,
    "buildIntelligentProviderScores",
    ()=>buildIntelligentProviderScores,
    "filterCombosByStrategyCategory",
    ()=>filterCombosByStrategyCategory,
    "getStrategyCategory",
    ()=>getStrategyCategory,
    "isIntelligentStrategy",
    ()=>isIntelligentStrategy,
    "normalizeIntelligentRoutingConfig",
    ()=>normalizeIntelligentRoutingConfig,
    "normalizeIntelligentRoutingFilter",
    ()=>normalizeIntelligentRoutingFilter
]);
const INTELLIGENT_STRATEGIES = [
    "auto",
    "lkgp"
];
const INTELLIGENT_ROUTING_FILTERS = [
    "all",
    "intelligent",
    "deterministic"
];
const DEFAULT_INTELLIGENT_WEIGHTS = {
    quota: 0.16,
    health: 0.2,
    costInv: 0.16,
    latencyInv: 0.12,
    taskFit: 0.08,
    stability: 0.05,
    tierPriority: 0.05,
    tierAffinity: 0.05,
    specificityMatch: 0.05,
    contextAffinity: 0.08,
    cacheAffinity: 0,
    resetWindowAffinity: 0
};
const MODE_PACK_OPTIONS = [
    {
        id: "ship-fast",
        label: "Ship Fast",
        emoji: "rocket_launch"
    },
    {
        id: "cost-saver",
        label: "Cost Saver",
        emoji: "savings"
    },
    {
        id: "quality-first",
        label: "Quality First",
        emoji: "target"
    },
    {
        id: "offline-friendly",
        label: "Offline Friendly",
        emoji: "cloud_off"
    }
];
const ROUTER_STRATEGY_OPTIONS = [
    {
        id: "rules",
        label: "Rules (6-Factor Scoring)"
    },
    {
        id: "cost",
        label: "Cost Optimized"
    },
    {
        id: "latency",
        label: "Latency Optimized"
    },
    {
        id: "sla-aware",
        label: "SLA-aware"
    },
    {
        id: "lkgp",
        label: "Last Known Good Provider"
    }
];
const FACTOR_LABELS = {
    quota: "Quota",
    health: "Health",
    costInv: "Cost",
    latencyInv: "Latency",
    taskFit: "Task Fit",
    stability: "Stability",
    tierPriority: "Tier",
    tierAffinity: "Tier Affinity",
    specificityMatch: "Specificity",
    contextAffinity: "Context Affinity",
    cacheAffinity: "Cache Hit Affinity",
    resetWindowAffinity: "Reset Window"
};
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function toFiniteNumber(value) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
}
function toPositiveNumber(value) {
    const numericValue = toFiniteNumber(value);
    return numericValue !== null && numericValue > 0 ? numericValue : undefined;
}
function isIntelligentStrategy(strategy) {
    return typeof strategy === "string" && INTELLIGENT_STRATEGIES.includes(strategy);
}
function getStrategyCategory(strategy) {
    return isIntelligentStrategy(strategy) ? "intelligent" : "deterministic";
}
function normalizeIntelligentRoutingFilter(value) {
    if (typeof value === "string" && INTELLIGENT_ROUTING_FILTERS.includes(value)) {
        return value;
    }
    return "all";
}
function filterCombosByStrategyCategory(combos, filter) {
    if (filter === "all") return combos;
    return combos.filter((combo)=>getStrategyCategory(combo?.strategy) === filter);
}
function normalizeIntelligentRoutingConfig(config) {
    const configRecord = isRecord(config) ? config : {};
    const rawWeights = isRecord(configRecord.weights) ? configRecord.weights : {};
    const rawSla = isRecord(configRecord.sla) ? configRecord.sla : {};
    const slaTargetP95Ms = configRecord.slaTargetP95Ms ?? rawSla.targetP95Ms;
    const slaMaxErrorRate = toFiniteNumber(configRecord.slaMaxErrorRate ?? rawSla.maxErrorRate);
    const slaMaxCostPer1MTokens = [REDIGIDO-PRESERVACAO] ?? rawSla.maxCostPer1MTokens;
    const slaHardConstraints = configRecord.slaHardConstraints ?? rawSla.hardConstraints;
    return {
        candidatePool: Array.isArray(configRecord.candidatePool) ? configRecord.candidatePool.filter((value)=>typeof value === "string") : [],
        explorationRate: Math.min(1, Math.max(0, toFiniteNumber(configRecord.explorationRate) ?? 0.05)),
        modePack: typeof configRecord.modePack === "string" && configRecord.modePack.trim().length > 0 ? configRecord.modePack : "ship-fast",
        budgetCap: toPositiveNumber(configRecord.budgetCap),
        weights: {
            quota: toFiniteNumber(rawWeights.quota) ?? DEFAULT_INTELLIGENT_WEIGHTS.quota,
            health: toFiniteNumber(rawWeights.health) ?? DEFAULT_INTELLIGENT_WEIGHTS.health,
            costInv: toFiniteNumber(rawWeights.costInv) ?? DEFAULT_INTELLIGENT_WEIGHTS.costInv,
            latencyInv: toFiniteNumber(rawWeights.latencyInv) ?? DEFAULT_INTELLIGENT_WEIGHTS.latencyInv,
            taskFit: toFiniteNumber(rawWeights.taskFit) ?? DEFAULT_INTELLIGENT_WEIGHTS.taskFit,
            stability: toFiniteNumber(rawWeights.stability) ?? DEFAULT_INTELLIGENT_WEIGHTS.stability,
            tierPriority: toFiniteNumber(rawWeights.tierPriority) ?? DEFAULT_INTELLIGENT_WEIGHTS.tierPriority,
            tierAffinity: toFiniteNumber(rawWeights.tierAffinity) ?? DEFAULT_INTELLIGENT_WEIGHTS.tierAffinity,
            specificityMatch: toFiniteNumber(rawWeights.specificityMatch) ?? DEFAULT_INTELLIGENT_WEIGHTS.specificityMatch,
            contextAffinity: toFiniteNumber(rawWeights.contextAffinity) ?? DEFAULT_INTELLIGENT_WEIGHTS.contextAffinity,
            cacheAffinity: toFiniteNumber(rawWeights.cacheAffinity) ?? DEFAULT_INTELLIGENT_WEIGHTS.cacheAffinity,
            resetWindowAffinity: toFiniteNumber(rawWeights.resetWindowAffinity) ?? DEFAULT_INTELLIGENT_WEIGHTS.resetWindowAffinity
        },
        routerStrategy: typeof configRecord.routerStrategy === "string" && configRecord.routerStrategy.trim().length > 0 ? configRecord.routerStrategy : "rules",
        slaTargetP95Ms: toPositiveNumber(slaTargetP95Ms),
        slaMaxErrorRate: slaMaxErrorRate !== null ? Math.min(1, Math.max(0, slaMaxErrorRate)) : undefined,
        slaMaxCostPer1MTokens: toPositiveNumber(slaMaxCostPer1MTokens),
        slaHardConstraints: slaHardConstraints === true
    };
}
function buildIntelligentProviderScores(combo) {
    const configRecord = normalizeIntelligentRoutingConfig(combo?.config);
    const comboWeights = isRecord(combo?.weights) ? combo.weights : combo?.config;
    const weights = normalizeIntelligentRoutingConfig({
        ...isRecord(comboWeights) ? comboWeights : {},
        weights: isRecord(combo?.weights) ? combo.weights : configRecord.weights
    }).weights;
    const pool = configRecord.candidatePool;
    const baseScore = pool.length > 0 ? 1 / pool.length : 0;
    return pool.map((provider)=>({
            provider,
            model: "auto",
            score: baseScore,
            factors: weights
        }));
}
}),
"[project]/src/shared/utils/turkishText.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>BuilderIntelligentStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/intelligentRouting.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/turkishText.ts [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
;
function getI18nOrFallback(t, key, fallback) {
    if (typeof t?.has === "function" && t.has(key)) return t(key);
    return fallback;
}
function toProviderOptions(activeProviders = [], candidatePool = []) {
    const uniqueProviders = new Map();
    activeProviders.forEach((provider)=>{
        const providerId = typeof provider?.providerId === "string" && provider.providerId.trim().length > 0 ? provider.providerId : typeof provider?.provider === "string" && provider.provider.trim().length > 0 ? provider.provider : typeof provider?.id === "string" && provider.id.trim().length > 0 ? provider.id : null;
        if (!providerId) return;
        const currentEntry = uniqueProviders.get(providerId);
        const fallbackLabel = typeof provider?.displayName === "string" && provider.displayName.trim().length > 0 ? provider.displayName : typeof provider?.providerName === "string" && provider.providerName.trim().length > 0 ? provider.providerName : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AI_PROVIDERS"][providerId]?.name || providerId;
        const connectionCount = typeof provider?.activeConnectionCount === "number" ? provider.activeConnectionCount : typeof provider?.connectionCount === "number" ? provider.connectionCount : 1;
        uniqueProviders.set(providerId, {
            id: providerId,
            label: currentEntry?.label || fallbackLabel,
            connectionCount: (currentEntry?.connectionCount || 0) + connectionCount
        });
    });
    candidatePool.forEach((poolId)=>{
        if (!uniqueProviders.has(poolId)) {
            uniqueProviders.set(poolId, {
                id: poolId,
                label: `${poolId} (Offline/Deleted)`,
                connectionCount: 0
            });
        }
    });
    return [
        ...uniqueProviders.values()
    ].sort((a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["compareTr"])(a.label, b.label));
}
function BuilderIntelligentStep({ t, config, onChange, activeProviders }) {
    const normalizedConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeIntelligentRoutingConfig"])(config);
    const isSlaAwareStrategy = [
        "sla-aware",
        "sla"
    ].includes(normalizedConfig.routerStrategy);
    const providerOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>toProviderOptions(activeProviders, normalizedConfig.candidatePool), [
        activeProviders,
        normalizedConfig.candidatePool
    ]);
    const updateConfig = (patch)=>{
        onChange({
            ...normalizedConfig,
            ...patch,
            weights: {
                ...normalizedConfig.weights,
                ...patch.weights || {}
            }
        });
    };
    const toggleCandidateProvider = (providerId)=>{
        const nextCandidatePool = normalizedConfig.candidatePool.includes(providerId) ? normalizedConfig.candidatePool.filter((entry)=>entry !== providerId) : [
            ...normalizedConfig.candidatePool,
            providerId
        ];
        updateConfig({
            candidatePool: nextCandidatePool
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Section, {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-semibold text-text-main",
                                    children: getI18nOrFallback(t, "builderIntelligentTitle", "Intelligent Routing Configuration")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted mt-1",
                                    children: getI18nOrFallback(t, "builderIntelligentDesc", "Configure the multi-factor scoring engine for this auto-routing combo.")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                    lineNumber: 114,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[12px]",
                                    children: "auto_awesome"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, this),
                                "Intelligent"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                            lineNumber: 122,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                    lineNumber: 109,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Section, {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-semibold text-text-main",
                                        children: getI18nOrFallback(t, "candidatePoolLabel", "Candidate Pool")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 132,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] text-text-muted mt-1",
                                        children: getI18nOrFallback(t, "candidatePoolHint", "Select which providers this engine should evaluate. Leave empty to use all active providers.")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 135,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] text-text-muted",
                                children: normalizedConfig.candidatePool.length > 0 ? `${normalizedConfig.candidatePool.length} selected` : "All active providers"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 flex flex-wrap gap-2",
                        children: [
                            providerOptions.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] text-text-muted",
                                children: getI18nOrFallback(t, "candidatePoolEmpty", "No active providers available yet.")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 152,
                                columnNumber: 13
                            }, this),
                            providerOptions.map((provider)=>{
                                const isSelected = normalizedConfig.candidatePool.includes(provider.id);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>toggleCandidateProvider(provider.id),
                                    className: `rounded-full border px-3 py-1.5 text-xs transition-colors ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-black/10 dark:border-white/10 text-text-main hover:border-primary/40 hover:bg-primary/5"}`,
                                    children: [
                                        provider.label,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "ml-1 text-[10px] text-text-muted",
                                            children: [
                                                provider.connectionCount,
                                                " acct",
                                                provider.connectionCount === 1 ? "" : "s"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                            lineNumber: 171,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, provider.id, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                    lineNumber: 160,
                                    columnNumber: 15
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Section, {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-semibold text-text-main block mb-2",
                                children: getI18nOrFallback(t, "modePackLabel", "Mode Pack")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 183,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: normalizedConfig.modePack,
                                onChange: (event)=>updateConfig({
                                        modePack: event.target.value
                                    }),
                                className: "w-full text-xs py-2 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MODE_PACK_OPTIONS"].map((modePack)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: modePack.id,
                                        children: getI18nOrFallback(t, `modePack${modePack.id[0].toUpperCase()}${modePack.id.slice(1)}`, modePack.label)
                                    }, modePack.id, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 192,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 186,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Section, {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-semibold text-text-main block mb-2",
                                children: getI18nOrFallback(t, "routerStrategyLabel", "Router Strategy")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 204,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: normalizedConfig.routerStrategy,
                                onChange: (event)=>updateConfig({
                                        routerStrategy: event.target.value
                                    }),
                                className: "w-full text-xs py-2 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROUTER_STRATEGY_OPTIONS"].map((strategy)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: strategy.id,
                                        children: strategy.id === "rules" ? getI18nOrFallback(t, "strategyRules", strategy.label) : strategy.label
                                    }, strategy.id, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 213,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 207,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                lineNumber: 181,
                columnNumber: 7
            }, this),
            isSlaAwareStrategy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Section, {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-semibold text-text-main",
                                        children: getI18nOrFallback(t, "slaRoutingTitle", "SLA targets")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 227,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] text-text-muted mt-1",
                                        children: getI18nOrFallback(t, "slaRoutingHint", "Prefer providers that satisfy p95 latency, error-rate and optional cost targets.")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 230,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 226,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[12px]",
                                        children: "verified"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 239,
                                        columnNumber: 15
                                    }, this),
                                    "SLA"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 238,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                        lineNumber: 225,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 grid grid-cols-1 md:grid-cols-3 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-semibold text-text-main block",
                                children: [
                                    getI18nOrFallback(t, "slaTargetP95Label", "Target p95 latency (ms)"),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: "1",
                                        step: "100",
                                        value: normalizedConfig.slaTargetP95Ms ?? "",
                                        placeholder: "2000",
                                        onChange: (event)=>updateConfig({
                                                slaTargetP95Ms: event.target.value ? Number(event.target.value) : undefined
                                            }),
                                        className: "mt-2 w-full text-xs py-2 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 247,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 245,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-semibold text-text-main block",
                                children: [
                                    getI18nOrFallback(t, "slaMaxErrorRateLabel", "Max error rate"),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: "0",
                                        max: "1",
                                        step: "0.01",
                                        value: normalizedConfig.slaMaxErrorRate ?? "",
                                        placeholder: "0.05",
                                        onChange: (event)=>updateConfig({
                                                slaMaxErrorRate: event.target.value ? Number(event.target.value) : undefined
                                            }),
                                        className: "mt-2 w-full text-xs py-2 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 264,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 262,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-semibold text-text-main block",
                                children: [
                                    getI18nOrFallback(t, "slaMaxCostLabel", "Max cost ($ / 1M tokens)"),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: "0",
                                        step: "0.001",
                                        value: normalizedConfig.slaMaxCostPer1MTokens ?? "",
                                        placeholder: getI18nOrFallback(t, "slaMaxCostPlaceholder", "No limit"),
                                        onChange: (event)=>updateConfig({
                                                slaMaxCostPer1MTokens: event.target.value ? Number(event.target.value) : undefined
                                            }),
                                        className: "mt-2 w-full text-xs py-2 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 282,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 280,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                        lineNumber: 244,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "mt-3 flex items-center gap-2 text-xs text-text-main",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                checked: normalizedConfig.slaHardConstraints,
                                onChange: (event)=>updateConfig({
                                        slaHardConstraints: event.target.checked
                                    }),
                                className: "accent-primary"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 301,
                                columnNumber: 13
                            }, this),
                            getI18nOrFallback(t, "slaHardConstraintsLabel", "Prefer strict SLA-compliant candidates before soft scoring.")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                        lineNumber: 300,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                lineNumber: 224,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Section, {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-semibold text-text-main block",
                                children: getI18nOrFallback(t, "explorationRateLabel", "Exploration Rate")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 318,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "range",
                                min: "0",
                                max: "1",
                                step: "0.01",
                                value: normalizedConfig.explorationRate,
                                onChange: (event)=>updateConfig({
                                        explorationRate: Number(event.target.value || 0)
                                    }),
                                className: "mt-3 w-full accent-primary"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 321,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] text-text-muted mt-2",
                                children: getI18nOrFallback(t, "explorationRateHint", "{percent}% of requests can explore non-optimal providers.").replace("{percent}", `${Math.round(normalizedConfig.explorationRate * 100)}`)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 330,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                        lineNumber: 317,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Section, {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-semibold text-text-main block mb-2",
                                children: getI18nOrFallback(t, "budgetCapLabel", "Budget Cap (USD / request)")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 340,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: "0",
                                step: "0.0001",
                                value: normalizedConfig.budgetCap ?? "",
                                placeholder: getI18nOrFallback(t, "budgetCapPlaceholder", "No limit"),
                                onChange: (event)=>updateConfig({
                                        budgetCap: event.target.value ? Number(event.target.value) : undefined
                                    }),
                                className: "w-full text-xs py-2 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 343,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                        lineNumber: 339,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                lineNumber: 316,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                className: "rounded-lg border border-black/8 dark:border-white/8 bg-black/2 dark:bg-white/2 p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                        className: "cursor-pointer text-xs font-semibold text-text-main",
                        children: getI18nOrFallback(t, "advancedWeightsTitle", "Advanced: Scoring Weights")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                        lineNumber: 360,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-3",
                        children: Object.entries(normalizedConfig.weights).map(([weightKey, weightValue])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-black/6 dark:border-white/6 p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-[11px] font-medium text-text-main",
                                                children: getI18nOrFallback(t, `weight${weightKey[0].toUpperCase()}${weightKey.slice(1)}`, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FACTOR_LABELS"][weightKey])
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                                lineNumber: 370,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[11px] text-text-muted",
                                                children: [
                                                    Math.round(Number(weightValue) * 100),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                                lineNumber: 377,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 369,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "range",
                                        min: "0",
                                        max: "1",
                                        step: "0.05",
                                        value: weightValue,
                                        onChange: (event)=>updateConfig({
                                                weights: {
                                                    ...normalizedConfig.weights,
                                                    [weightKey]: Number(event.target.value || 0)
                                                }
                                            }),
                                        className: "mt-3 w-full accent-primary"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                        lineNumber: 381,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, weightKey, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                                lineNumber: 365,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                        lineNumber: 363,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
                lineNumber: 359,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>IntelligentComboPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/notificationStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/intelligentRouting.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
;
;
function getI18nOrFallback(t, key, fallback) {
    if (typeof t?.has === "function" && t.has(key)) return t(key);
    return fallback;
}
function formatProviderLabel(providerId, activeProviders = []) {
    const matchedProvider = activeProviders.find((provider)=>provider?.providerId === providerId || provider?.provider === providerId);
    if (typeof matchedProvider?.displayName === "string" && matchedProvider.displayName.trim()) {
        return matchedProvider.displayName.trim();
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AI_PROVIDERS"][providerId]?.name || providerId;
}
function countProvidersInScope(activeProviders = []) {
    const providerIds = new Set();
    for (const provider of activeProviders){
        const providerId = typeof provider?.providerId === "string" && provider.providerId.trim().length > 0 ? provider.providerId.trim() : typeof provider?.provider === "string" && provider.provider.trim().length > 0 ? provider.provider.trim() : null;
        if (providerId) providerIds.add(providerId);
    }
    return providerIds.size;
}
function IntelligentComboPanel({ t, combo, allCombos, activeProviders, onComboUpdated }) {
    const notify = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"])();
    const [savingModePack, setSavingModePack] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const normalizedConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeIntelligentRoutingConfig"])(combo?.config), [
        combo?.config
    ]);
    const providerScores = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildIntelligentProviderScores"])(combo), [
        combo
    ]);
    const providerScopeCount = normalizedConfig.candidatePool.length || countProvidersInScope(activeProviders);
    const handleModePackChange = async (modePackId)=>{
        if (!combo?.id || modePackId === normalizedConfig.modePack) return;
        setSavingModePack(modePackId);
        try {
            const response = await fetch(`/api/combos/${combo.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    config: {
                        ...combo?.config || {},
                        modePack: modePackId
                    }
                })
            });
            if (!response.ok) {
                const errorBody = await response.json().catch(()=>null);
                throw new Error(errorBody?.error?.message || errorBody?.error || "Failed to update mode pack");
            }
            const updatedCombo = await response.json();
            onComboUpdated?.(updatedCombo);
            notify.success(getI18nOrFallback(t, "modePackUpdated", "Mode pack updated to {pack}.").replace("{pack}", modePackId));
        } catch (error) {
            notify.error(error?.message || "Failed to update mode pack.");
        } finally{
            setSavingModePack(null);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        className: "border-primary/10 bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent",
        padding: "sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-primary text-[18px]",
                                            children: "auto_awesome"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                            lineNumber: 118,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold text-text-main",
                                            children: getI18nOrFallback(t, "intelligentPanelTitle", "Intelligent Routing Dashboard")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                            lineNumber: 121,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                    lineNumber: 117,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted mt-1",
                                    children: getI18nOrFallback(t, "intelligentPanelDesc", "Real-time scoring and health status for this auto-routing combo.")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                    lineNumber: 125,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 flex flex-wrap items-center gap-2 text-[11px] text-text-muted",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            className: "rounded bg-black/5 dark:bg-white/5 px-2 py-1 text-text-main",
                                            children: combo?.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                            lineNumber: 133,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                allCombos.length,
                                                " intelligent combo(s)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                            lineNumber: 136,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                providerScopeCount,
                                                " providers in scope"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                            lineNumber: 137,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-300",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: "tune"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                    lineNumber: 142,
                                    columnNumber: 13
                                }, this),
                                getI18nOrFallback(t, "configOnlyStatus", "Configuration View")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                    lineNumber: 115,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 xl:grid-cols-2 gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Section, {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-text-main",
                                                children: getI18nOrFallback(t, "statusOverview", "Status Overview")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                lineNumber: 151,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] text-text-muted mt-1",
                                                children: getI18nOrFallback(t, "configOnlyHint", "This panel shows routing inputs only. Live breaker state is available on the Health page.")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                lineNumber: 154,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                        lineNumber: 150,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-lg bg-black/5 dark:bg-white/5 px-3 py-2 text-right",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                children: "Candidate Pool"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                lineNumber: 163,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-lg font-semibold text-text-main",
                                                children: providerScopeCount
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                lineNumber: 166,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                        lineNumber: 162,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                lineNumber: 149,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                            lineNumber: 148,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Section, {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold text-text-main",
                                                    children: getI18nOrFallback(t, "activeModePack", "Active Mode Pack")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                    lineNumber: 174,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[11px] text-text-muted mt-1",
                                                    children: getI18nOrFallback(t, "modePackHint", "Switch presets to bias the routing engine without rebuilding the combo.")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                    lineNumber: 177,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                            lineNumber: 173,
                                            columnNumber: 15
                                        }, this),
                                        savingModePack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] text-text-muted",
                                            children: [
                                                "Saving ",
                                                savingModePack,
                                                "…"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                            lineNumber: 186,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                    lineNumber: 172,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-2 mt-3",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MODE_PACK_OPTIONS"].map((modePack)=>{
                                        const isActive = normalizedConfig.modePack === modePack.id;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            variant: isActive ? "primary" : "secondary",
                                            size: "sm",
                                            onClick: ()=>handleModePackChange(modePack.id),
                                            disabled: Boolean(savingModePack),
                                            className: "!justify-start",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[14px]",
                                                    children: modePack.emoji
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                    lineNumber: 202,
                                                    columnNumber: 21
                                                }, this),
                                                modePack.label
                                            ]
                                        }, modePack.id, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                            lineNumber: 194,
                                            columnNumber: 19
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                    lineNumber: 190,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                            lineNumber: 171,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                    lineNumber: 147,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 xl:grid-cols-2 gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Section, {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between gap-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-text-main",
                                                children: getI18nOrFallback(t, "providerScores", "Provider Scores")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                lineNumber: 215,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] text-text-muted mt-1",
                                                children: normalizedConfig.candidatePool.length > 0 ? `${normalizedConfig.candidatePool.length} providers currently ranked for this combo.` : getI18nOrFallback(t, "allProvidersEvaluated", "No candidate pool configured. All active providers are evaluated at runtime.")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                lineNumber: 218,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                        lineNumber: 214,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                    lineNumber: 213,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-3 flex flex-col gap-2",
                                    children: providerScores.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-lg border border-dashed border-black/10 dark:border-white/10 p-3 text-[11px] text-text-muted",
                                        children: getI18nOrFallback(t, "allProvidersEvaluated", "No candidate pool configured. All active providers are evaluated at runtime.")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                        lineNumber: 232,
                                        columnNumber: 17
                                    }, this) : providerScores.map((entry)=>{
                                        const percentage = Math.round(entry.score * 100);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-black/8 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs font-semibold text-text-main",
                                                                    children: formatProviderLabel(entry.provider, activeProviders)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                                    lineNumber: 249,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[11px] text-text-muted mt-0.5",
                                                                    children: entry.model
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                                    lineNumber: 252,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                            lineNumber: 248,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary",
                                                            children: [
                                                                percentage,
                                                                "%"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                            lineNumber: 254,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                    lineNumber: 247,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-2 h-2 rounded-full bg-black/8 dark:bg-white/8 overflow-hidden",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-full rounded-full bg-blue-500 transition-all",
                                                        style: {
                                                            width: `${percentage}%`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                        lineNumber: 260,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                    lineNumber: 259,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-2 flex flex-wrap gap-1.5",
                                                    children: Object.entries(entry.factors).map(([factorKey, factorValue])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded-full bg-black/5 dark:bg-white/5 px-2 py-1 text-[10px] text-text-muted",
                                                            children: [
                                                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FACTOR_LABELS"][factorKey],
                                                                " ",
                                                                Math.round(Number(factorValue) * 100),
                                                                "%"
                                                            ]
                                                        }, `${entry.provider}-${factorKey}`, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                            lineNumber: 268,
                                                            columnNumber: 27
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                    lineNumber: 266,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, entry.provider, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                            lineNumber: 243,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                    lineNumber: 230,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                            lineNumber: 212,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Section, {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between gap-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-text-main",
                                                children: getI18nOrFallback(t, "routingInputs", "Routing Inputs")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                lineNumber: 287,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] text-text-muted mt-1",
                                                children: getI18nOrFallback(t, "routingInputsHint", "Mode pack and weighting stay here; breaker runtime state stays on the Health page.")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                lineNumber: 290,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                        lineNumber: 286,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                    lineNumber: 285,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-black/8 bg-white/60 p-3 dark:border-white/8 dark:bg-white/[0.03]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[11px] uppercase tracking-wide text-text-muted",
                                                    children: t("modePack")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                    lineNumber: 302,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-sm font-semibold text-text-main",
                                                    children: normalizedConfig.modePack
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                    lineNumber: 305,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                            lineNumber: 301,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-black/8 bg-white/60 p-3 dark:border-white/8 dark:bg-white/[0.03]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[11px] uppercase tracking-wide text-text-muted",
                                                    children: "Exploration Rate"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                    lineNumber: 310,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-sm font-semibold text-text-main",
                                                    children: [
                                                        Math.round(normalizedConfig.explorationRate * 100),
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                                    lineNumber: 313,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                            lineNumber: 309,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                                    lineNumber: 300,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                            lineNumber: 284,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
                    lineNumber: 211,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
            lineNumber: 114,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/combos/steps.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @file steps.ts
 * @description Combo step normalization helpers for model, combo-ref, provider-wildcard, and routing metadata.
 *
 * @changes
 * - [2026-07-25] [Composer] - Preserve provider-wildcard steps during combo normalization
 */ __turbopack_context__.s([
    "COMBO_SCHEMA_VERSION",
    ()=>COMBO_SCHEMA_VERSION,
    "getComboModelProvider",
    ()=>getComboModelProvider,
    "getComboModelString",
    ()=>getComboModelString,
    "getComboStepTarget",
    ()=>getComboStepTarget,
    "getComboStepWeight",
    ()=>getComboStepWeight,
    "normalizeComboModels",
    ()=>normalizeComboModels,
    "normalizeComboRecord",
    ()=>normalizeComboRecord,
    "normalizeComboStep",
    ()=>normalizeComboStep
]);
const COMBO_SCHEMA_VERSION = 2;
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function toTrimmedString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function toWeight(value) {
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : 0;
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(100, parsed));
}
function collectComboNames(allCombos) {
    const names = new Set();
    if (!allCombos) return names;
    if (!Array.isArray(allCombos) && typeof allCombos[Symbol.iterator] === "function" && !(isRecord(allCombos) && Array.isArray(allCombos.combos))) {
        for (const value of allCombos){
            const name = toTrimmedString(value);
            if (name) names.add(name);
        }
        return names;
    }
    const combosFromRecord = isRecord(allCombos) && Array.isArray(allCombos.combos) ? allCombos.combos : [];
    const combos = Array.isArray(allCombos) ? allCombos : combosFromRecord;
    for (const combo of combos){
        const name = typeof combo === "string" ? toTrimmedString(combo) : toTrimmedString(combo?.name);
        if (name) names.add(name);
    }
    return names;
}
function parseProviderId(model) {
    const trimmed = model.trim();
    const slashIndex = trimmed.indexOf("/");
    if (slashIndex <= 0) return null;
    const providerId = trimmed.slice(0, slashIndex).trim();
    return providerId.length > 0 ? providerId : null;
}
function parseProviderWildcardPattern(target) {
    const trimmed = target.trim();
    const slashIndex = trimmed.indexOf("/");
    if (slashIndex <= 0) return null;
    const providerId = trimmed.slice(0, slashIndex).trim();
    const modelPattern = trimmed.slice(slashIndex + 1).trim();
    if (!providerId || !modelPattern.includes("*")) return null;
    return {
        providerId,
        modelPattern
    };
}
function toFullModelString(model, providerId) {
    const trimmedModel = model.trim();
    if (trimmedModel.includes("/")) return trimmedModel;
    const normalizedProviderId = toTrimmedString(providerId);
    return normalizedProviderId ? `${normalizedProviderId}/${trimmedModel}` : trimmedModel;
}
function slugify(value) {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return slug.length > 0 ? slug : "step";
}
function buildStepId(kind, comboName, index, seed) {
    const kindSlug = kind === "combo-ref" ? "ref" : kind === "provider-wildcard" ? "wildcard" : "model";
    const parts = [
        slugify(comboName || "combo"),
        kindSlug,
        String(index + 1),
        slugify(seed)
    ];
    return parts.join("-").slice(0, 200);
}
function shouldTreatAsComboRef(target, providerId, options) {
    if (providerId) return false;
    const comboNames = collectComboNames(options.allCombos);
    return comboNames.has(target) || target === toTrimmedString(options.comboName);
}
function getComboStepWeight(value) {
    if (typeof value === "string") return 0;
    if (!isRecord(value)) return 0;
    return toWeight(value.weight);
}
function getComboModelString(value) {
    if (typeof value === "string") return toTrimmedString(value);
    if (!isRecord(value) || value.kind === "combo-ref") return null;
    const rawModel = toTrimmedString(value.model);
    if (!rawModel) return null;
    const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(rawModel);
    return toFullModelString(rawModel, providerId);
}
function getComboModelProvider(value) {
    if (typeof value === "string") return parseProviderId(value);
    if (!isRecord(value) || value.kind === "combo-ref") return null;
    return toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(toTrimmedString(value.model) || "");
}
function getComboStepTarget(value, options = {}) {
    if (typeof value === "string") {
        const target = toTrimmedString(value);
        if (!target) return null;
        return shouldTreatAsComboRef(target, null, options) ? target : target;
    }
    if (!isRecord(value)) return null;
    if (value.kind === "combo-ref") return toTrimmedString(value.comboName);
    if (value.kind === "provider-wildcard") {
        const providerId = toTrimmedString(value.providerId);
        const modelPattern = toTrimmedString(value.modelPattern) || "*";
        return providerId ? `${providerId}/${modelPattern}` : null;
    }
    const rawModel = toTrimmedString(value.model);
    if (!rawModel) return null;
    const isExplicitModel = value.kind === "model";
    const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(rawModel);
    if (!isExplicitModel && shouldTreatAsComboRef(rawModel, providerId, options)) {
        return rawModel;
    }
    return toFullModelString(rawModel, providerId);
}
function normalizeComboStep(value, options = {}) {
    const comboName = toTrimmedString(options.comboName);
    const index = typeof options.index === "number" ? options.index : 0;
    if (typeof value === "string") {
        const target = toTrimmedString(value);
        if (!target) return null;
        if (shouldTreatAsComboRef(target, null, options)) {
            return {
                id: buildStepId("combo-ref", comboName, index, target),
                kind: "combo-ref",
                comboName: target,
                weight: 0
            };
        }
        const wildcardPattern = parseProviderWildcardPattern(target);
        if (wildcardPattern) {
            return {
                id: buildStepId("provider-wildcard", comboName, index, `${wildcardPattern.providerId}/${wildcardPattern.modelPattern}`),
                kind: "provider-wildcard",
                providerId: wildcardPattern.providerId,
                modelPattern: wildcardPattern.modelPattern,
                weight: 0
            };
        }
        const providerId = parseProviderId(target);
        return {
            id: buildStepId("model", comboName, index, target),
            kind: "model",
            model: target,
            ...providerId ? {
                providerId
            } : {},
            weight: 0
        };
    }
    if (!isRecord(value)) return null;
    const explicitId = toTrimmedString(value.id);
    const weight = toWeight(value.weight);
    const label = toTrimmedString(value.label);
    const prompt = toTrimmedString(value.prompt);
    if (value.kind === "combo-ref") {
        const comboRefName = toTrimmedString(value.comboName);
        if (!comboRefName) return null;
        return {
            id: explicitId || buildStepId("combo-ref", comboName, index, comboRefName),
            kind: "combo-ref",
            comboName: comboRefName,
            weight,
            ...label ? {
                label
            } : {}
        };
    }
    if (value.kind === "provider-wildcard") {
        const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(toTrimmedString(value.model) || "");
        if (!providerId) return null;
        const modelPattern = toTrimmedString(value.modelPattern) || "*";
        const connectionId = value.connectionId === null ? null : toTrimmedString(value.connectionId) || undefined;
        const allowedConnectionIds = Array.isArray(value.allowedConnectionIds) ? value.allowedConnectionIds.map((connId)=>toTrimmedString(connId)).filter((connId)=>!!connId) : undefined;
        return {
            id: explicitId || buildStepId("provider-wildcard", comboName, index, connectionId ? `${providerId}/${modelPattern}:${connectionId}` : `${providerId}/${modelPattern}`),
            kind: "provider-wildcard",
            providerId,
            modelPattern,
            ...connectionId !== undefined ? {
                connectionId
            } : {},
            weight,
            ...label ? {
                label
            } : {},
            ...allowedConnectionIds && allowedConnectionIds.length > 0 ? {
                allowedConnectionIds
            } : {}
        };
    }
    const rawModel = toTrimmedString(value.model);
    if (!rawModel) return null;
    const isExplicitModel = value.kind === "model";
    const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(rawModel);
    const wildcardPattern = parseProviderWildcardPattern(rawModel);
    if (wildcardPattern) {
        const connectionId = value.connectionId === null ? null : toTrimmedString(value.connectionId) || undefined;
        const allowedConnectionIds = Array.isArray(value.allowedConnectionIds) ? value.allowedConnectionIds.map((connId)=>toTrimmedString(connId)).filter((connId)=>!!connId) : undefined;
        return {
            id: explicitId || buildStepId("provider-wildcard", comboName, index, connectionId ? `${wildcardPattern.providerId}/${wildcardPattern.modelPattern}:${connectionId}` : `${wildcardPattern.providerId}/${wildcardPattern.modelPattern}`),
            kind: "provider-wildcard",
            providerId: wildcardPattern.providerId,
            modelPattern: wildcardPattern.modelPattern,
            ...connectionId !== undefined ? {
                connectionId
            } : {},
            weight,
            ...label ? {
                label
            } : {},
            ...allowedConnectionIds && allowedConnectionIds.length > 0 ? {
                allowedConnectionIds
            } : {}
        };
    }
    if (!isExplicitModel && shouldTreatAsComboRef(rawModel, providerId, options)) {
        return {
            id: explicitId || buildStepId("combo-ref", comboName, index, rawModel),
            kind: "combo-ref",
            comboName: rawModel,
            weight,
            ...label ? {
                label
            } : {}
        };
    }
    const model = toFullModelString(rawModel, providerId);
    const connectionId = value.connectionId === null ? null : toTrimmedString(value.connectionId) || undefined;
    const tags = Array.isArray(value.tags) ? value.tags.map((tag)=>toTrimmedString(tag)).filter((tag)=>!!tag) : undefined;
    const allowedConnectionIds = Array.isArray(value.allowedConnectionIds) ? value.allowedConnectionIds.map((connId)=>toTrimmedString(connId)).filter((connId)=>!!connId) : undefined;
    return {
        id: explicitId || buildStepId("model", comboName, index, connectionId ? `${model}:${connectionId}` : model),
        kind: "model",
        model,
        ...providerId ? {
            providerId
        } : {},
        ...connectionId !== undefined ? {
            connectionId
        } : {},
        weight,
        ...label ? {
            label
        } : {},
        ...prompt ? {
            prompt
        } : {},
        ...tags && tags.length > 0 ? {
            tags
        } : {},
        ...allowedConnectionIds && allowedConnectionIds.length > 0 ? {
            allowedConnectionIds
        } : {}
    };
}
function normalizeComboModels(models, options = {}) {
    const list = Array.isArray(models) ? models : [];
    return list.map((value, index)=>normalizeComboStep(value, {
            ...options,
            index
        })).filter((value)=>value !== null);
}
function normalizeComboRecord(combo, options = {}) {
    const comboName = toTrimmedString(combo.name);
    return {
        ...combo,
        version: COMBO_SCHEMA_VERSION,
        models: normalizeComboModels(combo.models, {
            comboName,
            allCombos: options.allCombos
        })
    };
}
}),
"[project]/src/lib/api/serverErrorMessage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Extract a human-readable message from a parsed API error body.
 *
 * OmniRoute API error bodies follow the shape produced by
 * `comboErrorResponse`/`buildErrorBody`:
 *
 *   { error: { message: string, details?: Array<{ message?: string }> } }
 *
 * Field-level validation errors (e.g. COMBO_002) carry the most specific
 * text in `error.details[0].message`; other errors carry it in
 * `error.message`. This helper prefers the most specific available message
 * and falls back to a caller-supplied default when the body is missing,
 * malformed, or not an object — so a failed `fetch().json()` (which may be
 * `null`) never throws at the call site.
 */ __turbopack_context__.s([
    "resolveServerErrorMessage",
    ()=>resolveServerErrorMessage
]);
function resolveServerErrorMessage(body, fallback) {
    if (!body || typeof body !== "object") return fallback;
    const error = body.error;
    if (!error || typeof error !== "object") return fallback;
    const details = error.details;
    if (Array.isArray(details) && details.length > 0) {
        const first = details[0];
        if (first && typeof first === "object") {
            const detailMessage = first.message;
            if (typeof detailMessage === "string" && detailMessage.length > 0) {
                return detailMessage;
            }
        }
    }
    const message = error.message;
    if (typeof message === "string" && message.length > 0) return message;
    return fallback;
}
}),
"[project]/src/app/(dashboard)/dashboard/combos/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>CombosPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Loading.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$EmptyState$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/EmptyState.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Tooltip.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$compression$2f$ComboCompressionModeSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/compression/ComboCompressionModeSelect.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useCopyToClipboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/hooks/useCopyToClipboard.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$parts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/parts.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/FieldLabelWithHelp.tsx [app-ssr] (ecmascript) <export default as FieldLabelWithHelp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$WeightTotalBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__WeightTotalBar$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/WeightTotalBar.tsx [app-ssr] (ecmascript) <export default as WeightTotalBar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$useComboProxyAssignments$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/useComboProxyAssignments.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$ResponseValidationEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/ResponseValidationEditor.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$ReasoningTokenBufferToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/ReasoningTokenBufferToggle.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/emailPrivacyStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/notificationStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$routingStrategies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/routingStrategies.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/builderDraft.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$comboConfigMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/comboConfigMode.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$AutoComboCatalog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/AutoComboCatalog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$KimiComboPresetCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/KimiComboPresetCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$kimiComboPreset$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/kimiComboPreset.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$BuilderIntelligentStep$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/BuilderIntelligentStep.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$IntelligentComboPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/combos/IntelligentComboPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/intelligentRouting.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/steps.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$serverErrorMessage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api/serverErrorMessage.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$AutoComboCatalog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$KimiComboPresetCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$BuilderIntelligentStep$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$IntelligentComboPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$AutoComboCatalog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$KimiComboPresetCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$BuilderIntelligentStep$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$IntelligentComboPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
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
;
;
;
;
;
;
const ModelSelectModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/src/shared/components/ModelSelectModal.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const ProxyConfigModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/src/shared/components/ProxyConfigModal.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const VALID_NAME_REGEX = /^[a-zA-Z0-9_/.\-\[\] ]+$/;
const STRATEGY_OPTIONS = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$routingStrategies$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROUTING_STRATEGIES"].map((strategy)=>({
        value: strategy.value,
        labelKey: strategy.labelKey,
        descKey: strategy.combosDescKey,
        icon: strategy.icon
    }));
const STRATEGY_LABEL_FALLBACK = {
    "context-relay": "Context Relay",
    "reset-aware": "Reset-Aware RR"
};
const STRATEGY_DESC_FALLBACK = {
    "context-relay": "Priority-style routing with automatic context handoffs when account rotation happens.",
    "reset-aware": "Quota remaining and reset windows decide the order; similar scores rotate round-robin."
};
const STRATEGY_GUIDANCE_FALLBACK = {
    priority: {
        when: "Use when you have one preferred model and only want fallback on failure.",
        avoid: "Avoid when you need balanced load between models.",
        example: "Example: Primary coding model with cheaper backup for outages."
    },
    weighted: {
        when: "Use when you need controlled traffic split across models.",
        avoid: "Avoid when weights are not maintained or you need strict fairness.",
        example: "Example: 80% stable model and 20% canary model for safe rollout."
    },
    "round-robin": {
        when: "Use when you need predictable, even request distribution.",
        avoid: "Avoid when model latency/cost differs significantly.",
        example: "Example: Same model across multiple accounts to spread throughput."
    },
    "context-relay": {
        when: "Use when long sessions must survive account rotation without losing the working context.",
        avoid: "Avoid when account switching is rare or when you do not want extra summarization requests.",
        example: "Example: Codex sessions that rotate across multiple accounts near quota exhaustion."
    },
    random: {
        when: "Use when you want a simple spread with low configuration effort.",
        avoid: "Avoid when requests must be distributed with strict guarantees.",
        example: "Example: Prototyping with equivalent models and no traffic policy."
    },
    "least-used": {
        when: "Use when you want adaptive balancing based on recent demand.",
        avoid: "Avoid when your traffic is too low to benefit from usage balancing.",
        example: "Example: Mixed workloads where one model tends to get overloaded."
    },
    "cost-optimized": {
        when: "Use when minimizing cost is the top priority.",
        avoid: "Avoid when pricing data is missing or outdated.",
        example: "Example: Batch or background jobs where lower cost matters most."
    },
    "reset-aware": {
        when: "Use when multiple accounts with quota telemetry have different reset windows.",
        avoid: "Avoid when quota telemetry is unavailable for most accounts.",
        example: "Example: Prefer a 60% weekly account resetting tomorrow over 80% that resets later."
    },
    "fill-first": {
        when: "Use when you want to drain one provider's quota fully before moving to the next.",
        avoid: "Avoid when you need request-level load balancing across providers.",
        example: "Example: Use all $200 Deepgram credits before falling to Groq."
    },
    p2c: {
        when: "Use when you want low-latency selection using Power-of-Two-Choices algorithm.",
        avoid: "Avoid for small combos with 2 or fewer models — no benefit over round-robin.",
        example: "Example: High-throughput inference across 4+ equivalent model endpoints."
    },
    "strict-random": {
        when: "Use when you want perfectly even spread — each model used once before repeating.",
        avoid: "Avoid when models have different quality or latency and order matters.",
        example: "Example: Multiple accounts of the same model to distribute usage evenly."
    },
    auto: {
        when: "Use when you want multi-factor scoring based on cost, latency, and quality.",
        avoid: "Avoid when you need strict priority ordering or historical persistence.",
        example: "Example: Balance requests between models with different strengths."
    },
    lkgp: {
        when: "Use when you want routing based on historical success rates and performance.",
        avoid: "Avoid when historical data is limited or unreliable.",
        example: "Example: Route to models with proven track records for specific tasks."
    },
    "context-optimized": {
        when: "Use when you need to optimize for context window usage across models.",
        avoid: "Avoid when models have similar context lengths or simple tasks.",
        example: "Example: Distribute long conversations across models with large context windows."
    }
};
const ADVANCED_FIELD_HELP_FALLBACK = {
    maxRetries: "How many retries are attempted before failing the request.",
    retryDelay: "Initial delay between retries. Higher values reduce burst pressure.",
    concurrencyPerModel: "Round-robin combo/model limit: max simultaneous requests sent to each model target. This is separate from any provider account-only cap.",
    queueTimeout: "How long a request can wait for a round-robin model slot before timing out. This queue is separate from any account-only concurrency cap.",
    stickyLimit: "Round-robin sticky batch size: consecutive successful requests sent to one target before rotating to the next. Empty inherits the global Sticky Limit setting; 1 disables batching (pure one-request rotation).",
    stickyWeightedLimit: "Weighted sticky batch size: consecutive successful requests sent to the selected weighted target before drawing again. Empty or 1 keeps the current per-request weighted draw.",
    failoverBeforeRetry: "When enabled, a 429 from the upstream triggers immediate target failover instead of retrying the same URL first.",
    targetTimeoutMs: "Optional combo target timeout. Empty inherits the current request timeout; larger values are capped to that timeout.",
    maxSetRetries: "Number of times to retry the full target set when every target fails. 0 = no set-level retry.",
    setRetryDelayMs: "Delay between set-level retry attempts, giving transient issues time to resolve.",
    nestedComboMode: "How references to other combos are handled. Flatten expands a combo ref into this combo's target list (legacy). Execute treats a combo ref as a black-box target: the parent strategy selects the child combo, then the child runs its own strategy and retries."
};
const LEGACY_COMBO_RESILIENCE_KEYS = new Set([
    "timeoutMs",
    "healthCheckEnabled",
    "healthCheckTimeoutMs",
    "queueTimeoutMs",
    "queueDepth",
    "fallbackDelayMs",
    "handoffProviders",
    "maxComboDepth",
    "manifestRouting",
    "complexityAwareRouting",
    "pipeline_enabled",
    "pipelineConcurrency",
    "shadowRouting",
    "evalRouting",
    "resetAwareEnabled",
    "resetAwareWindow"
]);
const MS_PER_SECOND = 1000;
function msToOptionalSecondsInput(value) {
    const ms = Number(value);
    if (!Number.isFinite(ms) || ms <= 0) return "";
    return String(Math.round(ms / MS_PER_SECOND));
}
function secondsInputToOptionalMs(value, maxSeconds = 86400) {
    if (!value) return undefined;
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
    return Math.min(maxSeconds, Math.round(seconds)) * MS_PER_SECOND;
}
function sanitizeComboRuntimeConfig(config) {
    if (!config || typeof config !== "object") return {};
    return Object.fromEntries(Object.entries(config).filter(([key, value])=>value !== undefined && value !== null && !LEGACY_COMBO_RESILIENCE_KEYS.has(key)));
}
function updateFusionTuning(config, field, rawValue) {
    const value = rawValue === "" ? undefined : Number(rawValue);
    const next = {
        ...config.fusionTuning || {},
        [field]: value
    };
    const pruned = Object.fromEntries(Object.entries(next).filter(([, v])=>typeof v === "number" && Number.isFinite(v)));
    return {
        ...config,
        fusionTuning: Object.keys(pruned).length > 0 ? pruned : undefined
    };
}
const STRATEGY_RECOMMENDATIONS_FALLBACK = {
    priority: {
        title: "Fail-safe baseline",
        description: "Use one primary model and keep fallback chain short and reliable.",
        tips: [
            "Put your most reliable model first.",
            "Keep 1-2 backup models with similar quality.",
            "Use safe retries to absorb transient provider failures."
        ]
    },
    weighted: {
        title: "Controlled traffic split",
        description: "Great for canary rollouts and gradual migration between models.",
        tips: [
            "Start with conservative split like 90/10.",
            "Keep the total at 100% and auto-balance after changes.",
            "Monitor success and latency before increasing canary weight."
        ]
    },
    "round-robin": {
        title: "Predictable load sharing",
        description: "Best when models are equivalent and you need smooth distribution.",
        tips: [
            "Use at least 2 models.",
            "Set concurrency limits to avoid burst overload.",
            "Use queue timeout to fail fast under saturation."
        ]
    },
    "context-relay": {
        title: "Session continuity first",
        description: "Best when account rotation is expected and the next account must inherit a condensed task summary.",
        tips: [
            "Use with providers that rotate accounts for the same model family.",
            "Keep the handoff threshold below the hard quota cutoff to give the summary time to generate.",
            "Set a dedicated summary model only when the primary model is too expensive or unstable."
        ]
    },
    random: {
        title: "Quick spread with low setup",
        description: "Use when you need simple distribution without strict guarantees.",
        tips: [
            "Use models with similar latency profiles.",
            "Keep retries enabled to absorb random misses.",
            "Prefer this for experimentation, not strict SLAs."
        ]
    },
    "least-used": {
        title: "Adaptive balancing",
        description: "Routes to less-used models to reduce hotspots over time.",
        tips: [
            "Works better under continuous traffic.",
            "Combine with health checks for safer balancing.",
            "Track per-model usage to validate distribution gains."
        ]
    },
    "cost-optimized": {
        title: "Budget-first routing",
        description: "Routes to lower-cost models when pricing metadata is available.",
        tips: [
            "Ensure pricing coverage for all selected models.",
            "Keep a quality fallback for hard prompts.",
            "Use for batch/background jobs where cost is the main KPI."
        ]
    },
    "reset-aware": {
        title: "Reset-aware account rotation",
        description: "Balances remaining provider quota against reset timing.",
        tips: [
            "Use explicit account steps or account-tag routing for providers with quota telemetry.",
            "Tune session vs weekly weights when short-term exhaustion is more risky.",
            "Keep the tie band small so equivalent accounts still rotate fairly."
        ]
    },
    "fill-first": {
        title: "Quota drain strategy",
        description: "Exhausts one provider's quota before moving to the next in chain.",
        tips: [
            "Order models by free quota size — biggest first.",
            "Enable health checks to skip drained providers.",
            "Ideal for free-tier stacking (Deepgram → Groq → NIM)."
        ]
    },
    p2c: {
        title: "Power-of-Two-Choices",
        description: "Picks the less-loaded of two random candidates per request — low latency at scale.",
        tips: [
            "Use with 4+ models for best effect.",
            "Requires latency telemetry enabled in Settings.",
            "Great replacement for round-robin in high-throughput combos."
        ]
    },
    "strict-random": {
        title: "Shuffle deck distribution",
        description: "Each model is used exactly once per cycle before reshuffling.",
        tips: [
            "Use at least 2 models for meaningful distribution.",
            "Ideal for same-model accounts to evenly spread quota.",
            "Guarantees no model is skipped or repeated within a cycle."
        ]
    },
    auto: {
        title: "Multi-factor optimization",
        description: "Routes based on real-time scoring of cost, latency, quality, and health.",
        tips: [
            "Let the engine balance across multiple factors automatically.",
            "Monitor which factors drive routing decisions in the logs.",
            "Use for complex workloads where no single factor dominates."
        ]
    },
    lkgp: {
        title: "History-based routing",
        description: "Routes based on historical success rates and persistent performance data.",
        tips: [
            "Let success history accumulate before relying on this strategy.",
            "Models with better track records get preference over time.",
            "Ideal for stable workloads with consistent model availability."
        ]
    },
    "context-optimized": {
        title: "Context-aware distribution",
        description: "Routes to optimize context window usage and conversation continuity.",
        tips: [
            "Best for long conversations that span multiple requests.",
            "Selects models with appropriate context capacity automatically.",
            "Use when context limits are a bottleneck for your workload."
        ]
    }
};
const COMBO_USAGE_GUIDE_STORAGE_KEY = "omniroute:combos:hide-usage-guide";
const COMBO_FORM_STAGE_META = [
    {
        id: "basics",
        fallbackLabel: "Basics",
        fallbackDescription: "Name and starting template.",
        icon: "looks_one"
    },
    {
        id: "steps",
        fallbackLabel: "Steps",
        fallbackDescription: "Provider, model and account selection.",
        icon: "looks_two"
    },
    {
        id: "strategy",
        fallbackLabel: "Strategy",
        fallbackDescription: "Routing behavior and advanced settings.",
        icon: "looks_3"
    },
    {
        id: "intelligent",
        fallbackLabel: "Intelligent",
        fallbackDescription: "Auto-routing candidate pool, presets and scoring.",
        icon: "auto_awesome"
    },
    {
        id: "review",
        fallbackLabel: "Review",
        fallbackDescription: "Final verification before saving.",
        icon: "fact_check"
    }
];
const COMBO_TEMPLATE_FALLBACK = {
    title: "Quick templates",
    description: "Apply a starting profile, then adjust models and config.",
    apply: "Apply template",
    highAvailabilityTitle: "High availability",
    highAvailabilityDesc: "Priority routing with health checks and safe retries.",
    costSaverTitle: "Cost saver",
    costSaverDesc: "Cost-optimized routing for budget-first workloads.",
    balancedTitle: "Balanced load",
    balancedDesc: "Least-used routing to spread demand over time.",
    freeStackTitle: "Free Stack ($0)",
    freeStackDesc: "Round-robin across free providers: Kiro, Qoder, Antigravity CLI. Zero cost, never stops.",
    paidPremiumTitle: "Paid Premium",
    paidPremiumDesc: "Round-robin across paid subscriptions: Cursor, Antigravity. Top-tier models, distributed load."
};
const COMBO_TEMPLATES = [
    {
        id: "free-stack",
        icon: "volunteer_activism",
        titleKey: "templateFreeStack",
        descKey: "templateFreeStackDesc",
        fallbackTitle: COMBO_TEMPLATE_FALLBACK.freeStackTitle,
        fallbackDesc: COMBO_TEMPLATE_FALLBACK.freeStackDesc,
        strategy: "round-robin",
        suggestedName: "free-stack",
        isFeatured: true,
        config: {
            maxRetries: 3,
            retryDelayMs: 500
        }
    },
    {
        id: "high-availability",
        icon: "shield",
        titleKey: "templateHighAvailability",
        descKey: "templateHighAvailabilityDesc",
        fallbackTitle: COMBO_TEMPLATE_FALLBACK.highAvailabilityTitle,
        fallbackDesc: COMBO_TEMPLATE_FALLBACK.highAvailabilityDesc,
        strategy: "priority",
        suggestedName: "high-availability",
        config: {
            maxRetries: 2,
            retryDelayMs: 1500
        }
    },
    {
        id: "cost-saver",
        icon: "savings",
        titleKey: "templateCostSaver",
        descKey: "templateCostSaverDesc",
        fallbackTitle: COMBO_TEMPLATE_FALLBACK.costSaverTitle,
        fallbackDesc: COMBO_TEMPLATE_FALLBACK.costSaverDesc,
        strategy: "cost-optimized",
        suggestedName: "cost-saver",
        config: {
            maxRetries: 1,
            retryDelayMs: 500
        }
    },
    {
        id: "balanced",
        icon: "balance",
        titleKey: "templateBalanced",
        descKey: "templateBalancedDesc",
        fallbackTitle: COMBO_TEMPLATE_FALLBACK.balancedTitle,
        fallbackDesc: COMBO_TEMPLATE_FALLBACK.balancedDesc,
        strategy: "least-used",
        suggestedName: "balanced-load",
        config: {
            maxRetries: 1,
            retryDelayMs: 1000
        }
    },
    {
        id: "paid-premium",
        icon: "workspace_premium",
        titleKey: "templatePaidPremium",
        descKey: "templatePaidPremiumDesc",
        fallbackTitle: COMBO_TEMPLATE_FALLBACK.paidPremiumTitle,
        fallbackDesc: COMBO_TEMPLATE_FALLBACK.paidPremiumDesc,
        strategy: "round-robin",
        suggestedName: "paid-premium",
        config: {
            maxRetries: 2,
            retryDelayMs: 1000
        }
    }
];
function getStrategyMeta(strategy) {
    return STRATEGY_OPTIONS.find((s)=>s.value === strategy) || STRATEGY_OPTIONS[0];
}
function getStrategyLabel(t, strategy) {
    const key = getStrategyMeta(strategy).labelKey;
    return getI18nOrFallback(t, key, STRATEGY_LABEL_FALLBACK[strategy] || strategy);
}
function getStrategyDescription(t, strategy) {
    const key = getStrategyMeta(strategy).descKey;
    return getI18nOrFallback(t, key, STRATEGY_DESC_FALLBACK[strategy] || STRATEGY_DESC_FALLBACK.priority || strategy);
}
function getStrategyBadgeClass(strategy) {
    if (strategy === "weighted") return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
    if (strategy === "round-robin") return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
    if (strategy === "context-relay") return "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400";
    if (strategy === "random") return "bg-purple-500/15 text-purple-600 dark:text-purple-400";
    if (strategy === "least-used") return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400";
    if (strategy === "cost-optimized") return "bg-teal-500/15 text-teal-600 dark:text-teal-400";
    if (strategy === "reset-aware") return "bg-lime-500/15 text-lime-700 dark:text-lime-300";
    if (strategy === "fill-first") return "bg-orange-500/15 text-orange-600 dark:text-orange-400";
    if (strategy === "p2c") return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400";
    return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
}
function getI18nOrFallback(t, key, fallback) {
    try {
        if (typeof t.has === "function" && t.has(key)) return t(key);
    } catch  {}
    return fallback;
}
function moveArrayItem(items, fromIndex, toIndex) {
    const nextItems = [
        ...items
    ];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    return nextItems;
}
function getStrategyGuideText(t, strategy, field) {
    const strategyFallback = STRATEGY_GUIDANCE_FALLBACK[strategy] || STRATEGY_GUIDANCE_FALLBACK.priority;
    const key = `strategyGuide.${strategy}.${field}`;
    return getI18nOrFallback(t, key, strategyFallback[field]);
}
function getStrategyRecommendationText(t, strategy, field) {
    const strategyFallback = STRATEGY_RECOMMENDATIONS_FALLBACK[strategy] || STRATEGY_RECOMMENDATIONS_FALLBACK.priority;
    if (field === "tips") {
        return strategyFallback.tips.map((tip, index)=>getI18nOrFallback(t, `strategyRecommendations.${strategy}.tip${index + 1}`, tip));
    }
    return getI18nOrFallback(t, `strategyRecommendations.${strategy}.${field}`, strategyFallback[field]);
}
function normalizeModelEntry(entry) {
    if (typeof entry === "string") return {
        model: entry,
        weight: 0
    };
    if (entry?.kind === "combo-ref") {
        return {
            ...entry,
            model: entry.comboName,
            weight: entry.weight || 0
        };
    }
    if (entry?.kind === "provider-wildcard") {
        return {
            ...entry,
            model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getComboStepTarget"])(entry),
            weight: entry.weight || 0
        };
    }
    return {
        ...entry,
        model: entry.model,
        weight: entry.weight || 0
    };
}
function getModelString(entry) {
    if (typeof entry === "string") return entry;
    if (entry?.kind === "combo-ref") return entry.comboName;
    if (entry?.kind === "provider-wildcard") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getComboStepTarget"])(entry);
    return entry.model;
}
function findProviderNodeByIdentifier(providerNodes, providerIdentifier) {
    return (providerNodes || []).find((node)=>node.id === providerIdentifier || node.prefix === providerIdentifier);
}
function findBuilderProviderByIdentifier(builderProviders, providerIdentifier) {
    return (builderProviders || []).find((provider)=>provider.providerId === providerIdentifier || provider.alias === providerIdentifier || provider.prefix === providerIdentifier);
}
function deriveCandidatePoolFromModels(models) {
    const providerIds = new Set();
    for (const entry of models || []){
        if (!entry) continue;
        if (entry.kind === "combo-ref") continue;
        const modelValue = getModelString(entry);
        const parsed = typeof modelValue === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseQualifiedModel"])(modelValue) : null;
        const providerId = typeof entry.providerId === "string" && entry.providerId.trim().length > 0 ? entry.providerId.trim() : parsed?.providerId;
        if (providerId) providerIds.add(providerId);
    }
    return Array.from(providerIds);
}
function formatComboEntryDisplay(entry, { providerNodes = [], builderProviders = [], includeConnection = false, showFullEmails = true } = {}) {
    const normalizedEntry = normalizeModelEntry(entry);
    if (normalizedEntry.kind === "combo-ref") {
        return `Combo → ${normalizedEntry.comboName}`;
    }
    if (normalizedEntry.kind === "provider-wildcard") {
        const providerIdentifier = normalizedEntry.providerId;
        const builderProvider = findBuilderProviderByIdentifier(builderProviders, providerIdentifier);
        const providerNode = findProviderNodeByIdentifier(providerNodes, providerIdentifier);
        const providerLabel = builderProvider?.displayName || providerNode?.name || providerIdentifier || "provider";
        const patternLabel = normalizedEntry.modelPattern || "*";
        const wildcardLabel = `${providerLabel}/${patternLabel}`;
        if (!includeConnection) {
            return wildcardLabel;
        }
        const connectionId = normalizedEntry.connectionId || null;
        const rawConnectionLabel = connectionId && builderProvider?.connections?.find((connection)=>connection.id === connectionId)?.label || normalizedEntry.label || null;
        const connectionLabel = rawConnectionLabel ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
            rawConnectionLabel
        ], showFullEmails, rawConnectionLabel) : null;
        if (connectionId) {
            return `${wildcardLabel} · ${connectionLabel || `acct ${connectionId.slice(0, 8)}`}`;
        }
        return `${wildcardLabel} · dynamic account`;
    }
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseQualifiedModel"])(normalizedEntry.model);
    if (!parsed) return normalizedEntry.model;
    const providerIdentifier = normalizedEntry.providerId || parsed.providerId;
    const builderProvider = findBuilderProviderByIdentifier(builderProviders, providerIdentifier);
    const providerNode = findProviderNodeByIdentifier(providerNodes, providerIdentifier);
    const providerLabel = builderProvider?.displayName || providerNode?.name || providerIdentifier;
    const modelLabel = builderProvider?.models?.find((model)=>model.id === parsed.modelId)?.name || parsed.modelId;
    if (!includeConnection) {
        return `${providerLabel}/${modelLabel}`;
    }
    const connectionId = normalizedEntry.connectionId || null;
    const rawConnectionLabel = connectionId && builderProvider?.connections?.find((connection)=>connection.id === connectionId)?.label || normalizedEntry.label || null;
    const connectionLabel = rawConnectionLabel ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
        rawConnectionLabel
    ], showFullEmails, rawConnectionLabel) : null;
    if (connectionId) {
        return `${providerLabel}/${modelLabel} · ${connectionLabel || `acct ${connectionId.slice(0, 8)}`}`;
    }
    if (normalizedEntry.providerId || builderProvider) {
        return `${providerLabel}/${modelLabel} · dynamic account`;
    }
    return `${providerLabel}/${modelLabel}`;
}
function CombosPage() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const emailsVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((s)=>s.emailsVisible);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const [combos, setCombos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showCreateModal, setShowCreateModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingCombo, setEditingCombo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeProviders, setActiveProviders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [metrics, setMetrics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [testResults, setTestResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [testingCombo, setTestingCombo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { copied, copy } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useCopyToClipboard$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCopyToClipboard"])();
    const notify = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"])();
    const [proxyTargetCombo, setProxyTargetCombo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [proxyConfig, setProxyConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { comboProxyAssignedIds, fetchComboProxyAssignments } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$useComboProxyAssignments$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useComboProxyAssignments"])();
    const [providerNodes, setProviderNodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showUsageGuide, setShowUsageGuide] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [recentlyCreatedCombo, setRecentlyCreatedCombo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [creatingKimiPreset, setCreatingKimiPreset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [comboDragIndex, setComboDragIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [comboDragOverIndex, setComboDragOverIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [savingComboOrder, setSavingComboOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [comboConfigMode, setComboConfigMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("guided");
    const [promptCompressionEnabled, setPromptCompressionEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedIntelligentComboId, setSelectedIntelligentComboId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const comboDragIndexRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const activeFilter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeIntelligentRoutingFilter"])(searchParams.get("filter"));
    const intelligentCombos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>combos.filter((combo)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isIntelligentStrategy"])(combo?.strategy)), [
        combos
    ]);
    const filteredCombos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterCombosByStrategyCategory"])(combos, activeFilter), [
        combos,
        activeFilter
    ]);
    const selectedIntelligentCombo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (intelligentCombos.length === 0) return null;
        const explicitlySelectedCombo = intelligentCombos.find((combo)=>combo.id === selectedIntelligentComboId) || null;
        if (explicitlySelectedCombo) {
            return explicitlySelectedCombo;
        }
        return activeFilter === "intelligent" ? intelligentCombos[0] : null;
    }, [
        activeFilter,
        intelligentCombos,
        selectedIntelligentComboId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (intelligentCombos.length === 0) {
            setSelectedIntelligentComboId(null);
            return;
        }
        if (selectedIntelligentComboId && !intelligentCombos.some((combo)=>combo.id === selectedIntelligentComboId)) {
            setSelectedIntelligentComboId(null);
        }
    }, [
        intelligentCombos,
        selectedIntelligentComboId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchData();
        fetch("/api/settings").then((r)=>r.ok ? r.json() : null).then((settings)=>setComboConfigMode((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$comboConfigMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeComboConfigMode"])(settings?.comboConfigMode))).catch(()=>setComboConfigMode("guided"));
        fetch("/api/settings/compression").then((r)=>r.ok ? r.json() : null).then((settings)=>setPromptCompressionEnabled(settings?.enabled === true)).catch(()=>setPromptCompressionEnabled(false));
        fetch("/api/settings/proxy").then((r)=>r.ok ? r.json() : null).then((c)=>setProxyConfig(c)).catch(()=>{});
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            if (globalThis.localStorage?.getItem(COMBO_USAGE_GUIDE_STORAGE_KEY) === "1") {
                setShowUsageGuide(false);
            }
        } catch  {
        // Ignore storage access errors (privacy mode / restricted environments)
        }
    }, []);
    const fetchData = async ()=>{
        try {
            const [combosRes, providersRes, metricsRes, nodesRes] = await Promise.all([
                fetch("/api/combos"),
                fetch("/api/providers"),
                fetch("/api/combos/metrics"),
                fetch("/api/provider-nodes")
            ]);
            const combosData = await combosRes.json();
            const providersData = await providersRes.json();
            const metricsData = await metricsRes.json();
            const nodesData = nodesRes.ok ? await nodesRes.json() : {
                nodes: []
            };
            if (combosRes.ok) setCombos((combosData.combos || []).filter((c)=>!c.isHidden));
            if (providersRes.ok) {
                const active = (providersData.connections || []).filter(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isEligibleActiveConnection"]);
                setActiveProviders(active);
            }
            if (metricsRes.ok) setMetrics(metricsData.metrics || {});
            setProviderNodes(nodesData.nodes || []);
        } catch (error) {
            console.log("Error fetching data:", error);
        } finally{
            setLoading(false);
        }
    };
    const handleCreate = async (data)=>{
        try {
            const res = await fetch("/api/combos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                await fetchData();
                setShowCreateModal(false);
                setRecentlyCreatedCombo(data.name?.trim() || "");
                notify.success(t("comboCreated"));
            } else {
                const err = await res.json();
                notify.error(err.error?.message || err.error || t("failedCreate"));
            }
        } catch (error) {
            notify.error(t("errorCreating"));
        }
    };
    const handleUpdate = async (id, data)=>{
        try {
            const res = await fetch(`/api/combos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                await fetchData();
                setEditingCombo(null);
                notify.success(t("comboUpdated"));
            } else {
                const err = await res.json();
                notify.error(err.error?.message || err.error || t("failedUpdate"));
            }
        } catch (error) {
            notify.error(t("errorUpdating"));
        }
    };
    const handleDelete = async (id)=>{
        if (!confirm(t("deleteConfirm"))) return;
        try {
            const res = await fetch(`/api/combos/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setCombos(combos.filter((c)=>c.id !== id));
                notify.success(t("comboDeleted"));
            }
        } catch (error) {
            notify.error(t("errorDeleting"));
        }
    };
    const handleDuplicate = async (combo)=>{
        const baseName = combo.name.replace(/-copy(-\d+)?$/, "");
        const existingNames = combos.map((c)=>c.name);
        let newName = `${baseName}-copy`;
        let counter = 1;
        while(existingNames.includes(newName)){
            counter++;
            newName = `${baseName}-copy-${counter}`;
        }
        const data = {
            name: newName,
            models: combo.models,
            strategy: combo.strategy || "priority",
            config: sanitizeComboRuntimeConfig(combo.config)
        };
        await handleCreate(data);
    };
    // Kimi Coding preset (2026-07 partnership) — one-click create, mirrors
    // handleDuplicate's directness (no separate confirmation modal). See
    // KimiComboPresetCard.tsx for why this bypasses the combo builder wizard.
    const handleCreateKimiPreset = async ()=>{
        setCreatingKimiPreset(true);
        try {
            await handleCreate(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$kimiComboPreset$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KIMI_CODING_PRESET"]);
        } finally{
            setCreatingKimiPreset(false);
        }
    };
    const handleTestCombo = async (combo)=>{
        setTestingCombo(combo.name);
        setTestResults(null);
        try {
            const res = await fetch("/api/combos/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    comboName: combo.name
                })
            });
            const data = await res.json();
            setTestResults(data);
        } catch (error) {
            setTestResults({
                error: t("testFailed")
            });
            notify.error(t("testFailed"));
        }
    };
    const handleToggleCombo = async (combo)=>{
        const newActive = combo.isActive === false ? true : false;
        const previousActive = combo.isActive !== false;
        // Optimistic update
        setCombos((prev)=>prev.map((c)=>c.id === combo.id ? {
                    ...c,
                    isActive: newActive
                } : c));
        try {
            const res = await fetch(`/api/combos/${combo.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    isActive: newActive
                })
            });
            if (!res.ok) {
                // The server rejected the toggle (4xx/5xx). Surface its message instead
                // of silently reverting with a generic toast — never swallow the error.
                const errorBody = await res.json().catch(()=>null);
                setCombos((prev)=>prev.map((c)=>c.id === combo.id ? {
                            ...c,
                            isActive: previousActive
                        } : c));
                notify.error((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$serverErrorMessage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveServerErrorMessage"])(errorBody, t("failedToggle")));
            }
        } catch (error) {
            // Revert on network error
            setCombos((prev)=>prev.map((c)=>c.id === combo.id ? {
                        ...c,
                        isActive: previousActive
                    } : c));
            notify.error(t("failedToggle"));
        }
    };
    const handleHideUsageGuideForever = ()=>{
        setShowUsageGuide(false);
        try {
            globalThis.localStorage?.setItem(COMBO_USAGE_GUIDE_STORAGE_KEY, "1");
        } catch  {}
    };
    const handleShowUsageGuide = ()=>{
        setShowUsageGuide(true);
        try {
            globalThis.localStorage?.removeItem(COMBO_USAGE_GUIDE_STORAGE_KEY);
        } catch  {}
    };
    const handleFilterChange = (nextFilter)=>{
        const params = new URLSearchParams(searchParams.toString());
        if (nextFilter === "all") {
            params.delete("filter");
        } else {
            params.set("filter", nextFilter);
        }
        const queryString = params.toString();
        router.replace(`/dashboard/combos${queryString ? `?${queryString}` : ""}`, {
            scroll: false
        });
    };
    const handleIntelligentComboUpdated = (updatedCombo)=>{
        setCombos((previousCombos)=>previousCombos.map((combo)=>combo.id === updatedCombo?.id ? updatedCombo : combo));
    };
    const resetComboDragState = ()=>{
        comboDragIndexRef.current = null;
        setComboDragIndex(null);
        setComboDragOverIndex(null);
    };
    const handleComboDragStart = (e, index)=>{
        if (savingComboOrder || activeFilter !== "all" || combos.length < 2) {
            e.preventDefault();
            return;
        }
        comboDragIndexRef.current = index;
        setComboDragIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", combos[index]?.id || `${index}`);
        if (e.currentTarget instanceof HTMLElement) {
            setTimeout(()=>{
                e.currentTarget.style.opacity = "0.5";
            }, 0);
        }
    };
    const handleComboDragEnd = (e)=>{
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = "1";
        }
        resetComboDragState();
    };
    const handleComboDragOver = (e, index)=>{
        e.preventDefault();
        const activeDragIndex = comboDragIndexRef.current ?? comboDragIndex;
        if (activeDragIndex === null || activeDragIndex === index) return;
        e.dataTransfer.dropEffect = "move";
        setComboDragOverIndex(index);
    };
    const handleComboDrop = async (e, dropIndex)=>{
        e.preventDefault();
        const fromIndex = comboDragIndexRef.current ?? comboDragIndex;
        resetComboDragState();
        if (fromIndex === null || fromIndex === dropIndex) return;
        const previousCombos = combos;
        const nextCombos = moveArrayItem(combos, fromIndex, dropIndex);
        setCombos(nextCombos);
        setSavingComboOrder(true);
        try {
            const res = await fetch("/api/combos/reorder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    comboIds: nextCombos.map((combo)=>combo.id)
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error?.message || data.error || "Failed to reorder combos");
            }
            if (Array.isArray(data.combos)) {
                setCombos(data.combos);
            }
        } catch  {
            setCombos(previousCombos);
            notify.error(getI18nOrFallback(t, "failedReorder", "Failed to save combo order"));
        } finally{
            setSavingComboOrder(false);
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                    lineNumber: 1072,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                    lineNumber: 1073,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
            lineNumber: 1071,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-semibold",
                                children: t("title")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1082,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-text-muted mt-1",
                                children: t("description")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1083,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1081,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center gap-2",
                        children: [
                            !showUsageGuide && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                size: "sm",
                                variant: "ghost",
                                onClick: handleShowUsageGuide,
                                children: getI18nOrFallback(t, "usageGuideShow", "Show guide")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1088,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                icon: "add",
                                onClick: ()=>setShowCreateModal(true),
                                children: t("createCombo")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1092,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1086,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1080,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$AutoComboCatalog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1098,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$KimiComboPresetCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                alreadyCreated: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$kimiComboPreset$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasKimiCodingPreset"])(combos),
                creating: creatingKimiPreset,
                onCreate: handleCreateKimiPreset
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1100,
                columnNumber: 7
            }, this),
            showUsageGuide && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ComboUsageGuide, {
                onHide: ()=>setShowUsageGuide(false),
                onHideForever: handleHideUsageGuideForever,
                onCreateCombo: ()=>setShowCreateModal(true)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1107,
                columnNumber: 9
            }, this),
            recentlyCreatedCombo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                padding: "sm",
                className: "border border-emerald-500/20 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap items-center justify-between gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-emerald-700 dark:text-emerald-300",
                                    children: getI18nOrFallback(t, "quickTestTitle", `Combo "${recentlyCreatedCombo}" ready to validate`)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1121,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                    className: "inline-block text-[11px] mt-0.5 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                                    children: recentlyCreatedCombo
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1128,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-text-muted mt-0.5",
                                    children: getI18nOrFallback(t, "quickTestDescription", "Run a test now to confirm fallback and latency behavior.")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1131,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1120,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    size: "sm",
                                    variant: "secondary",
                                    icon: "play_arrow",
                                    onClick: ()=>{
                                        handleTestCombo({
                                            name: recentlyCreatedCombo
                                        });
                                        setRecentlyCreatedCombo("");
                                    },
                                    children: getI18nOrFallback(t, "testNow", "Test now")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1140,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    size: "sm",
                                    variant: "ghost",
                                    onClick: ()=>setRecentlyCreatedCombo(""),
                                    children: tc("close")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1151,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1139,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                    lineNumber: 1119,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1115,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-2 rounded-xl border border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-1",
                children: [
                    {
                        id: "all",
                        icon: "layers",
                        label: getI18nOrFallback(t, "filterAll", "All"),
                        count: combos.length
                    },
                    {
                        id: "intelligent",
                        icon: "auto_awesome",
                        label: getI18nOrFallback(t, "filterIntelligent", "Intelligent"),
                        count: combos.filter((combo)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStrategyCategory"])(combo?.strategy) === "intelligent").length
                    },
                    {
                        id: "deterministic",
                        icon: "sort",
                        label: getI18nOrFallback(t, "filterDeterministic", "Deterministic"),
                        count: combos.filter((combo)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStrategyCategory"])(combo?.strategy) === "deterministic").length
                    }
                ].map((tab)=>{
                    const isActive = activeFilter === tab.id;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>handleFilterChange(tab.id),
                        className: `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${isActive ? "border border-primary/20 bg-primary/10 text-primary" : "border border-transparent text-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-main"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[16px]",
                                children: tab.icon
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1194,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: tab.label
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1195,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-black/5 dark:bg-white/5 px-1.5 py-0.5 text-[11px] text-text-muted",
                                children: tab.count
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1196,
                                columnNumber: 15
                            }, this)
                        ]
                    }, tab.id, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1184,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1158,
                columnNumber: 7
            }, this),
            activeFilter === "intelligent" && selectedIntelligentCombo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$IntelligentComboPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                t: t,
                combo: selectedIntelligentCombo,
                allCombos: intelligentCombos,
                activeProviders: activeProviders,
                onComboUpdated: handleIntelligentComboUpdated
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1205,
                columnNumber: 9
            }, this),
            combos.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$EmptyState$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                icon: "🧩",
                title: t("noCombosYet"),
                description: t("description"),
                actionLabel: t("createCombo"),
                onAction: ()=>setShowCreateModal(true)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1215,
                columnNumber: 9
            }, this) : filteredCombos.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                padding: "sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-primary text-[18px]",
                                    children: "filter_alt"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1226,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-semibold text-text-main",
                                    children: getI18nOrFallback(t, "filterEmptyTitle", "No combos match this strategy filter.")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1227,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1225,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-text-muted",
                            children: activeFilter === "intelligent" ? getI18nOrFallback(t, "filterEmptyIntelligentDescription", "Create an auto or LKGP combo to populate the intelligent routing dashboard.") : getI18nOrFallback(t, "filterEmptyDeterministicDescription", "Only auto and LKGP combos exist right now. Switch back to All or create a deterministic combo.")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1231,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                size: "sm",
                                icon: "add",
                                onClick: ()=>setShowCreateModal(true),
                                children: t("createCombo")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1245,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1244,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                    lineNumber: 1224,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1223,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-4",
                children: filteredCombos.map((combo, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        "data-testid": `combo-card-${combo.id}`,
                        onClick: ()=>{
                            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isIntelligentStrategy"])(combo?.strategy)) {
                                setSelectedIntelligentComboId(combo.id);
                            }
                        },
                        onDragOver: (e)=>handleComboDragOver(e, index),
                        onDrop: (e)=>handleComboDrop(e, index),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ComboCard, {
                            combo: combo,
                            metrics: metrics[combo.name],
                            compressionEnabled: promptCompressionEnabled,
                            providerNodes: providerNodes,
                            copied: copied,
                            onCopy: copy,
                            onEdit: ()=>setEditingCombo(combo),
                            onDelete: ()=>handleDelete(combo.id),
                            onDuplicate: ()=>handleDuplicate(combo),
                            onTest: ()=>handleTestCombo(combo),
                            testing: testingCombo === combo.name,
                            onProxy: ()=>setProxyTargetCombo(combo),
                            hasProxy: comboProxyAssignedIds.has(combo.id) || !!proxyConfig?.combos?.[combo.id],
                            onToggle: ()=>handleToggleCombo(combo),
                            dragDisabled: savingComboOrder || activeFilter !== "all" || combos.length < 2,
                            isDragged: comboDragIndex === index,
                            isDropTarget: comboDragOverIndex === index && comboDragIndex !== index,
                            isSelected: selectedIntelligentCombo?.id === combo.id,
                            onDragStart: (e)=>handleComboDragStart(e, index),
                            onDragEnd: handleComboDragEnd
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1265,
                            columnNumber: 15
                        }, this)
                    }, combo.id, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1254,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1252,
                columnNumber: 9
            }, this),
            testResults && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: !!testResults,
                onClose: ()=>{
                    setTestResults(null);
                    setTestingCombo(null);
                },
                title: t("testResults", {
                    name: testingCombo
                }),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TestResultsView, {
                    results: testResults
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                    lineNumber: 1301,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1293,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ComboFormModal, {
                isOpen: showCreateModal,
                onClose: ()=>setShowCreateModal(false),
                onSave: handleCreate,
                activeProviders: activeProviders,
                combo: null,
                comboConfigMode: comboConfigMode
            }, "create", false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1305,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ComboFormModal, {
                isOpen: !!editingCombo,
                combo: editingCombo,
                onClose: ()=>setEditingCombo(null),
                onSave: (data)=>handleUpdate(editingCombo.id, data),
                activeProviders: activeProviders,
                comboConfigMode: comboConfigMode
            }, editingCombo?.id || "new", false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1315,
                columnNumber: 7
            }, this),
            proxyTargetCombo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProxyConfigModal, {
                isOpen: !!proxyTargetCombo,
                onClose: ()=>(setProxyTargetCombo(null), fetchComboProxyAssignments()),
                level: "combo",
                levelId: proxyTargetCombo.id,
                levelLabel: proxyTargetCombo.name
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1326,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
        lineNumber: 1079,
        columnNumber: 5
    }, this);
}
const COMBO_WIZARD_STEPS = [
    {
        step: 1,
        icon: "badge",
        titleKey: "wizardStep1Title",
        descKey: "wizardStep1Desc"
    },
    {
        step: 2,
        icon: "hub",
        titleKey: "wizardStep2Title",
        descKey: "wizardStep2Desc"
    },
    {
        step: 3,
        icon: "route",
        titleKey: "wizardStep3Title",
        descKey: "wizardStep3Desc"
    },
    {
        step: 4,
        icon: "check_circle",
        titleKey: "wizardStep4Title",
        descKey: "wizardStep4Desc"
    }
];
function ComboUsageGuide({ onHide, onHideForever, onCreateCombo }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        padding: "sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-primary text-[16px]",
                                    children: "tips_and_updates"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1373,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1372,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-sm font-semibold",
                                        children: getI18nOrFallback(t, "wizardGuideTitle", "Getting Started with Combos")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1378,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-text-muted mt-0.5",
                                        children: getI18nOrFallback(t, "wizardGuideDesc", "Create model combos to route AI traffic intelligently")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1381,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1377,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1371,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                size: "sm",
                                variant: "ghost",
                                onClick: onHide,
                                className: "!h-6 px-2 text-[10px]",
                                children: getI18nOrFallback(t, "usageGuideHide", "Hide")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1391,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                size: "sm",
                                variant: "ghost",
                                onClick: onHideForever,
                                className: "!h-6 px-2 text-[10px]",
                                children: getI18nOrFallback(t, "usageGuideDontShowAgain", "Don't show again")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1394,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1390,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1370,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 md:grid-cols-4 gap-2 mt-3",
                children: COMBO_WIZARD_STEPS.map((step, index)=>{
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 mb-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary",
                                        children: step.step
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1413,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px] text-primary",
                                        children: step.icon
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1416,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1412,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-medium",
                                children: getI18nOrFallback(t, step.titleKey, step.titleKey)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1420,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-[11px] leading-4 text-text-muted",
                                children: getI18nOrFallback(t, step.descKey, step.descKey)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1423,
                                columnNumber: 15
                            }, this),
                            index < COMBO_WIZARD_STEPS.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-text-muted md:block",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined text-[14px]",
                                    children: "arrow_forward"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1428,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1427,
                                columnNumber: 17
                            }, this)
                        ]
                    }, step.step, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1408,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1405,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        size: "sm",
                        icon: "add",
                        onClick: onCreateCombo,
                        children: getI18nOrFallback(t, "createFirstCombo", "Create Your First Combo")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1437,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-text-muted",
                        children: getI18nOrFallback(t, "wizardGuideHint", "or click + Create Combo above")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1440,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1436,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
        lineNumber: 1369,
        columnNumber: 5
    }, this);
}
function StrategyGuidanceCard({ strategy }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-2.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[11px] text-text-muted",
                children: getI18nOrFallback(t, "strategyGuideTitle", "How to use this strategy")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1452,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-1.5 flex flex-col gap-1.5 text-[11px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-text-main",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: [
                                    getI18nOrFallback(t, "strategyGuideWhen", "When to use"),
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1457,
                                columnNumber: 11
                            }, this),
                            " ",
                            getStrategyGuideText(t, strategy, "when")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1456,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-text-main",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: [
                                    getI18nOrFallback(t, "strategyGuideAvoid", "Avoid when"),
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1463,
                                columnNumber: 11
                            }, this),
                            " ",
                            getStrategyGuideText(t, strategy, "avoid")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1462,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-text-main",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: [
                                    getI18nOrFallback(t, "strategyGuideExample", "Example"),
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1469,
                                columnNumber: 11
                            }, this),
                            " ",
                            getStrategyGuideText(t, strategy, "example")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1468,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1455,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
        lineNumber: 1451,
        columnNumber: 5
    }, this);
}
function StrategyRecommendationsPanel({ strategy, onApply, showNudge }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    const strategyLabel = getStrategyLabel(t, strategy);
    const title = getStrategyRecommendationText(t, strategy, "title");
    const description = getStrategyRecommendationText(t, strategy, "description");
    const tips = getStrategyRecommendationText(t, strategy, "tips");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] p-2.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] text-text-muted",
                                children: getI18nOrFallback(t, "recommendationsLabel", "Recommended setup")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1490,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold text-text-main mt-0.5",
                                children: [
                                    title,
                                    " · ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-primary",
                                        children: strategyLabel
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1494,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1493,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] text-text-muted mt-0.5",
                                children: description
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1496,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1489,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        size: "sm",
                        variant: "ghost",
                        onClick: onApply,
                        className: "!h-6 px-2 text-[10px]",
                        children: getI18nOrFallback(t, "applyRecommendations", "Apply recommendations")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1498,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1488,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 grid grid-cols-1 gap-1",
                children: tips.map((tip, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start gap-1 rounded-md bg-black/[0.02] dark:bg-white/[0.03] px-1.5 py-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[12px] text-primary mt-0.5",
                                children: "check"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1509,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] text-text-main",
                                children: tip
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1510,
                                columnNumber: 13
                            }, this)
                        ]
                    }, `${strategy}-tip-${index + 1}`, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1505,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1503,
                columnNumber: 7
            }, this),
            showNudge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "data-testid": "strategy-change-nudge",
                className: "mt-2 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] text-primary",
                children: getI18nOrFallback(t, "recommendationsUpdated", "Recommendations updated for {strategy}.").replace("{strategy}", strategyLabel)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1516,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
        lineNumber: 1487,
        columnNumber: 5
    }, this);
}
function ComboReadinessPanel({ checks, blockers, showDescription = true }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    const hasBlockers = blockers.length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-testid": "combo-readiness-panel",
        className: `rounded-lg border px-2.5 py-2 ${hasBlockers ? "border-amber-500/30 bg-amber-500/5" : "border-emerald-500/20 bg-emerald-500/[0.04]"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `material-symbols-outlined text-[14px] ${hasBlockers ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`,
                        children: hasBlockers ? "rule" : "check_circle"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1545,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[11px] font-medium text-text-main",
                        children: getI18nOrFallback(t, "readinessTitle", "Ready to save?")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1554,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1544,
                columnNumber: 7
            }, this),
            showDescription && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[10px] text-text-muted mt-0.5",
                children: getI18nOrFallback(t, "readinessDescription", "Review the checklist before creating or updating this combo.")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1560,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2",
                children: checks.map((check)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 rounded-md px-1.5 py-1 bg-black/[0.02] dark:bg-white/[0.02]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `material-symbols-outlined text-[12px] ${check.ok ? "text-emerald-500" : "text-amber-500"}`,
                                children: check.ok ? "task_alt" : "pending"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1575,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] text-text-main",
                                children: check.label
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1582,
                                columnNumber: 13
                            }, this)
                        ]
                    }, check.id, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1571,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1569,
                columnNumber: 7
            }, this),
            hasBlockers && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "data-testid": "combo-save-blockers",
                className: "mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] font-medium text-amber-700 dark:text-amber-300",
                        children: getI18nOrFallback(t, "saveBlockedTitle", "Save is blocked until the following items are fixed:")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1592,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-1 flex flex-col gap-0.5",
                        children: blockers.map((blocker, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] text-amber-700 dark:text-amber-300",
                                children: [
                                    "• ",
                                    blocker
                                ]
                            }, `${blocker}-${index}`, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1601,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1599,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1588,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
        lineNumber: 1536,
        columnNumber: 5
    }, this);
}
function ComboCardInner({ combo, metrics, compressionEnabled, copied, onCopy, onEdit, onDelete, onDuplicate, onTest, testing, onProxy, hasProxy, onToggle, providerNodes, dragDisabled, isDragged, isDropTarget, isSelected, onDragStart, onDragEnd }) {
    const strategy = combo.strategy || "priority";
    const models = combo.models || [];
    const isDisabled = combo.isActive === false;
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const emailsVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((s)=>s.emailsVisible);
    const strategyDescription = getStrategyDescription(t, strategy);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        padding: "sm",
        className: `group transition-all ${isDisabled ? "opacity-50" : ""} ${isDropTarget ? "border border-primary/30 bg-primary/5" : ""} ${isDragged ? "opacity-60" : ""} ${isSelected ? "border-primary/30 bg-primary/[0.04]" : ""}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 md:gap-3 flex-1 min-w-0 w-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            draggable: !dragDisabled,
                            onDragStart: onDragStart,
                            onDragEnd: onDragEnd,
                            "data-testid": `combo-drag-handle-${combo.id}`,
                            className: `p-1 rounded-md transition-colors shrink-0 ${dragDisabled ? "cursor-not-allowed text-text-muted/40" : "cursor-grab active:cursor-grabbing text-text-muted hover:text-primary hover:bg-black/5 dark:hover:bg-white/5"}`,
                            title: getI18nOrFallback(t, "reorderHandle", "Drag to reorder combo"),
                            "aria-label": getI18nOrFallback(t, "reorderHandle", "Drag to reorder combo"),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[18px]",
                                children: "drag_indicator"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1670,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1656,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-primary text-[18px]",
                                children: "layers"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1674,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1673,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0 flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                            className: "text-sm font-medium font-mono truncate",
                                            children: combo.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 1678,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            content: strategyDescription,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded-full ${getStrategyBadgeClass(strategy)}`,
                                                children: getStrategyLabel(t, strategy)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                lineNumber: 1680,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 1679,
                                            columnNumber: 15
                                        }, this),
                                        hasProxy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary flex items-center gap-0.5",
                                            title: t("proxyConfigured"),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[11px]",
                                                    children: "vpn_lock"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 1693,
                                                    columnNumber: 19
                                                }, this),
                                                "proxy"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 1689,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: (e)=>{
                                                e.stopPropagation();
                                                onCopy(combo.name, `combo-${combo.id}`);
                                            },
                                            className: "p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-muted hover:text-primary transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100",
                                            title: t("copyComboName"),
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[14px]",
                                                children: copied === `combo-${combo.id}` ? "check" : "content_copy"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                lineNumber: 1705,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 1697,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1677,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1 mt-0.5 flex-wrap",
                                    children: [
                                        models.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-text-muted italic",
                                            children: t("noModels")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 1713,
                                            columnNumber: 17
                                        }, this) : models.slice(0, 3).map((entry, index)=>{
                                            const { weight } = normalizeModelEntry(entry);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                className: "text-[10px] font-mono bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded text-text-muted",
                                                children: [
                                                    formatComboEntryDisplay(entry, {
                                                        providerNodes,
                                                        includeConnection: true,
                                                        showFullEmails: emailsVisible
                                                    }),
                                                    strategy === "weighted" && weight > 0 ? ` (${weight}%)` : ""
                                                ]
                                            }, index, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                lineNumber: 1718,
                                                columnNumber: 21
                                            }, this);
                                        }),
                                        models.length > 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-text-muted",
                                            children: t("more", {
                                                count: models.length - 3
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 1733,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1711,
                                    columnNumber: 13
                                }, this),
                                metrics && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 mt-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-text-muted",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-emerald-500",
                                                    children: metrics.totalSuccesses
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 1742,
                                                    columnNumber: 19
                                                }, this),
                                                "/",
                                                metrics.totalRequests,
                                                " ",
                                                t("reqs")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 1741,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-text-muted",
                                            children: [
                                                metrics.successRate,
                                                "% ",
                                                t("success")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 1745,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-text-muted",
                                            children: [
                                                "~",
                                                metrics.avgLatencyMs,
                                                "ms"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 1748,
                                            columnNumber: 17
                                        }, this),
                                        metrics.fallbackRate > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-amber-500",
                                            children: [
                                                metrics.fallbackRate,
                                                "% fallback"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 1750,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1740,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1676,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                    lineNumber: 1655,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between md:justify-end gap-1.5 shrink-0 ml-0 md:ml-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t border-black/5 dark:border-white/5 md:border-t-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    size: "sm",
                                    checked: !isDisabled,
                                    onChange: onToggle,
                                    title: isDisabled ? t("enableCombo") : t("disableCombo")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1761,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] text-text-muted md:hidden",
                                    children: isDisabled ? "Disabled" : "Active"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1767,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1760,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1.5 transition-opacity",
                            children: [
                                compressionEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$compression$2f$ComboCompressionModeSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ComboCompressionModeSelect"], {
                                    combo: combo,
                                    title: t("compressionOverride"),
                                    className: "text-xs py-1 px-2 rounded border border-black/10 dark:border-white/10 bg-surface text-text-main focus:border-primary focus:outline-none transition-colors disabled:opacity-50 max-w-[130px] md:max-w-none"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1773,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/dashboard/combos/${combo.id}`,
                                    onClick: (e)=>e.stopPropagation(),
                                    className: "p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-muted hover:text-primary transition-colors",
                                    title: getI18nOrFallback(t, "controlCenter", "Control Center"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px]",
                                        children: "monitoring"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1785,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1779,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onTest,
                                    disabled: testing,
                                    className: "p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-muted hover:text-emerald-500 transition-colors",
                                    title: t("testCombo"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined text-[16px] ${testing ? "animate-spin" : ""}`,
                                        children: testing ? "progress_activity" : "play_arrow"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1793,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1787,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onDuplicate,
                                    className: "p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-muted hover:text-primary transition-colors",
                                    title: t("duplicate"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px]",
                                        children: "content_copy"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1804,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1799,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onProxy,
                                    className: "p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-muted hover:text-primary transition-colors",
                                    title: t("proxyConfig"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px]",
                                        children: "vpn_lock"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1811,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1806,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onEdit,
                                    className: "p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-text-muted hover:text-primary transition-colors",
                                    title: tc("edit"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px]",
                                        children: "edit"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1818,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1813,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onDelete,
                                    className: "p-1.5 hover:bg-red-500/10 rounded text-red-500 transition-colors",
                                    title: tc("delete"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[16px]",
                                        children: "delete"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1825,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1820,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1771,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                    lineNumber: 1759,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
            lineNumber: 1654,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
        lineNumber: 1646,
        columnNumber: 5
    }, this);
}
const ComboCard = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["memo"])(ComboCardInner);
function TestResultsView({ results }) {
    const emailsVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((s)=>s.emailsVisible);
    if (results.error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 text-red-500 text-sm",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[18px]",
                    children: "error"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                    lineNumber: 1841,
                    columnNumber: 9
                }, this),
                typeof results.error === "string" ? results.error : JSON.stringify(results.error)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
            lineNumber: 1840,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-2",
        children: [
            results.resolvedBy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 text-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-emerald-500 text-[18px]",
                        children: "check_circle"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1851,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "Resolved by:",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded",
                                        children: results.resolvedBy
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 1857,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1855,
                                columnNumber: 13
                            }, this),
                            results.resolvedByTarget?.connectionId || results.resolvedByTarget?.stepId ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-1 text-xs text-text-muted",
                                children: [
                                    results.resolvedByTarget?.connectionId ? `account ${results.resolvedByTarget.connectionId.slice(0, 8)}` : "dynamic account",
                                    results.resolvedByTarget?.stepId ? ` · step ${results.resolvedByTarget.stepId}` : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                lineNumber: 1862,
                                columnNumber: 15
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                        lineNumber: 1854,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 1850,
                columnNumber: 9
            }, this),
            results.results?.map((r, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    title: r.error || undefined,
                    className: "flex items-center gap-2 text-xs px-2 py-1.5 rounded bg-black/[0.02] dark:bg-white/[0.02]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `material-symbols-outlined text-[14px] ${r.status === "ok" ? "text-emerald-500" : r.status === "skipped" ? "text-text-muted" : "text-red-500"}`,
                            children: r.status === "ok" ? "check_circle" : r.status === "skipped" ? "skip_next" : "error"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1880,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0 flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                    className: "font-mono block truncate",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
                                        r.label
                                    ], emailsVisible, r.model)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1892,
                                    columnNumber: 13
                                }, this),
                                r.connectionId || r.stepId ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-0.5 text-[10px] text-text-muted",
                                    children: [
                                        r.connectionId ? `acct ${r.connectionId.slice(0, 8)}` : "dynamic account",
                                        r.stepId ? ` · ${r.stepId}` : ""
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 1896,
                                    columnNumber: 15
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1891,
                            columnNumber: 11
                        }, this),
                        r.latencyMs !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-text-muted",
                            children: [
                                r.latencyMs,
                                "ms"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1902,
                            columnNumber: 41
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-[10px] uppercase font-medium ${r.status === "ok" ? "text-emerald-500" : r.status === "skipped" ? "text-text-muted" : "text-red-500"}`,
                            children: r.status
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 1903,
                            columnNumber: 11
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                    lineNumber: 1875,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
        lineNumber: 1848,
        columnNumber: 5
    }, this);
}
function ComboFormModal({ isOpen, combo, onClose, onSave, activeProviders, comboConfigMode }) {
    const getEmptyCreateDraftSnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>({
            name: "",
            models: [],
            strategy: "priority",
            config: {},
            showAdvanced: false,
            nameError: "",
            agentSystemMessage: "",
            agentToolFilter: "",
            agentContextCache: false,
            contextLength: undefined
        }), []);
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("combos");
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("common");
    const emailsVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((s)=>s.emailsVisible);
    const notify = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"])();
    const isExpertMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$comboConfigMode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeComboConfigMode"])(comboConfigMode) === "expert";
    const createDraftStateRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(getEmptyCreateDraftSnapshot());
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(combo?.name || "");
    const [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(combo?.description || "");
    const [models, setModels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        return (combo?.models || []).map((m)=>normalizeModelEntry(m));
    });
    const [strategy, setStrategy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(combo?.strategy || "priority");
    const [showModelSelect, setShowModelSelect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [nameError, setNameError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [pricingByProvider, setPricingByProvider] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [modelAliases, setModelAliases] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [providerNodes, setProviderNodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [builderOptions, setBuilderOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        providers: [],
        comboRefs: []
    });
    const [builderLoading, setBuilderLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [builderProviderId, setBuilderProviderId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [builderModelId, setBuilderModelId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [builderConnectionId, setBuilderConnectionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMBO_BUILDER_AUTO_CONNECTION"]);
    // #3266: optional account allowlist — scopes an auto-selecting step's round-robin
    // to a subset of the provider's connections. Empty = whole active pool.
    const [builderAllowedConnectionIds, setBuilderAllowedConnectionIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [manualModelInput, setManualModelInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [manualModelError, setManualModelError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [builderComboRefName, setBuilderComboRefName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [builderError, setBuilderError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [builderStage, setBuilderStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMBO_BUILDER_STAGES"][0]);
    const [showAdvanced, setShowAdvanced] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(sanitizeComboRuntimeConfig(combo?.config));
    const [showStrategyNudge, setShowStrategyNudge] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const strategyChangeMountedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Agent features (#399 / #401 / #454)
    const [agentSystemMessage, setAgentSystemMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(combo?.system_message || "");
    const [agentToolFilter, setAgentToolFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(combo?.tool_filter_regex || "");
    const [agentContextCache, setAgentContextCache] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(!!combo?.context_cache_protection);
    const [contextLength, setContextLength] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(combo?.context_length || undefined);
    const [contextLengthError, setContextLengthError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const comboBuilderStages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getComboBuilderStages"])({
            strategy
        }), [
        strategy
    ]);
    const visibleStageMeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>COMBO_FORM_STAGE_META.filter((stageMeta)=>comboBuilderStages.includes(stageMeta.id)), [
        comboBuilderStages
    ]);
    const usesIntelligentBuilderStage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isIntelligentBuilderStrategy"])(strategy);
    const intelligentConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$intelligentRouting$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeIntelligentRoutingConfig"])(config), [
        config
    ]);
    const resetFormForCombo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((nextCombo, comboDefaults = null)=>{
        const nextDefaults = nextCombo || comboDefaults ? {
            ...comboDefaults || {}
        } : {};
        const nextConfig = nextCombo?.config ? sanitizeComboRuntimeConfig(nextCombo.config) : sanitizeComboRuntimeConfig(Object.fromEntries(Object.entries(nextDefaults).filter(([key])=>key !== "strategy")));
        setName(nextCombo?.name || "");
        setDescription(nextCombo?.description || "");
        setModels((nextCombo?.models || []).map((m)=>normalizeModelEntry(m)));
        setStrategy(nextCombo?.strategy || comboDefaults?.strategy || "priority");
        setConfig(nextConfig);
        setShowAdvanced(isExpertMode);
        setNameError("");
        setContextLengthError("");
        setAgentSystemMessage(nextCombo?.system_message || "");
        setAgentToolFilter(nextCombo?.tool_filter_regex || "");
        setAgentContextCache(!!nextCombo?.context_cache_protection);
        setContextLength(nextCombo?.context_length || undefined);
    }, [
        isExpertMode,
        setAgentContextCache,
        setContextLength
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        createDraftStateRef.current = {
            name,
            models,
            strategy,
            config,
            showAdvanced,
            nameError,
            agentSystemMessage,
            agentToolFilter,
            agentContextCache,
            contextLength
        };
    }, [
        name,
        models,
        strategy,
        config,
        showAdvanced,
        nameError,
        agentSystemMessage,
        agentToolFilter,
        agentContextCache,
        contextLength
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!comboBuilderStages.includes(builderStage)) {
            setBuilderStage("strategy");
        }
    }, [
        builderStage,
        comboBuilderStages
    ]);
    const hasPricingForModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((modelValue)=>{
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseQualifiedModel"])(modelValue);
        if (!parsed) return false;
        const { providerId: providerIdentifier, modelId } = parsed;
        const matchedNode = findProviderNodeByIdentifier(providerNodes, providerIdentifier);
        const providerCandidates = [
            providerIdentifier
        ];
        if (matchedNode?.apiType) providerCandidates.push(matchedNode.apiType);
        if (matchedNode?.name) providerCandidates.push(String(matchedNode.name).toLowerCase());
        return providerCandidates.some((candidate)=>!!pricingByProvider?.[candidate]?.[modelId]);
    }, [
        pricingByProvider,
        providerNodes
    ]);
    const [dragIndex, setDragIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dragOverIndex, setDragOverIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const builderProviders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>builderOptions.providers || [], [
        builderOptions.providers
    ]);
    const builderComboRefs = (builderOptions.comboRefs || []).filter((comboRef)=>comboRef.name !== combo?.name && comboRef.name !== name.trim());
    const selectedBuilderProvider = builderProviders.find((provider)=>provider.providerId === builderProviderId) || null;
    const selectedBuilderModel = selectedBuilderProvider?.models?.find((model)=>model.id === builderModelId) || null;
    const selectedBuilderConnections = selectedBuilderProvider?.connections || [];
    const selectedBuilderConnection = builderConnectionId && builderConnectionId !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMBO_BUILDER_AUTO_CONNECTION"] ? selectedBuilderConnections.find((connection)=>connection.id === builderConnectionId) || null : null;
    // Defensive: only carry allowlist ids that still belong to the selected provider's
    // connections, so stale ids from a previous provider can never leak into a step.
    const builderEffectiveAllowedConnectionIds = builderAllowedConnectionIds.filter((id)=>selectedBuilderConnections.some((connection)=>connection.id === id));
    const builderCandidateStep = selectedBuilderProvider && selectedBuilderModel ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildPrecisionComboModelStep"])({
        providerId: selectedBuilderProvider.providerId,
        modelId: selectedBuilderModel.id,
        connectionId: builderConnectionId !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMBO_BUILDER_AUTO_CONNECTION"] ? builderConnectionId : null,
        connectionLabel: selectedBuilderConnection?.label || null,
        allowedConnectionIds: builderEffectiveAllowedConnectionIds
    }) : null;
    const builderHasDuplicate = builderCandidateStep && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasExactModelStepDuplicate"])(models, builderCandidateStep);
    const manualModelStep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildManualComboModelStep"])({
        value: manualModelInput,
        providers: builderProviders
    });
    const manualModelHasDuplicate = manualModelStep && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasExactModelStepDuplicate"])(models, manualModelStep);
    const weightTotal = models.reduce((sum, modelEntry)=>sum + (modelEntry.weight || 0), 0);
    const pricedModelCount = models.reduce((count, modelEntry)=>count + (hasPricingForModel(modelEntry.model) ? 1 : 0), 0);
    const pricingCoveragePercent = models.length > 0 ? Math.round(pricedModelCount / models.length * 100) : 0;
    const hasNoModels = models.length === 0;
    const hasRoundRobinSingleModel = strategy === "round-robin" && models.length === 1;
    const hasCostOptimizedWithoutPricing = strategy === "cost-optimized" && models.length > 0 && pricedModelCount === 0;
    const hasCostOptimizedPartialPricing = strategy === "cost-optimized" && models.length > 0 && pricedModelCount > 0 && pricedModelCount < models.length;
    const hasInvalidWeightedTotal = strategy === "weighted" && models.length > 0 && weightTotal !== 100;
    const builderStageChecks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getComboBuilderStageChecks"])({
        name,
        nameError,
        modelsCount: models.length,
        hasInvalidWeightedTotal,
        hasCostOptimizedWithoutPricing
    });
    const canAdvanceFromCurrentStage = builderStage === "basics" ? builderStageChecks.basics : builderStage === "steps" ? builderStageChecks.steps : builderStage === "intelligent" ? true : true;
    const currentStageIndex = visibleStageMeta.findIndex((stageMeta)=>stageMeta.id === builderStage);
    const pinnedAccountCount = models.filter((entry)=>Boolean(entry?.connectionId)).length;
    const comboRefCount = models.filter((entry)=>entry?.kind === "combo-ref").length;
    const uniqueProviderCount = new Set(models.map((entry)=>{
        const target = getModelString(entry);
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseQualifiedModel"])(target);
        return entry?.providerId || parsed?.providerId || null;
    }).filter(Boolean)).size;
    const saveBlocked = !name.trim() || !!nameError || !!contextLengthError || saving || hasNoModels || hasInvalidWeightedTotal || hasCostOptimizedWithoutPricing;
    const readinessChecks = [
        {
            id: "name",
            ok: !!name.trim() && !nameError,
            label: getI18nOrFallback(t, "readinessCheckName", "Combo name is valid")
        },
        {
            id: "models",
            ok: !hasNoModels,
            label: getI18nOrFallback(t, "readinessCheckModels", "At least one model is selected")
        },
        {
            id: "weights",
            ok: strategy === "weighted" ? !hasInvalidWeightedTotal : true,
            label: strategy === "weighted" ? getI18nOrFallback(t, "readinessCheckWeights", "Weighted total is 100%") : getI18nOrFallback(t, "readinessCheckWeightsOptional", "Weight rule not required")
        },
        {
            id: "pricing",
            ok: strategy === "cost-optimized" ? !hasCostOptimizedWithoutPricing : true,
            label: strategy === "cost-optimized" ? getI18nOrFallback(t, "readinessCheckPricing", "Pricing data is available") : getI18nOrFallback(t, "readinessCheckPricingOptional", "Pricing rule not required")
        }
    ];
    const saveBlockers = [];
    if (!name.trim()) {
        saveBlockers.push(getI18nOrFallback(t, "saveBlockName", "Define a combo name."));
    } else if (nameError) {
        saveBlockers.push(nameError);
    }
    if (hasNoModels) {
        saveBlockers.push(getI18nOrFallback(t, "saveBlockModels", "Add at least one model."));
    }
    if (hasInvalidWeightedTotal) {
        saveBlockers.push(typeof t.has === "function" && t.has("saveBlockWeighted") ? t("saveBlockWeighted", {
            total: weightTotal
        }) : `Set weights to 100% (current: ${weightTotal}%).`);
    }
    if (hasCostOptimizedWithoutPricing) {
        saveBlockers.push(getI18nOrFallback(t, "saveBlockPricing", "Add pricing for at least one model or choose a different strategy."));
    }
    const showInlineReadinessPanel = !isExpertMode || saveBlockers.length > 0;
    const fetchModalData = async ()=>{
        setBuilderLoading(true);
        try {
            const [aliasesRes, nodesRes, pricingRes, builderRes] = await Promise.all([
                fetch("/api/models/alias"),
                fetch("/api/provider-nodes"),
                fetch("/api/pricing"),
                fetch("/api/combos/builder/options")
            ]);
            if (!aliasesRes.ok || !nodesRes.ok) {
                throw new Error(`Failed to fetch data: aliases=${aliasesRes.status}, nodes=${nodesRes.status}`);
            }
            const pricingData = pricingRes.ok ? await pricingRes.json() : {};
            const builderData = builderRes.ok ? await builderRes.json() : {};
            const [aliasesData, nodesData] = await Promise.all([
                aliasesRes.json(),
                nodesRes.json()
            ]);
            setPricingByProvider(pricingData && typeof pricingData === "object" && !Array.isArray(pricingData) ? pricingData : {});
            setModelAliases(aliasesData.aliases || {});
            setProviderNodes(nodesData.nodes || []);
            setBuilderOptions({
                providers: builderData.providers || [],
                comboRefs: builderData.comboRefs || []
            });
        } catch (error) {
            console.error("Error fetching modal data:", error);
            setBuilderOptions({
                providers: [],
                comboRefs: []
            });
        } finally{
            setBuilderLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen) fetchModalData();
    }, [
        isOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isOpen) return;
        setBuilderProviderId("");
        setBuilderModelId("");
        setBuilderConnectionId(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMBO_BUILDER_AUTO_CONNECTION"]);
        setBuilderAllowedConnectionIds([]);
        setManualModelInput("");
        setManualModelError("");
        setBuilderComboRefName("");
        setBuilderError("");
        setBuilderStage("basics");
    }, [
        combo?.id,
        isOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isOpen) return;
        let cancelled = false;
        if (combo) {
            resetFormForCombo(combo);
            return ()=>{
                cancelled = true;
            };
        }
        createDraftStateRef.current = getEmptyCreateDraftSnapshot();
        resetFormForCombo(null, null);
        const loadDefaults = async ()=>{
            try {
                const response = await fetch("/api/settings/combo-defaults");
                const data = response.ok ? await response.json() : {};
                const draft = createDraftStateRef.current;
                const isPristineDraft = draft.name.trim().length === 0 && draft.models.length === 0 && draft.strategy === "priority" && Object.keys(draft.config || {}).length === 0 && (draft.showAdvanced === false || isExpertMode && draft.showAdvanced === true) && draft.nameError.length === 0 && draft.agentSystemMessage.length === 0 && draft.agentToolFilter.length === 0 && draft.agentContextCache === false && draft.contextLength === undefined;
                if (!cancelled && isPristineDraft) {
                    resetFormForCombo(null, data.comboDefaults || null);
                }
            } catch  {
            // Keep the blank create form if defaults fail to load.
            }
        };
        loadDefaults();
        return ()=>{
            cancelled = true;
        };
    }, [
        combo,
        getEmptyCreateDraftSnapshot,
        isExpertMode,
        isOpen,
        resetFormForCombo
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isOpen) return;
        if (builderProviderId) return;
        if (builderProviders.length === 1) {
            setBuilderProviderId(builderProviders[0].providerId);
        }
    }, [
        builderProviderId,
        builderProviders,
        isOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!strategyChangeMountedRef.current) {
            strategyChangeMountedRef.current = true;
            return;
        }
        setShowStrategyNudge(true);
        const timeoutId = setTimeout(()=>setShowStrategyNudge(false), 2600);
        return ()=>clearTimeout(timeoutId);
    }, [
        strategy
    ]);
    const validateName = (value)=>{
        if (!value.trim()) {
            setNameError(t("nameRequired"));
            return false;
        }
        if (!VALID_NAME_REGEX.test(value)) {
            setNameError(t("nameInvalid"));
            return false;
        }
        setNameError("");
        return true;
    };
    const handleNameChange = (e)=>{
        const value = e.target.value;
        setName(value);
        if (value) validateName(value);
        else setNameError("");
    };
    const handleBuilderProviderChange = (e)=>{
        const nextProviderId = e.target.value;
        setBuilderProviderId(nextProviderId);
        setBuilderModelId("");
        setBuilderConnectionId(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMBO_BUILDER_AUTO_CONNECTION"]);
        setBuilderAllowedConnectionIds([]);
        setBuilderError("");
    };
    const handleBuilderAllowedConnectionToggle = (connectionId)=>{
        setBuilderAllowedConnectionIds((prev)=>prev.includes(connectionId) ? prev.filter((id)=>id !== connectionId) : [
                ...prev,
                connectionId
            ]);
        setBuilderError("");
    };
    const handleBuilderModelChange = (e)=>{
        const nextModelId = e.target.value;
        setBuilderModelId(nextModelId);
        setBuilderError("");
        if (!nextModelId || !selectedBuilderProvider) {
            setBuilderConnectionId(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMBO_BUILDER_AUTO_CONNECTION"]);
            return;
        }
        setBuilderConnectionId((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findNextSuggestedConnectionId"])(models, selectedBuilderProvider.providerId, nextModelId, selectedBuilderProvider.connections || []));
    };
    const handleBuilderConnectionChange = (e)=>{
        setBuilderConnectionId(e.target.value || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMBO_BUILDER_AUTO_CONNECTION"]);
        setBuilderError("");
    };
    const handleGoToNextStage = ()=>{
        setBuilderStage((currentStage)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getNextComboBuilderStage"])(currentStage, {
                strategy
            }));
    };
    const handleGoToPreviousStage = ()=>{
        setBuilderStage((currentStage)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPreviousComboBuilderStage"])(currentStage, {
                strategy
            }));
    };
    const handleAddBuilderStep = ()=>{
        if (!selectedBuilderProvider || !selectedBuilderModel) {
            return;
        }
        const nextStep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildPrecisionComboModelStep"])({
            providerId: selectedBuilderProvider.providerId,
            modelId: selectedBuilderModel.id,
            connectionId: builderConnectionId !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMBO_BUILDER_AUTO_CONNECTION"] ? builderConnectionId : null,
            connectionLabel: selectedBuilderConnection?.label || null,
            allowedConnectionIds: builderEffectiveAllowedConnectionIds
        });
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasExactModelStepDuplicate"])(models, nextStep)) {
            setBuilderError(getI18nOrFallback(t, "builderDuplicateExact", "This exact provider/model/account step is already in the combo."));
            return;
        }
        const nextModels = [
            ...models,
            nextStep
        ];
        setModels(nextModels);
        setBuilderError("");
        setBuilderAllowedConnectionIds([]);
        setBuilderConnectionId((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findNextSuggestedConnectionId"])(nextModels, selectedBuilderProvider.providerId, selectedBuilderModel.id, selectedBuilderConnections));
    };
    const handleAddManualModel = ()=>{
        const parsedManualModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseQualifiedModel"])(manualModelInput);
        if (!parsedManualModel) {
            setManualModelError(getI18nOrFallback(t, "manualModelInvalid", "Enter a model as provider/model."));
            return;
        }
        const resolvedProviderId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveComboBuilderProviderId"])(parsedManualModel.providerId, builderProviders);
        if (!resolvedProviderId) {
            setManualModelError(getI18nOrFallback(t, "manualModelUnknownProvider", "Unknown provider prefix."));
            return;
        }
        const nextStep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildManualComboModelStep"])({
            value: manualModelInput,
            providers: builderProviders
        });
        if (!nextStep) {
            setManualModelError(getI18nOrFallback(t, "manualModelInvalid", "Enter a model as provider/model."));
            return;
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasExactModelStepDuplicate"])(models, nextStep)) {
            setManualModelError(getI18nOrFallback(t, "builderDuplicateExact", "This exact provider/model/account step is already in the combo."));
            return;
        }
        setModels([
            ...models,
            nextStep
        ]);
        setManualModelInput("");
        setManualModelError("");
    };
    const handleAddComboReference = ()=>{
        if (!builderComboRefName) return;
        setModels([
            ...models,
            {
                kind: "combo-ref",
                comboName: builderComboRefName,
                weight: 0
            }
        ]);
        setBuilderComboRefName("");
        setBuilderError("");
    };
    const handleAddModel = (model)=>{
        const qualifiedModel = typeof model?.value === "string" ? model.value : "";
        const parsedModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseQualifiedModel"])(qualifiedModel);
        const resolvedProviderId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveComboBuilderProviderId"])(model?.providerId, builderProviders) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveComboBuilderProviderId"])(parsedModel?.providerId, builderProviders) || typeof model?.providerId === "string" && model.providerId.trim() || parsedModel?.providerId || null;
        const nextEntry = {
            model: qualifiedModel,
            ...resolvedProviderId ? {
                providerId: resolvedProviderId
            } : {},
            weight: 0
        };
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasExactModelStepDuplicate"])(models, nextEntry)) {
            setBuilderError(getI18nOrFallback(t, "builderDuplicateExact", "This exact provider/model/account step is already in the combo."));
            return;
        }
        setModels([
            ...models,
            nextEntry
        ]);
        setBuilderError("");
    };
    const handleRemoveModel = (index)=>{
        setModels(models.filter((_, i)=>i !== index));
    };
    // Upstream PR decolua/9router#889 (Fajar Hidayat): clicking a model that is
    // already in the combo, inside ModelSelectModal, deselects it in place. We
    // strip every step whose qualified model matches — duplicates with a
    // different providerId/weight that point at the same model id are all
    // removed (matches upstream JS semantics which filtered by a single-string
    // identity).
    const handleDeselectModel = (model)=>{
        const value = typeof model?.value === "string" ? model.value : typeof model === "string" ? model : "";
        if (!value) return;
        setModels(models.filter((m)=>m.model !== value));
        setBuilderError("");
    };
    // Batch add for ModelSelectModal "Select all" — delegates to the pure
    // computeBatchAddModelSteps (src/lib/combos/builderDraft.ts) which applies
    // every candidate against a growing list in one pass, otherwise N× onSelect
    // would each close over the same stale `models` snapshot and keep only the
    // last entry. Extracted so tests exercise this real implementation instead
    // of a hand-maintained mirror (#8526).
    const handleAddModels = (selected)=>{
        const { next, addedAny } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeBatchAddModelSteps"])(models, selected, builderProviders);
        if (!addedAny) return;
        setModels(next);
        setBuilderError("");
    };
    const handleDeselectModels = (toRemove)=>{
        const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeBatchDeselectModelSteps"])(models, toRemove);
        if (next === models) return;
        setModels(next);
        setBuilderError("");
    };
    const handleWeightChange = (index, weight)=>{
        const newModels = [
            ...models
        ];
        newModels[index] = {
            ...newModels[index],
            weight: Math.max(0, Math.min(100, Number(weight) || 0))
        };
        setModels(newModels);
    };
    const handleAutoBalance = ()=>{
        const count = models.length;
        if (count === 0) return;
        const weight = Math.floor(100 / count);
        const remainder = 100 - weight * count;
        setModels(models.map((m, i)=>({
                ...m,
                weight: weight + (i === 0 ? remainder : 0)
            })));
    };
    const applyStrategyRecommendations = ()=>{
        const strategyDefaults = {
            priority: {
                maxRetries: 2,
                retryDelayMs: 1500
            },
            weighted: {
                maxRetries: 1,
                retryDelayMs: 1000
            },
            "round-robin": {
                maxRetries: 1,
                retryDelayMs: 750,
                concurrencyPerModel: 3,
                queueTimeoutMs: 30000
            },
            "context-relay": {
                maxRetries: 1,
                retryDelayMs: 750,
                handoffThreshold: 0.85,
                maxMessagesForSummary: 30
            },
            random: {
                maxRetries: 1,
                retryDelayMs: 1000
            },
            "least-used": {
                maxRetries: 1,
                retryDelayMs: 1000
            },
            "cost-optimized": {
                maxRetries: 1,
                retryDelayMs: 500
            }
        };
        const defaults = strategyDefaults[strategy] || strategyDefaults.priority;
        setConfig((prev)=>{
            const next = {
                ...prev
            };
            for (const [key, value] of Object.entries(defaults)){
                if (next[key] === undefined || next[key] === null || next[key] === "") {
                    next[key] = value;
                }
            }
            return next;
        });
        if (strategy === "weighted" && models.length > 1) {
            handleAutoBalance();
        }
        if (strategy === "round-robin" || strategy === "weighted") {
            setShowAdvanced(true);
        }
        notify.success(getI18nOrFallback(t, "recommendationsApplied", "Recommendations applied to this combo."));
    };
    const FREE_STACK_PRESET_MODELS = [
        {
            model: "agy/gemini-3.5-flash-low",
            weight: 0
        },
        {
            model: "kr/claude-sonnet-4.5",
            weight: 0
        },
        {
            model: "if/kimi-k2-thinking",
            weight: 0
        },
        {
            model: "if/qwen3-coder-plus",
            weight: 0
        },
        {
            model: "if/deepseek-v3.2",
            weight: 0
        },
        {
            model: "nvidia/llama-3.3-70b-instruct",
            weight: 0
        },
        {
            model: "groq/llama-3.3-70b-versatile",
            weight: 0
        }
    ];
    const PAID_PREMIUM_PRESET_MODELS = [
        {
            model: "cu/claude-4.6-opus-high",
            weight: 0
        },
        {
            model: "antigravity/claude-sonnet-4-6",
            weight: 0
        },
        {
            model: "cu/claude-4.6-sonnet-high",
            weight: 0
        },
        {
            model: "antigravity/gemini-pro-agent",
            weight: 0
        }
    ];
    const applyTemplate = (template)=>{
        setStrategy(template.strategy);
        setConfig((prev)=>({
                ...prev,
                ...template.config
            }));
        if (!name.trim()) setName(template.suggestedName);
        if (template.id === "free-stack") {
            setModels(FREE_STACK_PRESET_MODELS);
        } else if (template.id === "paid-premium") {
            setModels(PAID_PREMIUM_PRESET_MODELS);
        }
    };
    // Format model display name with readable provider name
    const formatModelDisplay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((entry)=>{
        return formatComboEntryDisplay(entry, {
            providerNodes,
            builderProviders,
            includeConnection: true,
            showFullEmails: emailsVisible
        });
    }, [
        builderProviders,
        emailsVisible,
        providerNodes
    ]);
    const handleMoveUp = (index)=>{
        if (index === 0) return;
        const newModels = [
            ...models
        ];
        [newModels[index - 1], newModels[index]] = [
            newModels[index],
            newModels[index - 1]
        ];
        setModels(newModels);
    };
    const handleMoveDown = (index)=>{
        if (index === models.length - 1) return;
        const newModels = [
            ...models
        ];
        [newModels[index], newModels[index + 1]] = [
            newModels[index + 1],
            newModels[index]
        ];
        setModels(newModels);
    };
    // Drag and Drop handlers
    const handleDragStart = (e, index)=>{
        setDragIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
        // Make drag image slightly transparent
        if (e.target) {
            setTimeout(()=>e.currentTarget.style.opacity = "0.5", 0);
        }
    };
    const handleDragEnd = (e)=>{
        if (e.target) e.currentTarget.style.opacity = "1";
        setDragIndex(null);
        setDragOverIndex(null);
    };
    const handleDragOver = (e, index)=>{
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverIndex(index);
    };
    const handleDrop = (e, dropIndex)=>{
        e.preventDefault();
        const fromIndex = dragIndex;
        if (fromIndex === null || fromIndex === dropIndex) return;
        const newModels = [
            ...models
        ];
        const [moved] = newModels.splice(fromIndex, 1);
        newModels.splice(dropIndex, 0, moved);
        setModels(newModels);
        setDragIndex(null);
        setDragOverIndex(null);
    };
    const handleSave = async ()=>{
        if (!validateName(name)) return;
        if (hasNoModels || hasInvalidWeightedTotal || hasCostOptimizedWithoutPricing) return;
        setSaving(true);
        const saveData = {
            name: name.trim(),
            models,
            strategy
        };
        // Per-combo description (#5005). Free-text, optional, persisted in combo data.
        if (description.trim()) {
            saveData.description = description.trim();
        } else if (isEdit) {
            // Editing: send null to explicitly clear a previously-set description.
            saveData.description = null;
        }
        const configToSave = sanitizeComboRuntimeConfig(config);
        if (strategy === "round-robin") {
            if (config.concurrencyPerModel !== undefined) configToSave.concurrencyPerModel = config.concurrencyPerModel;
            if (config.queueTimeoutMs !== undefined) configToSave.queueTimeoutMs = config.queueTimeoutMs;
            if (config.stickyRoundRobinLimit !== undefined) configToSave.stickyRoundRobinLimit = config.stickyRoundRobinLimit;
        }
        if (strategy === "weighted" && config.stickyWeightedLimit !== undefined) {
            configToSave.stickyWeightedLimit = config.stickyWeightedLimit;
        }
        if (usesIntelligentBuilderStage && !isExpertMode && (!Array.isArray(configToSave.candidatePool) || configToSave.candidatePool.length === 0)) {
            const derivedCandidatePool = deriveCandidatePoolFromModels(models);
            if (derivedCandidatePool.length > 0) {
                configToSave.candidatePool = derivedCandidatePool;
            }
        }
        const hasConfigToSave = Object.keys(configToSave).length > 0;
        const hadExistingConfig = Object.keys(sanitizeComboRuntimeConfig(combo?.config)).length > 0;
        if (hasConfigToSave || isEdit && hadExistingConfig) {
            saveData.config = configToSave;
        }
        // Agent features (#399 / #401 / #454)
        if (agentSystemMessage.trim()) saveData.system_message = agentSystemMessage.trim();
        else delete saveData.system_message;
        if (agentToolFilter.trim()) saveData.tool_filter_regex = agentToolFilter.trim();
        else delete saveData.tool_filter_regex;
        if (agentContextCache) saveData.context_cache_protection = true;
        else delete saveData.context_cache_protection;
        // Validate and save context_length
        if (contextLength !== undefined && contextLength !== null) {
            const ctxLen = Number(contextLength);
            if (isNaN(ctxLen) || !Number.isInteger(ctxLen)) {
                setContextLengthError(t("agentFeaturesContextLengthErrorInteger"));
                setSaving(false);
                return;
            }
            if (ctxLen >= 1000 && ctxLen <= 2000000) {
                saveData.context_length = ctxLen;
            } else {
                setContextLengthError(t("agentFeaturesContextLengthErrorRange"));
                setSaving(false);
                return;
            }
        } else if (isEdit) {
            // Editing: send null to explicitly clear context_length
            saveData.context_length = null;
        } else {
            delete saveData.context_length;
        }
        await onSave(saveData);
        setSaving(false);
    };
    const isEdit = !!combo;
    const showBasicsSection = isExpertMode || builderStage === "basics";
    const showStepsSection = isExpertMode || builderStage === "steps";
    const showStrategySection = isExpertMode || builderStage === "strategy";
    const showIntelligentSection = usesIntelligentBuilderStage && (isExpertMode || builderStage === "intelligent");
    const showReviewSection = !isExpertMode && builderStage === "review";
    const advancedConfigVisible = isExpertMode || showAdvanced;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isOpen,
                onClose: onClose,
                title: isEdit ? t("editCombo") : t("createCombo"),
                size: "full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-3",
                    children: [
                        !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-lg border border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between gap-2 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold text-text-main",
                                                    children: getI18nOrFallback(t, "builderFlowTitle", "Combo Builder Flow")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 2855,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-text-muted mt-0.5",
                                                    children: getI18nOrFallback(t, "builderStagesDescription", "Move through the stages in order to define the combo, build the steps, choose the routing strategy and review the result.")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 2858,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 2854,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] uppercase tracking-wide text-text-muted",
                                            children: [
                                                Math.max(currentStageIndex + 1, 1),
                                                "/",
                                                visibleStageMeta.length
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 2866,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 2853,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 md:grid-cols-5 gap-2",
                                    children: visibleStageMeta.map((stageMeta, index)=>{
                                        const isActive = builderStage === stageMeta.id;
                                        const canVisitStage = isActive ? true : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canAccessComboBuilderStage"])(stageMeta.id, builderStageChecks, {
                                            strategy
                                        });
                                        const isCompleted = stageMeta.id === "review" ? false : stageMeta.id === "basics" ? builderStageChecks.basics : stageMeta.id === "steps" ? builderStageChecks.steps : stageMeta.id === "intelligent" ? usesIntelligentBuilderStage : builderStageChecks.strategy;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            "data-testid": `combo-builder-stage-${stageMeta.id}`,
                                            onClick: ()=>{
                                                if (!canVisitStage) return;
                                                setBuilderStage(stageMeta.id);
                                            },
                                            disabled: !canVisitStage,
                                            className: `text-left rounded-lg border px-3 py-2 transition-all ${isActive ? "border-primary bg-primary/8" : canVisitStage ? "border-black/8 dark:border-white/8 bg-white/60 dark:bg-white/[0.02] hover:border-primary/40" : "border-black/6 dark:border-white/6 bg-black/[0.015] dark:bg-white/[0.015] opacity-60 cursor-not-allowed"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `material-symbols-outlined text-[14px] ${isCompleted && !isActive ? "text-emerald-500" : isActive ? "text-primary" : "text-text-muted"}`,
                                                            children: isCompleted && !isActive ? "check_circle" : stageMeta.icon
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 2907,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[11px] font-semibold text-text-main",
                                                            children: getI18nOrFallback(t, `builderStage.${stageMeta.id}.label`, stageMeta.fallbackLabel)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 2918,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 2906,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-text-muted mt-1 leading-[1.45]",
                                                    children: getI18nOrFallback(t, `builderStage.${stageMeta.id}.description`, stageMeta.fallbackDescription)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 2926,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[9px] uppercase tracking-wide mt-1 text-text-muted",
                                                    children: index < currentStageIndex ? getI18nOrFallback(t, "builderStageVisited", "Visited") : isActive ? getI18nOrFallback(t, "builderStageCurrent", "Current") : canVisitStage ? getI18nOrFallback(t, "builderStagePending", "Pending") : getI18nOrFallback(t, "builderStageLocked", "Locked")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 2933,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, stageMeta.id, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 2889,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 2871,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 2852,
                            columnNumber: 13
                        }, this),
                        showBasicsSection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            label: t("comboName"),
                                            "data-testid": "combo-name-input",
                                            value: name,
                                            onChange: handleNameChange,
                                            placeholder: t("comboNamePlaceholder"),
                                            error: nameError
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 2953,
                                            columnNumber: 17
                                        }, this),
                                        !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-text-muted mt-0.5",
                                            children: t("nameHint")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 2962,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 2952,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-[11px] font-medium text-text-muted block mb-0.5",
                                            children: getI18nOrFallback(t, "comboDescription", "Description")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 2968,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            rows: 2,
                                            "data-testid": "combo-description-input",
                                            value: description,
                                            onChange: (e)=>setDescription(e.target.value),
                                            placeholder: getI18nOrFallback(t, "comboDescriptionPlaceholder", "Optional note describing this combo"),
                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none resize-none"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 2971,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 2967,
                                    columnNumber: 15
                                }, this),
                                !isEdit && !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg border border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-medium",
                                                    children: getI18nOrFallback(t, "templatesTitle", COMBO_TEMPLATE_FALLBACK.title)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 2988,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-text-muted mt-0.5",
                                                    children: getI18nOrFallback(t, "templatesDescription", COMBO_TEMPLATE_FALLBACK.description)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 2991,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 2987,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1",
                                            children: COMBO_TEMPLATES.map((template)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>applyTemplate(template),
                                                    "data-testid": `combo-template-${template.id}`,
                                                    className: `text-left rounded-md border px-3 py-2 transition-all ${template.isFeatured ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500/80 hover:bg-emerald-500/10 ring-1 ring-emerald-500/20" : "border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] hover:border-primary/40 hover:bg-primary/5"}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `material-symbols-outlined text-[16px] ${template.isFeatured ? "text-emerald-500" : "text-primary"}`,
                                                                    children: template.icon
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 3013,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[12px] font-semibold text-text-main",
                                                                    children: getI18nOrFallback(t, template.titleKey, template.fallbackTitle)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 3018,
                                                                    columnNumber: 27
                                                                }, this),
                                                                template.isFeatured && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "ml-auto text-[9px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded",
                                                                    children: "FREE"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 3022,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3012,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] text-text-muted mt-1.5 leading-[1.5]",
                                                            children: getI18nOrFallback(t, template.descKey, template.fallbackDesc)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3027,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: `text-[10px] mt-1.5 font-medium ${template.isFeatured ? "text-emerald-500" : "text-primary"}`,
                                                            children: [
                                                                getI18nOrFallback(t, "templateApply", COMBO_TEMPLATE_FALLBACK.apply),
                                                                " →"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3030,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, template.id, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3001,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 2999,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 2986,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true),
                        showStrategySection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1 mb-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium",
                                            children: t("routingStrategy")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3047,
                                            columnNumber: 17
                                        }, this),
                                        !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            content: getStrategyDescription(t, strategy),
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[13px] text-text-muted cursor-help",
                                                children: "help"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                lineNumber: 3050,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3049,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3046,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-3 gap-1 p-0.5 bg-black/5 dark:bg-white/5 rounded-lg",
                                    children: STRATEGY_OPTIONS.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setStrategy(s.value),
                                            "data-testid": `strategy-option-${s.value}`,
                                            title: !isExpertMode ? getStrategyDescription(t, s.value) : undefined,
                                            "aria-label": isExpertMode ? getStrategyLabel(t, s.value) : `${getStrategyLabel(t, s.value)}. ${getStrategyDescription(t, s.value)}`,
                                            className: `py-1.5 px-2 rounded-md text-xs font-medium transition-all ${strategy === s.value ? "bg-white dark:bg-white/5 shadow-sm text-primary" : "text-text-muted hover:text-text-main"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[14px] align-middle mr-0.5",
                                                    children: s.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3074,
                                                    columnNumber: 21
                                                }, this),
                                                getStrategyLabel(t, s.value)
                                            ]
                                        }, s.value, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3058,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3056,
                                    columnNumber: 15
                                }, this),
                                !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-text-muted mt-0.5",
                                            children: getStrategyDescription(t, strategy)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3083,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StrategyGuidanceCard, {
                                                strategy: strategy
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                lineNumber: 3087,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3086,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StrategyRecommendationsPanel, {
                                                strategy: strategy,
                                                onApply: applyStrategyRecommendations,
                                                showNudge: showStrategyNudge
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                lineNumber: 3090,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3089,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 3045,
                            columnNumber: 13
                        }, this),
                        showIntelligentSection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$BuilderIntelligentStep$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            t: t,
                            config: config,
                            activeProviders: builderProviders,
                            onChange: (nextIntelligentConfig)=>setConfig((previousConfig)=>({
                                        ...previousConfig,
                                        ...nextIntelligentConfig,
                                        weights: {
                                            ...previousConfig?.weights || {},
                                            ...nextIntelligentConfig?.weights || {}
                                        }
                                    }))
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 3102,
                            columnNumber: 13
                        }, this),
                        showStepsSection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium",
                                            children: t("models")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3123,
                                            columnNumber: 17
                                        }, this),
                                        strategy === "weighted" && models.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleAutoBalance,
                                            className: "text-[10px] text-primary hover:text-primary/80 transition-colors",
                                            children: t("autoBalance")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3125,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3122,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg border border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-3 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs font-semibold text-text-main",
                                                            children: getI18nOrFallback(t, "builderTitle", "Precision Builder")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3137,
                                                            columnNumber: 21
                                                        }, this),
                                                        !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] text-text-muted mt-0.5",
                                                            children: getI18nOrFallback(t, "builderStepsDescription", "Build each combo step in sequence: provider, model, then account. This allows repeating the same provider and model with different accounts.")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3141,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3136,
                                                    columnNumber: 19
                                                }, this),
                                                !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setShowModelSelect(true),
                                                    className: "text-[10px] shrink-0 text-primary hover:text-primary/80 transition-colors",
                                                    children: getI18nOrFallback(t, "builderBrowseCatalog", "Legacy model browser")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3151,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3135,
                                            columnNumber: 17
                                        }, this),
                                        isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-3 rounded-md border border-black/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] px-2.5 py-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-[10px] font-medium uppercase tracking-wide text-text-muted block mb-1",
                                                    children: getI18nOrFallback(t, "manualModel", "Manual model")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3163,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col sm:flex-row gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: manualModelInput,
                                                            onChange: (e)=>{
                                                                setManualModelInput(e.target.value);
                                                                setManualModelError("");
                                                            },
                                                            onKeyDown: (e)=>{
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    handleAddManualModel();
                                                                }
                                                            },
                                                            placeholder: "provider/model",
                                                            "data-testid": "combo-manual-model-input",
                                                            className: "flex-1 text-xs py-2 px-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-text-main focus:border-primary focus:outline-none font-mono"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3167,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                            onClick: handleAddManualModel,
                                                            size: "sm",
                                                            disabled: !manualModelInput.trim() || !!manualModelHasDuplicate,
                                                            "data-testid": "combo-manual-model-add",
                                                            children: getI18nOrFallback(t, "addModel", "Add model")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3184,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3166,
                                                    columnNumber: 21
                                                }, this),
                                                (manualModelError || manualModelHasDuplicate) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[10px] text-amber-700 dark:text-amber-300",
                                                    children: manualModelError || getI18nOrFallback(t, "builderDuplicateExact", "This exact provider/model/account step is already in the combo.")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3194,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3162,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 md:grid-cols-3 gap-2 mt-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "text-[10px] font-medium uppercase tracking-wide text-text-muted block mb-1",
                                                            children: [
                                                                "1. ",
                                                                getI18nOrFallback(t, "builderProvider", "Provider")
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3208,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            value: builderProviderId,
                                                            onChange: handleBuilderProviderChange,
                                                            "data-testid": "combo-builder-provider",
                                                            className: "w-full text-xs py-2 px-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-text-main focus:border-primary focus:outline-none",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "",
                                                                    children: builderLoading ? getI18nOrFallback(t, "builderLoadingProviders", "Loading providers…") : getI18nOrFallback(t, "builderSelectProvider", "Select provider")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 3217,
                                                                    columnNumber: 23
                                                                }, this),
                                                                builderProviders.map((provider)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: provider.providerId,
                                                                        children: [
                                                                            provider.displayName,
                                                                            " (",
                                                                            provider.connectionCount,
                                                                            " acct",
                                                                            provider.connectionCount === 1 ? "" : "s",
                                                                            ")"
                                                                        ]
                                                                    }, provider.providerId, true, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                        lineNumber: 3223,
                                                                        columnNumber: 25
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3211,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3207,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "text-[10px] font-medium uppercase tracking-wide text-text-muted block mb-1",
                                                            children: [
                                                                "2. ",
                                                                getI18nOrFallback(t, "builderModel", "Model")
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3232,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            value: builderModelId,
                                                            onChange: handleBuilderModelChange,
                                                            disabled: !selectedBuilderProvider,
                                                            "data-testid": "combo-builder-model",
                                                            className: "w-full text-xs py-2 px-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-text-main focus:border-primary focus:outline-none disabled:opacity-50",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "",
                                                                    children: selectedBuilderProvider ? getI18nOrFallback(t, "builderSelectModel", "Select model") : getI18nOrFallback(t, "builderProviderFirst", "Choose provider first")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 3242,
                                                                    columnNumber: 23
                                                                }, this),
                                                                (selectedBuilderProvider?.models || []).map((model)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: model.id,
                                                                        children: [
                                                                            model.name,
                                                                            model.source ? ` · ${model.source}` : ""
                                                                        ]
                                                                    }, model.id, true, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                        lineNumber: 3248,
                                                                        columnNumber: 25
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3235,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3231,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "text-[10px] font-medium uppercase tracking-wide text-text-muted block mb-1",
                                                            children: [
                                                                "3. ",
                                                                getI18nOrFallback(t, "builderAccount", "Account")
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3257,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            value: builderConnectionId,
                                                            onChange: handleBuilderConnectionChange,
                                                            disabled: !selectedBuilderModel,
                                                            "data-testid": "combo-builder-account",
                                                            className: "w-full text-xs py-2 px-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-text-main focus:border-primary focus:outline-none disabled:opacity-50",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMBO_BUILDER_AUTO_CONNECTION"],
                                                                    children: getI18nOrFallback(t, "autoSelectAccount", "Auto-select account at runtime")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 3267,
                                                                    columnNumber: 23
                                                                }, this),
                                                                selectedBuilderConnections.map((connection)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: connection.id,
                                                                        children: [
                                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
                                                                                connection.label
                                                                            ], emailsVisible, connection.label),
                                                                            connection.status !== "active" ? ` · ${connection.status}` : ""
                                                                        ]
                                                                    }, connection.id, true, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                        lineNumber: 3275,
                                                                        columnNumber: 25
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3260,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3256,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3206,
                                            columnNumber: 17
                                        }, this),
                                        builderConnectionId === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$builderDraft$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COMBO_BUILDER_AUTO_CONNECTION"] && selectedBuilderConnections.length > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 rounded-md border border-black/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] px-2.5 py-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-[10px] font-medium uppercase tracking-wide text-text-muted block mb-1.5",
                                                    children: getI18nOrFallback(t, "builderRestrictAccounts", "Restrict to accounts (optional)")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3287,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap gap-1.5",
                                                    "data-testid": "combo-builder-allowlist",
                                                    children: selectedBuilderConnections.map((connection)=>{
                                                        const checked = builderAllowedConnectionIds.includes(connection.id);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>handleBuilderAllowedConnectionToggle(connection.id),
                                                            "aria-pressed": checked,
                                                            className: `text-[11px] px-2 py-1 rounded border transition-colors ${checked ? "border-primary bg-primary/10 text-primary" : "border-black/10 dark:border-white/10 text-text-muted hover:border-primary/40"}`,
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
                                                                connection.label
                                                            ], emailsVisible, connection.label)
                                                        }, connection.id, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3298,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3294,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-text-muted mt-1.5",
                                                    children: getI18nOrFallback(t, "builderRestrictAccountsHint", "Leave empty to use the whole active pool. When selected, round-robin / weighted picks stay within this subset of accounts.")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3314,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3286,
                                            columnNumber: 19
                                        }, this) : null,
                                        isExpertMode ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 flex flex-wrap items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    onClick: handleAddBuilderStep,
                                                    size: "sm",
                                                    disabled: !builderCandidateStep || !!builderHasDuplicate,
                                                    "data-testid": "combo-builder-add-step",
                                                    children: getI18nOrFallback(t, "builderAddStep", "Add detailed step")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3326,
                                                    columnNumber: 21
                                                }, this),
                                                builderHasDuplicate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-amber-600 dark:text-amber-300",
                                                    children: getI18nOrFallback(t, "builderDuplicateExact", "This exact provider/model/account step is already in the combo.")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3335,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3325,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 rounded-md border border-black/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] px-2.5 py-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                    children: getI18nOrFallback(t, "builderPreview", "Current step preview")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3346,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-text-main mt-1",
                                                    children: builderCandidateStep ? formatModelDisplay(builderCandidateStep) : getI18nOrFallback(t, "previewNextStep", "Choose provider and model to preview the next step.")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3349,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center gap-1.5 mt-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                            onClick: handleAddBuilderStep,
                                                            size: "sm",
                                                            disabled: !builderCandidateStep || !!builderHasDuplicate,
                                                            "data-testid": "combo-builder-add-step",
                                                            children: getI18nOrFallback(t, "builderAddStep", "Add detailed step")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3359,
                                                            columnNumber: 23
                                                        }, this),
                                                        builderHasDuplicate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] text-amber-600 dark:text-amber-300",
                                                            children: getI18nOrFallback(t, "builderDuplicateExact", "This exact provider/model/account step is already in the combo.")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3368,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3358,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3345,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-3 pt-3 border-t border-black/5 dark:border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-[10px] font-medium uppercase tracking-wide text-text-muted block mb-1",
                                                    children: getI18nOrFallback(t, "builderComboRef", "Reference another combo")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3381,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col sm:flex-row gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            value: builderComboRefName,
                                                            onChange: (e)=>setBuilderComboRefName(e.target.value),
                                                            className: "flex-1 text-xs py-2 px-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-text-main focus:border-primary focus:outline-none",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "",
                                                                    children: getI18nOrFallback(t, "selectComboToReference", "Select an existing combo to reference")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 3390,
                                                                    columnNumber: 23
                                                                }, this),
                                                                builderComboRefs.map((comboRef)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: comboRef.name,
                                                                        children: [
                                                                            comboRef.name,
                                                                            " · ",
                                                                            comboRef.strategy,
                                                                            " · ",
                                                                            comboRef.stepCount,
                                                                            " step",
                                                                            comboRef.stepCount === 1 ? "" : "s"
                                                                        ]
                                                                    }, comboRef.id, true, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                        lineNumber: 3398,
                                                                        columnNumber: 25
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3385,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                            onClick: handleAddComboReference,
                                                            variant: "ghost",
                                                            size: "sm",
                                                            disabled: !builderComboRefName,
                                                            children: getI18nOrFallback(t, "builderAddComboRef", "Add combo ref")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3404,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3384,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3380,
                                            columnNumber: 17
                                        }, this),
                                        builderError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[10px] text-amber-700 dark:text-amber-300",
                                            children: builderError
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3416,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3134,
                                    columnNumber: 15
                                }, this),
                                models.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-4 border border-dashed border-black/10 dark:border-white/10 rounded-lg bg-black/[0.01] dark:bg-white/[0.01]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-text-muted text-xl mb-1",
                                            children: "layers"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3424,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: t("noModelsYet")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3427,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3423,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1 max-h-[240px] overflow-y-auto",
                                    children: models.map((entry, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            draggable: true,
                                            onDragStart: (e)=>handleDragStart(e, index),
                                            onDragEnd: handleDragEnd,
                                            onDragOver: (e)=>handleDragOver(e, index),
                                            onDrop: (e)=>handleDrop(e, index),
                                            className: `group/item flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all cursor-grab active:cursor-grabbing ${dragOverIndex === index && dragIndex !== index ? "bg-primary/10 border border-primary/30" : "bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] border border-transparent"} ${dragIndex === index ? "opacity-50" : ""}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[14px] text-text-muted/40 cursor-grab shrink-0",
                                                    children: "drag_indicator"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3446,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-medium text-text-muted w-3 text-center shrink-0",
                                                    children: index + 1
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3451,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0 px-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-text-main truncate",
                                                            children: formatModelDisplay(entry)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3457,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[10px] text-text-muted truncate",
                                                            children: entry.kind === "combo-ref" ? getI18nOrFallback(t, "builderComboRefStep", "Nested combo reference") : entry.kind === "provider-wildcard" ? getI18nOrFallback(t, "builderProviderWildcard", "All matching provider models") : entry.connectionId ? getI18nOrFallback(t, "builderPinnedAccount", "Pinned account") : entry.providerId ? getI18nOrFallback(t, "builderDynamicAccountShort", "Dynamic account") : getI18nOrFallback(t, "builderLegacyEntry", "Legacy model entry")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3460,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3456,
                                                    columnNumber: 23
                                                }, this),
                                                strategy === "cost-optimized" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-[9px] px-1.5 py-0.5 rounded-full uppercase font-semibold ${hasPricingForModel(entry.model) ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`,
                                                    title: hasPricingForModel(entry.model) ? getI18nOrFallback(t, "pricingAvailable", "Pricing available") : getI18nOrFallback(t, "pricingMissing", "No pricing"),
                                                    children: hasPricingForModel(entry.model) ? getI18nOrFallback(t, "pricingAvailableShort", "priced") : getI18nOrFallback(t, "pricingMissingShort", "no-price")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3486,
                                                    columnNumber: 25
                                                }, this),
                                                strategy === "weighted" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-0.5 shrink-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            max: "100",
                                                            value: entry.weight,
                                                            onChange: (e)=>handleWeightChange(index, e.target.value),
                                                            className: "w-10 text-[11px] text-center py-0.5 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3507,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] text-text-muted",
                                                            children: "%"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3515,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3506,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-0.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>handleMoveUp(index),
                                                            disabled: index === 0,
                                                            className: `p-0.5 rounded ${index === 0 ? "text-text-muted/20 cursor-not-allowed" : "text-text-muted hover:text-primary hover:bg-black/5 dark:hover:bg-white/5"}`,
                                                            title: t("moveUp"),
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "material-symbols-outlined text-[12px]",
                                                                children: "arrow_upward"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                lineNumber: 3527,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3521,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>handleMoveDown(index),
                                                            disabled: index === models.length - 1,
                                                            className: `p-0.5 rounded ${index === models.length - 1 ? "text-text-muted/20 cursor-not-allowed" : "text-text-muted hover:text-primary hover:bg-black/5 dark:hover:bg-white/5"}`,
                                                            title: t("moveDown"),
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "material-symbols-outlined text-[12px]",
                                                                children: "arrow_downward"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                lineNumber: 3537,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3531,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3520,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleRemoveModel(index),
                                                    className: "p-0.5 hover:bg-red-500/10 rounded text-text-muted hover:text-red-500 transition-all",
                                                    title: t("removeModel"),
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "material-symbols-outlined text-[12px]",
                                                        children: "close"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                        lineNumber: 3549,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3544,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, `${entry.model}-${index}`, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3432,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3430,
                                    columnNumber: 17
                                }, this),
                                strategy === "weighted" && models.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$WeightTotalBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__WeightTotalBar$3e$__["WeightTotalBar"], {
                                    models: models
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3557,
                                    columnNumber: 64
                                }, this),
                                strategy === "cost-optimized" && models.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 rounded-md border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] px-2 py-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between text-[10px]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-text-muted",
                                                    children: getI18nOrFallback(t, "pricingCoverage", "Pricing coverage")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3562,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-medium text-text-main",
                                                    children: [
                                                        pricedModelCount,
                                                        "/",
                                                        models.length,
                                                        " (",
                                                        pricingCoveragePercent,
                                                        "%)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3565,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3561,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-1.5 mt-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `h-full transition-all duration-300 ${pricingCoveragePercent === 100 ? "bg-emerald-500" : pricingCoveragePercent > 0 ? "bg-amber-500" : "bg-red-500"}`,
                                                style: {
                                                    width: `${pricingCoveragePercent}%`
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                lineNumber: 3570,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3569,
                                            columnNumber: 19
                                        }, this),
                                        !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-text-muted mt-1",
                                            children: getI18nOrFallback(t, "pricingCoverageHint", "Cost-optimized works best when all combo models have pricing.")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3582,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3560,
                                    columnNumber: 17
                                }, this),
                                hasNoModels && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[12px]",
                                            children: "warning"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3595,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: t("noModelsYet")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3596,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3594,
                                    columnNumber: 17
                                }, this),
                                hasInvalidWeightedTotal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[12px]",
                                            children: "warning"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3602,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                t("weighted"),
                                                " ",
                                                weightTotal,
                                                "% ",
                                                "\u2260",
                                                " 100%. ",
                                                t("autoBalance")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3603,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3601,
                                    columnNumber: 17
                                }, this),
                                !isExpertMode && hasRoundRobinSingleModel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1.5 text-[10px] text-blue-700 dark:text-blue-300 flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[12px]",
                                            children: "info"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3611,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: getI18nOrFallback(t, "warningRoundRobinSingleModel", "Round-robin is most useful with at least 2 models.")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3612,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3610,
                                    columnNumber: 17
                                }, this),
                                hasCostOptimizedPartialPricing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[12px]",
                                            children: "warning"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3624,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: typeof t.has === "function" && t.has("warningCostOptimizedPartialPricing") ? t("warningCostOptimizedPartialPricing", {
                                                priced: pricedModelCount,
                                                total: models.length
                                            }) : `Only ${pricedModelCount} of ${models.length} models have pricing. Routing may be partially cost-aware.`
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3625,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3623,
                                    columnNumber: 17
                                }, this),
                                hasCostOptimizedWithoutPricing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[12px]",
                                            children: "warning"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3638,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: getI18nOrFallback(t, "warningCostOptimizedNoPricing", "No pricing data found for this combo. Cost-optimized may route unexpectedly.")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3639,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3637,
                                    columnNumber: 17
                                }, this),
                                showInlineReadinessPanel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ComboReadinessPanel, {
                                        checks: readinessChecks,
                                        blockers: saveBlockers,
                                        showDescription: !isExpertMode
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                        lineNumber: 3651,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3650,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowModelSelect(true),
                                    className: "w-full mt-2 py-2 border border-dashed border-black/10 dark:border-white/10 rounded-lg text-xs text-text-muted hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-1",
                                    "data-testid": "combo-browse-catalog",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[16px]",
                                            children: "travel_explore"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3664,
                                            columnNumber: 17
                                        }, this),
                                        getI18nOrFallback(t, "browseLegacyCatalog", "Browse legacy model catalog")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3659,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 3121,
                            columnNumber: 13
                        }, this),
                        showStrategySection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowAdvanced(!showAdvanced),
                                    className: "flex items-center gap-1 text-xs text-text-muted hover:text-text-main transition-colors self-start",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px]",
                                            children: showAdvanced ? "expand_less" : "expand_more"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3678,
                                            columnNumber: 19
                                        }, this),
                                        t("advancedSettings")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3674,
                                    columnNumber: 17
                                }, this),
                                advancedConfigVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-2 p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/5 dark:border-white/5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: t("maxRetries"),
                                                            help: getI18nOrFallback(t, "advancedHelp.maxRetries", ADVANCED_FIELD_HELP_FALLBACK.maxRetries),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3689,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            max: "10",
                                                            value: config.maxRetries ?? "",
                                                            placeholder: "1",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    maxRetries: e.target.value ? Number(e.target.value) : undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3698,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3688,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: t("retryDelay"),
                                                            help: getI18nOrFallback(t, "advancedHelp.retryDelay", ADVANCED_FIELD_HELP_FALLBACK.retryDelay),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3714,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            max: "60000",
                                                            step: "500",
                                                            value: config.retryDelayMs ?? "",
                                                            placeholder: "2000",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    retryDelayMs: e.target.value ? Number(e.target.value) : undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3723,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3713,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: getI18nOrFallback(t, "targetTimeout", "Target timeout (seconds)"),
                                                            help: getI18nOrFallback(t, "advancedHelp.targetTimeoutMs", ADVANCED_FIELD_HELP_FALLBACK.targetTimeoutMs),
                                                            showHelp: !isExpertMode,
                                                            htmlFor: "combo-target-timeout-ms"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3740,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "combo-target-timeout-ms",
                                                            type: "number",
                                                            min: "1",
                                                            max: "86400",
                                                            step: "1",
                                                            value: msToOptionalSecondsInput(config.targetTimeoutMs),
                                                            placeholder: getI18nOrFallback(t, "inheritRequestTimeout", "inherit"),
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    targetTimeoutMs: secondsInputToOptionalMs(e.target.value)
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3750,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3739,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3687,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "col-span-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 py-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "checkbox",
                                                                id: "failoverBeforeRetry",
                                                                checked: !!config.failoverBeforeRetry,
                                                                onChange: (e)=>setConfig({
                                                                        ...config,
                                                                        failoverBeforeRetry: e.target.checked || undefined
                                                                    }),
                                                                className: "w-3.5 h-3.5 rounded border border-black/20 dark:border-white/20 accent-primary cursor-pointer"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                lineNumber: 3771,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "failoverBeforeRetry",
                                                                className: "text-xs text-text-muted cursor-pointer select-none",
                                                                children: t("failoverBeforeRetry")
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                lineNumber: 3783,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                position: "bottom",
                                                                content: getI18nOrFallback(t, "advancedHelp.failoverBeforeRetry", ADVANCED_FIELD_HELP_FALLBACK.failoverBeforeRetry),
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "material-symbols-outlined text-[12px] text-text-muted cursor-help",
                                                                    children: "help"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 3797,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                lineNumber: 3789,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                        lineNumber: 3770,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3769,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "col-span-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$ReasoningTokenBufferToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        config: config,
                                                        setConfig: setConfig,
                                                        t: t
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                        lineNumber: 3804,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3803,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: t("maxSetRetries"),
                                                            help: getI18nOrFallback(t, "advancedHelp.maxSetRetries", ADVANCED_FIELD_HELP_FALLBACK.maxSetRetries),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3807,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            max: "10",
                                                            value: config.maxSetRetries ?? "",
                                                            placeholder: "0",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    maxSetRetries: e.target.value ? Number(e.target.value) : undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3816,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3806,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: t("setRetryDelayMs"),
                                                            help: getI18nOrFallback(t, "advancedHelp.setRetryDelayMs", ADVANCED_FIELD_HELP_FALLBACK.setRetryDelayMs),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3832,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            max: "60000",
                                                            step: "500",
                                                            value: config.setRetryDelayMs ?? "",
                                                            placeholder: "2000",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    setRetryDelayMs: e.target.value ? Number(e.target.value) : undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3841,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3831,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3768,
                                            columnNumber: 19
                                        }, this),
                                        strategy === "round-robin" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: t("concurrencyPerModel"),
                                                            help: getI18nOrFallback(t, "advancedHelp.concurrencyPerModel", ADVANCED_FIELD_HELP_FALLBACK.concurrencyPerModel),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3861,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "1",
                                                            max: "20",
                                                            value: config.concurrencyPerModel ?? "",
                                                            placeholder: "3",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    concurrencyPerModel: e.target.value ? Number(e.target.value) : undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3870,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3860,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: t("queueTimeout"),
                                                            help: getI18nOrFallback(t, "advancedHelp.queueTimeout", ADVANCED_FIELD_HELP_FALLBACK.queueTimeout),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3888,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "1000",
                                                            max: "120000",
                                                            step: "1000",
                                                            value: config.queueTimeoutMs ?? "",
                                                            placeholder: "30000",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    queueTimeoutMs: e.target.value ? Number(e.target.value) : undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3897,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3887,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "col-span-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: getI18nOrFallback(t, "stickyLimit", "Sticky Limit"),
                                                            help: getI18nOrFallback(t, "advancedHelp.stickyLimit", ADVANCED_FIELD_HELP_FALLBACK.stickyLimit),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3914,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            max: "1000",
                                                            value: config.stickyRoundRobinLimit ?? "",
                                                            placeholder: getI18nOrFallback(t, "stickyLimitInherit", "inherit"),
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    stickyRoundRobinLimit: e.target.value ? Number(e.target.value) : undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3923,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3913,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3859,
                                            columnNumber: 21
                                        }, this),
                                        strategy === "weighted" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 gap-2 pt-2 border-t border-black/5 dark:border-white/5",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                        label: getI18nOrFallback(t, "stickyWeightedLimit", "Sticky Weighted Limit"),
                                                        help: getI18nOrFallback(t, "advancedHelp.stickyWeightedLimit", ADVANCED_FIELD_HELP_FALLBACK.stickyWeightedLimit),
                                                        showHelp: !isExpertMode
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                        lineNumber: 3945,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        max: "1000",
                                                        value: config.stickyWeightedLimit ?? "",
                                                        placeholder: "1",
                                                        onChange: (e)=>setConfig({
                                                                ...config,
                                                                stickyWeightedLimit: e.target.value ? Number(e.target.value) : undefined
                                                            }),
                                                        className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                        lineNumber: 3958,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                lineNumber: 3944,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3943,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 gap-2 pt-2 border-t border-black/5 dark:border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: getI18nOrFallback(t, "nestedComboMode", "Nested Combo Behavior"),
                                                            help: getI18nOrFallback(t, "advancedHelp.nestedComboMode", ADVANCED_FIELD_HELP_FALLBACK.nestedComboMode),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3979,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            value: config.nestedComboMode ?? "flatten",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    nestedComboMode: e.target.value === "execute" ? "execute" : "flatten"
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-surface-1 focus:border-primary focus:outline-none",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "flatten",
                                                                    children: getI18nOrFallback(t, "nestedComboFlatten", "Flatten nested combos")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 3998,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "execute",
                                                                    children: getI18nOrFallback(t, "nestedComboExecute", "Execute nested combos as targets")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 4001,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 3988,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 3978,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: getI18nOrFallback(t, "disableSessionStickiness", "Disable session stickiness"),
                                                            help: getI18nOrFallback(t, "advancedHelp.disableSessionStickiness", "Rotate to a different connection on every request instead of pinning a whole conversation to one connection by the first-message hash. Overrides the global default. Leave on Inherit to preserve prompt-cache hits for multi-turn chats."),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4013,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            value: config.disableSessionStickiness === true ? "disabled" : config.disableSessionStickiness === false ? "enabled" : "inherit",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    disableSessionStickiness: e.target.value === "disabled" ? true : e.target.value === "enabled" ? false : undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-surface-1 focus:border-primary focus:outline-none",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "inherit",
                                                                    children: getI18nOrFallback(t, "stickyLimitInherit", "inherit")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 4047,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "enabled",
                                                                    children: getI18nOrFallback(t, "sessionStickinessEnabled", "Stickiness on")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 4050,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "disabled",
                                                                    children: getI18nOrFallback(t, "sessionStickinessDisabled", "Stickiness off")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                    lineNumber: 4053,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4026,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4012,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 3977,
                                            columnNumber: 19
                                        }, this),
                                        strategy === "context-relay" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-black/5 dark:border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: getI18nOrFallback(t, "contextRelayHandoffThreshold", "Handoff Threshold"),
                                                            help: getI18nOrFallback(t, "contextRelayHandoffThresholdHelp", "When quota usage reaches this threshold, OmniRoute generates a structured handoff summary before the account is exhausted."),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4062,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0.5",
                                                            max: "0.94",
                                                            step: "0.01",
                                                            value: config.handoffThreshold ?? "",
                                                            placeholder: "0.85",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    handoffThreshold: e.target.value ? Number(e.target.value) : undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4075,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4061,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: getI18nOrFallback(t, "contextRelayMaxMessages", "Max Messages For Summary"),
                                                            help: getI18nOrFallback(t, "contextRelayMaxMessagesHelp", "Limits how much recent history is condensed into the relay summary."),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4092,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "5",
                                                            max: "100",
                                                            value: config.maxMessagesForSummary ?? "",
                                                            placeholder: "30",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    maxMessagesForSummary: e.target.value ? Number(e.target.value) : undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4105,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4091,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: getI18nOrFallback(t, "contextRelaySummaryModel", "Summary Model"),
                                                            help: getI18nOrFallback(t, "contextRelaySummaryModelHelp", "Optional override model used only for generating the handoff summary. Leave empty to reuse the active combo model."),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4123,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: config.handoffModel ?? "",
                                                            placeholder: "codex/gpt-5.6-sol",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    handoffModel: e.target.value || undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4132,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4122,
                                                    columnNumber: 23
                                                }, this),
                                                !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "md:col-span-3 rounded-md border border-fuchsia-500/20 bg-fuchsia-500/5 px-2 py-1.5",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] text-fuchsia-700 dark:text-fuchsia-300",
                                                        children: getI18nOrFallback(t, "contextRelayProviderNote", "Context Relay currently generates handoffs for Codex account rotation. Pair it with multiple accounts of the same provider for the best continuity.")
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                        lineNumber: 4147,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4146,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4060,
                                            columnNumber: 21
                                        }, this),
                                        strategy === "fusion" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "md:col-span-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: getI18nOrFallback(t, "fusionJudgeModel", "Judge model"),
                                                            help: getI18nOrFallback(t, "fusionJudgeModelHelp", "Model that synthesizes the panel answers into one final response. Leave empty to use the first panel model."),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4161,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: config.judgeModel ?? "",
                                                            placeholder: models[0]?.model || "openai/gpt-5.5",
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    judgeModel: e.target.value || undefined
                                                                }),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4170,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4160,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: getI18nOrFallback(t, "fusionMinPanel", "Min panel"),
                                                            help: getI18nOrFallback(t, "fusionMinPanelHelp", "Successful panel answers required before stragglers get a grace window (default 2)."),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4181,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "1",
                                                            max: "50",
                                                            value: config.fusionTuning?.minPanel ?? "",
                                                            placeholder: "2",
                                                            onChange: (e)=>setConfig(updateFusionTuning(config, "minPanel", e.target.value)),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4190,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4180,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: getI18nOrFallback(t, "fusionStragglerGraceMs", "Straggler grace (ms)"),
                                                            help: getI18nOrFallback(t, "fusionStragglerGraceMsHelp", "How long to wait for slow panel models once quorum is reached (default 8000)."),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4203,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "0",
                                                            max: "120000",
                                                            value: config.fusionTuning?.stragglerGraceMs ?? "",
                                                            placeholder: "8000",
                                                            onChange: (e)=>setConfig(updateFusionTuning(config, "stragglerGraceMs", e.target.value)),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4216,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4202,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "md:col-span-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$FieldLabelWithHelp$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FieldLabelWithHelp$3e$__["FieldLabelWithHelp"], {
                                                            label: getI18nOrFallback(t, "fusionPanelHardTimeoutMs", "Panel hard timeout (ms)"),
                                                            help: getI18nOrFallback(t, "fusionPanelHardTimeoutMsHelp", "Absolute cap so one hung model can't stall the whole panel (default 90000)."),
                                                            showHelp: !isExpertMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4231,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "1000",
                                                            max: "600000",
                                                            value: config.fusionTuning?.panelHardTimeoutMs ?? "",
                                                            placeholder: "90000",
                                                            onChange: (e)=>setConfig(updateFusionTuning(config, "panelHardTimeoutMs", e.target.value)),
                                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4244,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4230,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4159,
                                            columnNumber: 21
                                        }, this),
                                        !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-text-muted",
                                            children: t("advancedHint")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4261,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 3686,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true),
                        showStrategySection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2 p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/5 dark:border-white/5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5 mb-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px] text-primary",
                                            children: "rule"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4272,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-medium",
                                            children: getI18nOrFallback(t, "responseValidationTitle", "Response validation")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4273,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4271,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$combos$2f$ResponseValidationEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponseValidationEditor"], {
                                    value: config.responseValidation,
                                    onChange: (next)=>setConfig({
                                            ...config,
                                            responseValidation: next
                                        }),
                                    t: t
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4277,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 4270,
                            columnNumber: 13
                        }, this),
                        showStrategySection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2 p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/5 dark:border-white/5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5 mb-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px] text-primary",
                                            children: "smart_toy"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4289,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-medium",
                                            children: getI18nOrFallback(t, "agentFeaturesTitle", "Agent features")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4292,
                                            columnNumber: 17
                                        }, this),
                                        !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-text-muted",
                                            children: getI18nOrFallback(t, "agentFeaturesDescription", "Tune agent prompts and tool access for this combo.")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4296,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4288,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-[11px] font-medium text-text-muted block mb-0.5",
                                            children: getI18nOrFallback(t, "agentFeaturesSystemMessageOverride", "System message override")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4308,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            rows: 2,
                                            value: agentSystemMessage,
                                            onChange: (e)=>setAgentSystemMessage(e.target.value),
                                            placeholder: getI18nOrFallback(t, "agentFeaturesSystemMessagePlaceholder", "Optional system instructions for this combo"),
                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none resize-none"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4315,
                                            columnNumber: 17
                                        }, this),
                                        !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-text-muted mt-0.5",
                                            children: getI18nOrFallback(t, "agentFeaturesSystemMessageHint", "Applied only when this combo is used as an agent.")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4327,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4307,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-[11px] font-medium text-text-muted block mb-0.5",
                                            children: getI18nOrFallback(t, "agentFeaturesToolFilterRegex", "Tool filter regex")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4339,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: agentToolFilter,
                                            onChange: (e)=>setAgentToolFilter(e.target.value),
                                            placeholder: "e.g. ^(bash|computer)$",
                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none font-mono"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4342,
                                            columnNumber: 17
                                        }, this),
                                        !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-text-muted mt-0.5",
                                            children: getI18nOrFallback(t, "agentFeaturesToolFilterHint", "Limit agent tools by name with a regular expression.")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4350,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4338,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-[11px] font-medium text-text-muted block",
                                                    children: getI18nOrFallback(t, "agentFeaturesContextCacheProtection", "Context cache protection")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4363,
                                                    columnNumber: 19
                                                }, this),
                                                !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-text-muted",
                                                    children: getI18nOrFallback(t, "agentFeaturesContextCacheHint", "Keep cached context isolated when provider state changes.")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4371,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4362,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: agentContextCache,
                                            onChange: (e)=>setAgentContextCache(e.target.checked),
                                            className: "accent-primary shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4380,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4361,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-[11px] font-medium text-text-muted block mb-0.5",
                                            children: getI18nOrFallback(t, "agentFeaturesContextLength", "Context length")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4390,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            min: "1000",
                                            max: "2000000",
                                            step: "1000",
                                            value: contextLength || "",
                                            onChange: (e)=>{
                                                const value = e.target.value;
                                                setContextLengthError("");
                                                if (value === "") {
                                                    setContextLength(undefined);
                                                    return;
                                                }
                                                const num = Number(value);
                                                if (isNaN(num) || !Number.isInteger(num)) {
                                                    setContextLengthError(t("agentFeaturesContextLengthErrorInteger"));
                                                // Keep the raw input value so the user can correct it
                                                } else if (num < 1000 || num > 2000000) {
                                                    setContextLengthError(t("agentFeaturesContextLengthErrorRange"));
                                                    setContextLength(num);
                                                } else {
                                                    setContextLength(num);
                                                }
                                            },
                                            placeholder: getI18nOrFallback(t, "agentFeaturesContextLengthPlaceholder", "e.g. 128000"),
                                            className: "w-full text-xs py-1.5 px-2 rounded border border-black/10 dark:border-white/10 bg-transparent focus:border-primary focus:outline-none"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4393,
                                            columnNumber: 17
                                        }, this),
                                        contextLengthError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-red-500 mt-0.5",
                                            children: contextLengthError
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4425,
                                            columnNumber: 19
                                        }, this),
                                        !contextLengthError && !isExpertMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-text-muted mt-0.5",
                                            children: getI18nOrFallback(t, "agentFeaturesContextLengthHint", "Defines the context window for this combo in /v1/models.")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4428,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4389,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 4287,
                            columnNumber: 13
                        }, this),
                        showReviewSection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 md:grid-cols-4 gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                    children: getI18nOrFallback(t, "reviewName", "Name")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4444,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold text-text-main mt-1 break-all",
                                                    children: name || "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4447,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4443,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                    children: getI18nOrFallback(t, "reviewStrategy", "Strategy")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4452,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold text-text-main mt-1",
                                                    children: getStrategyLabel(t, strategy)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4455,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4451,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                    children: getI18nOrFallback(t, "reviewSteps", "Steps")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4460,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold text-text-main mt-1",
                                                    children: models.length
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4463,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4459,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                    children: getI18nOrFallback(t, "reviewAccounts", "Pinned accounts")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4466,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold text-text-main mt-1",
                                                    children: pinnedAccountCount
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4469,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4465,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4442,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 md:grid-cols-4 gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-black/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                    children: getI18nOrFallback(t, "reviewProviders", "Providers")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4475,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold text-text-main mt-1",
                                                    children: uniqueProviderCount
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4478,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4474,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-black/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                    children: getI18nOrFallback(t, "reviewComboRefs", "Combo refs")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4481,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold text-text-main mt-1",
                                                    children: comboRefCount
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4484,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4480,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-black/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                    children: getI18nOrFallback(t, "reviewAdvanced", "Advanced config")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4487,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold text-text-main mt-1",
                                                    children: Object.keys(config || {}).length
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4490,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4486,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-black/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                    children: getI18nOrFallback(t, "reviewAgentFlags", "Agent flags")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4495,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold text-text-main mt-1",
                                                    children: [
                                                        agentSystemMessage,
                                                        agentToolFilter,
                                                        agentContextCache ? "cache" : ""
                                                    ].filter(Boolean).length
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4498,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4494,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4473,
                                    columnNumber: 15
                                }, this),
                                usesIntelligentBuilderStage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg border border-primary/15 bg-primary/[0.04] p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-primary text-[16px]",
                                                    children: "auto_awesome"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4513,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold text-text-main",
                                                    children: getI18nOrFallback(t, "reviewIntelligentTitle", "Intelligent Routing Config")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4516,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4512,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                            className: "grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                            className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                            children: getI18nOrFallback(t, "modePackLabel", "Mode Pack")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4522,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                            className: "text-text-main mt-1",
                                                            children: intelligentConfig.modePack
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4525,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4521,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                            className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                            children: getI18nOrFallback(t, "routerStrategyLabel", "Router Strategy")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4528,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                            className: "text-text-main mt-1",
                                                            children: intelligentConfig.routerStrategy
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4531,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4527,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                            className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                            children: getI18nOrFallback(t, "explorationRateLabel", "Exploration Rate")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4534,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                            className: "text-text-main mt-1",
                                                            children: [
                                                                Math.round(intelligentConfig.explorationRate * 100),
                                                                "%"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4537,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4533,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                            className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                            children: getI18nOrFallback(t, "candidatePoolLabel", "Candidate Pool")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4542,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                            className: "text-text-main mt-1",
                                                            children: intelligentConfig.candidatePool.length > 0 ? intelligentConfig.candidatePool.length : getI18nOrFallback(t, "candidatePoolAllProviders", "All providers")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4545,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4541,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                            className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                            children: getI18nOrFallback(t, "budgetCapLabel", "Budget Cap (USD / request)")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4552,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                            className: "text-text-main mt-1",
                                                            children: intelligentConfig.budgetCap ? `$${intelligentConfig.budgetCap}` : getI18nOrFallback(t, "budgetCapPlaceholder", "No limit")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                            lineNumber: 4555,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4551,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4520,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4511,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg border border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-semibold text-text-main",
                                            children: getI18nOrFallback(t, "reviewSequence", "Execution sequence")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4566,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 flex flex-col gap-1.5 max-h-[260px] overflow-y-auto",
                                            children: models.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] text-text-muted",
                                                children: getI18nOrFallback(t, "reviewNoSteps", "No steps added yet.")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                lineNumber: 4571,
                                                columnNumber: 21
                                            }, this) : models.map((entry, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rounded-md border border-black/6 dark:border-white/6 bg-white/70 dark:bg-white/[0.03] px-2.5 py-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-start gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] font-semibold text-text-muted mt-0.5",
                                                                children: index + 1
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                lineNumber: 4581,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "min-w-0 flex-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-text-main truncate",
                                                                        children: formatModelDisplay(entry)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                        lineNumber: 4585,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-text-muted mt-0.5",
                                                                        children: [
                                                                            entry.kind === "combo-ref" ? getI18nOrFallback(t, "builderComboRefStep", "Nested combo reference") : entry.kind === "provider-wildcard" ? getI18nOrFallback(t, "builderProviderWildcard", "All matching provider models") : entry.connectionId ? getI18nOrFallback(t, "builderPinnedAccount", "Pinned account") : entry.providerId ? getI18nOrFallback(t, "builderDynamicAccountShort", "Dynamic account") : getI18nOrFallback(t, "builderLegacyEntry", "Legacy model entry"),
                                                                            strategy === "weighted" && entry.weight > 0 ? ` · ${entry.weight}%` : ""
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                        lineNumber: 4588,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                                lineNumber: 4584,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                        lineNumber: 4580,
                                                        columnNumber: 25
                                                    }, this)
                                                }, `${getModelString(entry) || "entry"}-${index}`, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                                    lineNumber: 4576,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                            lineNumber: 4569,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4565,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ComboReadinessPanel, {
                                    checks: readinessChecks,
                                    blockers: saveBlockers
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4626,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 4441,
                            columnNumber: 13
                        }, this),
                        isExpertMode ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 pt-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    onClick: onClose,
                                    variant: "ghost",
                                    fullWidth: true,
                                    size: "sm",
                                    children: tc("cancel")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4632,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    onClick: handleSave,
                                    fullWidth: true,
                                    size: "sm",
                                    disabled: saveBlocked,
                                    children: saving ? t("saving") : isEdit ? tc("save") : t("createCombo")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4635,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 4631,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 pt-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    onClick: builderStage === "basics" ? onClose : handleGoToPreviousStage,
                                    variant: "ghost",
                                    fullWidth: true,
                                    size: "sm",
                                    "data-testid": "combo-builder-back",
                                    children: builderStage === "basics" ? tc("cancel") : getI18nOrFallback(tc, "back", "Back")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4641,
                                    columnNumber: 15
                                }, this),
                                builderStage === "review" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    onClick: handleSave,
                                    fullWidth: true,
                                    size: "sm",
                                    disabled: saveBlocked,
                                    children: saving ? t("saving") : isEdit ? tc("save") : t("createCombo")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4651,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    onClick: handleGoToNextStage,
                                    fullWidth: true,
                                    size: "sm",
                                    disabled: !canAdvanceFromCurrentStage,
                                    "data-testid": "combo-builder-next",
                                    children: getI18nOrFallback(tc, "next", "Next")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                                    lineNumber: 4655,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 4640,
                            columnNumber: 13
                        }, this),
                        (isExpertMode || builderStage !== "review") && !canAdvanceFromCurrentStage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[10px] text-amber-700 dark:text-amber-300",
                            children: builderStage === "basics" ? getI18nOrFallback(t, "builderNeedValidName", "Define a valid combo name before continuing.") : getI18nOrFallback(t, "addStepBeforeContinue", "Add at least one step before continuing to the next stage.")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                            lineNumber: 4669,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                    lineNumber: 2850,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 2844,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ModelSelectModal, {
                isOpen: showModelSelect,
                onClose: ()=>setShowModelSelect(false),
                onSelect: handleAddModel,
                onDeselect: handleDeselectModel,
                onSelectMany: handleAddModels,
                onDeselectMany: handleDeselectModels,
                activeProviders: activeProviders,
                modelAliases: modelAliases,
                title: t("addModelToCombo"),
                selectedModel: null,
                addedModelValues: models.map((m)=>m.model),
                keepOpenOnSelect: true
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/combos/page.tsx",
                lineNumber: 4686,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_145v81h._.js.map