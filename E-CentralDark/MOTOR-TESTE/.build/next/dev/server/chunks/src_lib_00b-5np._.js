module.exports = [
"[project]/src/lib/usage/callLogArtifacts.ts [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/src/lib/usage/callLogArtifacts.ts [app-route] (ecmascript)");
    });
});
}),
"[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/src_lib_0wct30f._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/localDb.ts [app-route] (ecmascript)");
    });
});
}),
];