module.exports = [
"[externals]/node:async_hooks [external] (node:async_hooks, cjs, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[externals]_node_async_hooks_1gjz99j._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/node:async_hooks [external] (node:async_hooks, cjs)");
    });
});
}),
"[externals]/node:http [external] (node:http, cjs, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[externals]_node_http_1l3r0mi._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/node:http [external] (node:http, cjs)");
    });
});
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/event-streams/index.js [instrumentation] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[root-of-the-server]__1wy-s4s._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/@smithy/core/dist-es/submodules/event-streams/index.js [instrumentation] (ecmascript)");
    });
});
}),
];