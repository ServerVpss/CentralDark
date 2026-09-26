module.exports = [
"[project]/src/server/cors/origins.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
];

//# sourceMappingURL=src_server_cors_origins_ts_0yhd4ti._.js.map