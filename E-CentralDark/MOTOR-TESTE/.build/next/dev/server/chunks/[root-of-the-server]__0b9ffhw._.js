module.exports = [
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[project]/src/lib/runtime/ports.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRuntimePorts",
    ()=>getRuntimePorts
]);
const DEFAULT_PORT = 20128;
function parsePort(value, fallback) {
    if (!value) return fallback;
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 65535) return fallback;
    return parsed;
}
function getRuntimePorts() {
    // OMNIROUTE_PORT preserves the user's canonical PORT in wrapped runtimes
    // where Next.js requires process.env.PORT to be the dashboard listener port.
    const basePort = parsePort(process.env.OMNIROUTE_PORT || process.env.PORT, DEFAULT_PORT);
    const apiPortExplicit = !!process.env.API_PORT;
    const dashboardPortExplicit = !!process.env.DASHBOARD_PORT;
    return {
        port: basePort,
        apiPort: parsePort(process.env.API_PORT, basePort),
        dashboardPort: parsePort(process.env.DASHBOARD_PORT, basePort),
        apiPortExplicit,
        dashboardPortExplicit
    };
}
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
"[project]/src/lib/apiBridgeServer.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initApiBridgeServer",
    ()=>initApiBridgeServer
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$http__$5b$external$5d$__$28$http$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/http [external] (http, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/net [external] (net, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$runtime$2f$ports$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/runtime/ports.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/runtimeTimeouts.ts [instrumentation] (ecmascript)");
;
;
;
;
const API_BRIDGE_TIMEOUTS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getApiBridgeTimeoutConfig"])(process.env, (message)=>{
    console.warn(`[API Bridge] ${message}`);
});
const OPENAI_COMPAT_PATHS = [
    /^\/v1(?:\/|$)/,
    /^\/chat\/completions(?:\?|$)/,
    /^\/responses(?:\?|$)/,
    /^\/models(?:\?|$)/,
    /^\/codex(?:\/|\?|$)/,
    /^\/api\/oauth(?:\/|$)/,
    /^\/callback(?:\?|$)/
];
function isOpenAiCompatiblePath(pathname) {
    return OPENAI_COMPAT_PATHS.some((pattern)=>pattern.test(pathname));
}
function requestWantsStreaming(req) {
    const accept = String(req.headers.accept || "").toLowerCase();
    if (accept.includes("text/event-stream")) return true;
    const pathname = (req.url || "/").split("?")[0] || "/";
    return /^\/(?:v1\/)?(?:responses|chat\/completions)(?:\/|$)/.test(pathname);
}
function getProxyTimeoutMs(req) {
    if (!requestWantsStreaming(req)) return API_BRIDGE_TIMEOUTS.proxyTimeoutMs;
    return Math.max(API_BRIDGE_TIMEOUTS.proxyTimeoutMs, API_BRIDGE_TIMEOUTS.serverRequestTimeoutMs);
}
function proxyRequest(req, res, dashboardPort) {
    const proxyTimeoutMs = getProxyTimeoutMs(req);
    const targetReq = __TURBOPACK__imported__module__$5b$externals$5d2f$http__$5b$external$5d$__$28$http$2c$__cjs$29$__["default"].request({
        hostname: "127.0.0.1",
        port: dashboardPort,
        method: req.method,
        path: req.url,
        headers: {
            ...req.headers,
            host: `127.0.0.1:${dashboardPort}`
        },
        timeout: proxyTimeoutMs
    }, (targetRes)=>{
        const contentType = String(targetRes.headers["content-type"] || "").toLowerCase();
        if (contentType.includes("text/event-stream")) {
            targetReq.setTimeout(0);
        }
        res.writeHead(targetRes.statusCode || 502, targetRes.headers);
        targetRes.pipe(res);
    });
    targetReq.on("timeout", ()=>{
        targetReq.destroy();
        if (res.headersSent) return;
        res.writeHead(504, {
            "content-type": "application/json"
        });
        res.end(JSON.stringify({
            error: "api_bridge_timeout",
            detail: `Proxy request timed out after ${proxyTimeoutMs}ms`
        }));
    });
    targetReq.on("error", (error)=>{
        if (res.headersSent) return;
        res.writeHead(502, {
            "content-type": "application/json"
        });
        res.end(JSON.stringify({
            error: "api_bridge_unavailable",
            detail: String(error.message || error)
        }));
    });
    req.on("aborted", ()=>{
        targetReq.destroy();
    });
    req.pipe(targetReq);
}
function writeUpgradeProxyError(socket, status, body) {
    if (!socket.writable || socket.destroyed) return;
    const buffer = Buffer.from(body, "utf8");
    const response = [
        `HTTP/1.1 ${status} ${__TURBOPACK__imported__module__$5b$externals$5d2f$http__$5b$external$5d$__$28$http$2c$__cjs$29$__["default"].STATUS_CODES[status] || "Error"}`,
        "Connection: close",
        "Content-Type: application/json; charset=utf-8",
        `Content-Length: ${buffer.length}`,
        "",
        ""
    ].join("\r\n");
    socket.write(response);
    socket.end(buffer);
}
function proxyUpgrade(req, socket, head, dashboardPort) {
    const upstream = __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__["default"].connect(dashboardPort, "127.0.0.1");
    upstream.on("connect", ()=>{
        const requestLine = `${req.method || "GET"} ${req.url || "/"} HTTP/${req.httpVersion || "1.1"}`;
        const headerLines = [
            requestLine
        ];
        let wroteHost = false;
        for(let index = 0; index < req.rawHeaders.length; index += 2){
            const name = req.rawHeaders[index];
            const rawValue = req.rawHeaders[index + 1] || "";
            if (name.toLowerCase() === "host") {
                headerLines.push(`Host: 127.0.0.1:${dashboardPort}`);
                wroteHost = true;
            } else {
                headerLines.push(`${name}: ${rawValue}`);
            }
        }
        if (!wroteHost) {
            headerLines.push(`Host: 127.0.0.1:${dashboardPort}`);
        }
        upstream.write(`${headerLines.join("\r\n")}\r\n\r\n`);
        if (head.length > 0) {
            upstream.write(head);
        }
        socket.pipe(upstream);
        upstream.pipe(socket);
    });
    upstream.on("error", (error)=>{
        writeUpgradeProxyError(socket, 502, JSON.stringify({
            error: "api_bridge_upgrade_failed",
            detail: String(error.message || error)
        }));
    });
    socket.on("error", ()=>{
        upstream.destroy();
    });
    socket.on("close", ()=>{
        upstream.destroy();
    });
}
function initApiBridgeServer() {
    if (globalThis.__omnirouteApiBridgeStarted) return;
    const { apiPort, dashboardPort } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$runtime$2f$ports$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRuntimePorts"])();
    if (apiPort === dashboardPort) return;
    const host = process.env.API_HOST || "127.0.0.1";
    const server = __TURBOPACK__imported__module__$5b$externals$5d2f$http__$5b$external$5d$__$28$http$2c$__cjs$29$__["default"].createServer((req, res)=>{
        const rawUrl = req.url || "/";
        const pathname = rawUrl.split("?")[0] || "/";
        if (!isOpenAiCompatiblePath(pathname)) {
            res.writeHead(404, {
                "content-type": "application/json"
            });
            res.end(JSON.stringify({
                error: "not_found",
                message: "API port only serves OpenAI-compatible routes."
            }));
            return;
        }
        proxyRequest(req, res, dashboardPort);
    });
    server.requestTimeout = API_BRIDGE_TIMEOUTS.serverRequestTimeoutMs;
    server.headersTimeout = API_BRIDGE_TIMEOUTS.serverHeadersTimeoutMs;
    server.keepAliveTimeout = API_BRIDGE_TIMEOUTS.serverKeepAliveTimeoutMs;
    server.setTimeout(API_BRIDGE_TIMEOUTS.serverSocketTimeoutMs);
    server.on("upgrade", (req, socket, head)=>{
        const rawUrl = req.url || "/";
        const pathname = rawUrl.split("?")[0] || "/";
        if (!isOpenAiCompatiblePath(pathname)) {
            writeUpgradeProxyError(socket, 404, JSON.stringify({
                error: "not_found",
                message: "API port only serves OpenAI-compatible routes."
            }));
            return;
        }
        proxyUpgrade(req, socket, head, dashboardPort);
    });
    server.on("error", (error)=>{
        if (error?.code === "EADDRINUSE") {
            console.warn(`[API Bridge] Port ${apiPort} is already in use. API bridge disabled. (dashboard: ${dashboardPort})`);
            return;
        }
        console.warn("[API Bridge] Failed to start:", error?.message || error);
    });
    server.listen(apiPort, host, ()=>{
        globalThis.__omnirouteApiBridgeStarted = true;
        console.log(`[API Bridge] Listening on ${host}:${apiPort} -> dashboard:${dashboardPort}`);
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0b9ffhw._.js.map