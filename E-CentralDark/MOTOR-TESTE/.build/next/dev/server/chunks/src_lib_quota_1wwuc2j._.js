module.exports = [
"[project]/src/lib/quota/quotaModelNaming.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Deterministic naming helpers for quota virtual models (Phase B3).
 *
 * FORMAT: `qtSd/<groupSlug>/<provider>/<model>`
 *
 * The groupSlug is pure alphanumeric (no "-", no "/"), and the segments are
 * separated by "/" which makes parsing unambiguous: split on "/", take the
 * first 3 segments (prefix literal "qtSd", groupSlug, provider) and join the
 * remainder as the model id (model ids may contain "/" for namespaced models).
 */ __turbopack_context__.s([
    "QUOTA_MODEL_PREFIX",
    ()=>QUOTA_MODEL_PREFIX,
    "isQuotaModelName",
    ()=>isQuotaModelName,
    "parseQuotaModelName",
    ()=>parseQuotaModelName,
    "quotaGroupSlug",
    ()=>quotaGroupSlug,
    "quotaModelName",
    ()=>quotaModelName,
    "quotaPoolSlug",
    ()=>quotaPoolSlug
]);
const QUOTA_MODEL_PREFIX = "qtSd/";
function quotaGroupSlug(name) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return slug.length > 0 ? slug : "pool";
}
function quotaPoolSlug(poolName) {
    return quotaGroupSlug(poolName);
}
function quotaModelName(groupName, provider, model) {
    return `${QUOTA_MODEL_PREFIX}${quotaGroupSlug(groupName)}/${provider}/${model}`;
}
function parseQuotaModelName(name) {
    if (!name.startsWith(QUOTA_MODEL_PREFIX)) {
        return null;
    }
    // rest = "<groupSlug>/<provider>/<model>" (after "qtSd/")
    const rest = name.slice(QUOTA_MODEL_PREFIX.length);
    const parts = rest.split("/");
    // Need at least: groupSlug, provider, model  → 3 parts in rest
    if (parts.length < 3) {
        return null;
    }
    const groupSlug = parts[0];
    const provider = parts[1];
    const model = parts.slice(2).join("/");
    if (groupSlug.length === 0 || provider.length === 0 || model.length === 0) {
        return null;
    }
    return {
        groupSlug,
        provider,
        model
    };
}
function isQuotaModelName(name) {
    return name.startsWith(QUOTA_MODEL_PREFIX);
}
}),
"[project]/src/lib/quota/quotaKey.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "constrainConnectionsToQuota",
    ()=>constrainConnectionsToQuota,
    "reconcilePoolExclusivity",
    ()=>reconcilePoolExclusivity,
    "resolveQuotaKeyScope",
    ()=>resolveQuotaKeyScope
]);
/**
 * quota/quotaKey.ts — Resolve which connections and providers an API key may
 * use, based on its `allowedQuotas` pool-ID list.
 *
 * Also exports `reconcilePoolExclusivity` (Phase C3) which keeps each API
 * key's `allowedQuotas` in sync when a pool's allocations are saved with the
 * `exclusive` flag.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/quotaModelNaming.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaGroups.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
function constrainConnectionsToQuota(existing, quotaConnectionIds) {
    if (quotaConnectionIds.length === 0) return existing;
    if (existing.length === 0) return quotaConnectionIds;
    return existing.filter((id)=>quotaConnectionIds.includes(id));
}
async function resolveQuotaKeyScope(allowedQuotas) {
    if (!allowedQuotas || allowedQuotas.length === 0) {
        return {
            connectionIds: [],
            providers: [],
            poolSlugs: []
        };
    }
    const connectionIdSet = new Set();
    const providerSet = new Set();
    const groupSlugSet = new Set();
    // Collect the distinct group IDs reachable from the key's allowed pools.
    // Deduplicate: a key in 2 pools of the same group expands once.
    const groupIdSet = new Set();
    for (const poolId of allowedQuotas){
        const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPool"])(poolId);
        if (!pool) continue;
        groupIdSet.add(pool.groupId);
    }
    // For each distinct group, aggregate ALL pools in that group.
    for (const groupId of groupIdSet){
        const groupPools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPoolsByGroup"])(groupId);
        // Group-level "anyValidConnection" gate: include the group slug only when
        // at least one pool in the group has a usable connection.
        let groupHasValidConnection = false;
        for (const groupPool of groupPools){
            // D2: iterate ALL member connections (defensive fallback for un-backfilled rows).
            const connIds = Array.isArray(groupPool.connectionIds) && groupPool.connectionIds.length > 0 ? groupPool.connectionIds : [
                groupPool.connectionId
            ];
            for (const connId of connIds){
                const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(connId);
                if (!connection) continue; // missing connection contributes nothing
                const provider = connection.provider;
                if (typeof provider !== "string" || provider.length === 0) continue;
                connectionIdSet.add(connId);
                providerSet.add(provider);
                groupHasValidConnection = true;
            }
        }
        // Only expose the group slug when the group has at least one usable
        // connection — a fully-orphaned group has no qtSd/<groupSlug>/... models.
        if (groupHasValidConnection) {
            const groupName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGroupName"])(groupId) ?? groupId;
            groupSlugSet.add((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quotaGroupSlug"])(groupName));
        }
    }
    return {
        connectionIds: Array.from(connectionIdSet),
        providers: Array.from(providerSet),
        poolSlugs: Array.from(groupSlugSet)
    };
}
async function reconcilePoolExclusivity(poolId, prevApiKeyIds, nextApiKeyIds, exclusive) {
    const affectedIds = new Set([
        ...prevApiKeyIds,
        ...nextApiKeyIds
    ]);
    for (const keyId of affectedIds){
        try {
            const keyRow = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getApiKeyById"])(keyId);
            if (!keyRow) continue;
            const currentQuotas = Array.isArray(keyRow.allowedQuotas) ? keyRow.allowedQuotas : [];
            let nextQuotas;
            if (exclusive && nextApiKeyIds.includes(keyId)) {
                // Key is in the new allocation AND pool is exclusive → ensure poolId present.
                if (currentQuotas.includes(poolId)) {
                    continue; // no change needed
                }
                nextQuotas = [
                    ...currentQuotas,
                    poolId
                ];
            } else {
                // Pool is non-exclusive OR key was removed → ensure poolId absent.
                if (!currentQuotas.includes(poolId)) {
                    continue; // no change needed
                }
                nextQuotas = currentQuotas.filter((q)=>q !== poolId);
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateApiKeyPermissions"])(keyId, {
                allowedQuotas: nextQuotas
            });
        } catch  {
        // Defensive: a single key failure must never abort reconciliation for others.
        }
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_quota_1wwuc2j._.js.map