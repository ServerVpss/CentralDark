module.exports = [
"[externals]/crypto [external] (crypto, cjs, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[externals]/crypto [external] (crypto, cjs)");
    });
});
}),
"[project]/src/lib/db/readCache.ts [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/src/lib/db/readCache.ts [app-rsc] (ecmascript)");
    });
});
}),
"[project]/src/shared/utils/rateLimiter.ts [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/node_modules_ioredis_built_index_0igci7o.js",
  "server/chunks/ssr/src_shared_utils_rateLimiter_ts_1r6307p._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/shared/utils/rateLimiter.ts [app-rsc] (ecmascript)");
    });
});
}),
"[project]/src/shared/utils/apiKey.ts [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/src_shared_utils_apiKey_ts_0-a-g4-._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/shared/utils/apiKey.ts [app-rsc] (ecmascript)");
    });
});
}),
"[project]/src/lib/compliance/index.ts [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/src_lib_usage_callLogs_ts_04yd9gb._.js",
  "server/chunks/ssr/[root-of-the-server]__00j5bhi._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/compliance/index.ts [app-rsc] (ecmascript)");
    });
});
}),
"[project]/src/lib/quota/quotaCombos.ts [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/src_lib_quota_quotaKey_ts_1siq81e._.js",
  "server/chunks/ssr/[root-of-the-server]__1sag2oq._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/quota/quotaCombos.ts [app-rsc] (ecmascript)");
    });
});
}),
];