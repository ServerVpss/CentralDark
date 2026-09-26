module.exports = [
"[project]/open-sse/services/autoCombo/autoPrefix.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALID_VARIANTS",
    ()=>VALID_VARIANTS,
    "parseAutoPrefix",
    ()=>parseAutoPrefix
]);
const VALID_VARIANTS = [
    "coding",
    "fast",
    "cheap",
    "offline",
    "smart",
    "lkgp",
    "chaos"
];
function parseAutoPrefix(model) {
    // Guard against null/undefined (called with non-string inputs)
    if (typeof model !== "string") {
        return {
            valid: false,
            error: "Not an auto-prefixed model"
        };
    }
    if (!model.startsWith("auto")) {
        return {
            valid: false,
            error: "Not an auto-prefixed model"
        };
    }
    const parts = model.split("/");
    if (parts.length === 1) {
        if (parts[0] === "auto") {
            return {
                valid: true,
                variant: undefined
            }; // Default auto
        } else {
            return {
                valid: false,
                error: "Invalid auto prefix format"
            };
        }
    }
    if (parts.length === 2) {
        if (parts[0] !== "auto") {
            return {
                valid: false,
                error: "Invalid auto prefix format"
            };
        }
        const variantStr = parts[1];
        if (variantStr === "" || VALID_VARIANTS.includes(variantStr)) {
            return {
                valid: true,
                variant: variantStr === "" ? undefined : variantStr
            };
        } else {
            return {
                valid: false,
                error: `Invalid auto variant: ${variantStr}`
            };
        }
    }
    return {
        valid: false,
        error: "Invalid auto prefix format"
    };
}
}),
];

//# sourceMappingURL=open-sse_services_autoCombo_autoPrefix_ts_1zobmvp._.js.map