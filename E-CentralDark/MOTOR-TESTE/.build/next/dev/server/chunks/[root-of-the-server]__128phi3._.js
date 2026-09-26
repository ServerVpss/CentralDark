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
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/domain/providerExpiration.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Provider Expiration Tracking
 *
 * Tracks OAuth token, subscription, and API credit expiration dates
 * per provider connection. Provides proactive alerts before expiration
 * so operators can re-authenticate or renew before failures occur.
 *
 * Prevents the common failure mode where an OAuth token or subscription
 * expires silently and requests start failing with 401/402 errors.
 */ /** Types of expiration events */ __turbopack_context__.s([
    "detectExpirationFromResponse",
    ()=>detectExpirationFromResponse,
    "getAllExpirations",
    ()=>getAllExpirations,
    "getExpiration",
    ()=>getExpiration,
    "getExpirationSummary",
    ()=>getExpirationSummary,
    "getExpiringSoon",
    ()=>getExpiringSoon,
    "removeExpiration",
    ()=>removeExpiration,
    "resetExpirations",
    ()=>resetExpirations,
    "setExpiration",
    ()=>setExpiration
]);
// ── In-memory store ──────────────────────────────────────────────────────────
// In production, this would be persisted to SQLite alongside other domain state.
// Using in-memory Map for the initial implementation.
const expirations = new Map();
/**
 * Calculate expiry status from an expiration date.
 */ function calculateStatus(expiresAt, alertDays) {
    if (!expiresAt) return "unknown";
    const now = new Date();
    const expiry = new Date(expiresAt);
    if (isNaN(expiry.getTime())) return "unknown";
    if (expiry <= now) return "expired";
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntilExpiry <= alertDays) return "expiring_soon";
    return "active";
}
function setExpiration(connectionId, provider, connectionName, expiresAt, expiryType, options) {
    const alertDays = options?.alertDays ?? 7;
    const status = calculateStatus(expiresAt, alertDays);
    const entry = {
        connectionId,
        provider,
        connectionName,
        expiresAt,
        expiryType,
        alertDays,
        lastChecked: new Date().toISOString(),
        status,
        note: options?.note ?? null
    };
    expirations.set(connectionId, entry);
    return entry;
}
function getExpiration(connectionId) {
    const entry = expirations.get(connectionId);
    if (!entry) return null;
    // Recalculate status (may have changed since last check)
    entry.status = calculateStatus(entry.expiresAt, entry.alertDays);
    return entry;
}
function getAllExpirations() {
    const result = [];
    for (const entry of expirations.values()){
        entry.status = calculateStatus(entry.expiresAt, entry.alertDays);
        result.push(entry);
    }
    return result.sort((a, b)=>{
        // Sort: expired first, then expiring_soon, then active, then unknown
        const order = {
            expired: 0,
            expiring_soon: 1,
            active: 2,
            unknown: 3
        };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    });
}
function getExpiringSoon() {
    return getAllExpirations().filter((e)=>e.status === "expired" || e.status === "expiring_soon");
}
function getExpirationSummary() {
    const all = getAllExpirations();
    const summary = {
        total: all.length,
        active: 0,
        expiringSoon: 0,
        expired: 0,
        unknown: 0,
        nextExpiration: null
    };
    let nearestMs = Infinity;
    for (const entry of all){
        switch(entry.status){
            case "active":
                summary.active++;
                break;
            case "expiring_soon":
                summary.expiringSoon++;
                break;
            case "expired":
                summary.expired++;
                break;
            case "unknown":
                summary.unknown++;
                break;
        }
        // Track nearest expiration
        if (entry.expiresAt) {
            const ms = new Date(entry.expiresAt).getTime() - Date.now();
            if (ms > 0 && ms < nearestMs) {
                nearestMs = ms;
                summary.nextExpiration = entry;
            }
        }
    }
    return summary;
}
function removeExpiration(connectionId) {
    return expirations.delete(connectionId);
}
function detectExpirationFromResponse(provider, status, headers) {
    // 401 with specific patterns → token expired
    if (status === 401) {
        return {
            expiresAt: new Date().toISOString(),
            expiryType: "oauth_token"
        };
    }
    // 402 → payment/subscription expired
    if (status === 402) {
        return {
            expiresAt: new Date().toISOString(),
            expiryType: "subscription"
        };
    }
    // Rate limit headers may indicate reset times
    const resetHeader = headers["x-ratelimit-reset"] || headers["x-ratelimit-reset-tokens"] || headers["retry-after"];
    if (resetHeader && status === 429) {
        const resetTime = parseInt(resetHeader, 10);
        if (!isNaN(resetTime)) {
            // Could be epoch seconds or seconds-from-now
            const date = resetTime > 1_000_000_000 ? new Date(resetTime * 1000) : new Date(Date.now() + resetTime * 1000);
            return {
                expiresAt: date.toISOString(),
                expiryType: "free_tier_reset"
            };
        }
    }
    return null;
}
function resetExpirations() {
    expirations.clear();
}
}),
"[project]/src/app/api/providers/expiration/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$providerExpiration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/providerExpiration.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const list = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$providerExpiration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllExpirations"])();
        const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$providerExpiration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getExpirationSummary"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            summary,
            list
        });
    } catch (error) {
        console.error("[API ERROR] /api/providers/expiration GET:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch expiration metadata."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__128phi3._.js.map