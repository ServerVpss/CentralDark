module.exports = [
"[project]/src/lib/runtime/ports.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/shared/services/modelSyncScheduler.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildModelSyncInternalHeaders",
    ()=>buildModelSyncInternalHeaders,
    "createPinnedModelSyncTlsConnector",
    ()=>createPinnedModelSyncTlsConnector,
    "fetchModelSyncInternal",
    ()=>fetchModelSyncInternal,
    "getLastModelSyncTime",
    ()=>getLastModelSyncTime,
    "getModelSyncInternalAuthHeaderName",
    ()=>getModelSyncInternalAuthHeaderName,
    "getModelSyncInternalBaseUrl",
    ()=>getModelSyncInternalBaseUrl,
    "isModelSyncInternalRequest",
    ()=>isModelSyncInternalRequest,
    "resolveModelSyncInternalBaseUrl",
    ()=>resolveModelSyncInternalBaseUrl,
    "startModelSyncScheduler",
    ()=>startModelSyncScheduler,
    "stopModelSyncScheduler",
    ()=>stopModelSyncScheduler
]);
/**
 * Model Auto-Sync Scheduler (#488)
 *
 * Automatically refreshes model lists for provider connections that have
 * autoSync enabled in their providerSpecificData, at a configurable
 * interval (default: 24h).
 *
 * Pattern mirrors cloudSyncScheduler.ts for consistency.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/undici/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$runtime$2f$ports$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/runtime/ports.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MODEL_SYNC_SETTING_KEY = "model_sync_last_run";
const MODEL_SYNC_INTERNAL_AUTH_HEADER = "x-model-sync-internal-auth";
function normalizeInternalBasePath(value) {
    const trimmed = value?.trim();
    if (!trimmed || trimmed === "/") return "";
    if (!trimmed.startsWith("/") || /[?#\\]/.test(trimmed)) return "";
    const segments = trimmed.split("/").filter(Boolean);
    if (segments.some((segment)=>segment === "." || segment === "..")) return "";
    return `/${segments.join("/")}`;
}
function getModelSyncInternalBaseUrl() {
    return resolveModelSyncInternalBaseUrl();
}
function resolveModelSyncInternalBaseUrl(_candidate) {
    const { dashboardPort } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$runtime$2f$ports$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRuntimePorts"])();
    const nativeTls = process.env.OMNIROUTE_INTERNAL_SCHEME === "https";
    const origin = nativeTls ? `https://localhost:${dashboardPort}` : `http://127.0.0.1:${dashboardPort}`;
    return `${origin}${normalizeInternalBasePath(process.env.OMNIROUTE_BASE_PATH)}`;
}
function createPinnedModelSyncTlsConnector(connect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildConnector"])({
    servername: "localhost"
})) {
    return (options, callback)=>connect({
            ...options,
            host: "localhost",
            hostname: "127.0.0.1",
            servername: "localhost"
        }, callback);
}
let pinnedModelSyncTlsDispatcher = null;
function getPinnedModelSyncTlsDispatcher() {
    if (!pinnedModelSyncTlsDispatcher) {
        pinnedModelSyncTlsDispatcher = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Agent"]({
            connect: createPinnedModelSyncTlsConnector(),
            connections: 8,
            pipelining: 0
        });
    }
    return pinnedModelSyncTlsDispatcher;
}
const fetchWithDispatcher = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetch"];
const fetchModelSyncInternal = async (input, init = {})=>{
    const inputUrl = typeof input === "string" || input instanceof URL ? new URL(input) : new URL(input.url);
    const expectedBase = new URL(getModelSyncInternalBaseUrl());
    if (inputUrl.protocol !== expectedBase.protocol || inputUrl.hostname !== expectedBase.hostname || inputUrl.port !== expectedBase.port || inputUrl.username || inputUrl.password) {
        throw new TypeError("model sync internal fetch must target the active dashboard listener");
    }
    const basePath = expectedBase.pathname === "/" ? "" : expectedBase.pathname;
    if (basePath && inputUrl.pathname !== basePath && !inputUrl.pathname.startsWith(`${basePath}/`)) {
        throw new TypeError("model sync internal fetch must stay under the configured base path");
    }
    const requestInit = {
        ...init,
        redirect: "error"
    };
    if (inputUrl.protocol === "https:") {
        return fetchWithDispatcher(inputUrl, {
            ...requestInit,
            dispatcher: getPinnedModelSyncTlsDispatcher()
        });
    }
    return globalThis.fetch(inputUrl.href, requestInit);
};
const globalState = globalThis;
let schedulerTimer = null;
let isRunning = false;
let internalAuthToken = null;
function getInternalAuthToken() {
    if (!internalAuthToken) {
        internalAuthToken = globalState.__omnirouteModelSyncInternalAuthToken || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        globalState.__omnirouteModelSyncInternalAuthToken = internalAuthToken;
    }
    return internalAuthToken;
}
function getModelSyncInternalAuthHeaderName() {
    return MODEL_SYNC_INTERNAL_AUTH_HEADER;
}
function buildModelSyncInternalHeaders() {
    return {
        [MODEL_SYNC_INTERNAL_AUTH_HEADER]: getInternalAuthToken()
    };
}
function isModelSyncInternalRequest(request) {
    if (!internalAuthToken && globalState.__omnirouteModelSyncInternalAuthToken) {
        internalAuthToken = globalState.__omnirouteModelSyncInternalAuthToken;
    }
    const headerToken = request.headers.get(MODEL_SYNC_INTERNAL_AUTH_HEADER);
    return Boolean(headerToken && internalAuthToken && headerToken === internalAuthToken);
}
/**
 * Fetch all provider connections that have autoSync enabled.
 */ async function getAutoSyncConnections() {
    try {
        const { getProviderConnections } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
        const connections = await getProviderConnections();
        const autoSyncConnections = [];
        for (const conn of connections){
            if (!conn.isActive && conn.isActive !== undefined) continue;
            const psd = conn.providerSpecificData && typeof conn.providerSpecificData === "object" ? conn.providerSpecificData : {};
            if (psd.autoSync !== true) continue;
            if (typeof conn.id !== "string" || typeof conn.provider !== "string") continue;
            autoSyncConnections.push({
                id: conn.id,
                provider: conn.provider,
                ...typeof conn.name === "string" ? {
                    name: conn.name
                } : {}
            });
        }
        return autoSyncConnections;
    } catch (err) {
        console.warn("[ModelSync] Failed to load connections:", err.message);
        return [];
    }
}
/**
 * Sync models for a single connection via the internal sync-models endpoint.
 */ async function syncConnectionModels(connectionId, provider, baseUrl) {
    try {
        const res = await fetchModelSyncInternal(`${baseUrl}/api/providers/${connectionId}/sync-models`, {
            method: "POST",
            redirect: "error",
            headers: {
                "Content-Type": "application/json",
                ...buildModelSyncInternalHeaders()
            }
        });
        if (!res.ok) {
            console.warn(`[ModelSync] ${provider} (${connectionId.slice(0, 8)}): sync returned ${res.status}`);
            return false;
        }
        const data = await res.json();
        console.log(`[ModelSync] ${provider} (${connectionId.slice(0, 8)}): ✓ ${data.syncedModels || 0} models`);
        return true;
    } catch (err) {
        console.warn(`[ModelSync] ${provider} (${connectionId.slice(0, 8)}): fetch failed —`, err.message);
        return false;
    }
}
/**
 * Run one full model-sync cycle across all auto-sync connections.
 */ async function runSyncCycle(apiBaseUrl) {
    if (isRunning) {
        console.log("[ModelSync] Skipping cycle — previous run still in progress");
        return;
    }
    isRunning = true;
    const start = Date.now();
    try {
        const connections = await getAutoSyncConnections();
        if (connections.length === 0) {
            console.log("[ModelSync] No connections with autoSync enabled — skipping cycle");
            return;
        }
        console.log(`[ModelSync] Starting model sync cycle — ${connections.length} connection(s)`);
        const results = await Promise.allSettled(connections.map((conn)=>syncConnectionModels(conn.id, conn.name || conn.provider, apiBaseUrl)));
        const succeeded = results.filter((r)=>r.status === "fulfilled" && r.value === true).length;
        console.log(`[ModelSync] Cycle complete: ${succeeded}/${connections.length} synced in ${Date.now() - start}ms`);
        // Record last sync time
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateSettings"])({
                [MODEL_SYNC_SETTING_KEY]: new Date().toISOString()
            });
        } catch  {
        // Non-critical
        }
    } finally{
        isRunning = false;
    }
}
function startModelSyncScheduler(apiBaseUrl = getModelSyncInternalBaseUrl(), intervalMs = DEFAULT_INTERVAL_MS) {
    if (schedulerTimer) {
        console.log("[ModelSync] Scheduler already running — skipping start");
        return;
    }
    // Read MODEL_SYNC_INTERVAL_HOURS env override
    const envHours = parseInt(process.env.MODEL_SYNC_INTERVAL_HOURS ?? "", 10);
    const effectiveIntervalMs = !isNaN(envHours) && envHours > 0 ? envHours * 60 * 60 * 1000 : intervalMs;
    const trustedApiBaseUrl = resolveModelSyncInternalBaseUrl(apiBaseUrl);
    console.log(`[ModelSync] Scheduler started — interval: ${effectiveIntervalMs / 3_600_000}h`);
    // Run immediately on startup (staggered by 5s to avoid startup congestion)
    const startupDelay = setTimeout(()=>runSyncCycle(trustedApiBaseUrl), 5_000);
    startupDelay.unref?.();
    // Codex-only: revalidate catalog only on first-start or app upgrade (not every boot).
    void __turbopack_context__.A("[project]/src/shared/services/codexCatalogRevalidation.ts [app-route] (ecmascript, async loader)").then(({ scheduleCodexCatalogRevalidation })=>{
        scheduleCodexCatalogRevalidation({
            apiBaseUrl: trustedApiBaseUrl
        });
    }).catch(()=>{
    // silent
    });
    // Then run on the regular interval
    schedulerTimer = setInterval(()=>runSyncCycle(trustedApiBaseUrl), effectiveIntervalMs);
    schedulerTimer.unref?.();
}
function stopModelSyncScheduler() {
    if (schedulerTimer) {
        clearInterval(schedulerTimer);
        schedulerTimer = null;
        console.log("[ModelSync] Scheduler stopped");
    }
}
async function getLastModelSyncTime() {
    try {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        return settings[MODEL_SYNC_SETTING_KEY] ?? null;
    } catch  {
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_14filst._.js.map