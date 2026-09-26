module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/shared/utils/cors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Static CORS headers for route handlers.
 *
 * `Access-Control-Allow-Origin` is intentionally NOT set here. The middleware
 * (`src/middleware.ts` → `applyCorsHeaders`) is the single source of truth for
 * which origin to echo, based on the central allowlist in
 * `src/server/cors/origins.ts`. Route handlers may keep spreading
 * `CORS_HEADERS` for the standard methods/allowed-headers; the middleware
 * overlays the proper origin on the way out.
 */ __turbopack_context__.s([
    "CORS_HEADERS",
    ()=>CORS_HEADERS,
    "handleCorsOptions",
    ()=>handleCorsOptions
]);
const CORS_HEADERS = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, anthropic-version, x-omniroute-connection, x-internal-test, accept"
};
function handleCorsOptions() {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
    });
}
}),
"[project]/src/app/api/v1/[...omnirouteCatchAll]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "HEAD",
    ()=>HEAD,
    "OPTIONS",
    ()=>OPTIONS,
    "PATCH",
    ()=>PATCH,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cors.ts [app-route] (ecmascript)");
;
/**
 * Catch-all fallback for /v1/* (and /api/v1/*) — issue #6405.
 *
 * Without this route, unknown /v1/* paths fell through to the Next.js app-router
 * `not-found.tsx`, which returned the dashboard HTML 404 to API clients. OpenAI-
 * compatible clients (and their SDKs) expect JSON with `error.type === "not_found"`
 * so they can surface the failure instead of crashing on an HTML parse.
 *
 * Static / dynamic segments under /api/v1/ take precedence over this catch-all in
 * Next.js App Router matching, so real routes like `/v1/models` and
 * `/v1/chat/completions` are unaffected.
 */ function notFoundResponse(request) {
    const url = new URL(request.url);
    return Response.json({
        error: {
            message: `Unknown API route: ${url.pathname}`,
            type: "not_found",
            code: "unknown_route",
            path: url.pathname
        }
    }, {
        status: 404,
        headers: {
            "Content-Type": "application/json",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
        }
    });
}
async function OPTIONS() {
    return new Response(null, {
        headers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
    });
}
async function GET(request) {
    return notFoundResponse(request);
}
async function POST(request) {
    return notFoundResponse(request);
}
async function PUT(request) {
    return notFoundResponse(request);
}
async function PATCH(request) {
    return notFoundResponse(request);
}
async function DELETE(request) {
    return notFoundResponse(request);
}
async function HEAD(request) {
    return notFoundResponse(request);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0h2_0_a._.js.map