module.exports = [
"[project]/src/lib/db/models/activeSyncedCatalog.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getActiveSyncedCatalog",
    ()=>getActiveSyncedCatalog,
    "getAllActiveSyncedModels",
    ()=>getAllActiveSyncedModels,
    "reconcileProvidersWithActiveSyncedCatalog",
    ()=>reconcileProvidersWithActiveSyncedCatalog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [middleware] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function resolveStoredProviderId(aliasOrId) {
    const normalized = aliasOrId.trim();
    if (!normalized) return "";
    if (Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"], normalized)) {
        return normalized;
    }
    for (const [providerId, alias] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"])){
        if (alias === normalized) return providerId;
    }
    return normalized;
}
function readConnectionRef(connection) {
    if (!connection || typeof connection !== "object") return null;
    const record = connection;
    if (typeof record.id !== "string" || record.id.length === 0 || typeof record.provider !== "string" || record.provider.length === 0) {
        return null;
    }
    return {
        id: record.id,
        provider: record.provider
    };
}
function collectModelsForConnections(modelsByConnection, connectionIds) {
    const models = new Map();
    for (const connectionId of connectionIds){
        for (const model of modelsByConnection[connectionId] || []){
            if (!model?.id || models.has(model.id)) continue;
            models.set(model.id, model);
        }
    }
    return Array.from(models.values());
}
async function getActiveSyncedCatalog(providerId) {
    const storedProviderId = resolveStoredProviderId(providerId);
    if (!storedProviderId) {
        return {
            authoritative: false,
            models: []
        };
    }
    try {
        const [connections, modelsByConnection] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRawProviderConnections"])({
                provider: storedProviderId,
                isActive: true
            }, undefined, undefined, [
                "id",
                "provider"
            ]),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedAvailableModelsByConnection"])(storedProviderId)
        ]);
        const activeConnectionIds = connections.map(readConnectionRef).filter((connection)=>connection !== null).map((connection)=>connection.id);
        const models = collectModelsForConnections(modelsByConnection, activeConnectionIds);
        return {
            authoritative: models.length > 0 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["providerUsesAuthoritativeLiveCatalog"])(providerId),
            models
        };
    } catch  {
        return {
            authoritative: false,
            models: []
        };
    }
}
async function getAllActiveSyncedModels() {
    try {
        const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRawProviderConnections"])({
            isActive: true
        }, undefined, undefined, [
            "id",
            "provider"
        ]);
        const connectionIdsByProvider = new Map();
        for (const rawConnection of connections){
            const connection = readConnectionRef(rawConnection);
            if (!connection) continue;
            if (!connectionIdsByProvider.has(connection.provider)) {
                connectionIdsByProvider.set(connection.provider, new Set());
            }
            connectionIdsByProvider.get(connection.provider).add(connection.id);
        }
        const result = {};
        await Promise.all(Array.from(connectionIdsByProvider.entries()).map(async ([providerId, connectionIds])=>{
            const modelsByConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedAvailableModelsByConnection"])(providerId);
            const models = collectModelsForConnections(modelsByConnection, connectionIds);
            if (models.length > 0) {
                result[providerId] = models;
            }
        }));
        return result;
    } catch  {
        return {};
    }
}
async function reconcileProvidersWithActiveSyncedCatalog(providerIds, modelId) {
    const uniqueProviders = Array.from(new Set(providerIds.filter((provider)=>typeof provider === "string" && provider.length > 0)));
    const states = await Promise.all(uniqueProviders.map(async (provider)=>({
            provider,
            catalog: await getActiveSyncedCatalog(provider)
        })));
    const providers = [];
    const excludedProviders = [];
    for (const { provider, catalog } of states){
        const modelIsLive = catalog.models.some((model)=>model.id === modelId);
        if (!catalog.authoritative || modelIsLive) {
            providers.push(provider);
        } else {
            excludedProviders.push(provider);
        }
    }
    return {
        providers,
        excludedProviders
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_db_models_activeSyncedCatalog_ts_0_7sax-._.js.map