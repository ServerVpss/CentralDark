module.exports = [
"[externals]/node:worker_threads [external] (node:worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:worker_threads", () => require("node:worker_threads"));

module.exports = mod;
}),
"[project]/open-sse/utils/setupPolyfill.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
// Polyfill worker_threads.markAsUncloneable for Node.js < 21 compatibility (specifically Node 20.20.2)
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:worker_threads [external] (node:worker_threads, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__ = __turbopack_context__.i("[externals]/ws [external] (ws, esm_import, [project]/node_modules/ws)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__["default"] && !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__["default"].markAsUncloneable) {
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__["default"].markAsUncloneable = function(obj) {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__["default"].markAsUntransferable) {
            try {
                __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__["default"].markAsUntransferable(obj);
            } catch  {
            // no-op
            }
        }
    };
}
// Polyfill Promise.withResolvers for Node.js < 22 compatibility (specifically Node 20.20.2)
if (typeof Promise.withResolvers === "undefined") {
    Promise.withResolvers = function() {
        let resolve;
        let reject;
        const promise = new Promise((res, rej)=>{
            resolve = res;
            reject = rej;
        });
        return {
            promise,
            resolve,
            reject
        };
    };
}
// Polyfill WebSocket for Node.js < 22 compatibility (specifically Node 20.20.2)
if (typeof globalThis.WebSocket === "undefined") {
    globalThis.WebSocket = __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__["WebSocket"];
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/node:assert [external] (node:assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:assert", () => require("node:assert"));

module.exports = mod;
}),
"[externals]/node:net [external] (node:net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:net", () => require("node:net"));

module.exports = mod;
}),
"[externals]/node:http [external] (node:http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:querystring [external] (node:querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:querystring", () => require("node:querystring"));

module.exports = mod;
}),
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[externals]/node:diagnostics_channel [external] (node:diagnostics_channel, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:diagnostics_channel", () => require("node:diagnostics_channel"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/node:tls [external] (node:tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:tls", () => require("node:tls"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:zlib [external] (node:zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:zlib", () => require("node:zlib"));

module.exports = mod;
}),
"[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:perf_hooks", () => require("node:perf_hooks"));

module.exports = mod;
}),
"[externals]/node:util/types [external] (node:util/types, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util/types", () => require("node:util/types"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:stream/web [external] (node:stream/web, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/web", () => require("node:stream/web"));

module.exports = mod;
}),
"[externals]/node:http2 [external] (node:http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http2", () => require("node:http2"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:console [external] (node:console, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:console", () => require("node:console"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:timers [external] (node:timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:timers", () => require("node:timers"));

module.exports = mod;
}),
"[externals]/node:dns [external] (node:dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:dns", () => require("node:dns"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[project]/src/shared/utils/runtimeTimeouts.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS,
    "DEFAULT_FETCH_CONNECT_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_CONNECT_TIMEOUT_MS,
    "DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_FETCH_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_TIMEOUT_MS,
    "DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS",
    ()=>DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS,
    "DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_SSE_HEARTBEAT_INTERVAL_MS",
    ()=>DEFAULT_SSE_HEARTBEAT_INTERVAL_MS,
    "DEFAULT_STREAM_IDLE_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_IDLE_TIMEOUT_MS,
    "DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS,
    "DEFAULT_STREAM_READINESS_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_READINESS_TIMEOUT_MS,
    "MAX_TIMER_TIMEOUT_MS",
    ()=>MAX_TIMER_TIMEOUT_MS,
    "getApiBridgeTimeoutConfig",
    ()=>getApiBridgeTimeoutConfig,
    "getMainServerTimeoutConfig",
    ()=>getMainServerTimeoutConfig,
    "getStainlessTimeoutSeconds",
    ()=>getStainlessTimeoutSeconds,
    "getTlsClientTimeoutConfig",
    ()=>getTlsClientTimeoutConfig,
    "getUpstreamTimeoutConfig",
    ()=>getUpstreamTimeoutConfig
]);
const DEFAULT_FETCH_TIMEOUT_MS = 600_000;
const DEFAULT_STREAM_IDLE_TIMEOUT_MS = 600_000;
const MAX_TIMER_TIMEOUT_MS = 2_147_483_647;
const DEFAULT_SSE_HEARTBEAT_INTERVAL_MS = 15_000;
const DEFAULT_STREAM_READINESS_TIMEOUT_MS = 80_000;
const DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS = 180_000;
const DEFAULT_FETCH_CONNECT_TIMEOUT_MS = 30_000;
const DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS = 4_000;
const DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS = 600_000;
const DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS = 300_000;
const DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS = 60_000;
const DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS = 5_000;
const DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS = 0;
const DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS = 65_000;
const DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS = 66_000;
function hasEnvValue(env, name) {
    const raw = env[name];
    return raw != null && raw.trim() !== "";
}
function readTimeoutMs(env, name, defaultValue, options = {}) {
    const raw = env[name];
    if (raw == null || raw.trim() === "") return defaultValue;
    const parsed = Number(raw);
    const isValid = Number.isFinite(parsed) && (options.allowZero ? parsed >= 0 : parsed > 0);
    if (!isValid) {
        options.logger?.(`Invalid ${name}="${raw}". Using default ${defaultValue}ms.`);
        return defaultValue;
    }
    return Math.floor(parsed);
}
function getUpstreamTimeoutConfig(env = process.env, logger) {
    const sharedRequestTimeoutMs = hasEnvValue(env, "REQUEST_TIMEOUT_MS") ? readTimeoutMs(env, "REQUEST_TIMEOUT_MS", DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    }) : undefined;
    const fetchTimeoutMs = readTimeoutMs(env, "FETCH_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamIdleTimeoutMs = readTimeoutMs(env, "STREAM_IDLE_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_STREAM_IDLE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamReadinessTimeoutMs = readTimeoutMs(env, "STREAM_READINESS_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_STREAM_READINESS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamReadinessMaxTimeoutMs = readTimeoutMs(env, "STREAM_READINESS_MAX_TIMEOUT_MS", DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const sseHeartbeatIntervalMs = readTimeoutMs(env, "SSE_HEARTBEAT_INTERVAL_MS", DEFAULT_SSE_HEARTBEAT_INTERVAL_MS, {
        allowZero: true,
        logger
    });
    return {
        fetchTimeoutMs,
        streamIdleTimeoutMs,
        streamReadinessTimeoutMs,
        streamReadinessMaxTimeoutMs,
        sseHeartbeatIntervalMs,
        fetchHeadersTimeoutMs: readTimeoutMs(env, "FETCH_HEADERS_TIMEOUT_MS", fetchTimeoutMs, {
            allowZero: true,
            logger
        }),
        fetchBodyTimeoutMs: readTimeoutMs(env, "FETCH_BODY_TIMEOUT_MS", fetchTimeoutMs, {
            allowZero: true,
            logger
        }),
        fetchConnectTimeoutMs: readTimeoutMs(env, "FETCH_CONNECT_TIMEOUT_MS", DEFAULT_FETCH_CONNECT_TIMEOUT_MS, {
            allowZero: true,
            logger
        }),
        fetchKeepAliveTimeoutMs: readTimeoutMs(env, "FETCH_KEEPALIVE_TIMEOUT_MS", DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS, {
            logger
        })
    };
}
function getStainlessTimeoutSeconds(env = process.env, logger) {
    const { fetchTimeoutMs } = getUpstreamTimeoutConfig(env, logger);
    return Math.max(1, Math.ceil(fetchTimeoutMs / 1_000));
}
function getTlsClientTimeoutConfig(env = process.env, logger) {
    const upstream = getUpstreamTimeoutConfig(env, logger);
    return {
        timeoutMs: readTimeoutMs(env, "TLS_CLIENT_TIMEOUT_MS", upstream.fetchTimeoutMs, {
            allowZero: true,
            logger
        })
    };
}
function getApiBridgeTimeoutConfig(env = process.env, logger) {
    const sharedRequestTimeoutMs = hasEnvValue(env, "REQUEST_TIMEOUT_MS") ? readTimeoutMs(env, "REQUEST_TIMEOUT_MS", DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    }) : undefined;
    const proxyTimeoutMs = readTimeoutMs(env, "API_BRIDGE_PROXY_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const derivedRequestTimeoutMs = proxyTimeoutMs > 0 ? Math.max(proxyTimeoutMs, DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS) : DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS;
    const serverRequestDefaultMs = sharedRequestTimeoutMs !== undefined ? sharedRequestTimeoutMs > 0 ? Math.max(sharedRequestTimeoutMs, derivedRequestTimeoutMs) : 0 : derivedRequestTimeoutMs;
    const serverKeepAliveTimeoutMs = readTimeoutMs(env, "API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const serverHeadersTimeoutMs = readTimeoutMs(env, "API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    return {
        proxyTimeoutMs,
        serverRequestTimeoutMs: readTimeoutMs(env, "API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS", serverRequestDefaultMs, {
            allowZero: true,
            logger
        }),
        serverHeadersTimeoutMs: serverHeadersTimeoutMs > 0 && serverKeepAliveTimeoutMs > 0 ? Math.max(serverHeadersTimeoutMs, serverKeepAliveTimeoutMs + 1_000) : serverHeadersTimeoutMs,
        serverKeepAliveTimeoutMs,
        serverSocketTimeoutMs: readTimeoutMs(env, "API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS, {
            allowZero: true,
            logger
        })
    };
}
function getMainServerTimeoutConfig(env = process.env, logger) {
    const keepAliveTimeoutMs = readTimeoutMs(env, "MAIN_SERVER_KEEPALIVE_TIMEOUT_MS", DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const headersTimeoutMs = readTimeoutMs(env, "MAIN_SERVER_HEADERS_TIMEOUT_MS", DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    return {
        keepAliveTimeoutMs,
        // Node requires headersTimeout > keepAliveTimeout to avoid its internal
        // race-condition warning; keep both configurable but always coherent.
        headersTimeoutMs: headersTimeoutMs > 0 && keepAliveTimeoutMs > 0 ? Math.max(headersTimeoutMs, keepAliveTimeoutMs + 1_000) : headersTimeoutMs
    };
}
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
"[project]/open-sse/utils/socksConnectorWithFamily.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildSocksFamilySocketOptions",
    ()=>buildSocksFamilySocketOptions,
    "createSocksDispatcherWithFamily",
    ()=>createSocksDispatcherWithFamily,
    "resolveSocksHandshakeTimeoutMs",
    ()=>resolveSocksHandshakeTimeoutMs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/undici/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socks$2f$build$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/socks/build/index.js [instrumentation] (ecmascript)");
;
;
const DEFAULT_SOCKS_HANDSHAKE_TIMEOUT_MS = 10_000;
const MAX_SOCKS_HANDSHAKE_TIMEOUT_MS = 120_000;
function resolveSocksHandshakeTimeoutMs(env = process.env) {
    const raw = env.SOCKS_HANDSHAKE_TIMEOUT_MS;
    if (raw == null || raw.trim() === "") return DEFAULT_SOCKS_HANDSHAKE_TIMEOUT_MS;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_SOCKS_HANDSHAKE_TIMEOUT_MS;
    return Math.min(Math.floor(parsed), MAX_SOCKS_HANDSHAKE_TIMEOUT_MS);
}
function buildSocksFamilySocketOptions(family) {
    if (family === 6) return {
        family: 6,
        autoSelectFamily: false
    };
    if (family === 4) return {
        family: 4,
        autoSelectFamily: false
    };
    return {};
}
function resolvePort(protocol, port) {
    return port ? Number.parseInt(port, 10) : protocol === "http:" ? 80 : 443;
}
/**
 * Undici connector that tunnels through a single SOCKS5 proxy, pinning the family
 * of the TCP connection to the proxy host when `family` is set. Mirrors fetch-socks'
 * socksConnector but threads `socket_options` (which fetch-socks does not expose)
 * into SocksClient so Happy Eyeballs cannot pick IPv4 for an IPv6-only egress policy.
 */ function socksConnectorWithFamily(proxy, family, tlsOpts = {}) {
    const undiciConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildConnector"])(tlsOpts);
    const socketOptions = buildSocksFamilySocketOptions(family);
    return async (options, callback)=>{
        const { protocol, hostname, port, httpSocket } = options;
        try {
            const r = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socks$2f$build$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SocksClient"].createConnection({
                command: "connect",
                proxy,
                timeout: resolveSocksHandshakeTimeoutMs(),
                destination: {
                    host: hostname,
                    port: resolvePort(protocol, port)
                },
                existing_socket: httpSocket,
                socket_options: socketOptions
            });
            const sock = r.socket;
            if (protocol !== "https:") {
                return callback(null, sock.setNoDelay());
            }
            return undiciConnect({
                ...options,
                httpSocket: sock
            }, callback);
        } catch (error) {
            return callback(error, null);
        }
    };
}
function createSocksDispatcherWithFamily(proxy, family, agentOptions = {}) {
    const { connect, ...rest } = agentOptions;
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Agent"]({
        ...rest,
        connect: socksConnectorWithFamily(proxy, family, connect)
    });
}
}),
"[project]/open-sse/utils/proxyDispatcherCache.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__cacheProxyDispatcherForTest",
    ()=>__cacheProxyDispatcherForTest,
    "clearDispatcherCache",
    ()=>clearDispatcherCache,
    "createRoundRobinDispatcher",
    ()=>createRoundRobinDispatcher,
    "getDefaultCachedDispatcher",
    ()=>getDefaultCachedDispatcher,
    "getDispatcherCache",
    ()=>getDispatcherCache,
    "getRetryCachedDispatcher",
    ()=>getRetryCachedDispatcher,
    "setDefaultCachedDispatcher",
    ()=>setDefaultCachedDispatcher,
    "setDispatcherCacheEntry",
    ()=>setDispatcherCacheEntry,
    "setRetryCachedDispatcher",
    ()=>setRetryCachedDispatcher
]);
const DISPATCHER_CACHE_KEY = Symbol.for("omniroute.proxyDispatcher.cache");
const DEFAULT_DISPATCHER_KEY = Symbol.for("omniroute.proxyDispatcher.default");
const RETRY_DISPATCHER_KEY = Symbol.for("omniroute.proxyDispatcher.retry");
/** Upper bound on cached per-URL proxy dispatchers; oldest entries are evicted first. */ const MAX_DISPATCHER_CACHE_ENTRIES = 512;
/**
 * Direct upstream fan-out dispatcher.
 *
 * A single Undici Agent configured with `connections > 1` should be enough in
 * theory, but real Codex `/backend-api/codex/responses` streams on Node 24 have
 * still been observed queuing every subsequent same-origin request until the
 * previous stream emits trailers. Using several one-connection Agents gives
 * each long SSE stream an independent pool/client and prevents one stream from
 * monopolizing the effective queue while keeping pipelining disabled.
 */ class RoundRobinDispatcher {
    dispatchers;
    nextIndex = 0;
    constructor(dispatchers){
        this.dispatchers = dispatchers;
    }
    dispatch(options, handler) {
        const dispatcher = this.dispatchers[this.nextIndex % this.dispatchers.length];
        this.nextIndex = (this.nextIndex + 1) % this.dispatchers.length;
        return dispatcher.dispatch(options, handler);
    }
    close(callback) {
        const done = Promise.all(this.dispatchers.map((dispatcher)=>dispatcher.close())).then(()=>undefined);
        if (callback) {
            done.then(callback);
            return;
        }
        return done;
    }
    destroy(errorOrCallback, callback) {
        const callbackFn = typeof errorOrCallback === "function" ? errorOrCallback : callback;
        const error = typeof errorOrCallback === "function" ? null : errorOrCallback ?? null;
        const done = Promise.all(this.dispatchers.map((dispatcher)=>dispatcher.destroy(error))).then(()=>undefined);
        if (callbackFn) {
            done.then(callbackFn);
            return;
        }
        return done;
    }
}
function createRoundRobinDispatcher(dispatchers) {
    return new RoundRobinDispatcher(dispatchers);
}
function getDispatcherCache() {
    const globalWithCache = globalThis;
    if (!globalWithCache[DISPATCHER_CACHE_KEY]) {
        globalWithCache[DISPATCHER_CACHE_KEY] = new Map();
    }
    return globalWithCache[DISPATCHER_CACHE_KEY];
}
function getDefaultCachedDispatcher() {
    return globalThis[DEFAULT_DISPATCHER_KEY];
}
function setDefaultCachedDispatcher(dispatcher) {
    globalThis[DEFAULT_DISPATCHER_KEY] = dispatcher;
}
function getRetryCachedDispatcher() {
    return globalThis[RETRY_DISPATCHER_KEY];
}
function setRetryCachedDispatcher(dispatcher) {
    globalThis[RETRY_DISPATCHER_KEY] = dispatcher;
}
function closeDispatcher(dispatcher) {
    if (!dispatcher) return;
    try {
        const result = dispatcher.close();
        if (result && typeof result.catch === "function") {
            void result.catch(()=>{});
        }
    } catch  {}
}
function clearDispatcherCache() {
    const cache = getDispatcherCache();
    for (const dispatcher of cache.values()){
        closeDispatcher(dispatcher);
    }
    cache.clear();
    const globalWithCache = globalThis;
    closeDispatcher(globalWithCache[DEFAULT_DISPATCHER_KEY]);
    closeDispatcher(globalWithCache[RETRY_DISPATCHER_KEY]);
    delete globalWithCache[DEFAULT_DISPATCHER_KEY];
    delete globalWithCache[RETRY_DISPATCHER_KEY];
}
function __cacheProxyDispatcherForTest(key, dispatcher) {
    getDispatcherCache().set(key, dispatcher);
}
function setDispatcherCacheEntry(key, dispatcher) {
    const cache = getDispatcherCache();
    if (cache.size >= MAX_DISPATCHER_CACHE_ENTRIES) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) {
            const evicted = cache.get(oldest);
            cache.delete(oldest);
            closeDispatcher(evicted);
        }
    }
    cache.set(key, dispatcher);
}
}),
"[project]/open-sse/utils/proxyDispatcher.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "RELAY_TYPES",
    ()=>RELAY_TYPES,
    "__createRoundRobinDispatcherForTest",
    ()=>__createRoundRobinDispatcherForTest,
    "__getDefaultDispatcherOptionsForTest",
    ()=>__getDefaultDispatcherOptionsForTest,
    "__getProxyDispatcherOptionsForTest",
    ()=>__getProxyDispatcherOptionsForTest,
    "__getSocksOptionsForTest",
    ()=>__getSocksOptionsForTest,
    "__resolveDispatcherFamilyForTest",
    ()=>__resolveDispatcherFamilyForTest,
    "buildRelayHeaders",
    ()=>buildRelayHeaders,
    "buildVercelRelayHeaders",
    ()=>buildVercelRelayHeaders,
    "createProxyDispatcher",
    ()=>createProxyDispatcher,
    "getDefaultDispatcher",
    ()=>getDefaultDispatcher,
    "getDefaultDispatcherConnectionLimit",
    ()=>getDefaultDispatcherConnectionLimit,
    "getProxyDispatcherConnectionLimit",
    ()=>getProxyDispatcherConnectionLimit,
    "getProxyRetryDispatcher",
    ()=>getProxyRetryDispatcher,
    "getRetryDispatcher",
    ()=>getRetryDispatcher,
    "isRelayType",
    ()=>isRelayType,
    "isSocks5ProxyEnabled",
    ()=>isSocks5ProxyEnabled,
    "normalizeProxyUrl",
    ()=>normalizeProxyUrl,
    "proxyConfigToUrl",
    ()=>proxyConfigToUrl,
    "proxyUrlForLogs",
    ()=>proxyUrlForLogs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$setupPolyfill$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/setupPolyfill.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/undici/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fetch$2d$socks$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/fetch-socks/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/runtimeTimeouts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFamily.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$socksConnectorWithFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/socksConnectorWithFamily.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyDispatcherCache.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$setupPolyfill$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$setupPolyfill$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
const SUPPORTED_PROTOCOLS = new Set([
    "http:",
    "https:",
    "socks5:"
]);
const RELAY_TYPES = new Set([
    "vercel",
    "deno",
    "cloudflare"
]);
function isRelayType(type) {
    return typeof type === "string" && RELAY_TYPES.has(type);
}
const DEFAULT_PROXY_DISPATCHER_CONNECTIONS = 32;
const MAX_PROXY_DISPATCHER_CONNECTIONS = 256;
function getDispatcherOptions() {
    const timeouts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getUpstreamTimeoutConfig"])(process.env, (message)=>{
        console.warn(`[ProxyDispatcher] ${message}`);
    });
    return {
        headersTimeout: timeouts.fetchHeadersTimeoutMs,
        bodyTimeout: timeouts.fetchBodyTimeoutMs,
        connectTimeout: timeouts.fetchConnectTimeoutMs,
        keepAliveTimeout: timeouts.fetchKeepAliveTimeoutMs,
        // Without this, an upstream Keep-Alive: timeout=N header clamps
        // keepAliveTimeout UP to undici's default keepAliveMaxTimeout (600 s),
        // completely overriding the configured 1 s and restoring zombie-socket risk.
        keepAliveMaxTimeout: timeouts.fetchKeepAliveTimeoutMs,
        // 9router#1237: RFC 8305 Happy Eyeballs. undici does not
        // enable it by default, so when DNS returns both AAAA (IPv6) and A (IPv4)
        // and the IPv6 route is broken (e.g. NAT64 `64:ff9b::` without routing),
        // the direct egress connect hangs until ETIMEDOUT — even though `curl`
        // (which has Happy Eyeballs) reaches the same host. Race both families and
        // use whichever connects first. The proxy path pins family via `proxyTls`
        // and ProxyAgent ignores `connect`, so this only affects direct egress.
        // undici types `connect` as a union whose TcpNetConnectOpts member nominally
        // requires `port`; at runtime undici merges these into net.connect (the origin
        // already carries host:port), so the partial pin is valid — cast to suppress
        // the spurious missing-`port` error, mirroring the `proxyTls` cast below.
        connect: {
            autoSelectFamily: true,
            autoSelectFamilyAttemptTimeout: 1000
        }
    };
}
function getProxyDispatcherConnectionLimit(env = process.env) {
    const raw = env.OMNIROUTE_PROXY_DISPATCHER_CONNECTIONS;
    if (raw == null || raw.trim() === "") return DEFAULT_PROXY_DISPATCHER_CONNECTIONS;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 1) {
        console.warn(`[ProxyDispatcher] Invalid OMNIROUTE_PROXY_DISPATCHER_CONNECTIONS="${raw}". Using default ${DEFAULT_PROXY_DISPATCHER_CONNECTIONS}.`);
        return DEFAULT_PROXY_DISPATCHER_CONNECTIONS;
    }
    return Math.min(Math.floor(parsed), MAX_PROXY_DISPATCHER_CONNECTIONS);
}
function getProxyDispatcherOptions(env = process.env) {
    const options = getDispatcherOptions();
    // #9100: restore keep-alive on the proxy path. The previous hard-coded
    // keepAliveTimeout: 1 (1ms) destroyed the pooled socket right after every
    // response, forcing a fresh TCP+TLS+CONNECT handshake per request. Proxies
    // that throttle connection churn then serialized concurrent requests behind
    // ~30s stalls (5 concurrent → 1 fast + 4× ~29.5s). The socket now stays
    // alive for at least 30s (the default fetchKeepAliveTimeoutMs is 4s), and
    // keepAliveMaxTimeout is raised so an upstream Keep-Alive header cannot
    // clamp it back down to a sub-second value.
    //
    // Stale pooled sockets (a proxy that silently drops idle ones) are recovered
    // by the retry-once-with-fresh-socket path in proxyFetch.ts (mirrors the
    // direct-path #4252 fix) instead of by killing all idle sockets after 1ms.
    //
    // Pipelining 4 lets concurrent SSE streams multiplex over the pooled
    // connection instead of each opening its own socket (#4163 regression).
    return {
        ...options,
        connections: getProxyDispatcherConnectionLimit(env),
        keepAliveTimeout: Math.max(options.keepAliveTimeout, 30_000),
        keepAliveMaxTimeout: Math.max(options.keepAliveMaxTimeout, 60_000),
        pipelining: 4
    };
}
function getDefaultDispatcherConnectionLimit(env = process.env) {
    const raw = env.OMNIROUTE_DIRECT_DISPATCHER_CONNECTIONS;
    if (raw == null || raw.trim() === "") return DEFAULT_PROXY_DISPATCHER_CONNECTIONS;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 1) {
        console.warn(`[ProxyDispatcher] Invalid OMNIROUTE_DIRECT_DISPATCHER_CONNECTIONS="${raw}". Using default ${DEFAULT_PROXY_DISPATCHER_CONNECTIONS}.`);
        return DEFAULT_PROXY_DISPATCHER_CONNECTIONS;
    }
    return Math.min(Math.floor(parsed), MAX_PROXY_DISPATCHER_CONNECTIONS);
}
function getDefaultDispatcherOptions(env = process.env) {
    const options = getDispatcherOptions();
    // #4580 — On the direct egress path, undici's default pipelining (1) let a long
    // SSE stream monopolize the single pooled socket per origin. Keep the public
    // connection-limit option here, but getDefaultDispatcher() fans it out across
    // independent one-connection Agents; in production traces, one multi-connection
    // Agent could still queue same-origin Codex streams behind prior trailers.
    return {
        ...options,
        connections: getDefaultDispatcherConnectionLimit(env),
        pipelining: 0
    };
}
function createRoundRobinDirectDispatcher(connectionLimit) {
    const baseOptions = getDispatcherOptions();
    const perAgentOptions = {
        ...baseOptions,
        connections: 1,
        pipelining: 0
    };
    const dispatchers = Array.from({
        length: connectionLimit
    }, ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Agent"](perAgentOptions));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createRoundRobinDispatcher"])(dispatchers);
}
function getDefaultDispatcher() {
    let dispatcher = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDefaultCachedDispatcher"])();
    if (!dispatcher) {
        dispatcher = createRoundRobinDirectDispatcher(getDefaultDispatcherConnectionLimit());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setDefaultCachedDispatcher"])(dispatcher);
    }
    return dispatcher;
}
function getRetryDispatcher() {
    let dispatcher = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRetryCachedDispatcher"])();
    if (!dispatcher) {
        dispatcher = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Agent"]({
            ...getDispatcherOptions(),
            keepAliveTimeout: 1,
            keepAliveMaxTimeout: 1,
            pipelining: 0
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setRetryCachedDispatcher"])(dispatcher);
    }
    return dispatcher;
}
/**
 * Extract the port from a proxy URL string before URL parsing.
 * `new URL("http://host:80")` strips port 80 since it's the HTTP default,
 * but proxy servers commonly listen on port 80/443, so we need to preserve it.
 */ function extractExplicitPort(urlStr) {
    try {
        const idx = urlStr.indexOf("://");
        if (idx === -1) return null;
        const authorityStart = idx + 3;
        const authorityEnd = urlStr.indexOf("/", authorityStart);
        const authority = authorityEnd === -1 ? urlStr.slice(authorityStart) : urlStr.slice(authorityStart, authorityEnd);
        const lastColon = authority.lastIndexOf(":");
        const atSign = authority.lastIndexOf("@");
        if (lastColon !== -1 && lastColon > atSign) {
            const portStr = authority.slice(lastColon + 1);
            if (/^\d+$/.test(portStr)) {
                const port = Number(portStr);
                if (Number.isInteger(port) && port >= 1 && port <= 65535) return String(port);
            }
        }
    } catch  {}
    return null;
}
function defaultPortForProtocol(protocol) {
    if (protocol === "https:" || protocol === "wss:") return "443";
    if (protocol === "socks5:") return "1080";
    return "8080";
}
function normalizePort(port, protocol) {
    if (!port) return defaultPortForProtocol(protocol);
    const parsed = Number(port);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        throw new Error("[ProxyDispatcher] Invalid proxy port");
    }
    return String(parsed);
}
/**
 * Build a proxy URL string manually from parsed URL components.
 * We cannot use URL.toString() because the URL serializer silently strips
 * default ports (80 for http, 443 for https). Proxy servers commonly
 * listen on these ports, so we must always include the port explicitly.
 */ function buildProxyUrlString(parsed, port) {
    const auth = parsed.username ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@` : "";
    return `${parsed.protocol}//${auth}${parsed.hostname}:${port}`;
}
function isSocks5ProxyEnabled() {
    const raw = (process.env.ENABLE_SOCKS5_PROXY ?? "").trim().toLowerCase();
    return ![
        "false",
        "0",
        "no",
        "off"
    ].includes(raw);
}
function proxyUrlForLogs(proxyUrl) {
    const explicitPort = extractExplicitPort(proxyUrl);
    const parsed = new URL(proxyUrl);
    const port = explicitPort || parsed.port || defaultPortForProtocol(parsed.protocol);
    return `${parsed.protocol}//${parsed.hostname}:${port}`;
}
function normalizeProxyUrl(proxyUrl, source = "proxy", { allowSocks5 = isSocks5ProxyEnabled() } = {}) {
    // Strip a trailing synthetic `?family=ipv4|ipv6` marker BEFORE anything else.
    // `extractExplicitPort` slices the authority off the raw string, so a marker
    // turns the port substring into e.g. `80?family=ipv6`, which fails the digit
    // test and silently falls back to the default port (8080 for http) — rewriting
    // an http:80 proxy to :8080. We work on the marker-free string for both port
    // extraction and URL parsing, then re-append the marker exactly once below.
    const familyMatch = proxyUrl.match(/\?family=(ipv4|ipv6)$/);
    const familySuffix = familyMatch ? familyMatch[0] : "";
    const baseUrl = familySuffix ? proxyUrl.slice(0, -familySuffix.length) : proxyUrl;
    // Extract the explicit port from the raw URL string BEFORE parsing,
    // because `new URL()` silently strips default ports (80 for http,
    // 443 for https), which are valid and common for proxy servers.
    const explicitPort = extractExplicitPort(baseUrl);
    let parsed;
    try {
        parsed = new URL(baseUrl);
    } catch  {
        throw new Error(`[ProxyDispatcher] Invalid ${source} URL`);
    }
    if (!SUPPORTED_PROTOCOLS.has(parsed.protocol)) {
        throw new Error(`[ProxyDispatcher] Unsupported ${source} protocol: ${parsed.protocol.replace(":", "")}`);
    }
    if (parsed.protocol === "socks5:" && !allowSocks5) {
        throw new Error("[ProxyDispatcher] SOCKS5 proxy is disabled (remove ENABLE_SOCKS5_PROXY=false to enable — it is ON by default)");
    }
    if (!parsed.hostname) {
        throw new Error(`[ProxyDispatcher] Invalid ${source} host`);
    }
    // Use the explicit port from the raw string if present, otherwise apply default.
    const port = explicitPort || normalizePort(parsed.port, parsed.protocol);
    // Build the URL string manually instead of using parsed.toString(),
    // which would strip default ports (80/443) and break the proxy connection.
    // Preserve a synthetic `?family=` directive (the only query param we emit)
    // so the connect-family pin survives normalization and reaches the dispatcher.
    // The directive may arrive either as the stripped trailing marker (familySuffix)
    // or as an inline query on `baseUrl`; resolve both, append the marker once.
    const fam = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseProxyFamily"])((familyMatch ? familyMatch[1] : parsed.searchParams.get("family")) ?? undefined);
    const base = buildProxyUrlString(parsed, port);
    return fam === "auto" ? base : `${base}?family=${fam}`;
}
function buildVercelRelayHeaders(targetUrl, relayAuth) {
    const parsed = new URL(targetUrl);
    return {
        "x-relay-target": `${parsed.protocol}//${parsed.host}`,
        "x-relay-path": parsed.pathname + parsed.search,
        "x-relay-auth": relayAuth
    };
}
const buildRelayHeaders = buildVercelRelayHeaders;
function proxyConfigToUrl(proxyConfig, { allowSocks5 = isSocks5ProxyEnabled() } = {}) {
    if (!proxyConfig) return null;
    if (typeof proxyConfig === "string") {
        return normalizeProxyUrl(proxyConfig, "context proxy", {
            allowSocks5
        });
    }
    if (typeof proxyConfig !== "object" || Array.isArray(proxyConfig)) {
        throw new Error("[ProxyDispatcher] Invalid context proxy config");
    }
    const config = proxyConfig;
    // Partial / empty config object — treat as no proxy instead of crashing
    if (!config.host) return null;
    const type = String(config.type || "http").toLowerCase();
    // Edge-relay entries (vercel / deno / cloudflare) carry the relay URL in
    // `host` — no dispatcher needed; callers should use buildRelayHeaders() and
    // fetch the relay endpoint directly. All relay types share the exact same
    // x-relay-target / x-relay-path / x-relay-auth header spec (only the
    // deployment target differs).
    if (RELAY_TYPES.has(type)) {
        return config.host ? `https://${config.host}` : null;
    }
    const protocol = `${type}:`;
    if (!SUPPORTED_PROTOCOLS.has(protocol)) {
        throw new Error(`[ProxyDispatcher] Unsupported context proxy protocol: ${type}`);
    }
    if (protocol === "socks5:" && !allowSocks5) {
        throw new Error("[ProxyDispatcher] SOCKS5 proxy is disabled (remove ENABLE_SOCKS5_PROXY=false to enable — it is ON by default)");
    }
    const port = normalizePort(config.port, protocol);
    // Build the URL string manually to preserve the port through normalization.
    const auth = config.username ? `${encodeURIComponent(config.username)}:${config.password ? encodeURIComponent(config.password) : ""}@` : "";
    const proxyUrlStr = `${type}://${auth}${config.host}:${port}`;
    const fam = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseProxyFamily"])(config.family);
    const normalized = normalizeProxyUrl(proxyUrlStr, "context proxy", {
        allowSocks5
    });
    return fam === "auto" ? normalized : `${normalized}?family=${fam}`;
}
/** Resolve the concrete connect family for a proxy URL, fail-closed on contradictions. */ function resolveDispatcherFamily(parsed) {
    const directive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseProxyFamily"])(parsed.searchParams.get("family") ?? undefined);
    const literal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectIpLiteralFamily"])(parsed.hostname);
    if (directive === "auto") return literal;
    const want = directive === "ipv6" ? 6 : 4;
    if (literal !== null && literal !== want) {
        throw new Error(`[ProxyDispatcher] Proxy family directive ${directive} contradicts ${literal === 6 ? "IPv6" : "IPv4"} literal host`);
    }
    return want;
}
function __resolveDispatcherFamilyForTest(proxyUrl) {
    return resolveDispatcherFamily(new URL(proxyUrl));
}
function __getProxyDispatcherOptionsForTest(env = process.env) {
    return getProxyDispatcherOptions(env);
}
function __getDefaultDispatcherOptionsForTest(env = process.env) {
    return getDefaultDispatcherOptions(env);
}
function __createRoundRobinDispatcherForTest(dispatchers) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createRoundRobinDispatcher"])(dispatchers);
}
/**
 * Build a ProxyAgent / socks dispatcher for a normalized proxy URL using the
 * given options. Shared by the pooled dispatcher (keep-alive, pipelining 4)
 * and the retry dispatcher (fresh no-keep-alive socket, mirrors #4252).
 */ function buildProxyDispatcher(normalizedUrl, options) {
    const parsed = new URL(normalizedUrl);
    const family = resolveDispatcherFamily(parsed);
    parsed.searchParams.delete("family");
    const cleanUri = normalizedUrl.replace(/\?family=(ipv4|ipv6)$/, "");
    const explicitPort = extractExplicitPort(cleanUri);
    const port = explicitPort || normalizePort(parsed.port, parsed.protocol);
    if (parsed.protocol === "socks5:") {
        const socksOptions = {
            type: 5,
            host: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripIpv6Brackets"])(parsed.hostname),
            port: Number(port)
        };
        if (parsed.username) socksOptions.userId = decodeURIComponent(parsed.username);
        if (parsed.password) socksOptions.password = decodeURIComponent(parsed.password);
        return family === null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fetch$2d$socks$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["socksDispatcher"])(socksOptions, options) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$socksConnectorWithFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createSocksDispatcherWithFamily"])(socksOptions, family, options);
    }
    // ProxyAgent omits `connect`; the client->proxy socket is built from `proxyTls`.
    // undici 8.4.1 types `proxyTls?: buildConnector.BuildOptions`, a union whose
    // `TcpNetConnectOpts` member nominally requires `port` — so TS rejects a bare
    // `{ family, autoSelectFamily }` pin. At runtime undici merges these options into
    // net.connect (the uri already carries the host:port), so the partial pin is
    // valid; the cast suppresses the spurious missing-`port` error.
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ProxyAgent"]({
        uri: cleanUri,
        // undici 8.6+ forwards plain-HTTP requests through the proxy as an origin
        // request (GET http://host/…) instead of a CONNECT tunnel; upstream proxies
        // that only speak CONNECT then reject it (501). OmniRoute tunnels ALL proxied
        // traffic (HTTP + HTTPS) via CONNECT, so force tunneling. Unknown option on
        // undici <8.6 → silently ignored (that version already tunneled by default).
        proxyTunnel: true,
        ...options,
        ...family !== null ? {
            proxyTls: {
                family,
                autoSelectFamily: false
            }
        } : {}
    });
}
function createProxyDispatcher(proxyUrl) {
    const normalizedUrl = normalizeProxyUrl(proxyUrl, "proxy dispatcher");
    const dispatcherCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDispatcherCache"])();
    let dispatcher = dispatcherCache.get(normalizedUrl);
    if (dispatcher) return dispatcher;
    dispatcher = buildProxyDispatcher(normalizedUrl, getProxyDispatcherOptions());
    // A concurrent caller may have built + cached the same URL while we were
    // building. If so, drop our duplicate (avoid leaking sockets) and reuse theirs.
    const winner = dispatcherCache.get(normalizedUrl);
    if (winner) {
        void dispatcher.close().catch(()=>{});
        return winner;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setDispatcherCacheEntry"])(normalizedUrl, dispatcher);
    return dispatcher;
}
function getProxyRetryDispatcher(proxyUrl) {
    const normalizedUrl = normalizeProxyUrl(proxyUrl, "proxy dispatcher");
    const dispatcherCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDispatcherCache"])();
    const retryKey = `retry:${normalizedUrl}`;
    let dispatcher = dispatcherCache.get(retryKey);
    if (dispatcher) return dispatcher;
    dispatcher = buildProxyDispatcher(normalizedUrl, {
        ...getProxyDispatcherOptions(),
        // Retry needs exactly one fresh socket (not the inherited connection pool).
        connections: 1,
        keepAliveTimeout: 1,
        keepAliveMaxTimeout: 1,
        pipelining: 0
    });
    const winner = dispatcherCache.get(retryKey);
    if (winner) {
        void dispatcher.close().catch(()=>{});
        return winner;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setDispatcherCacheEntry"])(retryKey, dispatcher);
    return dispatcher;
}
function __getSocksOptionsForTest(proxyUrl) {
    const normalizedUrl = normalizeProxyUrl(proxyUrl, "proxy dispatcher");
    const parsed = new URL(normalizedUrl);
    parsed.searchParams.delete("family");
    const explicitPort = extractExplicitPort(normalizedUrl);
    const port = explicitPort || normalizePort(parsed.port, parsed.protocol);
    const socksOptions = {
        type: 5,
        host: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripIpv6Brackets"])(parsed.hostname),
        port: Number(port)
    };
    if (parsed.username) socksOptions.userId = decodeURIComponent(parsed.username);
    if (parsed.password) socksOptions.password = decodeURIComponent(parsed.password);
    return socksOptions;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/utils/proxyDispatcher.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "RELAY_TYPES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RELAY_TYPES"],
    "__cacheProxyDispatcherForTest",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["__cacheProxyDispatcherForTest"],
    "__createRoundRobinDispatcherForTest",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["__createRoundRobinDispatcherForTest"],
    "__getDefaultDispatcherOptionsForTest",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["__getDefaultDispatcherOptionsForTest"],
    "__getProxyDispatcherOptionsForTest",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["__getProxyDispatcherOptionsForTest"],
    "__getSocksOptionsForTest",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["__getSocksOptionsForTest"],
    "__resolveDispatcherFamilyForTest",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["__resolveDispatcherFamilyForTest"],
    "buildRelayHeaders",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildRelayHeaders"],
    "buildVercelRelayHeaders",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildVercelRelayHeaders"],
    "clearDispatcherCache",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clearDispatcherCache"],
    "createProxyDispatcher",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createProxyDispatcher"],
    "getDefaultDispatcher",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDefaultDispatcher"],
    "getDefaultDispatcherConnectionLimit",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDefaultDispatcherConnectionLimit"],
    "getProxyDispatcherConnectionLimit",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProxyDispatcherConnectionLimit"],
    "getProxyRetryDispatcher",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProxyRetryDispatcher"],
    "getRetryDispatcher",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRetryDispatcher"],
    "isRelayType",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isRelayType"],
    "isSocks5ProxyEnabled",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isSocks5ProxyEnabled"],
    "normalizeProxyUrl",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeProxyUrl"],
    "proxyConfigToUrl",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["proxyConfigToUrl"],
    "proxyUrlForLogs",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["proxyUrlForLogs"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyDispatcher.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyDispatcherCache.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0z1fkxo._.js.map