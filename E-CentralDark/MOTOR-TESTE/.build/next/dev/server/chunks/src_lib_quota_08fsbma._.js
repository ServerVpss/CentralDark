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
"[project]/src/lib/quota/quotaCombos.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "QUOTA_SHARE_STRATEGY",
    ()=>QUOTA_SHARE_STRATEGY,
    "buildQuotaExclusiveModels",
    ()=>buildQuotaExclusiveModels,
    "filterModelsToQuotaPools",
    ()=>filterModelsToQuotaPools,
    "removeQuotaCombosForPool",
    ()=>removeQuotaCombosForPool,
    "syncQuotaCombos",
    ()=>syncQuotaCombos
]);
/**
 * quota/quotaCombos.ts — Auto-mint / prune `quotaShared-*` virtual combo models
 * when a quota pool gains or loses allocations (Phase B2).
 *
 * Each combo routes to a single {provider, model} target and is pinned to the
 * pool's connectionId via ComboModelStep.connectionId (supported by the combo
 * target schema). Phase B4 wires resolution — this module only keeps the combo
 * rows in sync with the pool's provider model list.
 *
 * Guard: combo-sync failures never propagate to pool CRUD callers.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaGroups.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/quotaModelNaming.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
const QUOTA_SHARE_STRATEGY = "quota-share";
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createLogger"])("quota/quotaCombos");
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
/**
 * Resolve the pool record for combo-sync purposes.
 * Returns null when the pool cannot be found.
 * Individual connection lookups are deferred to syncQuotaCombos so that a
 * single missing connection does not abort the whole sync.
 *
 * B4: also resolves the GROUP NAME so that combos are named
 * `qtSd/<groupSlug>/...` instead of `qtSd/<poolSlug>/...`.
 * Falls back to pool.name when the group record is missing.
 */ async function resolvePoolForSync(poolId) {
    const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPool"])(poolId);
    if (!pool) return null;
    // Defensive: ensure connectionIds is always a non-empty array.
    const connectionIds = Array.isArray(pool.connectionIds) && pool.connectionIds.length > 0 ? pool.connectionIds : [
        pool.connectionId
    ];
    // B4: resolve the group name for combo naming.
    // Fall back to pool.name when the group is missing (legacy / test isolation).
    const groupName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGroupName"])(pool.groupId) ?? pool.name;
    return {
        pool: {
            id: pool.id,
            connectionId: pool.connectionId,
            connectionIds,
            name: pool.name,
            groupId: pool.groupId,
            groupName
        }
    };
}
/**
 * Return the list of model IDs for a provider from the provider REGISTRY — the
 * SAME source `/v1/models` uses. PROVIDER_MODELS only covers plain API providers
 * and is empty for CLI/OAuth providers (codex, kimi, claude, …), which silently
 * produced ZERO quotaShared-* combos. REGISTRY has all of them.
 * Empty array when the provider is unknown or has no registered models.
 */ function getProviderModelIds(provider) {
    const entry = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REGISTRY"][provider];
    const models = entry && Array.isArray(entry.models) ? entry.models : [];
    if (models.length === 0) return [];
    return models.map((m)=>typeof m === "object" && m !== null && typeof m.id === "string" ? m.id : null).filter((id)=>id !== null && id.length > 0);
}
async function syncQuotaCombos(poolId) {
    const resolved = await resolvePoolForSync(poolId);
    if (!resolved) {
        // Pool gone — prune any leftover combos (best effort).
        await removeQuotaCombosForPool(poolId);
        return;
    }
    const { pool } = resolved;
    // B4: use the GROUP name for combo naming (qtSd/<groupSlug>/...).
    // Falls back to pool.name when the group record is missing.
    const groupName = pool.groupName;
    const groupSlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quotaGroupSlug"])(groupName);
    // D2: build desired names as the UNION across ALL member connections.
    // A missing connection (no DB row / no provider field) is silently skipped —
    // it contributes nothing to the desired set but does NOT abort the whole sync.
    const desiredNames = new Set();
    // Track (connId, provider, modelIds) tuples for upsert, in order.
    const upsertWork = [];
    for (const connId of pool.connectionIds){
        let connection = null;
        try {
            connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(connId);
        } catch  {
            continue;
        }
        if (!connection) continue;
        const provider = connection.provider;
        if (typeof provider !== "string" || provider.length === 0) continue;
        const modelIds = getProviderModelIds(provider);
        if (modelIds.length === 0) continue;
        for (const modelId of modelIds){
            // B4: use groupName (not pool.name) as the first arg so combos carry the group slug.
            desiredNames.add((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quotaModelName"])(groupName, provider, modelId));
        }
        upsertWork.push({
            connId,
            provider,
            modelIds
        });
    }
    // B4: the pool is single-provider (guard enforced at pool creation).
    // Compute the pool's provider so the prune is scoped to group+provider only
    // (never touching another provider's combos in the same group).
    const poolProvider = upsertWork[0]?.provider;
    // Group steps by model across all connections (Task 3 guarantees a single provider).
    // This produces one combo per model with ALL connections' steps + the dedicated
    // "quota-share" strategy (Phase 3 #9), fixing the collision where two same-provider
    // connections would overwrite each other.
    const byModel = new Map();
    for (const { connId, provider, modelIds } of upsertWork){
        for (const modelId of modelIds){
            const arr = byModel.get(modelId) ?? [];
            arr.push({
                connId,
                provider
            });
            byModel.set(modelId, arr);
        }
    }
    for (const [modelId, conns] of byModel){
        const provider = conns[0].provider;
        // B4: use groupName for the combo name.
        const comboName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quotaModelName"])(groupName, provider, modelId);
        const steps = conns.map((c)=>({
                kind: "model",
                model: `${provider}/${modelId}`,
                providerId: provider,
                connectionId: c.connId,
                weight: 100
            }));
        try {
            const existing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboByName"])(comboName);
            const payload = {
                name: comboName,
                models: steps,
                strategy: QUOTA_SHARE_STRATEGY,
                isHidden: true
            };
            if (existing && typeof existing.id === "string") await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateCombo"])(existing.id, payload);
            else await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCombo"])(payload);
        } catch (err) {
            log.warn({
                err: err?.message,
                comboName,
                poolId
            }, "quota-combo upsert failed");
        }
    }
    // B4: Prune stale combos that belong to THIS pool's group+provider but are no
    // longer in the desired set. CRITICAL: must NOT prune another provider's combos
    // in the same group (e.g. syncing openrouter pool must not delete baidu combos).
    //
    // Prune condition: groupSlug matches AND provider matches AND name not in desiredNames.
    // If poolProvider is undefined (no valid connection), skip pruning to be safe.
    if (!poolProvider) {
        // No valid connections → nothing to prune (can't scope by provider).
        return;
    }
    let allCombos = [];
    try {
        allCombos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCombos"])();
    } catch (err) {
        log.warn({
            err: err?.message,
            poolId
        }, "quota-combo prune: getCombos failed");
        return;
    }
    for (const combo of allCombos){
        const name = typeof combo.name === "string" ? combo.name : null;
        if (!name) continue;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isQuotaModelName"])(name)) continue;
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseQuotaModelName"])(name);
        if (!parsed) continue;
        // B4: provider-scoped prune — only prune combos for THIS group+provider.
        if (parsed.groupSlug !== groupSlug) continue;
        if (parsed.provider !== poolProvider) continue;
        // Belongs to this group+provider but not produced by any current connection → prune.
        if (!desiredNames.has(name)) {
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteComboByName"])(name);
            } catch (err) {
                log.warn({
                    err: err?.message,
                    comboName: name,
                    poolId
                }, "quota-combo prune failed");
            }
        }
    }
}
function filterModelsToQuotaPools(models, poolSlugs) {
    if (poolSlugs.length === 0) return [];
    const slugSet = new Set(poolSlugs);
    return models.filter((m)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isQuotaModelName"])(m.id)) return false;
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseQuotaModelName"])(m.id);
        return parsed !== null && slugSet.has(parsed.groupSlug);
    });
}
async function buildQuotaExclusiveModels(allowedQuotas, combos, timestamp, metadataFor) {
    const { resolveQuotaKeyScope } = await __turbopack_context__.A("[project]/src/lib/quota/quotaKey.ts [app-route] (ecmascript, async loader)");
    const scope = await resolveQuotaKeyScope(allowedQuotas);
    if (scope.poolSlugs.length === 0) return [];
    const slugSet = new Set(scope.poolSlugs);
    const out = [];
    for (const combo of combos){
        const name = typeof combo.name === "string" ? combo.name : "";
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isQuotaModelName"])(name)) continue;
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseQuotaModelName"])(name);
        if (!parsed || !slugSet.has(parsed.groupSlug)) continue;
        out.push({
            id: name,
            object: "model",
            created: timestamp,
            owned_by: "combo",
            permission: [],
            root: name,
            parent: null,
            ...metadataFor(combo)
        });
    }
    return out;
}
async function removeQuotaCombosForPool(poolId) {
    // Resolve pool → groupName + provider for scoped deletion.
    const resolved = await resolvePoolForSync(poolId);
    // If the pool is already gone, we can't safely scope deletion.
    // Fall back: try to delete by provider-discovery from DB combos (best-effort).
    if (!resolved) {
        // Pool gone — nothing to scope by; skip (no partial prune without knowing the provider).
        return;
    }
    const { pool } = resolved;
    const groupName = pool.groupName;
    const groupSlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quotaGroupSlug"])(groupName);
    // Resolve the pool's provider from its connections.
    let poolProvider;
    for (const connId of pool.connectionIds){
        try {
            const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(connId);
            if (connection && typeof connection.provider === "string" && connection.provider.length > 0) {
                poolProvider = connection.provider;
                break;
            }
        } catch  {
        // skip
        }
    }
    if (!poolProvider) {
        // Can't scope by provider — skip to avoid nuking unrelated combos.
        return;
    }
    let allCombos = [];
    try {
        allCombos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCombos"])();
    } catch (err) {
        log.warn({
            err: err?.message,
            poolId
        }, "removeQuotaCombosForPool: getCombos failed");
        return;
    }
    for (const combo of allCombos){
        const name = typeof combo.name === "string" ? combo.name : null;
        if (!name) continue;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isQuotaModelName"])(name)) continue;
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseQuotaModelName"])(name);
        if (!parsed) continue;
        // B4: only delete combos for this group+provider.
        if (parsed.groupSlug !== groupSlug) continue;
        if (parsed.provider !== poolProvider) continue;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteComboByName"])(name);
        } catch (err) {
            log.warn({
                err: err?.message,
                comboName: name,
                poolId
            }, "quota-combo remove failed");
        }
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_quota_08fsbma._.js.map