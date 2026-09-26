module.exports = [
"[externals]/tls-client-node [external] (tls-client-node, esm_import, [project]/node_modules/tls-client-node, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[externals]_tls-client-node_0ptu5a4._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/tls-client-node [external] (tls-client-node, esm_import, [project]/node_modules/tls-client-node)");
    });
});
}),
];