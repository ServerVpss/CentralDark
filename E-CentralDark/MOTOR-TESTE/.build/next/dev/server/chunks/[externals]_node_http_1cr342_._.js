module.exports = [
"[externals]/node:http [external] (node:http, cjs, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[externals]_node_http_1l3r0mi._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/node:http [external] (node:http, cjs)");
    });
});
}),
];