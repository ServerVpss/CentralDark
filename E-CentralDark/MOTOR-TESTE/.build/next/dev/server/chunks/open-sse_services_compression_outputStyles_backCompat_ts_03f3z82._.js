module.exports = [
"[project]/open-sse/services/compression/outputStyles/backCompat.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveOutputStyleSelection",
    ()=>resolveOutputStyleSelection
]);
function resolveOutputStyleSelection(config) {
    if (Array.isArray(config.outputStyles) && config.outputStyles.length > 0) {
        return config.outputStyles;
    }
    const legacy = config.cavemanOutputMode;
    if (legacy?.enabled) {
        return [
            {
                id: "terse-prose",
                level: legacy.intensity ?? "full"
            }
        ];
    }
    return [];
}
}),
];

//# sourceMappingURL=open-sse_services_compression_outputStyles_backCompat_ts_03f3z82._.js.map