module.exports = [
"[externals]/node:process [external] (node:process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:process", () => require("node:process"));

module.exports = mod;
}),
"[externals]/node:http2 [external] (node:http2, cjs) <export default as node_http2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "node_http2",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$http2__$5b$external$5d$__$28$node$3a$http2$2c$__cjs$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$http2__$5b$external$5d$__$28$node$3a$http2$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:http2 [external] (node:http2, cjs)");
}),
"[externals]/node:vm [external] (node:vm, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:vm", () => require("node:vm"));

module.exports = mod;
}),
];