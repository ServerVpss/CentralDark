module.exports = [
"[externals]/node:dns/promises [external] (node:dns/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:dns/promises", () => require("node:dns/promises"));

module.exports = mod;
}),
"[externals]/node:net [external] (node:net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:net", () => require("node:net"));

module.exports = mod;
}),
"[project]/open-sse/utils/proxyFamily.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectIpLiteralFamily",
    ()=>detectIpLiteralFamily,
    "parseProxyFamily",
    ()=>parseProxyFamily,
    "stripIpv6Brackets",
    ()=>stripIpv6Brackets
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:net [external] (node:net, cjs)");
;
function stripIpv6Brackets(host) {
    if (typeof host !== "string") return "";
    if (host.startsWith("[") && host.endsWith("]")) {
        return host.slice(1, -1);
    }
    return host;
}
function detectIpLiteralFamily(host) {
    const bare = stripIpv6Brackets(host);
    const v = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(bare);
    return v === 0 ? null : v;
}
function parseProxyFamily(value) {
    return value === "ipv4" || value === "ipv6" ? value : "auto";
}
}),
"[project]/open-sse/utils/proxyFamilyResolve.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__clearFamilyCheckCacheForTest",
    ()=>__clearFamilyCheckCacheForTest,
    "assertHostnameSupportsFamily",
    ()=>assertHostnameSupportsFamily
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$dns$2f$promises__$5b$external$5d$__$28$node$3a$dns$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:dns/promises [external] (node:dns/promises, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFamily.ts [instrumentation] (ecmascript)");
;
;
const defaultLookup = (hostname)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$dns$2f$promises__$5b$external$5d$__$28$node$3a$dns$2f$promises$2c$__cjs$29$__["default"].lookup(hostname, {
        all: true
    });
/** Positive family checks are trusted for 5 minutes (DNS TTLs are typically short). */ const FAMILY_CHECK_POSITIVE_TTL_MS = 300_000;
/** Negative results change fast (DNS provisioning) — only 2 seconds. */ const FAMILY_CHECK_NEGATIVE_TTL_MS = 2_000;
/** Cached family-check results keyed by `${host}:${family}`. */ const familyCheckCache = new Map();
/** In-flight family checks keyed by `${host}:${family}` — dedupes concurrent probes. */ const familyCheckInflight = new Map();
async function assertHostnameSupportsFamily(host, family, lookupFn = defaultLookup) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectIpLiteralFamily"])(host) !== null) return;
    const cacheKey = `${host}:${family}`;
    const cached = familyCheckCache.get(cacheKey);
    if (cached && cached.lookupFn === lookupFn) {
        const ttl = cached.ok ? FAMILY_CHECK_POSITIVE_TTL_MS : FAMILY_CHECK_NEGATIVE_TTL_MS;
        if (Date.now() - cached.checkedAt < ttl) {
            if (!cached.ok) throw new Error(cached.message);
            return;
        }
        familyCheckCache.delete(cacheKey);
    }
    const inflight = familyCheckInflight.get(cacheKey);
    if (inflight) {
        await inflight;
        return;
    }
    const probe = (async ()=>{
        let records;
        try {
            records = await lookupFn((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripIpv6Brackets"])(host));
        } catch (err) {
            const message = `[ProxyFamily] DNS resolution failed for ${host}; refusing to egress (fail-closed): ${err instanceof Error ? err.message : String(err)}`;
            familyCheckCache.set(cacheKey, {
                lookupFn,
                checkedAt: Date.now(),
                ok: false,
                message
            });
            throw new Error(message);
        }
        const hasFamily = records.some((r)=>r.family === family);
        if (!hasFamily) {
            const message = `[ProxyFamily] Proxy host ${host} has no ${family === 6 ? "IPv6 (AAAA)" : "IPv4 (A)"} record; refusing ${family === 6 ? "IPv6" : "IPv4"}-only egress (fail-closed)`;
            familyCheckCache.set(cacheKey, {
                lookupFn,
                checkedAt: Date.now(),
                ok: false,
                message
            });
            throw new Error(message);
        }
        familyCheckCache.set(cacheKey, {
            lookupFn,
            checkedAt: Date.now(),
            ok: true
        });
    })();
    familyCheckInflight.set(cacheKey, probe);
    try {
        await probe;
    } finally{
        if (familyCheckInflight.get(cacheKey) === probe) {
            familyCheckInflight.delete(cacheKey);
        }
    }
}
function __clearFamilyCheckCacheForTest() {
    familyCheckCache.clear();
    familyCheckInflight.clear();
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ye5qww._.js.map