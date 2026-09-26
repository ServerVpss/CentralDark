module.exports = [
"[project]/src/server/cors/origins.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "STATIC_CORS_HEADERS",
    ()=>STATIC_CORS_HEADERS,
    "applyCorsHeaders",
    ()=>applyCorsHeaders,
    "getCorsStatus",
    ()=>getCorsStatus,
    "getRuntimeAllowedOrigins",
    ()=>getRuntimeAllowedOrigins,
    "resolveAllowedOrigin",
    ()=>resolveAllowedOrigin,
    "setRuntimeAllowedOrigins",
    ()=>setRuntimeAllowedOrigins
]);
/**
 * Centralized CORS origin allowlist.
 *
 * Source of truth for which browser origins may call OmniRoute over CORS.
 * No wildcard default. To allow any origin, opt in via `CORS_ALLOW_ALL=true`.
 *
 * Resolution order:
 *   1. If `CORS_ALLOW_ALL=true` → echo any origin back (effectively `*`,
 *      but with `Vary: Origin` so caches stay correct).
 *   2. Otherwise, the request's `Origin` is matched (case-insensitive,
 *      trailing slash ignored) against the allowlist.
 *   3. Allowlist sources (merged): env `CORS_ALLOWED_ORIGINS` (csv) and
 *      anything injected at runtime via `setRuntimeAllowedOrigins()` from
 *      the persisted settings layer.
 *
 * The middleware applies the resolved value via `applyCorsHeaders()`.
 * Per-route handlers no longer set `Access-Control-Allow-Origin` themselves.
 */ const ENV_ALLOW_ALL = "CORS_ALLOW_ALL";
const ENV_ALLOWED = "CORS_ALLOWED_ORIGINS";
const LEGACY_ENV_SINGLE = "CORS_ORIGIN";
const STANDARD_ALLOW_HEADERS = "Content-Type, Authorization, x-api-key, anthropic-version, x-omniroute-connection, x-internal-test, accept";
const STANDARD_ALLOW_METHODS = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
let runtimeAllowedOrigins = new Set();
function setRuntimeAllowedOrigins(csv) {
    runtimeAllowedOrigins = parseOriginList(csv);
}
function getRuntimeAllowedOrigins() {
    return runtimeAllowedOrigins;
}
function parseOriginList(value) {
    const result = new Set();
    if (!value) return result;
    for (const raw of value.split(",")){
        const v = raw.trim();
        if (!v) continue;
        result.add(normalizeOrigin(v));
    }
    return result;
}
function normalizeOrigin(origin) {
    let normalized = origin.toLowerCase();
    while(normalized.endsWith("/")){
        normalized = normalized.slice(0, -1);
    }
    return normalized;
}
function envAllowAll() {
    const raw = process.env[ENV_ALLOW_ALL];
    if (!raw) {
        // Backward-compat: legacy `CORS_ORIGIN=*` behaves like allow-all.
        return process.env[LEGACY_ENV_SINGLE]?.trim() === "*";
    }
    return raw.trim().toLowerCase() === "true" || raw.trim() === "1";
}
function envAllowedOrigins() {
    const fromList = parseOriginList(process.env[ENV_ALLOWED]);
    const legacy = process.env[LEGACY_ENV_SINGLE]?.trim();
    if (legacy && legacy !== "*") {
        fromList.add(normalizeOrigin(legacy));
    }
    return fromList;
}
function resolveAllowedOrigin(requestOrigin) {
    if (envAllowAll()) {
        // `*` is only safe when no credentials are involved; if a request did
        // arrive with an Origin header, echo it back with Vary so credentialed
        // flows can opt in via the explicit allowlist instead.
        return requestOrigin && requestOrigin.length > 0 ? requestOrigin : "*";
    }
    if (!requestOrigin) return null;
    const normalized = normalizeOrigin(requestOrigin);
    if (envAllowedOrigins().has(normalized)) return requestOrigin;
    if (runtimeAllowedOrigins.has(normalized)) return requestOrigin;
    return null;
}
function getCorsStatus() {
    const merged = new Set([
        ...envAllowedOrigins(),
        ...runtimeAllowedOrigins
    ]);
    return {
        allowAll: envAllowAll(),
        allowedOrigins: [
            ...merged
        ].sort()
    };
}
function applyCorsHeaders(response, request, relaxForTokenAuth = false) {
    const requestOrigin = request.headers.get("origin");
    let allowed = resolveAllowedOrigin(requestOrigin);
    if (allowed === null && relaxForTokenAuth) {
        allowed = requestOrigin && requestOrigin.length > 0 ? requestOrigin : "*";
    }
    if (allowed !== null) {
        response.headers.set("Access-Control-Allow-Origin", allowed);
        response.headers.append("Vary", "Origin");
    }
    // RFC 9110 §12.5.5 (issue #6737): the token-authenticated /v1*/v1beta* surface
    // (relaxForTokenAuth) negotiates content-encoding via Next's built-in
    // compression middleware, which only appends `Vary: Accept-Encoding`
    // conditionally (after its own content-type/threshold filter) — so shared
    // caches (CDNs/proxies) can't reliably tell compressed vs uncompressed variants
    // apart. Stamp it explicitly here, at the same chokepoint that already appends
    // `Vary: Origin`, on every relaxed-CORS response with a body.
    if (relaxForTokenAuth && response.status !== 204) {
        response.headers.append("Vary", "Accept-Encoding");
    }
    response.headers.set("Access-Control-Allow-Methods", STANDARD_ALLOW_METHODS);
    response.headers.set("Access-Control-Allow-Headers", STANDARD_ALLOW_HEADERS);
    const requestedHeaders = request.headers.get("access-control-request-headers");
    if (requestedHeaders) {
        response.headers.set("Access-Control-Allow-Headers", requestedHeaders);
    }
}
const STATIC_CORS_HEADERS = Object.freeze({
    "Access-Control-Allow-Methods": STANDARD_ALLOW_METHODS,
    "Access-Control-Allow-Headers": STANDARD_ALLOW_HEADERS
});
}),
"[project]/src/server/authz/routeGuard.ts [middleware] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "ALWAYS_PROTECTED_API_PATHS",
    ()=>ALWAYS_PROTECTED_API_PATHS,
    "LOCAL_ONLY_API_GET_EXEMPTIONS",
    ()=>LOCAL_ONLY_API_GET_EXEMPTIONS,
    "LOCAL_ONLY_API_PATTERNS",
    ()=>LOCAL_ONLY_API_PATTERNS,
    "LOCAL_ONLY_API_PREFIXES",
    ()=>LOCAL_ONLY_API_PREFIXES,
    "LOCAL_ONLY_MANAGE_SCOPE_BYPASS_PREFIXES",
    ()=>LOCAL_ONLY_MANAGE_SCOPE_BYPASS_PREFIXES,
    "classifyHostLocality",
    ()=>classifyHostLocality,
    "isAlwaysProtectedPath",
    ()=>isAlwaysProtectedPath,
    "isLocalOnlyBypassableByManageScope",
    ()=>isLocalOnlyBypassableByManageScope,
    "isLocalOnlyPath",
    ()=>isLocalOnlyPath,
    "isLoopbackHost",
    ()=>isLoopbackHost,
    "isPrivateLanHost",
    ()=>isPrivateLanHost
]);
/**
 * 3-tier route guard constants and helpers.
 *
 * Tier 1 — LOCAL_ONLY: accessible only from loopback. These routes spawn
 *   child processes; exposing them to non-local traffic is a known CVE class
 *   (GHSA-fhh6-4qxv-rpqj). Blocked unconditionally regardless of auth state.
 *
 *   Carve-out: paths matching the live manage-scope bypass list (DB-stored,
 *   read via `getAuthzBypassSnapshot()`) MAY also be accessed from
 *   non-loopback if and only if the request carries an API key with the
 *   `manage` scope (or an authenticated dashboard session — see
 *   `policies/management.ts`). The bypass is opt-in per prefix and can be
 *   killed globally via the `localOnlyManageScopeBypassEnabled` setting.
 *   Unauthenticated requests to bypassable paths are still rejected with
 *   403 LOCAL_ONLY.
 *
 * Tier 2 — ALWAYS_PROTECTED: auth is always required, even when
 *   requireLogin=false. Covers destructive / irreversible operations.
 *
 * Tier 3 — MANAGEMENT (default): auth required, but bypassed when
 *   requireLogin=false (existing behaviour).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2f$runtimeSettings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/config/runtimeSettings.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$spawnCapablePrefixes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/spawnCapablePrefixes.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/vncSession/manifest.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2f$runtimeSettings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2f$runtimeSettings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const LOOPBACK_HOSTS = new Set([
    "localhost",
    "127.0.0.1",
    "::1"
]);
const LOCAL_ONLY_API_PREFIXES = [
    "/api/mcp/",
    "/api/cli-tools/runtime/",
    "/api/cli-tools/omp-settings",
    "/api/cli-tools/letta-settings",
    "/api/cli-tools/grok-build-settings",
    "/api/cli-tools/forge-settings",
    "/api/cli-tools/jcode-settings",
    "/api/cli-tools/qwen-settings",
    "/api/services/",
    "/dashboard/providers/services/",
    "/api/copilot/",
    "/api/tools/agent-bridge/",
    "/api/tools/traffic-inspector/",
    "/api/issue-agent/",
    "/api/plugins/",
    "/api/plugins",
    "/api/middleware/",
    "/api/system/version",
    "/api/db-backups/exportAll",
    "/api/local/",
    "/api/headroom/start",
    "/api/headroom/stop",
    "/api/oauth/cursor/auto-import",
    "/api/skills/collect/",
    "/api/discovery/",
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_ROUTE_PREFIX"],
    "/api/acp/agents"
];
const LOCAL_ONLY_API_PATTERNS = [
    /^\/api\/providers\/[^/]+\/login\/?$/
];
;
const LOCAL_ONLY_MANAGE_SCOPE_BYPASS_PREFIXES = [
    "/api/mcp/"
];
const ALWAYS_PROTECTED_API_PATHS = [
    "/api/shutdown",
    "/api/providers/health-autopilot/actions",
    "/api/settings/database"
];
function isLoopbackHost(hostHeader) {
    if (!hostHeader) return false;
    let host = hostHeader.trim();
    if (host.startsWith("[")) {
        // IPv6 literal: [::1] or [::1]:port
        const bracketEnd = host.indexOf("]");
        host = bracketEnd >= 0 ? host.slice(1, bracketEnd) : host.slice(1);
    } else if ((host.match(/:/g) || []).length === 1) {
        // IPv4 / hostname with a single :port — strip it. A bare IPv6 address
        // ("::1", "::ffff:127.0.0.1") has multiple colons and must stay intact
        // (splitting on ":" would mangle it to "" and miss the loopback match).
        host = host.split(":")[0];
    }
    host = host.replace(/^::ffff:/i, "");
    return LOOPBACK_HOSTS.has(host.toLowerCase());
}
function classifyHostLocality(ip) {
    if (!ip) return "remote";
    if (isLoopbackHost(ip)) return "loopback";
    if (isPrivateLanHost(ip)) return "lan";
    return "remote";
}
/**
 * Private-LAN ranges (RFC 1918 IPv4 + IPv6 ULA/link-local). Matched against the
 * real socket peer address (NOT the spoofable Host header), so a public-internet
 * client — which presents a public source IP — never matches.
 */ const PRIVATE_LAN_PATTERNS = [
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
    /^100\.(6[4-9]|[78]\d|9\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}$/,
    /^192\.168\.\d{1,3}\.\d{1,3}$/,
    /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
    /^f[cd][0-9a-f]{2}:/i,
    /^fe80:/i
];
function isPrivateLanHost(hostHeader) {
    if (!hostHeader) return false;
    let host = hostHeader.trim();
    if (host.startsWith("[")) {
        const bracketEnd = host.indexOf("]");
        host = bracketEnd >= 0 ? host.slice(1, bracketEnd) : host.slice(1);
    }
    host = host.replace(/^::ffff:/i, "");
    // Strip :port only for IPv4 / hostname (a lone colon); leave IPv6 intact.
    if ((host.match(/:/g) || []).length === 1) host = host.split(":")[0];
    host = host.toLowerCase();
    return PRIVATE_LAN_PATTERNS.some((re)=>re.test(host));
}
const LOCAL_ONLY_API_GET_EXEMPTIONS = new Set([
    "/api/system/version"
]);
/** Safe HTTP methods that can be exempted for read-only paths. */ const SAFE_METHODS = new Set([
    "GET",
    "HEAD",
    "OPTIONS"
]);
function isLocalOnlyPath(path, method) {
    // Method-aware GET exemption: only exact-match paths in the exemption set
    // are eligible; prefix/wildcard matching is intentionally NOT used to avoid
    // accidentally opening sub-paths of a spawn-capable route.
    if (method && SAFE_METHODS.has(method.toUpperCase()) && LOCAL_ONLY_API_GET_EXEMPTIONS.has(path)) {
        return false;
    }
    return LOCAL_ONLY_API_PREFIXES.some((p)=>path === p || path.startsWith(p)) || LOCAL_ONLY_API_PATTERNS.some((re)=>re.test(path));
}
function isLocalOnlyBypassableByManageScope(path) {
    const snapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2f$runtimeSettings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getAuthzBypassSnapshot"])();
    if (!snapshot.enabled) return false;
    return snapshot.prefixes.some((p)=>{
        // Defence-in-depth: reject a bypass prefix that is the same as, child of,
        // OR PARENT of any spawn-capable prefix. The parent case catches e.g.
        // `/api/cli-tools/` (parent of `/api/cli-tools/runtime/`) — a request to
        // `/api/cli-tools/runtime/foo` would otherwise satisfy `path.startsWith(p)`
        // and reach the spawn-capable surface without a loopback check.
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$spawnCapablePrefixes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SPAWN_CAPABLE_PREFIXES"].some((spawn)=>p === spawn || p.startsWith(spawn) || spawn.startsWith(p))) {
            return false;
        }
        return path === p || path.startsWith(p);
    });
}
function isAlwaysProtectedPath(path) {
    return ALWAYS_PROTECTED_API_PATHS.some((p)=>path === p || path.startsWith(p));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/server/authz/headers.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Header constants used by the authz pipeline.
 *
 * Middleware adds these headers to the upstream request after a successful
 * auth decision. Route handlers and downstream services read them through
 * the assertAuth() helper instead of re-running auth logic.
 *
 * All header names are lowercase to match Next.js / fetch semantics.
 *
 * IMPORTANT: these headers are stripped from incoming client requests
 * before classification (see pipeline.ts) so a remote caller cannot
 * pre-populate them and impersonate a privileged subject.
 */ __turbopack_context__.s([
    "AUTHZ_HEADER_AUTH_ID",
    ()=>AUTHZ_HEADER_AUTH_ID,
    "AUTHZ_HEADER_AUTH_KIND",
    ()=>AUTHZ_HEADER_AUTH_KIND,
    "AUTHZ_HEADER_AUTH_LABEL",
    ()=>AUTHZ_HEADER_AUTH_LABEL,
    "AUTHZ_HEADER_AUTH_SCOPES",
    ()=>AUTHZ_HEADER_AUTH_SCOPES,
    "AUTHZ_HEADER_PEER_LOCALITY",
    ()=>AUTHZ_HEADER_PEER_LOCALITY,
    "AUTHZ_HEADER_REQUEST_ID",
    ()=>AUTHZ_HEADER_REQUEST_ID,
    "AUTHZ_HEADER_ROUTE_CLASS",
    ()=>AUTHZ_HEADER_ROUTE_CLASS,
    "AUTHZ_TRUSTED_HEADERS",
    ()=>AUTHZ_TRUSTED_HEADERS,
    "CLI_TOKEN_HEADER",
    ()=>CLI_TOKEN_HEADER,
    "PEER_IP_HEADER",
    ()=>PEER_IP_HEADER,
    "VIA_PROXY_HEADER",
    ()=>VIA_PROXY_HEADER
]);
const AUTHZ_HEADER_REQUEST_ID = "x-request-id";
const AUTHZ_HEADER_ROUTE_CLASS = "x-omniroute-route-class";
const AUTHZ_HEADER_AUTH_KIND = "x-omniroute-auth-kind";
const AUTHZ_HEADER_AUTH_ID = "x-omniroute-auth-id";
const AUTHZ_HEADER_AUTH_LABEL = "x-omniroute-auth-label";
const AUTHZ_HEADER_AUTH_SCOPES = "x-omniroute-auth-scopes";
const CLI_TOKEN_HEADER = "[REDIGIDO-PRESERVACAO]";
const PEER_IP_HEADER = "x-omniroute-peer-ip";
const VIA_PROXY_HEADER = "x-omniroute-via-proxy";
const AUTHZ_HEADER_PEER_LOCALITY = "x-omniroute-peer-locality";
const AUTHZ_TRUSTED_HEADERS = [
    AUTHZ_HEADER_ROUTE_CLASS,
    AUTHZ_HEADER_AUTH_KIND,
    AUTHZ_HEADER_AUTH_ID,
    AUTHZ_HEADER_AUTH_LABEL,
    AUTHZ_HEADER_AUTH_SCOPES,
    AUTHZ_HEADER_PEER_LOCALITY
];
}),
"[project]/src/server/authz/peerStamp.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "classifyStampedPeerLocality",
    ()=>classifyStampedPeerLocality,
    "resolveStampedPeer",
    ()=>resolveStampedPeer,
    "resolveStampedViaProxy",
    ()=>resolveStampedViaProxy
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/server/authz/routeGuard.ts [middleware] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function resolveStampedPeer(headerValue, token) {
    if (!headerValue || !token) return null;
    const sep = headerValue.indexOf("|");
    if (sep <= 0) return null;
    const provided = headerValue.slice(0, sep);
    const ip = headerValue.slice(sep + 1);
    if (!ip) return null;
    if (provided.length !== token.length) return null;
    try {
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(Buffer.from(provided), Buffer.from(token))) return null;
    } catch  {
        return null;
    }
    return ip;
}
function resolveStampedViaProxy(headerValue, token) {
    if (!headerValue || !token) return false;
    const sep = headerValue.indexOf("|");
    if (sep <= 0) return false;
    const provided = headerValue.slice(0, sep);
    const payload = headerValue.slice(sep + 1);
    if (provided.length !== token.length) return false;
    try {
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(Buffer.from(provided), Buffer.from(token))) return false;
    } catch  {
        return false;
    }
    return payload === "1";
}
function classifyStampedPeerLocality(peerHeader, viaProxyHeader, token) {
    const ip = resolveStampedPeer(peerHeader, token);
    const viaProxy = resolveStampedViaProxy(viaProxyHeader, token);
    const locality = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["classifyHostLocality"])(ip);
    if (viaProxy && locality !== "remote") return "remote";
    return locality;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/server/origin/publicOrigin.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "firstHeaderValue",
    ()=>firstHeaderValue,
    "getPublicOriginCandidates",
    ()=>getPublicOriginCandidates,
    "normalizeOrigin",
    ()=>normalizeOrigin,
    "resolvePublicOrigin",
    ()=>resolvePublicOrigin,
    "trustsForwardedHeaders",
    ()=>trustsForwardedHeaders,
    "validateBrowserMutationOrigin",
    ()=>validateBrowserMutationOrigin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/server/authz/routeGuard.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/peerStamp.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const PUBLIC_BASE_URL_ENV = [
    "OMNIROUTE_PUBLIC_BASE_URL",
    "NEXT_PUBLIC_BASE_URL",
    "NEXT_PUBLIC_APP_URL"
];
function uniqueCandidates(candidates) {
    const seen = new Set();
    const result = [];
    for (const candidate of candidates){
        const normalized = normalizeOrigin(candidate.origin);
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        result.push({
            ...candidate,
            origin: normalized
        });
    }
    return result;
}
function firstHeaderValue(value) {
    return value?.split(",")[0]?.trim() || null;
}
function normalizeOrigin(origin) {
    const parsed = new URL(origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Unsupported origin protocol");
    }
    return parsed.origin.toLowerCase();
}
function configuredPublicOrigins() {
    const candidates = [];
    for (const name of PUBLIC_BASE_URL_ENV){
        const value = process.env[name]?.trim();
        if (!value) continue;
        try {
            candidates.push({
                origin: normalizeOrigin(value),
                source: "configured"
            });
        } catch  {
            continue;
        }
    }
    return candidates;
}
function forwardedHeaderPart(value) {
    if (!value) return null;
    let result = value.trim();
    if (!result) return null;
    if (result.startsWith('"') && result.endsWith('"') && result.length >= 2) {
        result = result.slice(1, -1);
    }
    return result || null;
}
function parseForwardedHeader(value) {
    const first = firstHeaderValue(value);
    if (!first) return {
        proto: null,
        host: null
    };
    let proto = null;
    let host = null;
    for (const segment of first.split(";")){
        const [rawKey, ...rawValue] = segment.split("=");
        const key = rawKey?.trim().toLowerCase();
        const part = forwardedHeaderPart(rawValue.join("="));
        if (!key || !part) continue;
        if (key === "proto") proto = part;
        if (key === "host") host = part;
    }
    return {
        proto,
        host
    };
}
function sanitizeForwardedProto(proto) {
    const normalized = proto?.trim().toLowerCase();
    if (normalized === "http" || normalized === "https") return normalized;
    return null;
}
function sanitizeForwardedHost(host) {
    const trimmed = host?.trim();
    if (!trimmed) return null;
    if (/[/\\\s\x00-\x1f\x7f]/.test(trimmed)) return null;
    try {
        const parsed = new URL(`http://${trimmed}`);
        if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
            return null;
        }
        return parsed.host.toLowerCase();
    } catch  {
        return null;
    }
}
function trustProxyMode() {
    const raw = process.env.OMNIROUTE_TRUST_PROXY?.trim().toLowerCase();
    if (!raw || [
        "0",
        "false",
        "none",
        "off",
        "no",
        "disable",
        "disabled"
    ].includes(raw)) {
        return "none";
    }
    if ([
        "true",
        "1",
        "loopback"
    ].includes(raw)) return "loopback";
    if (raw === "private" || raw === "lan") return "private";
    return "none";
}
function trustsForwardedHeaders(request) {
    const mode = trustProxyMode();
    if (mode === "none") return false;
    const peer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveStampedPeer"])(request.headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PEER_IP_HEADER"]), process.env.OMNIROUTE_PEER_STAMP_TOKEN);
    const locality = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["classifyHostLocality"])(peer);
    if (mode === "loopback") return locality === "loopback";
    return locality === "loopback" || locality === "lan";
}
function trustedForwardedOrigin(request) {
    if (!trustsForwardedHeaders(request)) return null;
    const forwarded = parseForwardedHeader(request.headers.get("forwarded"));
    const proto = sanitizeForwardedProto(forwarded.proto ?? firstHeaderValue(request.headers.get("x-forwarded-proto")));
    const host = sanitizeForwardedHost(forwarded.host ?? firstHeaderValue(request.headers.get("x-forwarded-host")));
    if (!proto || !host) return null;
    try {
        return normalizeOrigin(`${proto}://${host}`);
    } catch  {
        return null;
    }
}
function requestUrlOrigin(request) {
    try {
        return normalizeOrigin(new URL(request.url).origin);
    } catch  {
        return null;
    }
}
function requestUrlProtocol(request) {
    try {
        return new URL(request.url).protocol === "https:" ? "https" : "http";
    } catch  {
        return "http";
    }
}
/**
 * Direct (no-proxy) LAN/loopback access (#5340). When the dashboard is reached
 * over a private-network host — e.g. `http://192.168.0.15:20128` instead of the
 * configured `localhost` base URL — Next.js standalone reports the internal bind
 * host in `request.url`, so the browser's same-origin `Origin` matches no
 * candidate and every mutation is rejected with INVALID_ORIGIN.
 *
 * This accepts the request `Host` (or a trusted `X-Forwarded-Host`) as a valid
 * mutation origin, gated by TWO independent checks so it cannot be abused:
 *   1. The token-stamped socket peer must be loopback or private-LAN (a public
 *      client never matches — it presents a public source IP).
 *   2. The Host itself must be a loopback/private-LAN IP literal. A DNS-rebinding
 *      attacker carries a *domain* in the Host (classifies as "remote"), so a
 *      rebind to a loopback/LAN socket cannot turn an attacker domain into a
 *      trusted origin. Direct IP access over the LAN/loopback still works.
 * The protocol is pinned to the actual connection (or a trusted forwarded proto),
 * never derived from the attacker-controllable Origin.
 */ function directLocalHostOrigin(request) {
    const peer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveStampedPeer"])(request.headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PEER_IP_HEADER"]), process.env.OMNIROUTE_PEER_STAMP_TOKEN);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["classifyHostLocality"])(peer) === "remote") return null;
    const rawHost = trustsForwardedHeaders(request) ? firstHeaderValue(request.headers.get("x-forwarded-host")) ?? request.headers.get("host") : request.headers.get("host");
    const host = sanitizeForwardedHost(rawHost);
    if (!host) return null;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["classifyHostLocality"])(host) === "remote") return null;
    const proto = sanitizeForwardedProto(firstHeaderValue(request.headers.get("x-forwarded-proto"))) ?? requestUrlProtocol(request);
    try {
        return normalizeOrigin(`${proto}://${host}`);
    } catch  {
        return null;
    }
}
function getPublicOriginCandidates(request) {
    const candidates = [];
    const requestOrigin = requestUrlOrigin(request);
    if (requestOrigin) candidates.push({
        origin: requestOrigin,
        source: "request-url"
    });
    const configured = configuredPublicOrigins();
    candidates.push(...configured);
    if (configured.length === 0) {
        const forwarded = trustedForwardedOrigin(request);
        if (forwarded) candidates.push({
            origin: forwarded,
            source: "trusted-forwarded"
        });
    }
    const directLocal = directLocalHostOrigin(request);
    if (directLocal) candidates.push({
        origin: directLocal,
        source: "direct-local-host"
    });
    return uniqueCandidates(candidates);
}
function resolvePublicOrigin(request) {
    const configured = uniqueCandidates(configuredPublicOrigins());
    if (configured.length > 0) return configured[0];
    const forwarded = trustedForwardedOrigin(request);
    if (forwarded) return {
        origin: forwarded,
        source: "trusted-forwarded"
    };
    const requestOrigin = requestUrlOrigin(request);
    if (requestOrigin) return {
        origin: requestOrigin,
        source: "request-url"
    };
    return {
        origin: "http://localhost:20128",
        source: "request-url"
    };
}
function validateBrowserMutationOrigin(request) {
    const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
    if (fetchSite && ![
        "same-origin",
        "same-site",
        "none"
    ].includes(fetchSite)) {
        return {
            ok: false,
            reason: "cross-site-fetch-metadata"
        };
    }
    const origin = request.headers.get("origin");
    if (!origin) return {
        ok: true
    };
    let normalizedOrigin;
    try {
        normalizedOrigin = normalizeOrigin(origin);
    } catch  {
        return {
            ok: false,
            reason: "invalid-origin"
        };
    }
    const allowed = new Set(getPublicOriginCandidates(request).map((candidate)=>candidate.origin));
    return allowed.has(normalizedOrigin) ? {
        ok: true
    } : {
        ok: false,
        reason: "invalid-origin"
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/server/authz/classify.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "classifyRoute",
    ()=>classifyRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$publicApiRoutes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/publicApiRoutes.ts [middleware] (ecmascript)");
;
const CLIENT_API_ALIAS_PREFIXES = [
    {
        alias: "/chat/completions",
        canonical: "/api/v1/chat/completions"
    },
    {
        alias: "/responses",
        canonical: "/api/v1/responses"
    },
    {
        alias: "/models",
        canonical: "/api/v1/models"
    }
];
function normalizePathname(rawPath) {
    let path = rawPath || "/";
    if (!path.startsWith("/")) path = "/" + path;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    if (path === "/codex" || path.startsWith("/codex/")) {
        return {
            path: "/api/v1/responses",
            reason: "client_api_codex_alias"
        };
    }
    if (path === "/v1/v1" || path.startsWith("/v1/v1/")) {
        const tail = path.slice("/v1/v1".length) || "";
        return {
            path: "/api/v1" + tail,
            reason: "client_api_double_prefix"
        };
    }
    if (path === "/v1beta" || path.startsWith("/v1beta/")) {
        const tail = path.slice("/v1beta".length) || "";
        return {
            path: "/api/v1beta" + tail,
            reason: "client_api_alias"
        };
    }
    if (path === "/v1" || path.startsWith("/v1/")) {
        const tail = path.slice("/v1".length) || "";
        return {
            path: "/api/v1" + tail,
            reason: "client_api_alias"
        };
    }
    for (const { alias, canonical } of CLIENT_API_ALIAS_PREFIXES){
        if (path === alias) {
            return {
                path: canonical,
                reason: "client_api_alias"
            };
        }
        if (path.startsWith(alias + "/")) {
            return {
                path: canonical + path.slice(alias.length),
                reason: "client_api_alias"
            };
        }
    }
    return {
        path
    };
}
function classifyRoute(rawPath, method = "GET") {
    const { path: normalizedPath, reason: aliasReason } = normalizePathname(rawPath);
    if (normalizedPath === "/" || normalizedPath === "") {
        return {
            routeClass: "MANAGEMENT",
            reason: "root_redirect",
            normalizedPath: "/"
        };
    }
    if (normalizedPath === "/dashboard/onboarding") {
        return {
            routeClass: "PUBLIC",
            reason: "setup_wizard",
            normalizedPath
        };
    }
    // Public, ticket-gated device-flow connect pages (e.g. /connect/codex/{token}).
    // Anyone with the shared link completes the provider login in their own browser.
    if (normalizedPath === "/connect" || normalizedPath.startsWith("/connect/")) {
        return {
            routeClass: "PUBLIC",
            reason: "public_connect_page",
            normalizedPath
        };
    }
    if (normalizedPath.startsWith("/dashboard")) {
        return {
            routeClass: "MANAGEMENT",
            reason: "dashboard_prefix",
            normalizedPath
        };
    }
    if (normalizedPath === "/api/v1" || normalizedPath.startsWith("/api/v1/")) {
        return {
            routeClass: "CLIENT_API",
            reason: aliasReason ?? "client_api_v1",
            normalizedPath
        };
    }
    if (normalizedPath === "/api/v1beta" || normalizedPath.startsWith("/api/v1beta/")) {
        return {
            routeClass: "CLIENT_API",
            reason: aliasReason ?? "client_api_v1",
            normalizedPath
        };
    }
    if (normalizedPath.startsWith("/api/")) {
        if (isClassifiedAsPublic(normalizedPath, method)) {
            return {
                routeClass: "PUBLIC",
                reason: matchesReadonlyPublic(normalizedPath, method) ? "public_readonly_prefix" : "public_prefix",
                normalizedPath
            };
        }
        return {
            routeClass: "MANAGEMENT",
            reason: "management_api",
            normalizedPath
        };
    }
    return {
        routeClass: "MANAGEMENT",
        reason: "fallback_management",
        normalizedPath
    };
}
function matchesReadonlyPublic(path, method) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$publicApiRoutes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PUBLIC_READONLY_METHODS"].has(String(method).toUpperCase())) return false;
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$publicApiRoutes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PUBLIC_READONLY_API_ROUTE_PREFIXES"].some((p)=>path.startsWith(p));
}
function isClassifiedAsPublic(path, method) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$publicApiRoutes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isPublicApiRoute"])(path, method);
}
}),
"[project]/src/server/authz/csrf.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "issueDashboardCsrfToken",
    ()=>issueDashboardCsrfToken,
    "validateDashboardCsrfToken",
    ()=>validateDashboardCsrfToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$dashboardCsrf$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/dashboardCsrf.ts [middleware] (ecmascript)");
;
;
const TOKEN_VERSION = "v1";
const TOKEN_TTL_SECONDS = 10 * 60;
const TOKEN_CONTEXT = "[REDIGIDO-PRESERVACAO]";
function getJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();
    return secret ? Buffer.from(secret, "utf8") : null;
}
function getCookieValue(request, name) {
    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie");
    if (!cookieHeader) return null;
    for (const segment of cookieHeader.split(";")){
        const [rawKey, ...rawValue] = segment.split("=");
        if (!rawKey || rawValue.length === 0) continue;
        if (rawKey.trim() === name) return rawValue.join("=").trim() || null;
    }
    return null;
}
function sessionHash(authToken) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(authToken).digest("base64url");
}
function csrfMac(secret, expiresAtSeconds, authToken) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])("sha256", secret).update(TOKEN_CONTEXT).update("\n").update(String(expiresAtSeconds)).update("\n").update(sessionHash(authToken)).digest();
}
function issueDashboardCsrfToken(request, nowMs = Date.now()) {
    const secret = getJwtSecret();
    const authToken = getCookieValue(request, "auth_token");
    if (!secret || !authToken) return null;
    const expiresAtSeconds = Math.floor(nowMs / 1000) + TOKEN_TTL_SECONDS;
    const mac = csrfMac(secret, expiresAtSeconds, authToken).toString("base64url");
    return {
        token: `${TOKEN_VERSION}.${expiresAtSeconds}.${mac}`,
        expiresAt: new Date(expiresAtSeconds * 1000).toISOString()
    };
}
function validateDashboardCsrfToken(request, nowMs = Date.now()) {
    const secret = getJwtSecret();
    const authToken = getCookieValue(request, "auth_token");
    const rawToken = request.headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$dashboardCsrf$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["DASHBOARD_CSRF_HEADER"]);
    if (!secret || !authToken || !rawToken) return false;
    const [version, rawExpiresAt, rawMac, ...extra] = rawToken.split(".");
    if (extra.length > 0 || version !== TOKEN_VERSION || !rawExpiresAt || !rawMac) return false;
    const expiresAtSeconds = Number(rawExpiresAt);
    const nowSeconds = Math.floor(nowMs / 1000);
    if (!Number.isSafeInteger(expiresAtSeconds) || expiresAtSeconds < nowSeconds) return false;
    let providedMac;
    try {
        providedMac = Buffer.from(rawMac, "base64url");
    } catch  {
        return false;
    }
    const expectedMac = csrfMac(secret, expiresAtSeconds, authToken);
    return providedMac.length === expectedMac.length && (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(providedMac, expectedMac);
}
}),
"[project]/src/server/authz/context.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "allow",
    ()=>allow,
    "reject",
    ()=>reject
]);
function allow(subject) {
    return {
        allow: true,
        subject
    };
}
function reject(status, code, message) {
    return {
        allow: false,
        status,
        code,
        message
    };
}
}),
"[project]/src/server/authz/policies/clientApi.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "clientApiPolicy",
    ()=>clientApiPolicy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/apiAuth.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$googApiKeyAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/googApiKeyAuth.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/context.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const HANDSHAKE_METHODS = new Set([
    "GET",
    "HEAD",
    "OPTIONS"
]);
function isWsHandshake(ctx) {
    if (ctx.classification.normalizedPath !== "/api/v1/ws") return false;
    if (!HANDSHAKE_METHODS.has(ctx.request.method.toUpperCase())) return false;
    try {
        return new URL(ctx.request.url, "http://localhost").searchParams.get("handshake") === "1";
    } catch  {
        return false;
    }
}
function extractBearer(request) {
    const raw = request.headers.get("authorization") ?? request.headers.get("Authorization");
    const xApiKey = request.headers.get("x-api-key") ?? request.headers.get("X-Api-Key");
    const xGoogApiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$googApiKeyAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractGoogApiKeyHeader"])(request.headers);
    if (raw) {
        const trimmed = raw.trim();
        if (trimmed.toLowerCase().startsWith("bearer ")) {
            const token = trimmed.slice(7).trim();
            if (token) return token;
        }
    // A non-"Bearer <token>" Authorization header (an empty "Bearer ", or a
    // client's own non-OmniRoute token — VS Code Copilot sends one even when the
    // OmniRoute key lives in the URL path of a /vscode tokenized endpoint) must
    // NOT short-circuit auth. Fall through to x-api-key and the path-scoped URL
    // token below instead of rejecting the request with "Authentication required".
    }
    if (xApiKey) {
        return xApiKey.trim() || null;
    }
    // Issue #7034: gemini-cli (and any @google/genai-based client) sends its
    // key via x-goog-api-key exclusively — accept it unconditionally, same
    // shape as the x-api-key fallback above.
    if (xGoogApiKey) {
        return xGoogApiKey;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])(request);
}
function maskKeyId(apiKey) {
    const tail = apiKey.slice(-4);
    return `key_${tail}`;
}
const clientApiPolicy = {
    routeClass: "CLIENT_API",
    async evaluate (ctx) {
        const bearer = extractBearer(ctx.request);
        if (!bearer) {
            // The WS descriptor handshake is a metadata read; the route handler
            // performs the actual wsAuth/dashboard/API-key decision and returns the
            // protocol details the browser needs before opening the socket.
            if (isWsHandshake(ctx)) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                    kind: "anonymous",
                    id: "ws-handshake"
                });
            }
            if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isDashboardSessionAuthenticated"])(ctx.request)) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                    kind: "dashboard_session",
                    id: "dashboard"
                });
            }
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isRequireApiKeyEnabled"])()) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                    kind: "anonymous",
                    id: "local"
                });
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["reject"])(401, "AUTH_002", "Authentication required");
        }
        const { validateApiKey } = await __turbopack_context__.A("[project]/src/lib/db/apiKeys.ts [middleware] (ecmascript, async loader)");
        const ok = await validateApiKey(bearer);
        if (!ok) {
            // Issue #2257: when REQUIRE_API_KEY is off, a stale CLI config (Codex
            // Desktop auto-config, Hermes, etc.) carrying an invalid Bearer
            // shouldn't 401 the whole request — REQUIRE_API_KEY=false means
            // "anonymous traffic is allowed", so an invalid key should degrade to
            // anonymous instead of rejecting. We log a warning so the bad key is
            // still observable in the request log.
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isRequireApiKeyEnabled"])()) {
                console.warn(`[clientApiPolicy] invalid bearer presented to ${ctx.classification.normalizedPath} ` + `but REQUIRE_API_KEY=false — falling through to anonymous (key_id=${maskKeyId(bearer)})`);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                    kind: "anonymous",
                    id: "local"
                });
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["reject"])(401, "AUTH_002", "Invalid API key");
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
            kind: "client_api_key",
            id: maskKeyId(bearer)
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/server/authz/accessScopes.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADMIN_MUTATION_PREFIXES",
    ()=>ADMIN_MUTATION_PREFIXES,
    "ADMIN_SCOPE_PREFIXES",
    ()=>ADMIN_SCOPE_PREFIXES,
    "inferRequiredScope",
    ()=>inferRequiredScope
]);
const ADMIN_SCOPE_PREFIXES = [
    "/api/cli/tokens",
    "/api/oauth",
    "/api/auth",
    "/api/policy",
    "/api/services",
    "/api/mcp"
];
const ADMIN_MUTATION_PREFIXES = [
    "/api/providers",
    "/api/cli-tools/apply"
];
const READ_METHODS = new Set([
    "GET",
    "HEAD",
    "OPTIONS"
]);
function matchesPrefix(path, prefixes) {
    // Exact match or a true path-segment boundary (`pre/...`). A bare
    // `startsWith(pre)` would over-match lookalikes (e.g. "/api/auth" vs
    // "/api/authz-inventory"), so it is intentionally NOT used.
    return prefixes.some((pre)=>path === pre || path.startsWith(pre + "/"));
}
function inferRequiredScope(method, path) {
    const m = (method || "GET").toUpperCase();
    const p = path || "/";
    if (matchesPrefix(p, ADMIN_SCOPE_PREFIXES)) return "admin";
    const isMutation = !READ_METHODS.has(m);
    if (isMutation && matchesPrefix(p, ADMIN_MUTATION_PREFIXES)) return "admin";
    return isMutation ? "write" : "read";
}
}),
"[project]/src/server/authz/accessTokenAuth.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ACCESS_TOKEN_PREFIX",
    ()=>ACCESS_TOKEN_PREFIX,
    "evaluateAccessTokenAuth",
    ()=>evaluateAccessTokenAuth,
    "extractBearer",
    ()=>extractBearer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$accessTokens$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/accessTokens.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$accessTokens$2f$scopes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/accessTokens/scopes.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$accessScopes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/accessScopes.ts [middleware] (ecmascript)");
;
;
;
const ACCESS_TOKEN_PREFIX = "oma_";
function extractBearer(request) {
    const header = request.headers.get("authorization") || "";
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());
    return match ? match[1].trim() : null;
}
function safePathname(url) {
    try {
        return new URL(url).pathname;
    } catch  {
        return "/";
    }
}
function evaluateAccessTokenAuth(request) {
    const bearer = extractBearer(request);
    if (!bearer || !bearer.startsWith(ACCESS_TOKEN_PREFIX)) {
        return {
            kind: "absent"
        };
    }
    let verified;
    try {
        verified = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$accessTokens$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["verifyAccessToken"])(bearer);
    } catch  {
        return {
            kind: "error"
        };
    }
    if (!verified) return {
        kind: "invalid"
    };
    const need = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$accessScopes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["inferRequiredScope"])(request.method, safePathname(request.url));
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$accessTokens$2f$scopes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["scopeSatisfies"])(verified.scope, need)) {
        return {
            kind: "insufficient",
            have: verified.scope,
            need
        };
    }
    return {
        kind: "ok",
        scope: verified.scope,
        id: verified.id,
        name: verified.name
    };
}
}),
"[project]/src/server/authz/policies/management.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "managementPolicy",
    ()=>managementPolicy
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$modelSyncScheduler$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/modelSyncScheduler.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/apiAuth.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$machineToken$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/machineToken.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/context.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$requireManagementAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/api/requireManagementAuth.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$managementScopes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/managementScopes.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$accessTokenAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/accessTokenAuth.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$internalServiceAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api/internalServiceAuth.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/peerStamp.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/server/authz/routeGuard.ts [middleware] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$modelSyncScheduler$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$requireManagementAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$modelSyncScheduler$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$requireManagementAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const MODEL_SYNC_MANAGEMENT_PATH = /^\/api\/providers\/[^/]+\/(sync-models|models)$/;
function requestPeerAddress(ctx) {
    // The Next middleware runtime exposes no socket/.ip, so the only trustworthy
    // locality signal is the token-stamped PEER_IP_HEADER our custom server writes
    // from the real TCP peer (scripts/dev/peer-stamp.mjs). We NEVER read the Host
    // header here — it is client-controlled and spoofable. Absent/forged stamp →
    // null → isLoopbackRequest/isPrivateLanRequest return false → fail closed.
    const stamped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveStampedPeer"])(ctx.request.headers?.get?.(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PEER_IP_HEADER"]) ?? null, process.env.OMNIROUTE_PEER_STAMP_TOKEN);
    if (stamped) return stamped;
    // Non-middleware callers (tests / direct Node) may carry a real socket peer.
    return ctx.request.ip ?? ctx.request.socket?.remoteAddress ?? null;
}
/**
 * True when the inbound TCP request carried forwarding headers
 * (`x-forwarded-for` / `x-real-ip`), as stamped by the custom Node server. When
 * set, the socket peer is the reverse-proxy hop, not the end-user — so a
 * loopback / private-LAN socket must NOT be trusted as local (Hard Rules #15 +
 * #17, port of decolua/9router da667836). Token-validated; an attacker who
 * knows the header name but not the per-process token cannot influence it.
 */ function isViaProxyRequest(ctx) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveStampedViaProxy"])(ctx.request.headers?.get?.(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VIA_PROXY_HEADER"]) ?? null, process.env.OMNIROUTE_PEER_STAMP_TOKEN);
}
function isLoopbackRequest(ctx) {
    if (isViaProxyRequest(ctx)) return false;
    const peerAddress = requestPeerAddress(ctx);
    return peerAddress ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isLoopbackHost"])(peerAddress) : false;
}
// Owner-authorized (2026-05-30): allow LOCAL_ONLY *paths* from a trusted private
// LAN, based on the real socket peer IP (not spoofable). Does NOT relax the
// CLI-token gate, which stays strictly loopback. Also falls back to "not LAN"
// when a reverse-proxy hop is detected (the apparent LAN IP would be the proxy,
// not the end-user — see isViaProxyRequest above).
function isPrivateLanRequest(ctx) {
    if (isViaProxyRequest(ctx)) return false;
    const peerAddress = requestPeerAddress(ctx);
    return peerAddress ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isPrivateLanHost"])(peerAddress) : false;
}
function hasValidCliToken(ctx) {
    if (!isLoopbackRequest(ctx)) return false;
    const headers = ctx.request.headers;
    const provided = headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLI_TOKEN_HEADER"]);
    if (!provided) return false;
    const expectedTokens = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$machineToken$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getMachineTokenSync"])(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$machineToken$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getLegacyCliTokenSync"])()
    ].filter(Boolean);
    return expectedTokens.some((expected)=>{
        if (provided.length !== expected.length) return false;
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(Buffer.from(provided), Buffer.from(expected));
    });
}
function hasBearerToken(headers) {
    const authHeader = headers.get("authorization") ?? headers.get("Authorization");
    return typeof authHeader === "string" && authHeader.trim().toLowerCase().startsWith("bearer ");
}
function isInternalModelSyncRequest(ctx) {
    if (!MODEL_SYNC_MANAGEMENT_PATH.test(ctx.classification.normalizedPath)) return false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$modelSyncScheduler$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isModelSyncInternalRequest"])(ctx.request);
}
const WS_BRIDGE_INTERNAL_PATH = "/api/internal/codex-responses-ws";
const WS_BRIDGE_SECRET_HEADER = "[REDIGIDO-PRESERVACAO]";
// The in-process codex Responses-over-WebSocket proxy authenticates its internal
// authenticate/prepare calls with a per-process, unguessable secret minted by
// server-ws.mjs (OMNIROUTE_WS_BRIDGE_SECRET). Without this carve-out the MANAGEMENT
// classification 401s that loopback call, which then leaks chunked/security headers
// back onto the upgrade socket. The internal route re-validates the secret timing-safe
// (bridgeSecretMatches), so this is the same trust boundary, surfaced one layer up.
function isValidWsBridgeRequest(ctx) {
    if (ctx.classification.normalizedPath !== WS_BRIDGE_INTERNAL_PATH) return false;
    const expected = process.env.OMNIROUTE_WS_BRIDGE_SECRET || "";
    if (!expected) return false;
    const provided = ctx.request.headers?.get?.(WS_BRIDGE_SECRET_HEADER) ?? "";
    if (!provided) return false;
    const expectedHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(expected).digest();
    const providedHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(provided).digest();
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(expectedHash, providedHash);
}
// Loopback-only inspector ingest endpoint (D4). Token-gated in its own route
// handler (INSPECTOR_INTERNAL_INGEST_TOKEN); exempt from management auth so the
// standalone MITM proxy (server.cjs) can post captured traffic without a
// dashboard cookie. See the carve-out in evaluate() below.
const INSPECTOR_INGEST_PATH = "/api/tools/traffic-inspector/internal/ingest";
const managementPolicy = {
    routeClass: "MANAGEMENT",
    async evaluate (ctx) {
        const path = ctx.classification.normalizedPath;
        // Codex Responses-over-WS bridge: honor the per-process bridge secret before
        // the loopback/auth gates so the proxy's internal calls aren't 401'd (which
        // would corrupt the WS upgrade response). The internal route re-checks it.
        if (isValidWsBridgeRequest(ctx)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                kind: "management_key",
                id: "ws-bridge",
                label: "codex-ws-bridge-secret"
            });
        }
        // Tier 1: local-only gate — block spawn-capable routes from non-loopback.
        //
        // Carve-out: a small allow-list of LOCAL_ONLY paths (see
        // LOCAL_ONLY_MANAGE_SCOPE_BYPASS_PREFIXES) is reachable from non-loopback
        // when the caller presents EITHER (a) a valid API key with the `manage`
        // scope, or (b) an authenticated dashboard session. This lets:
        //   - headless / remote MCP clients drive the management surface with a
        //     manage-scope Bearer key, and
        //   - the Dashboard UI itself (cookie session) render its MCP pages
        //     (/api/mcp/status, /api/mcp/tools) from a public hostname.
        //
        // The strict-loopback default still applies to everything else (notably
        // the subprocess-spawning /api/cli-tools/runtime/* surface, which is NOT
        // in the bypass list).
        //
        // Anonymous (no Bearer / invalid key / wrong scope / no session) requests
        // still hit the same 403 LOCAL_ONLY they did before.
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isLocalOnlyPath"])(path, ctx.request?.method) && !isLoopbackRequest(ctx) && !isPrivateLanRequest(ctx)) {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isLocalOnlyBypassableByManageScope"])(path)) {
                // Management auth is header-only — a URL-borne token must never satisfy a
                // manage-scope bypass of a LOCAL_ONLY route. See #3300 follow-up.
                const apiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])(ctx.request, {
                    allowUrl: false
                });
                if (apiKey) {
                    try {
                        if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isValidApiKey"])(apiKey)) {
                            const meta = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getApiKeyMetadata"])(apiKey);
                            // #7895: the `/api/mcp/` carve-out ALSO accepts the narrow
                            // `mcp:connect` scope, so remote MCP-only callers don't need
                            // broad `manage`/`admin` just to reach the transport routes.
                            // Scoped to `/api/mcp/` ONLY — every other LOCAL_ONLY bypass
                            // prefix still requires full `hasManageScope` (below).
                            const scopeGranted = path.startsWith("/api/mcp/") && meta ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$managementScopes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["hasMcpConnectOrManageScope"])(meta.scopes) : Boolean(meta && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$requireManagementAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasManageScope"])(meta.scopes));
                            if (meta && scopeGranted) {
                                // Distinguish admin vs manage vs the narrow mcp:connect scope in
                                // the audit label so log review can tell which privilege
                                // actually granted the bypass.
                                const grantedBy = meta.scopes.includes("admin") ? "admin" : meta.scopes.includes("manage") ? "manage" : meta.scopes.includes(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$managementScopes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["MCP_CONNECT_SCOPE"]) ? "mcp-connect" : "manage";
                                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                                    kind: "management_key",
                                    id: meta.id,
                                    label: `api-key-${grantedBy}-scope-local-only-bypass`
                                });
                            }
                        }
                    } catch (err) {
                        // Auth backend (DB / file store) failure: surface as 503 so the
                        // caller can retry. Anything else (TypeError / ReferenceError /
                        // programmer error) is logged so it's not silently swallowed —
                        // the policy still degrades closed (503) to avoid leaking the
                        // route, but we leave a breadcrumb for ops.
                        console.error("[managementPolicy] manage-scope bypass auth check failed", err);
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["reject"])(503, "AUTH_BACKEND_UNAVAILABLE", "Service temporarily unavailable");
                    }
                }
                // Dashboard session bypass: the Dashboard UI itself needs to render
                // /api/mcp/status, /api/mcp/tools, etc. from a public hostname. Cookie
                // auth is already proof of an authenticated admin — same trust level
                // as a manage-scope Bearer for the surface in scope here.
                try {
                    if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isDashboardSessionAuthenticated"])(ctx.request)) {
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                            kind: "dashboard_session",
                            id: "dashboard",
                            label: "dashboard-session-local-only-bypass"
                        });
                    }
                } catch (err) {
                    // Mirror the manage-scope branch above: degrade closed (503) rather
                    // than leaking the route through an unhandled 500, but log a
                    // breadcrumb for ops. Session-store DB failure / cookie parsing
                    // error / JWT decode throw all land here.
                    console.error("[managementPolicy] dashboard-session bypass auth check failed", err);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["reject"])(503, "AUTH_BACKEND_UNAVAILABLE", "Service temporarily unavailable");
                }
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["reject"])(403, "LOCAL_ONLY", "This endpoint requires localhost access");
        }
        // Inspector ingest (D4): the standalone MITM proxy (server.cjs) posts
        // captured AgentBridge traffic to this loopback-only endpoint. It carries
        // its own shared-secret token (validated in the route handler), so it does
        // not also need a dashboard session / management key. The LOCAL_ONLY gate
        // above already rejected any non-loopback caller; we additionally require a
        // strict loopback request here so a LAN peer cannot reach it without auth.
        if (path === INSPECTOR_INGEST_PATH && isLoopbackRequest(ctx)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                kind: "management_key",
                id: "inspector-ingest",
                label: "inspector-ingest-token"
            });
        }
        if (isInternalModelSyncRequest(ctx)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                kind: "management_key",
                id: "model-sync",
                label: "internal-model-sync"
            });
        }
        if (isLoopbackRequest(ctx) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$internalServiceAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isInternalServiceRequest"])(ctx.request)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                kind: "management_key",
                id: "internal-service",
                label: "internal-service-token"
            });
        }
        if (hasValidCliToken(ctx)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                kind: "management_key",
                id: "cli",
                label: "local-cli-token"
            });
        }
        // Tier 2: always-protected routes skip the requireLogin=false bypass.
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$routeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAlwaysProtectedPath"])(path) && !await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isAuthRequired"])(ctx.request)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                kind: "anonymous",
                id: "anonymous",
                label: "auth-disabled"
            });
        }
        if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isDashboardSessionAuthenticated"])(ctx.request)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                kind: "dashboard_session",
                id: "dashboard"
            });
        }
        // Allow API keys with the `manage` scope — enables headless / programmatic
        // management (e.g. provisioning providers, setting rate limits) without
        // a browser session. The pieces below already exist and are used by
        // `requireManagementAuth` on individual routes; wiring them here closes
        // the gap so management auth is consistent across the policy layer.
        //
        // Error handling mirrors `requireManagementAuth.ts`: a thrown
        // isValidApiKey / getApiKeyMetadata indicates the auth backend is
        // unhealthy, which is a 503, not a 403 — masking it as an auth failure
        // would tell callers their credentials are wrong when the real problem
        // is that the server cannot validate any credential right now.
        // Scoped CLI access token (remote mode). Evaluated BEFORE the API-key branch
        // because `oma_` tokens are management credentials, not inference API keys.
        // Shared with `requireManagementAuth` (no drift). Scope enforced per the
        // method+admin-allowlist policy (inferRequiredScope).
        const accessVerdict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$accessTokenAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["evaluateAccessTokenAuth"])(ctx.request);
        switch(accessVerdict.kind){
            case "ok":
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                    kind: "management_key",
                    id: accessVerdict.id,
                    label: `access-token:${accessVerdict.scope}`
                });
            case "error":
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["reject"])(503, "AUTH_BACKEND_UNAVAILABLE", "Service temporarily unavailable");
            case "invalid":
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["reject"])(401, "AUTH_001", "Invalid or expired access token");
            case "insufficient":
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["reject"])(403, "AUTH_SCOPE", `Access token scope '${accessVerdict.have}' is insufficient; '${accessVerdict.need}' required.`);
            case "absent":
                break; // no oma_ token → fall through to API-key auth
        }
        // Management auth is header-only — a URL-borne token must not authenticate
        // a management route. See #3300 follow-up.
        const apiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])(ctx.request, {
            allowUrl: false
        });
        if (apiKey) {
            try {
                if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isValidApiKey"])(apiKey)) {
                    const meta = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getApiKeyMetadata"])(apiKey);
                    // getApiKeyMetadata returns null whenever the row has no id,
                    // so when `meta` is truthy `meta.id` is guaranteed non-empty.
                    if (meta && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$requireManagementAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasManageScope"])(meta.scopes)) {
                        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
                            kind: "management_key",
                            id: meta.id,
                            label: "api-key-manage-scope"
                        });
                    }
                }
            } catch  {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["reject"])(503, "AUTH_BACKEND_UNAVAILABLE", "Service temporarily unavailable");
            }
        }
        const bearerPresent = hasBearerToken(ctx.request.headers);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["reject"])(bearerPresent ? 403 : 401, "AUTH_001", bearerPresent ? "Invalid management token" : "Authentication required");
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/server/authz/policies/public.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "publicPolicy",
    ()=>publicPolicy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/context.ts [middleware] (ecmascript)");
;
const publicPolicy = {
    routeClass: "PUBLIC",
    async evaluate (_ctx) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$context$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["allow"])({
            kind: "anonymous",
            id: "anonymous"
        });
    }
};
}),
"[project]/src/server/authz/pipeline.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "runAuthzPipeline",
    ()=>runAuthzPipeline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/sign.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gracefulShutdown$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gracefulShutdown.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$middleware$2f$bodySizeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/middleware/bodySizeGuard.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/requestId.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$cors$2f$origins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/cors/origins.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$origin$2f$publicOrigin$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/origin/publicOrigin.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$classify$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/classify.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$csrf$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/csrf.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/peerStamp.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ipFilter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ipFilter.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$policies$2f$clientApi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/policies/clientApi.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$policies$2f$management$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/policies/management.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$policies$2f$public$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/policies/public.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/headers.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$origin$2f$publicOrigin$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$policies$2f$clientApi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$policies$2f$management$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$origin$2f$publicOrigin$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$policies$2f$clientApi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$policies$2f$management$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const POLICIES = {
    PUBLIC: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$policies$2f$public$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["publicPolicy"],
    CLIENT_API: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$policies$2f$clientApi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["clientApiPolicy"],
    MANAGEMENT: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$policies$2f$management$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["managementPolicy"]
};
let staleDashboardJwtWarningEmitted = false;
function isStaleDashboardJwtError(error) {
    const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" ? error.code : "";
    if (code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED" || code === "ERR_JWT_EXPIRED" || code === "ERR_JWS_INVALID" || code === "ERR_JWT_CLAIM_VALIDATION_FAILED") {
        return true;
    }
    return error instanceof Error && error.message.includes("signature verification failed");
}
function stampSubject(headers, subject) {
    headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_AUTH_KIND"], subject.kind);
    headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_AUTH_ID"], subject.id);
    if (subject.label) headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_AUTH_LABEL"], subject.label);
    if (subject.scopes && subject.scopes.length > 0) {
        headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_AUTH_SCOPES"], subject.scopes.join(","));
    }
}
function rejectionResponse(outcome, classification, requestId) {
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: {
            code: outcome.code,
            message: outcome.message,
            correlation_id: requestId
        }
    }, {
        status: outcome.status
    });
    response.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_REQUEST_ID"], requestId);
    response.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_ROUTE_CLASS"], classification.routeClass);
    return response;
}
function isDashboardPath(pathname) {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname === "/home" || pathname.startsWith("/home/");
}
function isManagementDashboardRoute(classification, pathname) {
    return classification.routeClass === "MANAGEMENT" && isDashboardPath(pathname);
}
function getCookieValue(request, name) {
    const fromCookies = request.cookies.get(name)?.value;
    if (fromCookies) return fromCookies;
    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie");
    if (!cookieHeader) return null;
    for (const segment of cookieHeader.split(";")){
        const [rawKey, ...rawValue] = segment.split("=");
        if (!rawKey || rawValue.length === 0) continue;
        if (rawKey.trim() === name) return rawValue.join("=").trim() || null;
    }
    return null;
}
function getJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();
    return secret ? new TextEncoder().encode(secret) : null;
}
function shouldUseSecureCookie(request) {
    if (process.env.AUTH_COOKIE_SECURE === "true") return true;
    const forwardedProto = (request.headers.get("x-forwarded-proto") || "").split(",")[0].trim().toLowerCase();
    return forwardedProto === "https" || request.nextUrl.protocol === "https:";
}
async function refreshDashboardSessionIfNeeded(response, request) {
    const secret = getJwtSecret();
    if (!secret) return;
    const token = getCookieValue(request, "auth_token");
    if (!token) return;
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["jwtVerify"])(token, secret);
        const exp = typeof payload.exp === "number" ? payload.exp : null;
        if (!exp) return;
        const now = Math.floor(Date.now() / 1000);
        const refreshWindowSeconds = 7 * 24 * 60 * 60;
        if (exp - now >= refreshWindowSeconds) return;
        const freshToken = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["SignJWT"]({
            authenticated: true
        }).setProtectedHeader({
            alg: "HS256"
        }).setExpirationTime("30d").sign(secret);
        response.cookies.set("auth_token", freshToken, {
            httpOnly: true,
            secure: shouldUseSecureCookie(request),
            sameSite: "lax",
            path: "/"
        });
    } catch (error) {
        if (isStaleDashboardJwtError(error)) {
            response.cookies.delete("auth_token");
            if (!staleDashboardJwtWarningEmitted) {
                staleDashboardJwtWarningEmitted = true;
                console.warn("[Authz] Dropped stale dashboard session cookie during auto-refresh");
            }
            return;
        }
        console.error("[Authz] JWT auto-refresh failed:", error);
    }
}
function dashboardLoginRedirect(request, requestId) {
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`${request.nextUrl.basePath}/login`, request.url));
    response.cookies.delete("auth_token");
    stampRouteResponse(response, requestId, "MANAGEMENT");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$cors$2f$origins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCorsHeaders"])(response, request);
    return response;
}
function drainingResponse(requestId) {
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Server is shutting down",
            correlation_id: requestId
        }
    }, {
        status: 503
    });
    response.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_REQUEST_ID"], requestId);
    return response;
}
function invalidOriginResponse(requestId) {
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: {
            code: "INVALID_ORIGIN",
            message: "Invalid request origin. Same-origin dashboard writes must include a valid dashboard CSRF token. " + "Refresh the dashboard and retry, or set OMNIROUTE_PUBLIC_BASE_URL for non-dashboard browser integrations.",
            correlation_id: requestId
        }
    }, {
        status: 403
    });
    response.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_REQUEST_ID"], requestId);
    return response;
}
function isUnsafeMutationMethod(method) {
    return ![
        "GET",
        "HEAD",
        "OPTIONS"
    ].includes(method.toUpperCase());
}
function stampRouteResponse(response, requestId, routeClass) {
    response.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_REQUEST_ID"], requestId);
    response.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_ROUTE_CLASS"], routeClass);
    return response;
}
async function getBodySizeSettings() {
    try {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getCachedSettings"])();
    } catch (error) {
        console.warn("[Authz] Failed to load request body limit settings:", error instanceof Error ? error.message : error);
        return undefined;
    }
}
async function runAuthzPipeline(request, options = {}) {
    const { pathname } = request.nextUrl;
    const method = request.method;
    const requestId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["generateRequestId"])();
    if (pathname === "/") {
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`${request.nextUrl.basePath}/dashboard`, request.url));
        return stampRouteResponse(response, requestId, "MANAGEMENT");
    }
    const classification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$classify$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["classifyRoute"])(pathname, method);
    const guardedPathname = classification.normalizedPath;
    const managementDashboardRoute = isManagementDashboardRoute(classification, pathname);
    // Relax the CORS origin fallback ONLY for the token-authenticated API
    // surface (CLIENT_API: /v1/*, /v1beta/*, codex/responses aliases) and
    // read-only PUBLIC endpoints. These authenticate via Authorization /
    // x-api-key headers that browsers never auto-attach, so echoing the caller's
    // Origin (or `*`) there carries no credentialed-session / CSRF risk — it just
    // lets browser/Electron clients (issue #5242) read responses they are already
    // entitled to. MANAGEMENT (cookie-authed dashboard) and non-read-only PUBLIC
    // routes (e.g. /api/cloud/, which sets Allow-Credentials in its own handler)
    // stay exactly fail-closed.
    const corsRelaxOrigin = classification.routeClass === "CLIENT_API" || classification.routeClass === "PUBLIC" && classification.reason === "public_readonly_prefix";
    if (guardedPathname.startsWith("/api/") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gracefulShutdown$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isDraining"])()) {
        const response = drainingResponse(requestId);
        stampRouteResponse(response, requestId, classification.routeClass);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$cors$2f$origins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCorsHeaders"])(response, request, corsRelaxOrigin);
        return response;
    }
    if (guardedPathname.startsWith("/api/") && method !== "GET" && method !== "OPTIONS") {
        const bodySizeSettings = await getBodySizeSettings();
        const bodySizeRejection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$middleware$2f$bodySizeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["checkBodySize"])(request, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$middleware$2f$bodySizeGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getBodySizeLimit"])(guardedPathname, bodySizeSettings));
        if (bodySizeRejection) {
            stampRouteResponse(bodySizeRejection, requestId, classification.routeClass);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$cors$2f$origins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCorsHeaders"])(bodySizeRejection, request, corsRelaxOrigin);
            return bodySizeRejection;
        }
    }
    const requestHeaders = new Headers(request.headers);
    for (const trusted of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_TRUSTED_HEADERS"]){
        requestHeaders.delete(trusted);
    }
    // The trusted peer-IP + via-proxy stamps are read by the policy from the
    // ORIGINAL request (above); strip them from the forwarded headers so the
    // per-process token never reaches route handlers or upstream providers.
    requestHeaders.delete(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PEER_IP_HEADER"]);
    requestHeaders.delete(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VIA_PROXY_HEADER"]);
    requestHeaders.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_ROUTE_CLASS"], classification.routeClass);
    requestHeaders.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_REQUEST_ID"], requestId);
    // Stamp a trusted, non-secret locality verdict derived from the real stamped
    // peer IP AND the via-proxy marker. Route handlers (e.g. cliTokenAuth) read
    // this instead of re-deriving locality from the spoofable Host header. The
    // client-supplied values (if any) were already removed by the
    // AUTHZ_TRUSTED_HEADERS strip above. When the via-proxy marker is set, a
    // loopback socket is the proxy hop, not the end-user — verdict is downgraded
    // to "remote" so the LOCAL_ONLY gate is not bypassed by a request arriving
    // through an external reverse proxy (nginx / Caddy / Cloudflare Tunnel).
    // See peerStamp.ts and the upstream da667836 reference for the full rationale.
    const peerLocality = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["classifyStampedPeerLocality"])(request.headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PEER_IP_HEADER"]), request.headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VIA_PROXY_HEADER"]), process.env.OMNIROUTE_PEER_STAMP_TOKEN);
    requestHeaders.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_PEER_LOCALITY"], peerLocality);
    if (method === "OPTIONS") {
        const preflight = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"](null, {
            status: 204
        });
        preflight.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_REQUEST_ID"], requestId);
        preflight.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_ROUTE_CLASS"], classification.routeClass);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$cors$2f$origins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCorsHeaders"])(preflight, request, corsRelaxOrigin);
        return preflight;
    }
    if (!options.enforce) {
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next({
            request: {
                headers: requestHeaders
            }
        });
        response.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_REQUEST_ID"], requestId);
        response.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_ROUTE_CLASS"], classification.routeClass);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$cors$2f$origins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCorsHeaders"])(response, request, corsRelaxOrigin);
        return response;
    }
    // IP filter (#6131): enforce the operator's IP blacklist/whitelist on the
    // external surface. Loopback is exempt so the local operator can never lock
    // themselves out of the dashboard (they can always fix the list from
    // localhost). checkIP is a no-op when the filter is disabled.
    //
    // D1 (#9033): on a direct connection the proxy runtime has no socket, so
    // checkRequestIP reads only forwarding headers + undefined request.ip and
    // falls to "unknown", never blocking the blacklisted client. Resolve the
    // trusted peer IP from the authenticated stamp and pass it to checkRequestIP,
    // but only when NOT behind a reverse proxy (the via-proxy marker means the
    // peer IP is the proxy hop, e.g. 127.0.0.1, and the real client is in XFF).
    if (peerLocality !== "loopback") {
        const trustedPeerIp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveStampedPeer"])(request.headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PEER_IP_HEADER"]), process.env.OMNIROUTE_PEER_STAMP_TOKEN);
        const viaProxy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$peerStamp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveStampedViaProxy"])(request.headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VIA_PROXY_HEADER"]), process.env.OMNIROUTE_PEER_STAMP_TOKEN);
        const ipVerdict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ipFilter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["checkRequestIP"])(request, viaProxy ? null : trustedPeerIp);
        if (!ipVerdict.allowed) {
            const blocked = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: ipVerdict.reason || "Access denied"
            }, {
                status: 403
            });
            stampRouteResponse(blocked, requestId, classification.routeClass);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$cors$2f$origins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCorsHeaders"])(blocked, request, corsRelaxOrigin);
            return blocked;
        }
    }
    const policy = POLICIES[classification.routeClass];
    const outcome = await policy.evaluate({
        request,
        classification,
        requestId
    });
    if (!outcome.allow) {
        if (managementDashboardRoute) {
            return dashboardLoginRedirect(request, requestId);
        }
        const rejection = rejectionResponse(outcome, classification, requestId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$cors$2f$origins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCorsHeaders"])(rejection, request, corsRelaxOrigin);
        return rejection;
    }
    if (classification.routeClass === "MANAGEMENT" && outcome.subject.kind === "dashboard_session" && isUnsafeMutationMethod(method)) {
        const originVerdict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$origin$2f$publicOrigin$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateBrowserMutationOrigin"])(request);
        const csrfOriginFallback = originVerdict.reason === "invalid-origin" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$csrf$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDashboardCsrfToken"])(request);
        if (!originVerdict.ok && !csrfOriginFallback) {
            const rejection = invalidOriginResponse(requestId);
            rejection.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_ROUTE_CLASS"], classification.routeClass);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$cors$2f$origins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCorsHeaders"])(rejection, request);
            return rejection;
        }
    }
    stampSubject(requestHeaders, outcome.subject);
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request: {
            headers: requestHeaders
        }
    });
    response.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_REQUEST_ID"], requestId);
    response.headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_ROUTE_CLASS"], classification.routeClass);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$cors$2f$origins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCorsHeaders"])(response, request, corsRelaxOrigin);
    if (managementDashboardRoute) {
        await refreshDashboardSessionIfNeeded(response, request);
    }
    return response;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/types/databaseSettings.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Database performance optimization settings stored in SQLite key-value pairs.
 * User-configurable aggregation, retention, and optimization settings.
 */ __turbopack_context__.s([
    "DEFAULT_DATABASE_SETTINGS",
    ()=>DEFAULT_DATABASE_SETTINGS
]);
const DEFAULT_DATABASE_SETTINGS = {
    logs: {
        detailedLogsEnabled: false,
        callLogPipelineEnabled: false,
        maxDetailSizeKb: 10,
        ringBufferSize: 500
    },
    backup: {
        autoBackupEnabled: false,
        autoBackupFrequency: "never",
        keepLastNBackups: 5
    },
    cache: {
        semanticCacheEnabled: true,
        semanticCacheMaxSize: 100,
        semanticCacheTTL: 1800000,
        promptCacheEnabled: true,
        promptCacheStrategy: "auto",
        alwaysPreserveClientCache: "auto",
        // Keep in sync with CATALOG_CACHE_TTL_MS_DEFAULT
        // (src/app/api/v1/models/catalogCache.ts) — this value is what actually takes
        // effect, since catalog.ts reads it as `dbSettings.cache?.modelCatalogCacheTtlMs
        // ?? CATALOG_CACHE_TTL_MS_DEFAULT` and the `??` never falls through while a
        // default is declared here. Guarded by tests/unit/v1-models-catalog-ttl.test.ts.
        modelCatalogCacheTtlMs: 60_000
    },
    retention: {
        quotaSnapshots: 7,
        compressionAnalytics: 30,
        mcpAudit: 30,
        a2aEvents: 30,
        callLogs: 30,
        usageHistory: 30,
        memoryEntries: 30,
        domainCostHistory: 30,
        compressionCacheStats: 30,
        xpAuditLog: 30,
        compressionRunTelemetry: 30,
        autoCleanupEnabled: true
    },
    aggregation: {
        enabled: true,
        rawDataRetentionDays: 30,
        granularity: "daily"
    },
    optimization: {
        autoVacuumMode: "FULL",
        scheduledVacuum: "weekly",
        vacuumHour: 2,
        pageSize: 4096,
        cacheSize: 65536,
        optimizeOnStartup: true
    }
};
}),
"[project]/src/domain/connectionModelRules.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnectionExcludedModels",
    ()=>getConnectionExcludedModels,
    "hasEligibleConnectionForModel",
    ()=>hasEligibleConnectionForModel,
    "isModelExcludedByConnection",
    ()=>isModelExcludedByConnection,
    "normalizeExcludedModelPatterns",
    ()=>normalizeExcludedModelPatterns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wildcardRouter.ts [middleware] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizePattern(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    if (!normalized || normalized === "**") return null;
    return normalized;
}
function toPatternList(value) {
    if (Array.isArray(value)) {
        return value.map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    if (typeof value === "string") {
        return value.split(",").map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    return [];
}
function uniquePatterns(patterns) {
    return Array.from(new Set(patterns));
}
function getModelMatchCandidates(modelId) {
    const normalized = modelId.trim();
    if (!normalized) return [];
    const withoutExtendedContext = normalized.endsWith("[1m]") ? normalized.slice(0, -4) : normalized;
    const lastSlashIndex = withoutExtendedContext.lastIndexOf("/");
    const rawModel = lastSlashIndex >= 0 ? withoutExtendedContext.slice(lastSlashIndex + 1) : withoutExtendedContext;
    return Array.from(new Set([
        normalized,
        withoutExtendedContext,
        rawModel
    ].filter(Boolean)));
}
function normalizeExcludedModelPatterns(value) {
    return uniquePatterns(toPatternList(value));
}
function getConnectionExcludedModels(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeExcludedModelPatterns(data.excludedModels ?? data.excluded_models);
}
function isModelExcludedByConnection(modelId, providerSpecificData) {
    if (typeof modelId !== "string" || modelId.trim().length === 0) return false;
    const candidates = getModelMatchCandidates(modelId);
    const excludedModels = getConnectionExcludedModels(providerSpecificData);
    if (candidates.length === 0 || excludedModels.length === 0) return false;
    return excludedModels.some((pattern)=>candidates.some((candidate)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["wildcardMatch"])(candidate, pattern)));
}
function hasEligibleConnectionForModel(connections, modelId) {
    if (!Array.isArray(connections) || connections.length === 0) return false;
    return connections.some((connection)=>!isModelExcludedByConnection(modelId, connection?.providerSpecificData));
}
}),
"[project]/src/domain/tagRouter.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnectionRoutingTags",
    ()=>getConnectionRoutingTags,
    "matchesRoutingTags",
    ()=>matchesRoutingTags,
    "normalizeRoutingTagMatchMode",
    ()=>normalizeRoutingTagMatchMode,
    "normalizeRoutingTags",
    ()=>normalizeRoutingTags,
    "resolveRequestRoutingTags",
    ()=>resolveRequestRoutingTags
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeSingleRoutingTag(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
}
function normalizeRoutingTags(value) {
    const rawValues = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
    const deduped = new Set();
    for (const rawValue of rawValues){
        const normalized = normalizeSingleRoutingTag(rawValue);
        if (normalized) deduped.add(normalized);
    }
    return Array.from(deduped);
}
function normalizeRoutingTagMatchMode(value) {
    const normalized = typeof value === "string" ? value.trim().toLowerCase() : typeof value === "number" ? "" : "";
    return normalized === "all" ? "all" : "any";
}
function getConnectionRoutingTags(providerSpecificData) {
    return normalizeRoutingTags(asRecord(providerSpecificData).tags);
}
function matchesRoutingTags(connectionTags, requestTags, matchMode = "any") {
    if (requestTags.length === 0) return true;
    if (connectionTags.length === 0) return false;
    const tagSet = new Set(connectionTags);
    if (matchMode === "all") {
        return requestTags.every((tag)=>tagSet.has(tag));
    }
    return requestTags.some((tag)=>tagSet.has(tag));
}
function resolveRequestRoutingTags(body) {
    const metadata = asRecord(body?.metadata);
    return {
        tags: normalizeRoutingTags(metadata.tags),
        matchMode: normalizeRoutingTagMatchMode(metadata.tag_match_mode ?? metadata.tagMatchMode)
    };
}
}),
"[project]/src/domain/costRules.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkBudget",
    ()=>checkBudget,
    "deleteBudget",
    ()=>deleteBudget,
    "getBudget",
    ()=>getBudget,
    "getBudgetWindow",
    ()=>getBudgetWindow,
    "getCostSummary",
    ()=>getCostSummary,
    "getDailyTotal",
    ()=>getDailyTotal,
    "recordCost",
    ()=>recordCost,
    "resetCostData",
    ()=>resetCostData,
    "setBudget",
    ()=>setBudget,
    "syncAllBudgetSchedules",
    ()=>syncAllBudgetSchedules
]);
/**
 * Cost Rules — Domain Layer (T-19)
 *
 * Business rules for cost management: budget thresholds,
 * scheduled reset windows, and cost summaries per API key.
 *
 * State is persisted in SQLite via domainState.ts.
 *
 * @module domain/costRules
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/domainState.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/spend/batchWriter.ts [middleware] (ecmascript)");
;
;
const VALID_RESET_INTERVALS = new Set([
    "daily",
    "weekly",
    "monthly"
]);
const RESET_TIME_REGEX = /^(\d{2}):(\d{2})$/;
/** @type {Map<string, NormalizedBudgetConfig>} In-memory cache for budgets */ const budgets = new Map();
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function toCostEntries(value) {
    if (!Array.isArray(value)) return [];
    const entries = [];
    for (const item of value){
        if (!item || typeof item !== "object" || Array.isArray(item)) continue;
        const record = item;
        const cost = toNumber(record.cost, Number.NaN);
        const timestamp = toNumber(record.timestamp, Number.NaN);
        if (!Number.isFinite(cost) || !Number.isFinite(timestamp)) continue;
        entries.push({
            cost,
            timestamp
        });
    }
    return entries;
}
function sumEntries(entries) {
    return entries.reduce((sum, entry)=>sum + entry.cost, 0);
}
function normalizeResetInterval(value) {
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (VALID_RESET_INTERVALS.has(normalized)) {
            return normalized;
        }
    }
    return "daily";
}
function normalizeResetTime(value) {
    if (typeof value === "string") {
        const match = value.trim().match(RESET_TIME_REGEX);
        if (match) {
            const hours = Math.min(Math.max(parseInt(match[1], 10), 0), 23);
            const minutes = Math.min(Math.max(parseInt(match[2], 10), 0), 59);
            return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        }
    }
    return "00:00";
}
function normalizeTimestamp(value) {
    const numeric = toNumber(value, Number.NaN);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}
function normalizeBudgetConfig(config) {
    return {
        dailyLimitUsd: Math.max(0, toNumber(config.dailyLimitUsd)),
        weeklyLimitUsd: Math.max(0, toNumber(config.weeklyLimitUsd)),
        monthlyLimitUsd: Math.max(0, toNumber(config.monthlyLimitUsd)),
        warningThreshold: Math.min(Math.max(toNumber(config.warningThreshold, 0.8), 0), 1),
        resetInterval: normalizeResetInterval(config.resetInterval),
        resetTime: normalizeResetTime(config.resetTime),
        budgetResetAt: normalizeTimestamp(config.budgetResetAt),
        lastBudgetResetAt: normalizeTimestamp(config.lastBudgetResetAt),
        warningEmittedAt: normalizeTimestamp(config.warningEmittedAt),
        warningPeriodStart: normalizeTimestamp(config.warningPeriodStart)
    };
}
function getResetTimeParts(resetTime) {
    const match = resetTime.match(RESET_TIME_REGEX);
    if (!match) return [
        0,
        0
    ];
    return [
        parseInt(match[1], 10),
        parseInt(match[2], 10)
    ];
}
function getUtcDateMs(year, month, day, hours, minutes) {
    return Date.UTC(year, month, day, hours, minutes, 0, 0);
}
function getBudgetWindow(resetInterval, resetTime = "00:00", now = Date.now()) {
    const current = new Date(now);
    const [hours, minutes] = getResetTimeParts(normalizeResetTime(resetTime));
    const year = current.getUTCFullYear();
    const month = current.getUTCMonth();
    const day = current.getUTCDate();
    if (resetInterval === "weekly") {
        const daysSinceMonday = (current.getUTCDay() + 6) % 7;
        const thisWeekReset = getUtcDateMs(year, month, day - daysSinceMonday, hours, minutes);
        return now >= thisWeekReset ? {
            periodStartAt: thisWeekReset,
            nextResetAt: getUtcDateMs(year, month, day - daysSinceMonday + 7, hours, minutes)
        } : {
            periodStartAt: getUtcDateMs(year, month, day - daysSinceMonday - 7, hours, minutes),
            nextResetAt: thisWeekReset
        };
    }
    if (resetInterval === "monthly") {
        const thisMonthReset = getUtcDateMs(year, month, 1, hours, minutes);
        return now >= thisMonthReset ? {
            periodStartAt: thisMonthReset,
            nextResetAt: getUtcDateMs(year, month + 1, 1, hours, minutes)
        } : {
            periodStartAt: getUtcDateMs(year, month - 1, 1, hours, minutes),
            nextResetAt: thisMonthReset
        };
    }
    const todayReset = getUtcDateMs(year, month, day, hours, minutes);
    return now >= todayReset ? {
        periodStartAt: todayReset,
        nextResetAt: getUtcDateMs(year, month, day + 1, hours, minutes)
    } : {
        periodStartAt: getUtcDateMs(year, month, day - 1, hours, minutes),
        nextResetAt: todayReset
    };
}
function getActiveBudgetLimit(budget) {
    if (budget.resetInterval === "monthly") {
        return budget.monthlyLimitUsd > 0 ? budget.monthlyLimitUsd : budget.dailyLimitUsd;
    }
    if (budget.resetInterval === "weekly") {
        return budget.weeklyLimitUsd > 0 ? budget.weeklyLimitUsd : budget.dailyLimitUsd;
    }
    return budget.dailyLimitUsd;
}
function getBudgetWindowTotal(apiKeyId, periodStartAt) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["loadCostTotal"])(apiKeyId, periodStartAt) + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["spendBatchWriter"].getPendingCostTotal(apiKeyId, periodStartAt);
    } catch  {
        return 0;
    }
}
function getBudgetWindowRangeTotal(apiKeyId, periodStartAt, periodEndAt) {
    try {
        return sumEntries(toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["loadCostEntriesInRange"])(apiKeyId, periodStartAt, periodEndAt))) + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["spendBatchWriter"].getPendingCostTotal(apiKeyId, periodStartAt, periodEndAt);
    } catch  {
        return 0;
    }
}
function emitBudgetWarning(apiKeyId, budget, projectedTotal, activeLimitUsd, nextResetAt) {
    const percentage = activeLimitUsd > 0 ? (projectedTotal / activeLimitUsd * 100).toFixed(1) : "0.0";
    console.warn(`[BudgetWarning] ${apiKeyId} reached ${percentage}% of ${budget.resetInterval} budget ($${projectedTotal.toFixed(4)} / $${activeLimitUsd.toFixed(2)}) — next reset ${new Date(nextResetAt).toISOString()}`);
}
function syncBudgetSchedule(apiKeyId, config, now = Date.now(), options = {}) {
    const normalized = normalizeBudgetConfig(config);
    const window = getBudgetWindow(normalized.resetInterval, normalized.resetTime, now);
    const resetRolled = normalized.lastBudgetResetAt !== null && window.periodStartAt > normalized.lastBudgetResetAt;
    if (resetRolled && options.logReset !== false) {
        const previousSpend = getBudgetWindowRangeTotal(apiKeyId, normalized.lastBudgetResetAt, window.periodStartAt);
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["saveBudgetResetLog"])({
                apiKeyId,
                resetInterval: normalized.resetInterval,
                previousSpend,
                resetAt: window.periodStartAt,
                nextResetAt: window.nextResetAt,
                periodStart: window.periodStartAt,
                periodEnd: window.nextResetAt
            });
        } catch  {
        // Non-fatal: budget logic still proceeds even if logging fails.
        }
    }
    const updated = {
        ...normalized,
        budgetResetAt: window.nextResetAt,
        lastBudgetResetAt: window.periodStartAt,
        warningEmittedAt: resetRolled ? null : normalized.warningEmittedAt,
        warningPeriodStart: resetRolled ? null : normalized.warningPeriodStart
    };
    const changed = normalized.budgetResetAt !== updated.budgetResetAt || normalized.lastBudgetResetAt !== updated.lastBudgetResetAt || normalized.warningEmittedAt !== updated.warningEmittedAt || normalized.warningPeriodStart !== updated.warningPeriodStart || normalized.dailyLimitUsd !== updated.dailyLimitUsd || normalized.weeklyLimitUsd !== updated.weeklyLimitUsd || normalized.monthlyLimitUsd !== updated.monthlyLimitUsd || normalized.warningThreshold !== updated.warningThreshold || normalized.resetInterval !== updated.resetInterval || normalized.resetTime !== updated.resetTime;
    if (changed && options.persist !== false) {
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["saveBudget"])(apiKeyId, updated);
        } catch  {
        // Non-critical: in-memory cache still works.
        }
    }
    budgets.set(apiKeyId, updated);
    return updated;
}
function setBudget(apiKeyId, config) {
    return syncBudgetSchedule(apiKeyId, config, Date.now(), {
        logReset: false,
        persist: true
    });
}
function getBudget(apiKeyId) {
    const cached = budgets.get(apiKeyId);
    if (cached) {
        return syncBudgetSchedule(apiKeyId, cached);
    }
    try {
        const fromDb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["loadBudget"])(apiKeyId);
        if (fromDb) {
            return syncBudgetSchedule(apiKeyId, fromDb);
        }
    } catch  {
    // DB may not be ready.
    }
    return null;
}
function deleteBudget(apiKeyId) {
    budgets.delete(apiKeyId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["discardSpendBatchEntries"])(apiKeyId);
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["deleteBudget"])(apiKeyId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["deleteCostEntries"])(apiKeyId);
    } catch  {
    // Non-critical.
    }
}
function recordCost(apiKeyId, cost) {
    try {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["spendBatchWriter"].increment(apiKeyId, cost, Date.now());
    } catch  {
    // Non-critical.
    }
}
function syncAllBudgetSchedules(now = Date.now()) {
    let processed = 0;
    let resetCount = 0;
    try {
        const allBudgets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["loadAllBudgets"])();
        for (const [apiKeyId, budget] of Object.entries(allBudgets)){
            processed += 1;
            const synced = syncBudgetSchedule(apiKeyId, budget, now, {
                logReset: true,
                persist: true
            });
            if (budget.lastBudgetResetAt !== synced.lastBudgetResetAt) {
                resetCount += 1;
            }
        }
    } catch  {
    // Non-critical.
    }
    return {
        processed,
        resetCount
    };
}
function checkBudget(apiKeyId, additionalCost = 0) {
    const budget = getBudget(apiKeyId);
    if (!budget) {
        return {
            allowed: true,
            dailyUsed: 0,
            dailyLimit: 0,
            warningReached: false,
            remaining: 0,
            periodUsed: 0,
            activeLimitUsd: 0,
            resetInterval: null,
            resetTime: null,
            budgetResetAt: null,
            lastBudgetResetAt: null,
            periodStartAt: null
        };
    }
    const window = getBudgetWindow(budget.resetInterval, budget.resetTime);
    const periodUsed = getBudgetWindowTotal(apiKeyId, window.periodStartAt);
    const projectedTotal = periodUsed + additionalCost;
    const activeLimitUsd = getActiveBudgetLimit(budget);
    const warningReached = activeLimitUsd > 0 && projectedTotal >= activeLimitUsd * budget.warningThreshold;
    const remaining = Math.max(activeLimitUsd - projectedTotal, 0);
    if (warningReached && budget.warningPeriodStart !== window.periodStartAt) {
        const updatedBudget = {
            ...budget,
            warningEmittedAt: Date.now(),
            warningPeriodStart: window.periodStartAt
        };
        budgets.set(apiKeyId, updatedBudget);
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["saveBudget"])(apiKeyId, updatedBudget);
            emitBudgetWarning(apiKeyId, updatedBudget, projectedTotal, activeLimitUsd, window.nextResetAt);
        } catch  {
        // Non-critical.
        }
    }
    if (activeLimitUsd > 0 && projectedTotal > activeLimitUsd) {
        return {
            allowed: false,
            reason: `${budget.resetInterval[0].toUpperCase()}${budget.resetInterval.slice(1)} budget exceeded: $${projectedTotal.toFixed(4)} / $${activeLimitUsd.toFixed(2)}`,
            dailyUsed: periodUsed,
            dailyLimit: activeLimitUsd,
            warningReached: true,
            remaining,
            periodUsed,
            activeLimitUsd,
            resetInterval: budget.resetInterval,
            resetTime: budget.resetTime,
            budgetResetAt: window.nextResetAt,
            lastBudgetResetAt: window.periodStartAt,
            periodStartAt: window.periodStartAt
        };
    }
    return {
        allowed: true,
        dailyUsed: periodUsed,
        dailyLimit: activeLimitUsd,
        warningReached,
        remaining,
        periodUsed,
        activeLimitUsd,
        resetInterval: budget.resetInterval,
        resetTime: budget.resetTime,
        budgetResetAt: window.nextResetAt,
        lastBudgetResetAt: window.periodStartAt,
        periodStartAt: window.periodStartAt
    };
}
function getDailyTotal(apiKeyId) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    try {
        return sumEntries(toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, todayStart.getTime()))) + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["spendBatchWriter"].getPendingCostTotal(apiKeyId, todayStart.getTime());
    } catch  {
        return 0;
    }
}
function getCostSummary(apiKeyId) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const budget = getBudget(apiKeyId);
    const window = budget ? getBudgetWindow(budget.resetInterval, budget.resetTime) : null;
    try {
        const dailyEntries = [
            ...toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, todayStart.getTime())),
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["spendBatchWriter"].getBufferedEntries(apiKeyId, todayStart.getTime())
        ];
        const monthlyEntries = [
            ...toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, monthStart.getTime())),
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["spendBatchWriter"].getBufferedEntries(apiKeyId, monthStart.getTime())
        ];
        const periodEntries = window !== null ? [
            ...toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, window.periodStartAt)),
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["spendBatchWriter"].getBufferedEntries(apiKeyId, window.periodStartAt)
        ] : [];
        const dailyTotal = sumEntries(dailyEntries);
        const monthlyTotal = sumEntries(monthlyEntries);
        const periodTotal = sumEntries(periodEntries);
        const activeLimitUsd = budget ? getActiveBudgetLimit(budget) : 0;
        return {
            dailyTotal,
            monthlyTotal,
            totalEntries: monthlyEntries.length,
            budget,
            totalCostToday: dailyTotal,
            totalCostMonth: monthlyTotal,
            totalCostPeriod: periodTotal,
            activeLimitUsd,
            resetInterval: budget?.resetInterval ?? null,
            resetTime: budget?.resetTime ?? null,
            budgetResetAt: window?.nextResetAt ?? budget?.budgetResetAt ?? null,
            lastBudgetResetAt: window?.periodStartAt ?? budget?.lastBudgetResetAt ?? null,
            periodStartAt: window?.periodStartAt ?? null,
            nextResetAt: window?.nextResetAt ?? null,
            dailyLimitUsd: budget?.dailyLimitUsd ?? 0,
            weeklyLimitUsd: budget?.weeklyLimitUsd ?? 0,
            monthlyLimitUsd: budget?.monthlyLimitUsd ?? 0,
            warningThreshold: budget?.warningThreshold ?? null
        };
    } catch  {
        return {
            dailyTotal: 0,
            monthlyTotal: 0,
            totalEntries: 0,
            budget,
            totalCostToday: 0,
            totalCostMonth: 0,
            totalCostPeriod: 0,
            activeLimitUsd: budget ? getActiveBudgetLimit(budget) : 0,
            resetInterval: budget?.resetInterval ?? null,
            resetTime: budget?.resetTime ?? null,
            budgetResetAt: budget?.budgetResetAt ?? null,
            lastBudgetResetAt: budget?.lastBudgetResetAt ?? null,
            periodStartAt: budget?.lastBudgetResetAt ?? null,
            nextResetAt: budget?.budgetResetAt ?? null,
            dailyLimitUsd: budget?.dailyLimitUsd ?? 0,
            weeklyLimitUsd: budget?.weeklyLimitUsd ?? 0,
            monthlyLimitUsd: budget?.monthlyLimitUsd ?? 0,
            warningThreshold: budget?.warningThreshold ?? null
        };
    }
}
function resetCostData() {
    budgets.clear();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resetSpendBatchWriterForTests"])();
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["deleteAllCostData"])();
    } catch  {
    // Non-critical.
    }
}
}),
"[project]/src/domain/quotaCache.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DEFAULT_QUOTA_THRESHOLD_PERCENT",
    ()=>DEFAULT_QUOTA_THRESHOLD_PERCENT,
    "__clearForTests",
    ()=>__clearForTests,
    "getQuotaCache",
    ()=>getQuotaCache,
    "getQuotaCacheStats",
    ()=>getQuotaCacheStats,
    "getQuotaWindowStatus",
    ()=>getQuotaWindowStatus,
    "isAccountQuotaExhausted",
    ()=>isAccountQuotaExhausted,
    "isQuotaExhaustedForRequest",
    ()=>isQuotaExhaustedForRequest,
    "markAccountExhaustedFrom429",
    ()=>markAccountExhaustedFrom429,
    "quotaSnapshotChanged",
    ()=>quotaSnapshotChanged,
    "setQuotaCache",
    ()=>setQuotaCache,
    "startBackgroundRefresh",
    ()=>startBackgroundRefresh,
    "stopBackgroundRefresh",
    ()=>stopBackgroundRefresh
]);
/**
 * Quota Cache — Domain Layer
 *
 * In-memory cache of provider quota data per connectionId.
 * Populated by:
 *   - Dashboard usage endpoint (GET /api/usage/[connectionId])
 *   - 429 responses marking account as exhausted
 *
 * Background refresh runs every 1 minute:
 *   - Active accounts (quota > 0%): refetch every 5 minutes
 *   - Exhausted accounts: refetch every 5 minutes (or immediately after resetAt passes)
 *
 * @changes
 * - [2026-07-24] [Composer] - Scope Antigravity per-model exhaustion to exact model + family weekly windows
 *
 * @module domain/quotaCache
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/usage.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaSnapshots.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaResetEvents$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaResetEvents.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityQuotaFamily.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
// ─── Constants ──────────────────────────────────────────────────────────────
const ACTIVE_TTL_MS = 5 * 60 * 1000; // 5 minutes for active accounts
const EXHAUSTED_TTL_MS = 5 * 60 * 1000; // 5 minutes for 429-sourced entries (no resetAt)
const EXHAUSTED_REFRESH_MS = 5 * 60 * 1000; // 5 minutes: recheck exhausted accounts (aligned with TTL)
const REFRESH_INTERVAL_MS = 60 * 1000; // Background tick every 1 minute
const DEFAULT_QUOTA_THRESHOLD_PERCENT = 99;
function getState() {
    if (!globalThis.__omnirouteQuotaCacheState) {
        globalThis.__omnirouteQuotaCacheState = {
            cache: new Map(),
            refreshingSet: new Set(),
            refreshTimer: null,
            tickRunning: false
        };
    }
    return globalThis.__omnirouteQuotaCacheState;
}
const MAX_CONCURRENT_REFRESHES = 5;
// ─── Helpers ────────────────────────────────────────────────────────────────
function isExhausted(quotas) {
    const entries = Object.values(quotas);
    if (entries.length === 0) return false;
    return entries.every((q)=>q.remainingPercentage <= 0);
}
/**
 * T08 — Auto-advance quota window.
 * If we know the window duration, advance past the expired window(s) to
 * avoid blocking requests when the quota reset already happened but the
 * background refresh hasn't run yet.
 */ function advancedWindowResetAt(entry, now) {
    if (!entry.nextResetAt) return null;
    const resetMs = parseDate(entry.nextResetAt);
    if (resetMs === null) return null;
    // If the window's resetAt is in the past, the quota has been renewed.
    // Eagerly mark as available so requests don't wait for the 5-min TTL.
    if (resetMs <= now) {
        return {
            exhausted: false
        };
    }
    return null;
}
function parseDate(value) {
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? null : ms;
}
function clampPercent(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
}
function normalizeWindowKey(value) {
    if (typeof value !== "string") return "";
    return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function resolveQuotaWindow(quotas, windowName) {
    const direct = quotas[windowName];
    if (direct) return direct;
    const normalizedTarget = normalizeWindowKey(windowName);
    if (!normalizedTarget) return null;
    const prefixMatches = [];
    for (const [key, quota] of Object.entries(quotas)){
        const normalizedKey = normalizeWindowKey(key);
        if (!normalizedKey) continue;
        if (normalizedKey === normalizedTarget) return quota;
        // Support canonical selection of generic windows from labeled windows,
        // e.g. "weekly" from "weekly (7d)" or "session" from "session (5h)".
        if (normalizedKey.startsWith(`${normalizedTarget} `)) {
            prefixMatches.push({
                key,
                quota
            });
        }
    }
    // Deterministic fallback: choose the lexicographically first matching key.
    if (prefixMatches.length > 0) {
        prefixMatches.sort((a, b)=>a.key.localeCompare(b.key));
        return prefixMatches[0].quota;
    }
    return null;
}
function earliestResetAt(quotas) {
    let earliest = null;
    let earliestMs = Infinity;
    for (const q of Object.values(quotas)){
        if (!q.resetAt) continue;
        const ms = parseDate(q.resetAt);
        if (ms !== null && ms < earliestMs) {
            earliestMs = ms;
            earliest = q.resetAt;
        }
    }
    return earliest;
}
function quotaSnapshotChanged(prior, windowKey, remainingPercentage, exhausted) {
    if (!prior) return true;
    const priorWindow = prior.quotas?.[windowKey];
    if (!priorWindow) return true;
    return priorWindow.remainingPercentage !== remainingPercentage || (prior.exhausted ?? false) !== exhausted;
}
function normalizeQuotas(rawQuotas) {
    const result = {};
    for (const [key, q] of Object.entries(rawQuotas)){
        if (q && typeof q === "object") {
            result[key] = {
                remainingPercentage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["safePercentage"])(q.remainingPercentage) ?? (q.total > 0 ? Math.round((q.total - (q.used || 0)) / q.total * 100) : 0),
                resetAt: q.resetAt || null
            };
        }
    }
    return result;
}
function __clearForTests() {
    getState().cache.clear();
}
function resolveAntigravityQuotaWindowsForModel(quotaNames, requestedModel) {
    const requestedFamily = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getAntigravityQuotaFamily"])(requestedModel);
    const cleanRequestedModel = requestedModel.replace(/^(antigravity|agy)\//, "");
    const bareModel = cleanRequestedModel.includes("/") ? cleanRequestedModel.slice(cleanRequestedModel.lastIndexOf("/") + 1) : cleanRequestedModel;
    if (requestedFamily === "other") {
        return quotaNames.filter((windowName)=>{
            const bare = windowName.replace(/^(antigravity|agy)\//, "");
            return bare === bareModel || bare === cleanRequestedModel;
        });
    }
    const familyAggregates = requestedFamily === "gemini" ? [
        "gemini_weekly"
    ] : requestedFamily === "claude" ? [
        "claude_gpt_weekly"
    ] : [];
    const exactWindows = quotaNames.filter((windowName)=>{
        const bare = windowName.replace(/^(antigravity|agy)\//, "");
        return bare === bareModel;
    });
    const aggregateWindows = familyAggregates.filter((key)=>quotaNames.includes(key));
    const scoped = [
        ...exactWindows,
        ...aggregateWindows
    ];
    if (scoped.length > 0) return scoped;
    return quotaNames.filter((windowName)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getAntigravityQuotaFamily"])(windowName) === requestedFamily);
}
function isAntigravityQuotaExhausted(connectionId, entry, requestedModel) {
    if (!requestedModel) return entry.exhausted;
    const quotaNames = Object.keys(entry.quotas || {});
    if (quotaNames.length === 0) return entry.exhausted;
    const matchingWindows = resolveAntigravityQuotaWindowsForModel(quotaNames, requestedModel);
    return matchingWindows.length > 0 && matchingWindows.every((windowName)=>getQuotaWindowStatus(connectionId, windowName, DEFAULT_QUOTA_THRESHOLD_PERCENT)?.reachedThreshold);
}
function isCodexQuotaExhausted(connectionId, entry, requestedModel) {
    if (!requestedModel) return entry.exhausted;
    const quotaNames = Object.keys(entry.quotas || {});
    if (quotaNames.length === 0) return entry.exhausted;
    const filterWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getCodexQuotaWindowFilterForModel"])(requestedModel);
    const scopedWindowNames = quotaNames.filter((windowName)=>filterWindow?.(windowName));
    return scopedWindowNames.length > 0 && scopedWindowNames.every((windowName)=>getQuotaWindowStatus(connectionId, windowName, DEFAULT_QUOTA_THRESHOLD_PERCENT)?.reachedThreshold);
}
function isStandardQuotaExhausted(entry, now) {
    if (!entry.exhausted) return false;
    const age = now - entry.fetchedAt;
    if (!entry.nextResetAt && age > EXHAUSTED_TTL_MS) return false;
    return true;
}
function isQuotaExhaustedForRequest(connectionId, provider, requestedModel = null) {
    const entry = getState().cache.get(connectionId) || hydrateQuotaCacheFromSnapshots(connectionId);
    if (!entry) return false;
    const now = Date.now();
    const advanced = advancedWindowResetAt(entry, now);
    if (advanced) {
        entry.exhausted = false;
        return false;
    }
    if (provider === "antigravity" || provider === "agy") {
        return isAntigravityQuotaExhausted(connectionId, entry, requestedModel);
    }
    if (provider === "codex") {
        return isCodexQuotaExhausted(connectionId, entry, requestedModel);
    }
    // Standard (non-per-model-quota) providers: check connection-wide aggregate
    return isStandardQuotaExhausted(entry, now);
}
function setQuotaCache(connectionId, provider, rawQuotas) {
    const quotas = normalizeQuotas(rawQuotas);
    const exhausted = isExhausted(quotas);
    // #4438 — capture the prior entry BEFORE overwriting the cache so we can skip
    // redundant snapshot writes for idle connections whose quota didn't change.
    const prior = getState().cache.get(connectionId);
    const entry = {
        connectionId,
        provider,
        quotas,
        fetchedAt: Date.now(),
        exhausted,
        nextResetAt: exhausted ? earliestResetAt(quotas) : null
    };
    getState().cache.set(connectionId, entry);
    if (entry && rawQuotas) {
        for (const [windowKey, quotaInfo] of Object.entries(rawQuotas)){
            if (!quotaInfo || typeof quotaInfo !== "object") continue;
            const remainingPercentage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["safePercentage"])(quotaInfo.remainingPercentage) ?? (quotaInfo.total > 0 ? Math.round((quotaInfo.total - (quotaInfo.used || 0)) / quotaInfo.total * 100) : 0);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaResetEvents$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["recordProviderQuotaResetEventIfChanged"])({
                provider,
                connectionId,
                windowKey,
                currentResetAt: quotaInfo.resetAt ?? null,
                currentRemainingPercentage: remainingPercentage,
                previousObservation: prior?.quotas?.[windowKey] ? {
                    resetAt: prior.quotas[windowKey].resetAt,
                    remainingPercentage: prior.quotas[windowKey].remainingPercentage
                } : null
            });
            // #5923 (Finding #5) — is_exhausted must reflect THIS window's own remaining
            // percentage, not the connection-wide AND-across-all-windows aggregate
            // (`entry.exhausted`). A connection with one 0% window and other non-zero
            // windows previously never flagged that window's row as exhausted.
            const windowExhausted = remainingPercentage <= 0;
            // #4438 — only persist on the first observation or a real change.
            if (!quotaSnapshotChanged(prior, windowKey, remainingPercentage, windowExhausted)) continue;
            try {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["saveQuotaSnapshot"])({
                    provider,
                    connection_id: connectionId,
                    window_key: windowKey,
                    remaining_percentage: remainingPercentage,
                    is_exhausted: windowExhausted ? 1 : 0,
                    next_reset_at: quotaInfo.resetAt ?? null,
                    window_duration_ms: entry.windowDurationMs ?? null,
                    raw_data: null
                });
            } catch (error) {
                console.error("[quotaCache] Failed to save snapshot:", error);
            }
        }
    }
}
function getQuotaCache(connectionId) {
    return getState().cache.get(connectionId) || null;
}
function hydrateQuotaCacheFromSnapshots(connectionId) {
    const { cache } = getState();
    if (cache.has(connectionId)) return cache.get(connectionId) || null;
    let snapshots;
    try {
        snapshots = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getLatestQuotaSnapshotsForConnection"])(connectionId);
    } catch  {
        return null;
    }
    if (!snapshots.length) return null;
    const quotas = {};
    let provider = "";
    let fetchedAt = 0;
    let windowDurationMs = null;
    for (const snapshot of snapshots){
        const camelSnapshot = snapshot;
        const windowKey = camelSnapshot.windowKey ?? snapshot.window_key;
        if (!windowKey) continue;
        provider = provider || snapshot.provider || "";
        quotas[windowKey] = {
            remainingPercentage: clampPercent(Number(camelSnapshot.remainingPercentage ?? snapshot.remaining_percentage ?? 0)),
            resetAt: camelSnapshot.nextResetAt ?? snapshot.next_reset_at ?? null
        };
        const snapshotWindowDurationMs = camelSnapshot.windowDurationMs ?? snapshot.window_duration_ms ?? null;
        if (snapshotWindowDurationMs && snapshotWindowDurationMs > 0) {
            windowDurationMs = snapshotWindowDurationMs;
        }
        const createdAtVal = camelSnapshot.createdAt ?? snapshot.created_at;
        const createdAtMs = createdAtVal ? parseDate(createdAtVal) : null;
        if (createdAtMs !== null) fetchedAt = Math.max(fetchedAt, createdAtMs);
    }
    if (Object.keys(quotas).length === 0) return null;
    const exhausted = isExhausted(quotas);
    const entry = {
        connectionId,
        provider,
        quotas,
        fetchedAt: fetchedAt || Date.now(),
        exhausted,
        nextResetAt: exhausted ? earliestResetAt(quotas) : null,
        windowDurationMs
    };
    cache.set(connectionId, entry);
    return entry;
}
function isAccountQuotaExhausted(connectionId) {
    const entry = getState().cache.get(connectionId) || hydrateQuotaCacheFromSnapshots(connectionId);
    if (!entry) return false;
    if (!entry.exhausted) return false;
    const now = Date.now();
    // T08 — Auto window advance: if resetAt is in the past, eagerly treat as not exhausted.
    // This prevents stale exhaustion blocking when background refresh hasn't run yet.
    const advanced = advancedWindowResetAt(entry, now);
    if (advanced) {
        // Optimistically clear the exhausted flag so we unblock requests immediately.
        // The next background refresh will update with the real quota state.
        entry.exhausted = false;
        return false;
    }
    // Exhausted entries without resetAt expire after fixed TTL
    const age = now - entry.fetchedAt;
    if (!entry.nextResetAt && age > EXHAUSTED_TTL_MS) return false;
    return true;
}
function getQuotaWindowStatus(connectionId, windowName, thresholdPercent = DEFAULT_QUOTA_THRESHOLD_PERCENT) {
    const entry = getState().cache.get(connectionId) || hydrateQuotaCacheFromSnapshots(connectionId);
    if (!entry) return null;
    const now = Date.now();
    const window = resolveQuotaWindow(entry.quotas, windowName);
    if (!window) return null;
    const remainingPercentage = clampPercent(window.remainingPercentage);
    const usedPercentage = clampPercent(100 - remainingPercentage);
    let resetAt = window.resetAt || null;
    let windowExpired = false;
    if (resetAt) {
        const resetMs = parseDate(resetAt);
        if (resetMs !== null && resetMs <= now) {
            resetAt = null;
            windowExpired = true;
        }
    }
    return {
        remainingPercentage,
        usedPercentage,
        resetAt,
        // If reset time has already passed, avoid stale cached percentages blocking selection.
        reachedThreshold: windowExpired ? false : remainingPercentage <= 0 ? true : usedPercentage >= thresholdPercent
    };
}
function markAccountExhaustedFrom429(connectionId, provider) {
    getState().cache.set(connectionId, {
        connectionId,
        provider,
        quotas: {},
        fetchedAt: Date.now(),
        exhausted: true,
        nextResetAt: null
    });
}
// ─── Background Refresh ─────────────────────────────────────────────────────
async function refreshEntry(entry) {
    const { cache, refreshingSet } = getState();
    if (refreshingSet.has(entry.connectionId)) return;
    refreshingSet.add(entry.connectionId);
    try {
        const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(entry.connectionId);
        if (!connection || connection.authType !== "oauth" || !connection.isActive) {
            cache.delete(entry.connectionId);
            return;
        }
        const proxyInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(entry.connectionId);
        const usage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyInfo?.proxy || null, ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUsageForProvider"])(connection));
        if (usage?.quotas) {
            setQuotaCache(entry.connectionId, entry.provider, usage.quotas);
        }
    } catch (err) {
        console.warn(`[QuotaCache] Refresh failed for ${entry.connectionId.slice(0, 8)}:`, err?.message || err);
    } finally{
        refreshingSet.delete(entry.connectionId);
    }
}
function needsRefresh(entry, now) {
    const age = now - entry.fetchedAt;
    if (entry.exhausted) {
        if (entry.nextResetAt) {
            const resetMs = parseDate(entry.nextResetAt);
            if (resetMs !== null && resetMs <= now) return true;
        }
        return age >= EXHAUSTED_REFRESH_MS;
    }
    return age >= ACTIVE_TTL_MS;
}
async function backgroundRefreshTick() {
    const state = getState();
    if (state.tickRunning) return;
    state.tickRunning = true;
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cleanupOldSnapshots"])();
        const now = Date.now();
        const pending = [
            ...state.cache.values()
        ].filter((e)=>needsRefresh(e, now));
        // Refresh in batches to avoid thundering herd
        for(let i = 0; i < pending.length; i += MAX_CONCURRENT_REFRESHES){
            const batch = pending.slice(i, i + MAX_CONCURRENT_REFRESHES);
            await Promise.allSettled(batch.map(refreshEntry));
        }
    } finally{
        state.tickRunning = false;
    }
}
function startBackgroundRefresh() {
    const state = getState();
    if (state.refreshTimer) return;
    state.refreshTimer = setInterval(backgroundRefreshTick, REFRESH_INTERVAL_MS);
    state.refreshTimer?.unref?.();
}
function stopBackgroundRefresh() {
    const state = getState();
    if (state.refreshTimer) {
        clearInterval(state.refreshTimer);
        state.refreshTimer = null;
    }
}
function getQuotaCacheStats() {
    const entries = [];
    const { cache } = getState();
    for (const entry of cache.values()){
        entries.push({
            connectionId: entry.connectionId.slice(0, 8) + "...",
            provider: entry.provider,
            exhausted: entry.exhausted,
            nextResetAt: entry.nextResetAt,
            ageMs: Date.now() - entry.fetchedAt
        });
    }
    return {
        total: cache.size,
        entries
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/mitm/inspector/types.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "InterceptedRequestSchema",
    ()=>InterceptedRequestSchema
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const InterceptedRequestSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().uuid(),
    source: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "agent-bridge",
        "custom-host",
        "http-proxy",
        "system-proxy",
        "tproxy"
    ]),
    agent: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    timestamp: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().datetime(),
    method: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    host: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    requestHeaders: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
    requestBody: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
    requestSize: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    responseHeaders: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
    responseBody: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
    responseSize: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    status: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].union([
        __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int(),
        __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal("in-flight"),
        __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal("error")
    ]),
    proxyLatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional(),
    upstreamLatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional(),
    totalLatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional(),
    error: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    sourceModel: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable().optional(),
    mappedModel: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable().optional(),
    detectedKind: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "llm",
        "app",
        "unknown"
    ]).optional(),
    contextKey: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    annotation: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    sessionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().uuid().optional(),
    note: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    pid: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative().optional(),
    processName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$pipeline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/pipeline.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$pipeline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$pipeline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function proxy(request) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$pipeline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["runAuthzPipeline"])(request, {
        enforce: true
    });
}
const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/home",
        "/home/:path*",
        "/api/:path*",
        "/v1/:path*",
        "/v1",
        "/v1beta/:path*",
        "/v1beta",
        "/chat/:path*",
        "/responses/:path*",
        "/responses",
        "/codex/:path*",
        "/codex",
        "/models"
    ]
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_0v4j50b._.js.map