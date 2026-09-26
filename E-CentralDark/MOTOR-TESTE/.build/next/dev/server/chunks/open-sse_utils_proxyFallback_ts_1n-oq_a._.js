module.exports = [
"[project]/open-sse/utils/proxyFallback.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "__setProxyFallbackTestHooks",
    ()=>__setProxyFallbackTestHooks,
    "clearProxyFallbackCache",
    ()=>clearProxyFallbackCache,
    "findWorkingProxy",
    ()=>findWorkingProxy,
    "getProxyCandidates",
    ()=>getProxyCandidates,
    "selectWorkingProxyFallback",
    ()=>selectWorkingProxyFallback,
    "testProxiesAgainstTarget",
    ()=>testProxiesAgainstTarget,
    "testSingleProxy",
    ()=>testSingleProxy
]);
/**
 * proxyFallback.ts — Smart Proxy Fallback for Provider Validation
 *
 * When a direct fetch to a provider fails and no explicit proxy was configured,
 * this module automatically gathers proxy candidates from all available sources,
 * tests them in parallel against the provider URL, and returns the first working one.
 * Results are cached per target URL to avoid repeated probing without letting
 * a failed path poison a different endpoint on the same API host.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/undici/index.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyDispatcher.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/rotation.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$oneproxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/oneproxy.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------
const PROXY_FALLBACK_CACHE = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let proxyFallbackTestHooks = null;
function clearProxyFallbackCache() {
    PROXY_FALLBACK_CACHE.clear();
}
function __setProxyFallbackTestHooks(hooks) {
    proxyFallbackTestHooks = hooks;
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/**
 * Build a full proxy URL string from a proxy record's fields.
 */ function proxyRecordToUrl(proxy) {
    const auth = proxy.username ? `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password || "")}@` : "";
    return `${proxy.type}://${auth}${proxy.host}:${proxy.port}`;
}
function cacheKeyForTarget(targetHostname, targetUrl) {
    try {
        const url = new URL(targetUrl);
        const normalizedPath = `${url.pathname || "/"}${url.search}`;
        return `${url.protocol}//${url.host}${normalizedPath}`;
    } catch  {
        return targetHostname.toLowerCase();
    }
}
/**
 * Resolve the environment proxy URL (HTTP_PROXY / HTTPS_PROXY / ALL_PROXY)
 * for the given target URL. Returns null if no env proxy is configured or
 * the target matches NO_PROXY.
 */ function resolveEnvProxyUrl(targetUrl) {
    // Honour NO_PROXY
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;
    if (noProxy) {
        let hostname;
        try {
            hostname = new URL(targetUrl).hostname.toLowerCase();
        } catch  {
            return null;
        }
        const patterns = noProxy.split(",").map((p)=>p.trim().toLowerCase()).filter(Boolean);
        const match = patterns.some((pattern)=>{
            if (pattern === "*") return true;
            if (pattern.includes("*")) {
                const re = new RegExp("^" + pattern.split("*").map((s)=>s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
                return re.test(hostname);
            }
            return hostname === pattern || hostname.endsWith(`.${pattern}`);
        });
        if (match) return null;
    }
    let protocol;
    try {
        protocol = new URL(targetUrl).protocol;
    } catch  {
        return null;
    }
    const proxyUrl = protocol === "https:" ? process.env.HTTPS_PROXY || process.env.https_proxy || process.env.ALL_PROXY || process.env.all_proxy : process.env.HTTP_PROXY || process.env.http_proxy || process.env.ALL_PROXY || process.env.all_proxy;
    if (!proxyUrl) return null;
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeProxyUrl"])(proxyUrl, "environment proxy");
    } catch  {
        return null;
    }
}
async function getProxyCandidates(targetUrl) {
    const candidates = new Set();
    // 1. Global proxy from registry
    try {
        const globalProxy = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveProxyForScopeFromRegistry"])("global");
        if (globalProxy?.proxy) {
            candidates.add(proxyRecordToUrl(globalProxy.proxy));
        }
    } catch  {
    // Table may not exist yet
    }
    // 2. All user-configured proxies (include secrets for auth)
    try {
        const { items: allProxies } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["listProxies"])({
            includeSecrets: true
        });
        for (const p of allProxies){
            if (p.host && p.port) {
                candidates.add(proxyRecordToUrl(p));
            }
        }
    } catch  {
    // Table may not exist yet
    }
    // 3. Top 5 1proxy marketplace proxies
    try {
        const oneproxyProxies = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$oneproxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["listOneproxyProxies"])({
            limit: 5
        });
        for (const p of oneproxyProxies){
            if (p.host && p.port) {
                candidates.add(proxyRecordToUrl(p));
            }
        }
    } catch  {
    // Table may not exist yet
    }
    // 4. Environment proxy (needs targetUrl to determine protocol)
    if (targetUrl) {
        try {
            const envProxy = resolveEnvProxyUrl(targetUrl);
            if (envProxy) candidates.add(envProxy);
        } catch  {
        // Ignore env proxy errors
        }
    }
    return Array.from(candidates);
}
async function testSingleProxy(proxyUrl, targetUrl, timeoutMs = 3000) {
    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(), timeoutMs);
        const dispatcher = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createProxyDispatcher"])(proxyUrl);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["fetch"])(targetUrl, {
            method: "HEAD",
            signal: controller.signal,
            dispatcher,
            headers: {
                "User-Agent": "OmniRoute/1.0"
            }
        });
        clearTimeout(timeout);
        const latencyMs = Date.now() - start;
        // Any response (including 4xx) means the proxy can reach the target
        return {
            ok: true,
            latencyMs
        };
    } catch  {
        return {
            ok: false,
            latencyMs: null
        };
    }
}
async function testProxiesAgainstTarget(targetUrl, proxyUrls) {
    if (proxyUrls.length === 0) return [];
    const results = await Promise.allSettled(proxyUrls.map(async (proxyUrl)=>{
        const result = await testSingleProxy(proxyUrl, targetUrl);
        return {
            proxyUrl,
            ...result
        };
    }));
    return results.map((r)=>r.status === "fulfilled" ? r.value : {
            proxyUrl: "unknown",
            ok: false,
            latencyMs: null
        });
}
// ---------------------------------------------------------------------------
// Find working proxy (with caching)
// ---------------------------------------------------------------------------
// #9100: single-flight probe dedup. Under concurrent failures (e.g. 5 parallel
// chat requests all hitting a dead pinned proxy), every request would otherwise
// probe the whole proxy pool simultaneously — a thundering herd of TCP connects
// that throttles the very proxies it is trying to reach. Concurrent
// findWorkingProxy calls for the same cache key share ONE probe promise;
// mirrors the proxyHealthInflight pattern in src/lib/proxyHealth.ts.
const inflightProbes = new Map();
async function findWorkingProxy(targetHostname, targetUrl) {
    if (!targetHostname) return null;
    const cacheKey = cacheKeyForTarget(targetHostname, targetUrl);
    // Check cache first
    const cached = PROXY_FALLBACK_CACHE.get(cacheKey);
    if (cached) {
        if (cached.expiresAt > Date.now()) {
            // Cached hit — return the proxy (or null if previously all failed)
            return cached.proxyUrl || null;
        }
        // Expired entry — remove it and re-probe
        PROXY_FALLBACK_CACHE.delete(cacheKey);
    }
    // #9100: single-flight — if a probe for this cache key is already running,
    // share its promise instead of starting another (thundering-herd guard).
    const existingProbe = inflightProbes.get(cacheKey);
    if (existingProbe) {
        return existingProbe;
    }
    const probe = (async ()=>{
        // Collect candidates
        const candidates = await (proxyFallbackTestHooks?.getProxyCandidates ?? getProxyCandidates)(targetUrl);
        if (candidates.length === 0) {
            return null;
        }
        // Test all in parallel, return first that works
        const results = await Promise.allSettled(candidates.map(async (proxyUrl)=>{
            const { ok } = await (proxyFallbackTestHooks?.testSingleProxy ?? testSingleProxy)(proxyUrl, targetUrl);
            return {
                proxyUrl,
                ok
            };
        }));
        const working = results.find((r)=>r.status === "fulfilled" && r.value.ok);
        if (working && working.status === "fulfilled") {
            const proxyUrl = working.value.proxyUrl;
            // Cache the working proxy
            PROXY_FALLBACK_CACHE.set(cacheKey, {
                proxyUrl,
                expiresAt: Date.now() + CACHE_TTL_MS
            });
            return proxyUrl;
        }
        // All failed — cache the negative result to avoid re-probing too often
        PROXY_FALLBACK_CACHE.set(cacheKey, {
            proxyUrl: "",
            expiresAt: Date.now() + CACHE_TTL_MS
        });
        return null;
    })();
    inflightProbes.set(cacheKey, probe);
    try {
        return await probe;
    } finally{
        // Only the owning caller removes the entry — a later caller that picked up
        // the shared promise must not delete it out from under the first caller.
        if (inflightProbes.get(cacheKey) === probe) {
            inflightProbes.delete(cacheKey);
        }
    }
}
async function selectWorkingProxyFallback(_connectionId) {
    // #3332: auto-selection is opt-in. Without this gate, any single proxy in the
    // registry silently becomes a global fallback for ALL connections (ignoring
    // assignments / per-connection proxy_enabled). Default OFF — only run when the
    // operator explicitly enables PROXY_AUTO_SELECT_ENABLED.
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("PROXY_AUTO_SELECT_ENABLED")) return null;
    const candidates = await getProxyCandidates();
    if (candidates.length === 0) return null;
    // Use a well-known AI API endpoint as the test target. If a proxy can
    // reach this, it is likely suitable for routing AI traffic.
    const targetUrl = "https://api.openai.com/v1/models";
    const targetHostname = "api.openai.com";
    const workingUrl = await findWorkingProxy(targetHostname, targetUrl);
    if (!workingUrl) return null;
    try {
        const url = new URL(workingUrl);
        return {
            proxy: {
                type: url.protocol.replace(":", "") || "http",
                host: url.hostname,
                port: parseInt(url.port, 10) || (url.protocol === "https:" ? 443 : 80),
                username: url.username ? decodeURIComponent(url.username) : "",
                password: url.password ? decodeURIComponent(url.password) : ""
            },
            level: "autoSelect",
            levelId: null,
            source: "automatic"
        };
    } catch  {
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_utils_proxyFallback_ts_1n-oq_a._.js.map