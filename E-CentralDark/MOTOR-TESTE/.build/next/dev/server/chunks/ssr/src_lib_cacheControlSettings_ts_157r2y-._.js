module.exports = [
"[project]/src/lib/cacheControlSettings.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getCacheControlSettings",
    ()=>getCacheControlSettings,
    "invalidateCacheControlSettingsCache",
    ()=>invalidateCacheControlSettingsCache
]);
/**
 * Cache Control Settings
 *
 * Provides cached access to cache control settings for performance.
 * Settings are fetched once and cached to avoid repeated DB hits.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-rsc] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
let cachedSettings = null;
async function getCacheControlSettings() {
    if (cachedSettings !== null) {
        return cachedSettings;
    }
    const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
    cachedSettings = settings.alwaysPreserveClientCache || "auto";
    return cachedSettings;
}
function invalidateCacheControlSettingsCache() {
    cachedSettings = null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_cacheControlSettings_ts_157r2y-._.js.map