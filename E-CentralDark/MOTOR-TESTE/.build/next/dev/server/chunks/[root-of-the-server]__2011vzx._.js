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
"[project]/src/domain/degradation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Graceful Degradation Framework
 *
 * Provides a standardized pattern for services that depend on external
 * systems (Redis, vector databases, SSH, external APIs) to degrade
 * capability instead of failing completely.
 *
 * Hierarchy: Full → Reduced → Minimal → Safe Default
 *
 * Each service wraps its external calls with withDegradation(), which
 * tries the primary path, falls back to a secondary, and ultimately
 * returns a safe default if all backends are unavailable.
 */ /** Degradation levels from best to worst */ __turbopack_context__.s([
    "getDegradationReport",
    ()=>getDegradationReport,
    "getDegradationSummary",
    ()=>getDegradationSummary,
    "getFeatureStatus",
    ()=>getFeatureStatus,
    "hasAnyDegradation",
    ()=>hasAnyDegradation,
    "resetDegradationRegistry",
    ()=>resetDegradationRegistry,
    "withDegradation",
    ()=>withDegradation,
    "withDegradationSync",
    ()=>withDegradationSync
]);
// ── Global degradation registry ─────────────────────────────────────────────
const registry = new Map();
async function withDegradation(feature, primary, fallback, safeDefault, options) {
    const now = new Date().toISOString();
    // Try primary
    try {
        const result = await primary();
        const status = {
            level: "full",
            feature,
            capability: options?.fullCapability ?? "Full capability",
            reason: "",
            since: now
        };
        updateRegistry(feature, status);
        return {
            result,
            status
        };
    } catch (primaryError) {
        // Primary failed, try fallback
        try {
            const result = await fallback();
            const status = {
                level: "reduced",
                feature,
                capability: options?.reducedCapability ?? "Reduced capability (fallback active)",
                reason: primaryError instanceof Error ? primaryError.message : String(primaryError),
                since: now
            };
            updateRegistry(feature, status);
            options?.onDegrade?.(status);
            return {
                result,
                status
            };
        } catch (fallbackError) {
            // Both failed, return safe default
            const reason = [
                primaryError instanceof Error ? primaryError.message : String(primaryError),
                fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
            ].join(" → ");
            const status = {
                level: "default",
                feature,
                capability: options?.defaultCapability ?? "Safe default (all backends unavailable)",
                reason,
                since: now
            };
            updateRegistry(feature, status);
            options?.onDegrade?.(status);
            return {
                result: safeDefault,
                status
            };
        }
    }
}
function withDegradationSync(feature, primary, fallback, safeDefault, options) {
    const now = new Date().toISOString();
    try {
        const result = primary();
        const status = {
            level: "full",
            feature,
            capability: options?.fullCapability ?? "Full capability",
            reason: "",
            since: now
        };
        updateRegistry(feature, status);
        return {
            result,
            status
        };
    } catch (primaryError) {
        try {
            const result = fallback();
            const status = {
                level: "reduced",
                feature,
                capability: options?.reducedCapability ?? "Reduced capability",
                reason: primaryError instanceof Error ? primaryError.message : String(primaryError),
                since: now
            };
            updateRegistry(feature, status);
            options?.onDegrade?.(status);
            return {
                result,
                status
            };
        } catch (fallbackError) {
            const status = {
                level: "default",
                feature,
                capability: options?.defaultCapability ?? "Safe default",
                reason: `${primaryError} → ${fallbackError}`,
                since: now
            };
            updateRegistry(feature, status);
            options?.onDegrade?.(status);
            return {
                result: safeDefault,
                status
            };
        }
    }
}
// ── Registry management ─────────────────────────────────────────────────────
function updateRegistry(feature, status) {
    const existing = registry.get(feature);
    // Only update 'since' if level actually changed
    if (existing && existing.level === status.level) {
        status.since = existing.since;
    }
    registry.set(feature, status);
}
function getDegradationReport() {
    return Array.from(registry.values()).sort((a, b)=>{
        const order = {
            default: 0,
            minimal: 1,
            reduced: 2,
            full: 3
        };
        return (order[a.level] ?? 4) - (order[b.level] ?? 4);
    });
}
function getFeatureStatus(feature) {
    return registry.get(feature) ?? null;
}
function hasAnyDegradation() {
    for (const status of registry.values()){
        if (status.level !== "full") return true;
    }
    return false;
}
function getDegradationSummary() {
    const summary = {
        full: 0,
        reduced: 0,
        minimal: 0,
        default: 0
    };
    for (const status of registry.values()){
        summary[status.level]++;
    }
    return summary;
}
function resetDegradationRegistry() {
    registry.clear();
}
}),
"[project]/src/app/api/health/degradation/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$degradation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/degradation.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    try {
        const url = new URL(req.url);
        const summaryStr = url.searchParams.get("summary");
        if (summaryStr === "true") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                summary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$degradation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDegradationSummary"])(),
                isDegraded: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$degradation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasAnyDegradation"])()
            });
        }
        const report = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$degradation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDegradationReport"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            active: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$degradation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasAnyDegradation"])(),
            summary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$degradation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDegradationSummary"])(),
            features: report
        });
    } catch (error) {
        console.error("[API ERROR] /api/health/degradation GET:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch degradation report."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2011vzx._.js.map