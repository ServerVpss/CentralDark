module.exports = [
"[project]/src/shared/services/codexCatalogRevalidation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CODEX_CATALOG_REVALIDATED_VERSION_KEY",
    ()=>CODEX_CATALOG_REVALIDATED_VERSION_KEY,
    "createCodexCatalogRevalidationCoordinator",
    ()=>createCodexCatalogRevalidationCoordinator,
    "executeCodexCatalogRevalidation",
    ()=>executeCodexCatalogRevalidation,
    "liveResyncCodexConnections",
    ()=>liveResyncCodexConnections,
    "resolveBootRevalidationReason",
    ()=>resolveBootRevalidationReason,
    "resolveCodexCatalogAppVersion",
    ()=>resolveCodexCatalogAppVersion,
    "revalidateCodexCatalogs",
    ()=>revalidateCodexCatalogs,
    "revalidateCodexCatalogsOnStartup",
    ()=>revalidateCodexCatalogsOnStartup,
    "scheduleCodexCatalogRevalidation",
    ()=>scheduleCodexCatalogRevalidation,
    "scheduleCodexCatalogRevalidationAfterInit",
    ()=>scheduleCodexCatalogRevalidationAfterInit,
    "scrubCodexPersistedCatalogs",
    ()=>scrubCodexPersistedCatalogs,
    "scrubSyncedModelsWithCodexDenylist",
    ()=>scrubSyncedModelsWithCodexDenylist,
    "waitForLoopbackHttpReady",
    ()=>waitForLoopbackHttpReady
]);
/**
 * Codex catalog revalidation (Codex provider only)
 *
 * Runs scrub + live re-sync only in three cases:
 *  1) first-start — no version marker yet
 *  2) upgrade — app version marker changed after update/reboot
 *  3) init — setup/onboarding just completed (explicit trigger)
 *
 * Success log (single line): kill deprecated models complete.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$codexDiscoveryPolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/codexDiscoveryPolicy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
const CODEX_CATALOG_REVALIDATED_VERSION_KEY = "codex_catalog_revalidated_version";
function readNonEmptyTextFile(filePath) {
    try {
        const value = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(filePath, "utf8").trim();
        return value || null;
    } catch  {
        return null;
    }
}
function readInstalledPackageVersion(runtimeRoot) {
    try {
        const pkg = JSON.parse((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(runtimeRoot, "package.json"), "utf8"));
        return typeof pkg.version === "string" && pkg.version.trim() ? pkg.version.trim() : null;
    } catch  {
        return null;
    }
}
function resolveCodexCatalogAppVersion(env = process.env, options = {}) {
    for (const value of [
        env.OMNIROUTE_BUILD_SHA,
        env.BUILD_SHA
    ]){
        if (typeof value === "string" && value.trim()) return `build:${value.trim()}`;
    }
    const runtimeRoot = options.runtimeRoot || process.cwd();
    const buildSha = readNonEmptyTextFile(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(runtimeRoot, "BUILD_SHA"));
    if (buildSha) return `build:${buildSha}`;
    for (const buildIdPath of [
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(runtimeRoot, ".build", "next", "BUILD_ID"),
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(runtimeRoot, ".next", "BUILD_ID")
    ]){
        const buildId = readNonEmptyTextFile(buildIdPath);
        if (buildId) return `next:${buildId}`;
    }
    const envPackageVersion = env.npm_package_version || env.OMNIROUTE_VERSION;
    if (typeof envPackageVersion === "string" && envPackageVersion.trim()) {
        return `pkg:${envPackageVersion.trim()}`;
    }
    const hasPackageVersionOverride = Object.prototype.hasOwnProperty.call(options, "packageVersion");
    const packageVersion = hasPackageVersionOverride ? options.packageVersion : readInstalledPackageVersion(runtimeRoot);
    return typeof packageVersion === "string" && packageVersion.trim() ? `pkg:${packageVersion.trim()}` : null;
}
function resolveBootRevalidationReason(previousVersion, appVersion) {
    if (!previousVersion || !String(previousVersion).trim()) return "first-start";
    if (String(previousVersion).trim() !== appVersion) return "upgrade";
    return null;
}
function scrubSyncedModelsWithCodexDenylist(models) {
    const removedIds = [];
    const kept = [];
    for (const model of models){
        if (!model?.id) continue;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$codexDiscoveryPolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCodexDiscoveryModelExcluded"])({
            id: model.id
        })) {
            removedIds.push(model.id);
            continue;
        }
        kept.push(model);
    }
    return {
        kept,
        removedIds
    };
}
async function scrubCodexPersistedCatalogs() {
    const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
        provider: "codex"
    });
    const removedIds = new Set();
    let connectionsChanged = 0;
    for (const connection of connections){
        const connectionId = String(connection.id || "");
        if (!connectionId) continue;
        const existing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedAvailableModelsForConnection"])("codex", connectionId);
        if (existing.length === 0) continue;
        const { kept, removedIds: removed } = scrubSyncedModelsWithCodexDenylist(existing);
        if (removed.length === 0) continue;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["replaceSyncedAvailableModelsForConnection"])("codex", connectionId, kept);
        connectionsChanged += 1;
        for (const id of removed)removedIds.add(id);
    }
    return {
        connections: connections.length,
        connectionsChanged,
        modelsRemoved: removedIds.size,
        removedIds: Array.from(removedIds).sort((a, b)=>a.localeCompare(b))
    };
}
async function listActiveCodexConnectionIds() {
    const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
        provider: "codex"
    });
    return connections.filter((conn)=>conn.isActive !== false).map((conn)=>({
            id: String(conn.id),
            name: typeof conn.name === "string" ? conn.name : undefined
        })).filter((conn)=>conn.id.length > 0);
}
async function waitForLoopbackHttpReady(options) {
    const maxWaitMs = options?.maxWaitMs ?? 15_000;
    const pollMs = options?.pollMs ?? 50;
    const { fetchModelSyncInternal, resolveModelSyncInternalBaseUrl } = await __turbopack_context__.A("[project]/src/shared/services/modelSyncScheduler.ts [app-route] (ecmascript, async loader)");
    const baseUrl = resolveModelSyncInternalBaseUrl(options?.apiBaseUrl);
    const deadline = Date.now() + maxWaitMs;
    let lastErr;
    while(Date.now() < deadline){
        try {
            const res = await fetchModelSyncInternal(`${baseUrl}/api/providers/__readiness_probe__/models`, {
                redirect: "error",
                signal: AbortSignal.timeout(1_500)
            });
            if (res.status >= 200 && res.status < 600) return;
        } catch (err) {
            lastErr = err;
        }
        await new Promise((r)=>setTimeout(r, pollMs));
    }
    throw new Error(`loopback not ready within ${maxWaitMs}ms: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`);
}
async function liveResyncCodexConnections(apiBaseUrl) {
    const connections = await listActiveCodexConnectionIds();
    if (connections.length === 0) {
        return {
            attempted: 0,
            succeeded: 0
        };
    }
    const { buildModelSyncInternalHeaders, fetchModelSyncInternal, resolveModelSyncInternalBaseUrl } = await __turbopack_context__.A("[project]/src/shared/services/modelSyncScheduler.ts [app-route] (ecmascript, async loader)");
    const base = resolveModelSyncInternalBaseUrl(apiBaseUrl);
    const results = await Promise.allSettled(connections.map(async (conn)=>{
        const res = await fetchModelSyncInternal(`${base}/api/providers/${conn.id}/sync-models?quiet=1`, {
            method: "POST",
            redirect: "error",
            headers: {
                "Content-Type": "application/json",
                ...buildModelSyncInternalHeaders()
            }
        });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        return true;
    }));
    const succeeded = results.filter((r)=>r.status === "fulfilled").length;
    return {
        attempted: connections.length,
        succeeded
    };
}
async function readPreviousVersionMarker() {
    try {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        const raw = settings?.[CODEX_CATALOG_REVALIDATED_VERSION_KEY];
        return typeof raw === "string" && raw.trim() ? raw.trim() : null;
    } catch  {
        return null;
    }
}
async function writeVersionMarker(appVersion) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateSettings"])({
            [CODEX_CATALOG_REVALIDATED_VERSION_KEY]: appVersion
        });
        return true;
    } catch  {
        return false;
    }
}
async function executeCodexCatalogRevalidation(options) {
    await options.scrub();
    try {
        await options.waitForReady();
    } catch  {
        return {
            complete: false,
            attempted: 0,
            succeeded: 0
        };
    }
    const syncResult = await options.liveResync();
    if (syncResult.succeeded !== syncResult.attempted) {
        return {
            complete: false,
            ...syncResult
        };
    }
    if (!options.appVersion) return {
        complete: false,
        ...syncResult
    };
    const markerWritten = await options.writeMarker(options.appVersion);
    if (!markerWritten) return {
        complete: false,
        ...syncResult
    };
    options.logSuccess();
    return {
        complete: true,
        ...syncResult
    };
}
function createCodexCatalogRevalidationCoordinator(run) {
    let activeRun = null;
    let activeReason = null;
    let queuedInit = null;
    return (options)=>{
        if (activeRun !== null) {
            if (options.reason === "init" && activeReason !== "init") {
                queuedInit = options;
            }
            return activeRun;
        }
        activeRun = (async ()=>{
            let current = options;
            let firstError;
            try {
                while(current){
                    activeReason = current.reason;
                    try {
                        await run(current);
                    } catch (error) {
                        firstError ??= error;
                    }
                    current = queuedInit;
                    queuedInit = null;
                }
            } finally{
                activeRun = null;
                activeReason = null;
            }
            if (firstError) throw firstError;
        })();
        return activeRun;
    };
}
/**
 * Run scrub + live re-sync for an explicit reason, then mark version.
 * Operator-facing success log is a single line.
 */ async function performCodexCatalogRevalidation(options) {
    const appVersion = resolveCodexCatalogAppVersion();
    const { resolveModelSyncInternalBaseUrl } = await __turbopack_context__.A("[project]/src/shared/services/modelSyncScheduler.ts [app-route] (ecmascript, async loader)");
    const apiBaseUrl = resolveModelSyncInternalBaseUrl(options.apiBaseUrl);
    await executeCodexCatalogRevalidation({
        appVersion,
        scrub: scrubCodexPersistedCatalogs,
        waitForReady: ()=>waitForLoopbackHttpReady({
                apiBaseUrl
            }),
        liveResync: ()=>liveResyncCodexConnections(apiBaseUrl),
        writeMarker: writeVersionMarker,
        logSuccess: ()=>console.log("kill deprecated models complete.")
    });
}
const requestCodexCatalogRevalidation = createCodexCatalogRevalidationCoordinator(performCodexCatalogRevalidation);
function revalidateCodexCatalogs(options) {
    return requestCodexCatalogRevalidation(options);
}
async function revalidateCodexCatalogsOnStartup(options) {
    const appVersion = resolveCodexCatalogAppVersion();
    const previousVersion = await readPreviousVersionMarker();
    const reason = appVersion ? resolveBootRevalidationReason(previousVersion, appVersion) : "first-start";
    if (!reason) return;
    await revalidateCodexCatalogs({
        apiBaseUrl: options?.apiBaseUrl,
        reason
    });
}
function scheduleRun(run) {
    const timer = setTimeout(()=>{
        void run().catch(()=>{
        // silent — success line only on full success
        });
    }, 0);
    timer.unref?.();
}
function scheduleCodexCatalogRevalidation(options) {
    scheduleRun(()=>revalidateCodexCatalogsOnStartup({
            apiBaseUrl: options?.apiBaseUrl
        }));
}
function scheduleCodexCatalogRevalidationAfterInit(options) {
    scheduleRun(()=>revalidateCodexCatalogs({
            apiBaseUrl: options?.apiBaseUrl,
            reason: "init"
        }));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_shared_services_codexCatalogRevalidation_ts_0qe9xp8._.js.map