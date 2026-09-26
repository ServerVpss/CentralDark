module.exports = [
"[project]/src/app/api/v1/models/aliasBackedModels.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Extract `{providerKey, modelId}` pairs from the `modelAliases` key_value namespace
 * so `/v1/models` can surface models that were registered ONLY through a model alias
 * (e.g. `setModelAlias("kimi-k2.6", "custom/kimi-k2.6")`).
 *
 * Port of upstream decolua/9router PR #730 — kept as a PURE helper so the route can
 * walk the result and merge it into the per-provider catalog without dragging DB or
 * Next-runtime imports into a unit test.
 *
 * Each stored alias value is `"<providerKey>/<modelId>"`. `providerKey` may be either
 * a provider id (e.g. `openai`) or a provider alias / prefix (e.g. `cu`, `custom`);
 * the caller is responsible for resolving that against the active connection map.
 *
 * The split is on the FIRST `/` only — OpenRouter-style ids contain an internal slash
 * (`openrouter/anthropic/claude-3.5-sonnet`) and must keep their full sub-path as the
 * model id.
 */ __turbopack_context__.s([
    "extractAliasBackedModels",
    ()=>extractAliasBackedModels
]);
function extractAliasBackedModels(aliases) {
    if (!aliases || typeof aliases !== "object") return [];
    const seen = new Set();
    const out = [];
    for (const value of Object.values(aliases)){
        if (typeof value !== "string") continue;
        const trimmed = value.trim();
        if (trimmed.length === 0) continue;
        const slash = trimmed.indexOf("/");
        if (slash <= 0 || slash === trimmed.length - 1) continue;
        const providerKey = trimmed.slice(0, slash);
        const modelId = trimmed.slice(slash + 1);
        if (!providerKey || !modelId) continue;
        const dedupeKey = `${providerKey}/${modelId}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        out.push({
            providerKey,
            modelId
        });
    }
    return out;
}
}),
"[project]/src/app/api/v1/models/catalogSyncedCoverage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * catalogSyncedCoverage.ts — synced-model coverage for the /v1/models static loop.
 *
 * The synced discovery list (from a provider's `modelsUrl`) REPLACES the static
 * registry models in the catalog (see #7694 reasoning). But it must only replace
 * models the synced list actually covers. Before this helper, any provider with
 * ANY synced model dropped ALL its static models — so static models the upstream
 * discovery does not list (e.g. command-code's `deepseek/deepseek-v4-flash`) were
 * silently removed from the catalog even though the gateway routes them (200 OK).
 *
 * Pure module (no DB import) so it is unit-testable and keeps catalog.ts lean.
 */ __turbopack_context__.s([
    "buildSyncedModelIdsByCanonicalProvider",
    ()=>buildSyncedModelIdsByCanonicalProvider,
    "shouldSuppressStaticModelBySyncedCoverage",
    ()=>shouldSuppressStaticModelBySyncedCoverage
]);
function shouldSuppressStaticModelBySyncedCoverage(opts) {
    if (!opts.providerHasSynced) return false;
    if (opts.syncedModelIds.length === 0) return false;
    return opts.syncedModelIds.includes(opts.staticModelId);
}
function buildSyncedModelIdsByCanonicalProvider(syncedModelsByProvider, resolveCanonicalProviderId, providerIdToPrefix, providerIdToAlias) {
    const map = new Map();
    for (const [providerId, syncedModels] of Object.entries(syncedModelsByProvider)){
        if (!Array.isArray(syncedModels)) continue;
        const alias = providerIdToPrefix[providerId] || providerIdToAlias[providerId] || providerId;
        const canonicalId = resolveCanonicalProviderId(alias, providerId);
        const set = map.get(canonicalId) || new Set();
        for (const sm of syncedModels){
            if (typeof sm?.id === "string" && sm.id.length > 0) set.add(sm.id);
        }
        map.set(canonicalId, set);
    }
    return map;
}
}),
"[project]/src/app/api/v1/models/syncedCapabilities.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Synced-model catalog `capabilities` builder (#7694).
 *
 * Extracted from catalog.ts (frozen file-size baseline — `config/quality/file-size-baseline.json`)
 * to keep the vision (#4264) and reasoning-effort-tier (#7694) flags merged into a SINGLE
 * `capabilities` object rather than two separate spreads that would silently overwrite one
 * another via object-spread order. A model can be both vision- and reasoning-capable.
 */ __turbopack_context__.s([
    "buildSyncedCapabilities",
    ()=>buildSyncedCapabilities,
    "mergeSyncedCapabilities",
    ()=>mergeSyncedCapabilities
]);
function hasEffortTiers(sm) {
    return Array.isArray(sm.supportedThinkingEfforts) && sm.supportedThinkingEfforts.length > 0;
}
function buildSyncedCapabilities(sm) {
    const effortTiers = hasEffortTiers(sm);
    if (!sm.supportsVision && !effortTiers) return undefined;
    return {
        ...sm.supportsVision ? {
            vision: true
        } : {},
        ...effortTiers ? {
            effort_tiers: sm.supportedThinkingEfforts
        } : {}
    };
}
function mergeSyncedCapabilities(existing, sm) {
    const effortTiers = hasEffortTiers(sm);
    if (!sm.supportsVision && !effortTiers && !existing) return undefined;
    return {
        ...existing || {},
        ...sm.supportsVision ? {
            vision: true
        } : {},
        ...effortTiers ? {
            effort_tiers: sm.supportedThinkingEfforts
        } : {}
    };
}
}),
"[project]/src/app/api/v1/models/ccAliasPredicate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCcAliasPredicate",
    ()=>buildCcAliasPredicate
]);
/**
 * ccAliasPredicate.ts — catalog-side predicate for the cc discovery alias gate.
 *
 * Bridges the pure gate storage (`db/ccDiscoveryAliases.ts`) to the pure
 * synthesizer (`open-sse/utils/ccDiscoveryAliases.ts::appendCcDiscoveryAliases`).
 * Builds a single `(entry) => boolean` predicate from a settings snapshot,
 * so the catalog builder only needs to load the bulk settings once (no N+1
 * DB access per candidate model) and hand the closure to the synthesizer.
 *
 * Precedence for a model entry `<providerId>/<modelId...>` (split on the FIRST
 * "/" — everything after it is the modelId, even if it itself contains "/"):
 *   model setting (exact `providerId/modelId` key) > provider setting > global.
 *
 * Combo entries (`owned_by === "combo"`) use a virtual provider key `"combo"`
 * for the provider-level setting, and `combo/<comboName>` for the model-level
 * setting — combos have no real provider id, so this keeps them addressable
 * independently of any other provider's toggle while still falling back to
 * the same global flag.
 *
 * An entry whose id has no "/" and is not a combo (e.g. a bare synced model id
 * with no provider prefix) has no provider/model setting to look up — it only
 * follows the global flag.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryAliases.ts [app-route] (ecmascript)");
;
const COMBO_PROVIDER_KEY = "combo";
function settingFor(map, key) {
    return map.get(key) ?? null;
}
function buildCcAliasPredicate(snapshot) {
    return (entry)=>{
        const id = entry.id;
        if (typeof id !== "string" || id.length === 0) return false;
        const isCombo = entry.owned_by === "combo";
        if (isCombo) {
            const provider = settingFor(snapshot.providers, COMBO_PROVIDER_KEY);
            const model = settingFor(snapshot.models, `${COMBO_PROVIDER_KEY}/${id}`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCcAliasEnabled"])({
                model,
                provider,
                global: snapshot.global
            });
        }
        const slashIndex = id.indexOf("/");
        if (slashIndex === -1) {
            // No provider prefix and not a combo — nothing to key a provider/model
            // override on, so only the global flag applies.
            return snapshot.global;
        }
        const providerId = id.slice(0, slashIndex);
        const modelId = id.slice(slashIndex + 1);
        const provider = settingFor(snapshot.providers, providerId);
        const model = settingFor(snapshot.models, `${providerId}/${modelId}`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCcAliasEnabled"])({
            model,
            provider,
            global: snapshot.global
        });
    };
}
}),
"[project]/src/app/api/v1/models/functionalGatewayPredicate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * functionalGatewayPredicate.ts — catalog-side predicate for the functional
 * gateway mirror gate.
 *
 * Mirrors the 3-level gate of ccDiscoveryAliases (global > provider > model) but
 * for functional gateway mirrors. Storage reuses the same `key_value` namespace
 * conventions but under a dedicated feature flag (see db wiring in Task 4).
 */ __turbopack_context__.s([
    "buildFunctionalGatewayPredicate",
    ()=>buildFunctionalGatewayPredicate
]);
function resolveSetting(model, provider, global) {
    if (model === "off") return false;
    if (model === "on") return true;
    if (provider === "off") return false;
    if (provider === "on") return true;
    return global;
}
function buildFunctionalGatewayPredicate(snapshot) {
    return (entry)=>{
        const id = entry.id;
        if (typeof id !== "string" || id.length === 0) return false;
        const slashIndex = id.indexOf("/");
        if (slashIndex === -1) return snapshot.global;
        const providerId = id.slice(0, slashIndex);
        const modelId = id.slice(slashIndex + 1);
        const provider = snapshot.providers.get(providerId) ?? null;
        const model = snapshot.models.get(`${providerId}/${modelId}`) ?? null;
        return resolveSetting(model, provider, snapshot.global);
    };
}
}),
"[project]/src/app/api/v1/models/catalogDedupe.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * #4424 / #8015 — final exact-duplicate-id guard for `GET /v1/models`.
 *
 * OpenAI-compatible clients key models by `id`, so the same id appearing twice in the
 * `data` array breaks pickers and lookups. The catalog builder pushes entries from several
 * independent sources (static registry, synced provider models, combos, custom models,
 * specialty audio/video/moderation registries), each with its own local "already pushed?"
 * guard — so a model produced by two different sources can still slip through as an
 * exact-duplicate id.
 *
 * Historical bug: the guard keyed only by `(id, type, subtype)`. A generic untyped row
 * and a typed specialty row for the same public id therefore both survived (e.g.
 * `openai/whisper-1`, `veo-free/veo`). OpenAI-compatible clients still key only by `id`.
 *
 * Rules:
 * - keep the first entry per listing identity `(id, type, subtype)`
 * - when a non-chat specialty row exists for an id, drop untyped/generic chat siblings
 * - preserve intentional multi-surface pairs (audio transcription vs speech)
 * - never mutate account/connection/credential fields (this pass only drops whole rows)
 *
 * Pure (no DB / no I/O). Order-preserving. Independent of MODELS_CATALOG_PREFIX_MODE.
 */ __turbopack_context__.s([
    "dedupeExactCatalogIds",
    ()=>dedupeExactCatalogIds
]);
const asStr = (v)=>typeof v === "string" ? v : "";
const isNonChatSpecialtyType = (type)=>{
    if (!type || type === "chat") return false;
    return true;
};
const isGenericChatLike = (model)=>{
    const type = asStr(model.type);
    return !type || type === "chat";
};
const listingKey = (model)=>`${model.id}\u0000${asStr(model.type)}\u0000${asStr(model.subtype)}`;
function dedupeExactCatalogIds(models) {
    if (!Array.isArray(models) || models.length < 2) return models;
    const specialtyIds = new Set();
    for (const model of models){
        if (typeof model?.id !== "string" || model.id.length === 0) continue;
        if (isNonChatSpecialtyType(asStr(model.type))) {
            specialtyIds.add(model.id);
        }
    }
    const seen = new Set();
    const out = [];
    for (const model of models){
        if (typeof model?.id !== "string" || model.id.length === 0) {
            out.push(model);
            continue;
        }
        // False generic/chat sibling of a typed specialty model — drop.
        if (specialtyIds.has(model.id) && isGenericChatLike(model)) {
            continue;
        }
        const key = listingKey(model);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(model);
    }
    return out;
}
}),
"[project]/src/app/api/v1/models/catalogOrder.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "sortCatalogModelsProviderGrouped",
    ()=>sortCatalogModelsProviderGrouped
]);
/**
 * catalogOrder.ts — canonical provider-grouped ordering for GET /v1/models.
 *
 * The catalog is assembled by many independent push loops (auto-combos, named
 * combos, static registry, codex-native, synced, OpenRouter, specialty registries,
 * custom, alias-backed, connection-fallback). The same provider appears in several
 * loops with other providers interleaved, so its models land in multiple separated
 * blocks. This module applies ONE stable, provider-grouped sort at serialization.
 *
 * Group key = owned_by (the public owner identity), NOT the model-id prefix.
 * Built-in providers use their canonical id as owned_by; compatible nodes use the
 * configured node prefix. A single routable public prefix can differ from its owner:
 * no-auth OpenCode publishes `oc/<model>` while retaining owned_by "opencode".
 * Grouping by the prefix would split one provider's models; grouping by owned_by
 * keeps them contiguous.
 *
 * Order: combo block (owned_by === "combo") pinned first, preserving #4164; then
 * providers in registry precedence (OAUTH -> NOAUTH -> APIKEY canonical keys); then
 * unknown providers by locale-independent code-unit order. Within a group the input
 * order is preserved (stable), keeping combo sort_order, connection priority, custom
 * append-order, and equal-id audio twins.
 *
 * Reorders rows only. Identity, alias mapping, Combo/bare compatibility (#6940/#8530),
 * effort-variant scoping, and Claude-mirror gating are untouched. Pure; no DB/IO.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$oauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/oauth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/apikey/index.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
/** Canonical provider precedence, keyed by provider id (not alias). Built once. */ const CANONICAL_PROVIDER_ORDER = [
    ...Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$oauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OAUTH_PROVIDERS"]),
    ...Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"]),
    ...Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$apikey$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APIKEY_PROVIDERS"])
];
/**
 * Locale-independent code-unit comparator. UTF-16 code units put uppercase A-Z
 * (0x41-0x5A) before lowercase a-z (0x61-0x7A); byte-deterministic, no ICU.
 */ function codeUnitCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
/** Combo bucket key, distinct from any real provider id. */ const COMBO_GROUP = " combo";
/**
 * Grouping key for a catalog row: "combo" for combo-owned rows, else owned_by
 * (canonical identity). Rows with no usable owned_by fall back to the id-prefix;
 * that path is defensive only — every published row carries owned_by.
 */ function modelGroupKey(model) {
    const ownedBy = typeof model.owned_by === "string" ? model.owned_by : "";
    if (ownedBy === "combo") return COMBO_GROUP;
    if (ownedBy) return ownedBy;
    const id = typeof model.id === "string" ? model.id : "";
    const slash = id.indexOf("/");
    return slash > 0 ? id.slice(0, slash) : id;
}
/**
 * Sort priority for a group key: combo first, then registry precedence, then
 * unknown groups (rank Infinity, ordered among themselves by code unit).
 */ function groupSortPriority(groupKey) {
    if (groupKey === COMBO_GROUP) return -1;
    const idx = CANONICAL_PROVIDER_ORDER.indexOf(groupKey);
    return idx >= 0 ? idx : Infinity;
}
function sortCatalogModelsProviderGrouped(models) {
    if (!Array.isArray(models) || models.length < 2) return models;
    const annotated = models.map((model, index)=>{
        const groupKey = modelGroupKey(model);
        return {
            model,
            groupKey,
            priority: groupSortPriority(groupKey),
            index
        };
    });
    annotated.sort((a, b)=>{
        if (a.priority !== b.priority) return a.priority - b.priority;
        // Unknown groups (both Infinity): code-unit order by key.
        if (a.priority === Infinity && b.priority === Infinity) {
            const cmp = codeUnitCompare(a.groupKey, b.groupKey);
            if (cmp !== 0) return cmp;
        }
        // Stable: preserve input order within a group.
        return a.index - b.index;
    });
    return annotated.map((entry)=>entry.model);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/v1/models/catalogHelpers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getThinkingCapabilityFields",
    ()=>getThinkingCapabilityFields,
    "intersectStringArrays",
    ()=>intersectStringArrays,
    "isPositiveFiniteNumber",
    ()=>isPositiveFiniteNumber,
    "maybeOmitCatalogModelName",
    ()=>maybeOmitCatalogModelName,
    "mergeComboCapabilities",
    ()=>mergeComboCapabilities,
    "minKnownNumber",
    ()=>minKnownNumber,
    "parseJsonStringArray",
    ()=>parseJsonStringArray
]);
// Pure, dependency-free helpers + shared types for the unified model catalog
// (`getUnifiedModelsResponse` in ./catalog.ts). Extracted as a cohesive leaf so the
// catalog host shrinks toward the file-size cap without changing behavior — every
// function body here is byte-identical to its previous in-catalog definition.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/reasoning/effortStandardization.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function isPositiveFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
}
function parseJsonStringArray(value) {
    if (typeof value !== "string" || value.trim().length === 0) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((entry)=>typeof entry === "string" && entry.length > 0) : [];
    } catch  {
        return [];
    }
}
function maybeOmitCatalogModelName(model, includeNames) {
    if (includeNames || !Object.prototype.hasOwnProperty.call(model, "name")) return model;
    const { name: omittedName, ...nextModel } = model;
    void omittedName;
    return nextModel;
}
function intersectStringArrays(arrays) {
    if (arrays.length === 0 || arrays.some((values)=>values.length === 0)) return [];
    const [first, ...rest] = arrays;
    return first.filter((value, index)=>{
        if (first.indexOf(value) !== index) return false;
        return rest.every((values)=>values.includes(value));
    });
}
function minKnownNumber(values) {
    const knownValues = values.filter(isPositiveFiniteNumber);
    if (knownValues.length === 0) return undefined;
    return Math.min(...knownValues);
}
function getThinkingCapabilityFields(providerId, modelId, resolvedThinking, supportedThinkingEfforts) {
    const supportsThinking = resolvedThinking;
    if (typeof supportsThinking !== "boolean") return {};
    return {
        thinking: supportsThinking,
        supportsThinking,
        ...supportsThinking ? {
            effort_tiers: supportedThinkingEfforts && supportedThinkingEfforts.length > 0 ? [
                ...supportedThinkingEfforts
            ] : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extendCodexGpt56EffortValues"])(providerId, modelId, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CANONICAL_EFFORT_VALUES"])
        } : {}
    };
}
function mergeComboCapabilities(metadata) {
    const capabilities = {};
    for (const key of [
        "tool_calling",
        "reasoning",
        "vision",
        "attachment",
        "structured_output",
        "temperature",
        "thinking",
        "supportsThinking"
    ]){
        const values = metadata.map((entry)=>entry.capabilities[key]);
        if (values.every((value)=>typeof value === "boolean")) {
            const [first] = values;
            if (values.every((value)=>value === first)) capabilities[key] = first;
        }
    }
    const effortTiers = metadata.map((entry)=>entry.capabilities.effort_tiers);
    if (effortTiers.every((value)=>Array.isArray(value) && value.every((entry)=>typeof entry === "string"))) {
        capabilities.effort_tiers = intersectStringArrays(effortTiers);
    }
    return capabilities;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/v1/models/catalogRequest.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getModelCatalogAuthRejection",
    ()=>getModelCatalogAuthRejection,
    "isCcDiscoveryModelCatalogClient",
    ()=>isCcDiscoveryModelCatalogClient,
    "isCodexModelCatalogClient",
    ()=>isCodexModelCatalogClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/apiAuth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// Request-scoped catalog helpers: API-key auth gating for `/v1/models` and Codex
// CLI client detection. Extracted verbatim from ./catalog.ts.
async function validateCatalogApiKey(apiKey) {
    const { validateApiKey } = await __turbopack_context__.A("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript, async loader)");
    return validateApiKey(apiKey);
}
async function getModelCatalogAuthRejection(request, settings, headers) {
    const authRequired = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAuthRequired"])(request);
    if (!authRequired) return null;
    if (settings.requireAuthForModels === false) return null;
    const apiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])(request);
    if (apiKey) {
        if (await validateCatalogApiKey(apiKey)) return null;
        return Response.json({
            error: {
                message: "Invalid API key",
                type: "invalid_api_key",
                code: "invalid_api_key"
            }
        }, {
            status: 401,
            headers
        });
    }
    if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDashboardSessionAuthenticated"])(request)) return null;
    return Response.json({
        error: {
            message: "Authentication required",
            type: "invalid_api_key",
            code: "invalid_api_key"
        }
    }, {
        status: 401,
        headers
    });
}
function isCodexModelCatalogClient(request) {
    const headers = request.headers;
    const originator = headers.get("originator")?.toLowerCase() ?? "";
    if (originator.startsWith("codex")) return true;
    const userAgent = headers.get("user-agent")?.toLowerCase() ?? "";
    return userAgent.startsWith("codex");
}
function isCcDiscoveryModelCatalogClient(request) {
    const userAgent = request.headers.get("user-agent")?.toLowerCase() ?? "";
    return userAgent.includes("claude-cli");
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/v1/models/catalogResponse.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "applyCatalogPostFilters",
    ()=>applyCatalogPostFilters,
    "finalizeCatalogResponse",
    ()=>finalizeCatalogResponse
]);
/**
 * catalogResponse.ts — the tail of the /v1/models build: the post-filter chain and
 * the response envelope.
 *
 * Extracted from catalog.ts so the full catalog build and the quota-exclusive
 * short-circuit share one implementation. Two paths emitting the same envelope by
 * copy would drift; the quota path in particular silently lost the discovery
 * mirrors the first time it was written as a duplicate.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$noThinkingAlias$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/noThinkingAlias.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$claudeEffortVariants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/claudeEffortVariants.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$syncedEffortVariants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/syncedEffortVariants.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$ccDiscoveryAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/ccDiscoveryAliases.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$functionalGatewayMirrors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/functionalGatewayMirrors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryAliases.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$ccAliasPredicate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/ccAliasPredicate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$functionalGatewayMirrors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/functionalGatewayMirrors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$functionalGatewayPredicate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/functionalGatewayPredicate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogDedupe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogDedupe.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogOrder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogOrder.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelMetadataRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogHelpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogRequest.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$syncedEffortVariants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogOrder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$syncedEffortVariants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogOrder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
;
function applyCatalogPostFilters(request, models, ctx) {
    let finalModels = models;
    // variants are only generated for surviving models.
    if (new URL(request.url).searchParams.get("configuredOnly") === "true") {
        finalModels = finalModels.filter((m)=>{
            if (!m.root) return true;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasEligibleConnectionForModel"])(ctx.connections, m.root);
        });
    }
    // Advertise Claude reasoning-effort variants (claude/<model>-{low,medium,high[,xhigh]}).
    // Derived from the already key-filtered list so a variant only appears when its real
    // model is permitted. Runs before the no-thinking pass: the gateway already routes these
    // suffixed ids (claudeEffortVariant.ts), this just makes them selectable in catalog-only
    // clients (OpenCode) that can't set a reasoning_effort config the way VS Code does.
    finalModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$claudeEffortVariants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appendClaudeEffortVariants"])(finalModels, ctx.prefixMode === "canonical" ? ctx.aliasToProviderId : undefined);
    // Advertise no-thinking gateway variants (Fase 8.1). Derived from the already
    // key-filtered list, so a variant only appears when its real model is permitted.
    // #9418: skip when hideNoThinkVariants is on — the ids are still routable when
    // sent explicitly, just not advertised in the catalog.
    if (!ctx.hideNoThinkVariants) {
        finalModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$noThinkingAlias$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appendNoThinkingVariants"])(finalModels, ctx.prefixMode === "canonical" ? ctx.aliasToProviderId : undefined);
    }
    // Advertise `claude/<id>` discovery-mirror aliases so Claude Code's gateway
    // model discovery (which only lists `claude`/`anthropic`-prefixed ids) can see
    // every model this gate allows. Gated 3 levels deep (global > provider > model,
    // see ccDiscoveryAliases.ts) and default-off. Deliberately NOT filtered by model
    // `type` here — non-chat entries (embedding/image/etc.) get a mirror too; the
    // gate itself (default-off + explicit opt-in) is the operator's filter, not a
    // hardcoded type allowlist.
    const ccAliasGlobal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCcAliasGlobalEnabled"])();
    const ccAliasSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCcAliasSettingsBulk"])();
    if (ccAliasGlobal || ccAliasSettings.providers.size > 0 || ccAliasSettings.models.size > 0) {
        finalModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$ccDiscoveryAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appendCcDiscoveryAliases"])(finalModels, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$ccAliasPredicate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCcAliasPredicate"])({
            global: ccAliasGlobal,
            providers: ccAliasSettings.providers,
            models: ccAliasSettings.models
        }));
    }
    // Advertise `<gateway-alias>/<id>` functional-gateway mirrors so discovery
    // clients surface the route that actually has a credential, even when the
    // canonical owner provider has none (e.g. `deepseek/deepseek-v4-flash` fails
    // 404 but `agentrouter/deepseek/deepseek-v4-flash` returns 200). Gated 3
    // levels deep (global > provider > model, see db/functionalGatewayMirrors.ts)
    // and default-off. Only emits a mirror when the canonical owner has no
    // eligible connection for the model AND a passthrough gateway with an active
    // credential covers it.
    const fgGlobal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$functionalGatewayMirrors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFunctionalGatewayGlobalEnabled"])();
    const fgSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$functionalGatewayMirrors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFunctionalGatewaySettingsBulk"])();
    if (fgGlobal || fgSettings.providers.size > 0 || fgSettings.models.size > 0) {
        const gatewayProviderIds = [
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getPassthroughProviders"])()
        ];
        finalModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$functionalGatewayMirrors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appendFunctionalGatewayMirrors"])(finalModels, {
            gatewayProviderIds,
            isGateway: (provider)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getPassthroughProviders"])().has(provider),
            gatewayAlias: (provider)=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REGISTRY"][provider]?.alias || provider,
            gatewayCovers: (provider, modelId)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasEligibleConnectionForModel"])(ctx.connections.filter((c)=>c.provider === provider), modelId),
            gatewayHasConnection: (provider)=>ctx.connections.some((c)=>c.provider === provider),
            canonicalOwnerHasConnection: (owner)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasEligibleConnectionForModel"])(ctx.connections.filter((c)=>c.provider === owner), owner)
        });
        finalModels = finalModels.filter((m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$functionalGatewayPredicate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFunctionalGatewayPredicate"])({
                global: fgGlobal,
                ...fgSettings
            })(m));
    }
    // #7694: advertise `<provider>/<model>-<tier>` variants for synced models that
    // captured `reasoning.supported_efforts` at sync time (capabilities.effort_tiers).
    // Derived from the already key-filtered list; skips codex/kimi (own suffix mechanism).
    finalModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$syncedEffortVariants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appendSyncedEffortVariants"])(finalModels);
    // #4424 follow-up — drop exact-duplicate ids that slip through the per-source push
    // guards (e.g. `codex/gpt-5.5`, `veo-free/seedance` listed twice). Keyed by listing
    // identity (id, type, subtype) so the intentional same-id audio transcription/speech
    // pair survives. Independent of MODELS_CATALOG_PREFIX_MODE; runs as the final guard.
    finalModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogDedupe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dedupeExactCatalogIds"])(finalModels);
    return finalModels;
}
function finalizeCatalogResponse(request, finalModels, getContextFallback, headers) {
    const includeModelNames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isModelCatalogNamesEnabled"])();
    const enrichedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["disambiguateCatalogModelNames"])(finalModels.map((model)=>{
        if (model.owned_by === "combo") {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maybeOmitCatalogModelName"])(model, includeModelNames);
        }
        const enriched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enrichCatalogModelEntry"])(model);
        const fallbackContextLength = getContextFallback(enriched);
        const listedModel = fallbackContextLength ? {
            ...enriched,
            context_length: fallbackContextLength
        } : enriched;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maybeOmitCatalogModelName"])(listedModel, includeModelNames);
    }));
    // Canonical provider-grouped publication: one contiguous block per provider,
    // combos pinned first. Stable — preserves combo sort_order, connection priority,
    // and equal-id audio twins. Grouped by owned_by (canonical identity), not the
    // routing alias prefix. Applied after enrichment/disambiguation so the final
    // serialized order is what every consumer sees; cached as part of the body.
    const orderedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogOrder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sortCatalogModelsProviderGrouped"])(enrichedModels);
    // Codex CLI compatibility: its model-catalog refresh (codex_models_manager) does
    // GET /v1/models?client_version=<v> and decodes a JSON object with a TOP-LEVEL
    // `models` array, so the OpenAI-standard `{object,data}` shape makes it fail with
    // "missing field `models`" and log "failed to refresh available models" on every
    // startup. For codex clients only (detected by the codex originator/user-agent) we add
    // an EMPTY `models: []` so the decode succeeds and the error disappears. Every other
    // OpenAI consumer keeps the byte-identical `{object,data}` response.
    //
    // We deliberately keep it EMPTY rather than mirroring the catalog: codex replaces its
    // built-in per-model agent prompt (`base_instructions`, ~21k chars) with whatever a
    // populated entry carries for the selected model, so emitting our models with an
    // empty/foreign `base_instructions` would drop codex's agent prompt to nothing and
    // break its agent behavior (verified empirically against codex 0.137). An empty array
    // keeps codex on its built-in model info — same inference as today, minus the error.
    const responseBody = {
        object: "list",
        data: orderedModels
    };
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCodexModelCatalogClient"])(request)) {
        responseBody.models = [];
    }
    return Response.json(responseBody, {
        headers
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/v1/models/catalogOpenrouter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// OpenRouter-specific catalog normalization helpers. Extracted verbatim from
// ./catalog.ts as a cohesive leaf — id qualification, modality normalization,
// model-type inference, and the free-model / display-name heuristics that shape
// OpenRouter entries in `getUnifiedModelsResponse`.
__turbopack_context__.s([
    "getOpenRouterDisplayName",
    ()=>getOpenRouterDisplayName,
    "getOpenRouterModelType",
    ()=>getOpenRouterModelType,
    "isOpenRouterFreeModel",
    ()=>isOpenRouterFreeModel,
    "isZeroPrice",
    ()=>isZeroPrice,
    "normalizeOpenRouterModalities",
    ()=>normalizeOpenRouterModalities,
    "qualifyOpenRouterModelId",
    ()=>qualifyOpenRouterModelId
]);
function qualifyOpenRouterModelId(modelId) {
    return modelId.startsWith("openrouter/") ? modelId : `openrouter/${modelId}`;
}
function normalizeOpenRouterModalities(value) {
    return Array.isArray(value) ? value.filter((entry)=>typeof entry === "string" && entry.length > 0) : [];
}
function getOpenRouterModelType(inputModalities, outputModalities) {
    if (outputModalities.includes("image")) return "image";
    if (outputModalities.includes("audio")) return "audio";
    if (outputModalities.includes("video")) return "video";
    if (outputModalities.includes("embedding")) return "embedding";
    return "chat";
}
function isZeroPrice(value) {
    if (typeof value === "number") return value === 0;
    if (typeof value !== "string") return false;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed === 0;
}
function isOpenRouterFreeModel(model) {
    if (typeof model.id === "string" && model.id.endsWith(":free")) return true;
    return isZeroPrice(model.pricing?.prompt) && isZeroPrice(model.pricing?.completion);
}
function getOpenRouterDisplayName(model) {
    const name = model.name || model.id || "OpenRouter model";
    return isOpenRouterFreeModel(model) && !/\bgr[aá]tis\b/i.test(name) ? `${name} (Grátis)` : name;
}
}),
"[project]/src/app/api/v1/models/catalogVision.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCustomVisionCapabilityFields",
    ()=>getCustomVisionCapabilityFields,
    "getVisionCapabilityFields",
    ()=>getVisionCapabilityFields
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/visionModels.ts [app-route] (ecmascript)");
;
;
function getVisionCapabilityFields(modelId) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isVisionModelId"])(modelId)) return null;
    return {
        capabilities: {
            vision: true
        },
        input_modalities: [
            "text",
            "image"
        ],
        output_modalities: [
            "text"
        ]
    };
}
function getCustomVisionCapabilityFields(entry, ...candidateIds) {
    if (entry && entry.supportsVision === false) return null;
    if (entry && entry.supportsVision === true) {
        return {
            capabilities: {
                vision: true
            },
            input_modalities: [
                "text",
                "image"
            ],
            output_modalities: [
                "text"
            ]
        };
    }
    for (const id of candidateIds){
        if (typeof id === "string" && id) {
            const fields = getVisionCapabilityFields(id);
            if (fields) return fields;
        }
    }
    return null;
}
}),
"[project]/src/app/api/v1/models/catalogProviderMaps.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "FALLBACK_ALIAS_TO_PROVIDER",
    ()=>FALLBACK_ALIAS_TO_PROVIDER,
    "buildAliasMaps",
    ()=>buildAliasMaps,
    "getComboTargetModelId",
    ()=>getComboTargetModelId,
    "getProviderPrefixes",
    ()=>getProviderPrefixes,
    "prefixRoutesToProvider",
    ()=>prefixRoutesToProvider,
    "resolveCanonicalProviderId",
    ()=>resolveCanonicalProviderId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/models.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const FALLBACK_ALIAS_TO_PROVIDER = {
    ag: "antigravity",
    cc: "claude",
    cl: "cline",
    cu: "cursor",
    cx: "codex",
    gh: "github",
    kc: "kilocode",
    kmc: "kimi-coding",
    kr: "kiro"
};
function buildAliasMaps() {
    const aliasToProviderId = {};
    const providerIdToAlias = {};
    // Canonical source for ID/alias pairs used across dashboard/provider config.
    for (const provider of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AI_PROVIDERS"])){
        const providerId = provider?.id;
        const alias = provider?.alias || providerId;
        if (!providerId) continue;
        aliasToProviderId[providerId] = providerId;
        aliasToProviderId[alias] = providerId;
        if (!providerIdToAlias[providerId]) {
            providerIdToAlias[providerId] = alias;
        }
    }
    for (const [left, right] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"])){
        // Handle both possible directions:
        // - providerId -> alias
        // - alias -> providerId
        if (__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][left]) {
            aliasToProviderId[left] = aliasToProviderId[left] || right;
            continue;
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][right]) {
            aliasToProviderId[right] = aliasToProviderId[right] || left;
            continue;
        }
        aliasToProviderId[right] = aliasToProviderId[right] || left;
    }
    for (const alias of Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"])){
        if (!aliasToProviderId[alias]) {
            aliasToProviderId[alias] = alias;
        }
    }
    for (const [alias, providerId] of Object.entries(aliasToProviderId)){
        if (!providerIdToAlias[providerId]) {
            providerIdToAlias[providerId] = alias;
        }
    }
    // Safety net for environments where alias maps are partially loaded during
    // module initialization/circular imports.
    for (const [alias, providerId] of Object.entries(FALLBACK_ALIAS_TO_PROVIDER)){
        if (!aliasToProviderId[alias]) aliasToProviderId[alias] = providerId;
        if (!aliasToProviderId[providerId]) aliasToProviderId[providerId] = providerId;
        if (!providerIdToAlias[providerId]) providerIdToAlias[providerId] = alias;
    }
    return {
        aliasToProviderId,
        providerIdToAlias
    };
}
function resolveCanonicalProviderId(aliasToProviderId, aliasOrProviderId, fallbackProviderId) {
    return aliasToProviderId[aliasOrProviderId] || (fallbackProviderId ? aliasToProviderId[fallbackProviderId] : undefined) || FALLBACK_ALIAS_TO_PROVIDER[aliasOrProviderId] || fallbackProviderId || aliasOrProviderId;
}
function prefixRoutesToProvider(prefix, providerId) {
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(`${prefix}/__omniroute_probe__`);
    return parsed.provider === providerId;
}
function getProviderPrefixes(maps, providerId, rawProvider) {
    const { aliasToProviderId, providerIdToAlias } = maps;
    const prefixes = new Set([
        providerId,
        rawProvider,
        providerIdToAlias[providerId]
    ]);
    for (const [alias, mappedProviderId] of Object.entries(aliasToProviderId)){
        if (mappedProviderId === providerId) prefixes.add(alias);
    }
    return [
        ...prefixes
    ].filter((prefix)=>typeof prefix === "string" && prefix.length > 0 && prefixRoutesToProvider(prefix, providerId));
}
function getComboTargetModelId(maps, target) {
    const rawProvider = typeof target.providerId === "string" ? target.providerId.trim() : typeof target.provider === "string" ? target.provider.trim() : "";
    const modelStr = typeof target.modelStr === "string" ? target.modelStr.trim() : "";
    if (!rawProvider || rawProvider === "unknown" || !modelStr) return null;
    const providerId = resolveCanonicalProviderId(maps.aliasToProviderId, rawProvider);
    if (!providerId || providerId === "unknown") return null;
    let modelId = modelStr;
    for (const prefix of getProviderPrefixes(maps, providerId, rawProvider)){
        const prefixWithSlash = `${prefix}/`;
        if (modelStr.startsWith(prefixWithSlash)) {
            modelId = modelStr.slice(prefixWithSlash.length).trim();
            break;
        }
    }
    if (!modelId) return null;
    const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCanonicalProviderModel"])(providerId, modelId);
    return canonical.provider && canonical.model ? {
        providerId: canonical.provider,
        modelId: canonical.model
    } : null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/v1/models/catalogCache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CATALOG_CACHE_TTL_MS_DEFAULT",
    ()=>CATALOG_CACHE_TTL_MS_DEFAULT,
    "CATALOG_STALE_WHILE_REVALIDATE_MS",
    ()=>CATALOG_STALE_WHILE_REVALIDATE_MS,
    "__expireCatalogCacheForTest",
    ()=>__expireCatalogCacheForTest,
    "__flushCatalogBackgroundRefreshForTest",
    ()=>__flushCatalogBackgroundRefreshForTest,
    "__forceCatalogInFlightRejectionForTest",
    ()=>__forceCatalogInFlightRejectionForTest,
    "__getCatalogBuilderRunsForTest",
    ()=>__getCatalogBuilderRunsForTest,
    "__resetCatalogBuilderRunsForTest",
    ()=>__resetCatalogBuilderRunsForTest,
    "__setCatalogCacheEntryForTest",
    ()=>__setCatalogCacheEntryForTest,
    "mergeCatalogHeaders",
    ()=>mergeCatalogHeaders,
    "resolveCachedCatalogResponse",
    ()=>resolveCachedCatalogResponse
]);
/**
 * Response cache for `GET /v1/models`, extracted from catalog.ts.
 *
 * #6408 — concurrent catalog requests used to serialize (~1.2 s each × N). The
 * builder walks 8 registries and hits SQLite for connections, combos, custom
 * models and aliases; under Next.js's single-threaded App Router request
 * handling, N concurrent calls execute back-to-back and the Nth completes at
 * N × single-request latency. So identical concurrent requests are coalesced
 * onto one in-flight promise and the serialized body is memoized for a short
 * window.
 *
 * Auth rejection is NOT handled here and must stay in the caller: it depends on
 * live per-request state (dashboard cookie, API key) and must never be cached.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogRequest.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const CATALOG_STALE_WHILE_REVALIDATE_MS = 30_000;
const CATALOG_CACHE_TTL_MS_DEFAULT = 60_000;
const catalogCache = new Map();
const catalogInFlight = new Map();
let _catalogBuilderRuns = 0;
function buildCatalogCacheKey(request, catalogSettings) {
    const url = new URL(request.url);
    const prefix = url.searchParams.get("prefix") || "";
    const apiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])(request) || "";
    const isCodex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCodexModelCatalogClient"])(request) ? "1" : "0";
    const configuredOnly = url.searchParams.get("configuredOnly") === "true" ? "1" : "0";
    const hideAuto = catalogSettings?.hideAutoCombos ? "1" : "0";
    const hideNoThink = catalogSettings?.hideNoThinkVariants ? "1" : "0";
    return `${prefix}|${isCodex}|${apiKey}|${configuredOnly}|${hideAuto}|${hideNoThink}`;
}
// Tracks the model-catalog cache version (src/lib/db/readCache.ts) as of the last
// cache access. invalidateDbCache() bumps that version on every settings/connections/
// combos/pricing write; when it moves on, every memoized entry here was built from
// state that no longer holds, so drop them all rather than keying by version (which
// would leak one Map entry per version forever instead of ever pruning old ones).
let lastSeenCatalogCacheVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogCacheVersion"])();
function dropCatalogCacheIfStateChanged() {
    const currentVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogCacheVersion"])();
    if (currentVersion === lastSeenCatalogCacheVersion) return;
    lastSeenCatalogCacheVersion = currentVersion;
    catalogCache.clear();
// Deliberately NOT clearing catalogInFlight: an in-flight build bound to the
// previous generation is left to finish for its original caller, but the
// generation check in the join path (below) keeps new requests from joining
// it, and the generation check in storePayload keeps it from repopulating
// the now-current cache. Clearing it here would just detach the entry while
// the build still ran — wasted work with no correctness gain.
}
function mergeCatalogHeaders(...sources) {
    const merged = new Headers();
    for (const source of sources){
        if (!source) continue;
        for (const [key, value] of Object.entries(source)){
            merged.set(key, value);
        }
    }
    return merged;
}
/**
 * Persist a freshly built payload — but only when the build still belongs to the
 * current catalog-state generation. A build that started before a write
 * invalidation (its `buildGeneration` is older than `getModelCatalogCacheVersion()`)
 * returns its entry to its original caller but must NOT repopulate the cache: the
 * payload reflects pre-write state and caching it would serve stale data.
 */ function storePayload(cacheKey, payload, buildGeneration) {
    const entry = {
        body: payload.body,
        headers: payload.headers,
        status: payload.status,
        expiresAt: Date.now() + payload.cacheTTL
    };
    if (buildGeneration === (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogCacheVersion"])()) {
        catalogCache.set(cacheKey, entry);
    }
    return entry;
}
/**
 * Kick off a background rebuild so an expired-but-stale-eligible entry can be
 * refreshed without the current request waiting on it. Reuses catalogInFlight —
 * no second coalescing mechanism — so a concurrent cold/stale request for the
 * same key joins this refresh instead of starting another.
 *
 * The builder runs one macrotask later so the stale response that triggered this
 * call is handed back before the builder's synchronous prologue runs; the whole
 * point of this path is that the caller does not pay for the rebuild.
 *
 * The tracked promise **rejects** on failure. catalogInFlight is shared with the
 * cold path: a caller whose entry aged past the stale window skips the stale
 * branch and awaits whatever promise it finds here, and resolving with the stale
 * entry would hand it a body it was no longer entitled to while disguising a
 * build failure as a 200. The rejection is pre-handled so this path can never
 * raise an unhandledRejection; a failed refresh simply never overwrites the entry.
 */ function scheduleBackgroundRefresh(cacheKey, request, buildPayload) {
    if (catalogInFlight.has(cacheKey)) return; // a refresh for this key is already running
    const generation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogCacheVersion"])();
    const refreshPromise = new Promise((resolve, reject)=>{
        setTimeout(()=>{
            runBuilder(buildPayload, request).then((payload)=>resolve(storePayload(cacheKey, payload, generation))).catch((err)=>{
                console.error(`[catalog] Background stale-while-revalidate refresh failed for key "${cacheKey}":`, err);
                reject(err);
            });
        }, 0);
    });
    // Nobody on the stale path awaits this, so pre-handle the rejection; a cold-path
    // caller that joins it via catalogInFlight attaches its own handler and still
    // observes the failure.
    refreshPromise.catch(()=>{});
    catalogInFlight.set(cacheKey, {
        generation,
        promise: refreshPromise
    });
    refreshPromise.catch(()=>{}).finally(()=>{
        if (catalogInFlight.get(cacheKey)?.promise === refreshPromise) catalogInFlight.delete(cacheKey);
    });
}
function runBuilder(buildPayload, request) {
    _catalogBuilderRuns++;
    return buildPayload(request);
}
async function resolveCachedCatalogResponse(request, headerSources, buildPayload, catalogSettings) {
    const { corsHeaders, diagnosticHeaders } = headerSources;
    dropCatalogCacheIfStateChanged();
    const cacheKey = buildCatalogCacheKey(request, catalogSettings);
    const now = Date.now();
    const cached = catalogCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
        return new Response(cached.body, {
            status: cached.status,
            headers: mergeCatalogHeaders(corsHeaders, cached.headers, diagnosticHeaders)
        });
    }
    // Stale-while-revalidate: an expired entry is still served immediately as long as
    // (a) it was a successful build — a cached error replayed as "stale" would mask an
    // intermittent failure behind a fake success forever — and (b) it is within the
    // staleness window, so a refresh that keeps failing eventually falls through to the
    // cold-path wait instead of pinning ancient data.
    if (cached && cached.status === 200 && now - cached.expiresAt <= CATALOG_STALE_WHILE_REVALIDATE_MS) {
        scheduleBackgroundRefresh(cacheKey, request, buildPayload);
        return new Response(cached.body, {
            status: cached.status,
            headers: mergeCatalogHeaders(corsHeaders, cached.headers, diagnosticHeaders)
        });
    }
    const currentGeneration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogCacheVersion"])();
    let inflight = catalogInFlight.get(cacheKey);
    // Only join an in-flight build from the CURRENT generation. A build bound to an
    // older (pre-write) generation reflects stale state, so a new request starts a
    // fresh build instead of joining it.
    if (!inflight || inflight.generation !== currentGeneration) {
        const generation = currentGeneration;
        const promise = runBuilder(buildPayload, request).then((payload)=>storePayload(cacheKey, payload, generation));
        inflight = {
            generation,
            promise
        };
        catalogInFlight.set(cacheKey, inflight);
        promise.finally(()=>{
            if (catalogInFlight.get(cacheKey)?.promise === promise) catalogInFlight.delete(cacheKey);
        });
    }
    const payload = await inflight.promise;
    return new Response(payload.body, {
        status: payload.status,
        headers: mergeCatalogHeaders(corsHeaders, payload.headers, diagnosticHeaders)
    });
}
function __resetCatalogBuilderRunsForTest() {
    _catalogBuilderRuns = 0;
    catalogCache.clear();
    catalogInFlight.clear();
    lastSeenCatalogCacheVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogCacheVersion"])();
}
function __getCatalogBuilderRunsForTest() {
    return _catalogBuilderRuns;
}
function __expireCatalogCacheForTest(msAgo = 1) {
    const expiresAt = Date.now() - msAgo;
    for (const [key, entry] of catalogCache.entries()){
        catalogCache.set(key, {
            ...entry,
            expiresAt
        });
    }
}
function __setCatalogCacheEntryForTest(request, entry) {
    catalogCache.set(buildCatalogCacheKey(request), entry);
}
async function __flushCatalogBackgroundRefreshForTest() {
    await Promise.all([
        ...catalogInFlight.values()
    ].map((entry)=>entry.promise.catch(()=>{})));
}
function __forceCatalogInFlightRejectionForTest(request, error) {
    const rejected = Promise.reject(error);
    rejected.catch(()=>{}); // mark as handled — avoids an unhandledRejection warning
    // Bind to the current generation so the cold path still joins it (a stale
    // generation would be skipped as pre-write state and never awaited).
    catalogInFlight.set(buildCatalogCacheKey(request), {
        generation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogCacheVersion"])(),
        promise: rejected
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/v1/models/catalog.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getUnifiedModelsResponse",
    ()=>getUnifiedModelsResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/models.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$aliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/aliases.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/lazyConnectionView.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$aliasBackedModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/aliasBackedModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogSyncedCoverage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogSyncedCoverage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$syncedCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/syncedCapabilities.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/embeddingRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/imageRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$rerankRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/rerankRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$audioRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/audioRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$moderationRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/moderationRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$videoRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/videoRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$musicRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/musicRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/combo.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboStructure.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/builtinCatalog.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modelFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/modelFamily.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/activeSyncedCatalog.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$managedAvailableModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/managedAvailableModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$modelListingCapability$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/modelListingCapability.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2f$openrouterCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/catalog/openrouterCatalog.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelMetadataRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogResponse.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/noAuthProviders.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogHelpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogOpenrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogOpenrouter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogVision.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogProviderMaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogProviderMaps.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogRequest.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryMetrics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/freeModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$codexDiscoveryPolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/codexDiscoveryPolicy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
// The response cache (coalescing, short-TTL memoization and stale-while-revalidate)
// lives in ./catalogCache. Re-exported here because the existing tests import the
// hooks from this module, and CATALOG_STALE_WHILE_REVALIDATE_MS is part of the
// documented behavior of this endpoint.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalogCache.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$managedAvailableModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogProviderMaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$managedAvailableModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogProviderMaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
async function getUnifiedModelsResponse(request, corsHeaders = {}) {
    const diagnosticHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCatalogDiagnosticsHeaders"])({
        request
    });
    // #6408 fast path: reject unauthorized callers first (auth state is per-request
    // and MUST NOT be cached), then coalesce identical concurrent requests + short-
    // TTL memoize the serialized JSON body.
    let settingsForAuth = {};
    try {
        try {
            settingsForAuth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        } catch  {}
        const authRejection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogAuthRejection"])(request, settingsForAuth, {
            ...corsHeaders,
            ...diagnosticHeaders
        });
        if (authRejection) return authRejection;
    } catch  {
    // Fall through to full builder on auth-check failure; core handles errors.
    }
    // Best-effort cc-discovery usage metric — count every authorized GET /v1/models
    // hit from a Claude Code client, cache hit or not. Never blocks/slows the
    // request (incrementCcDiscoveryHitCount already swallows its own errors).
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCcDiscoveryModelCatalogClient"])(request)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["incrementCcDiscoveryHitCount"])();
    }
    try {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCachedCatalogResponse"])(request, {
            corsHeaders,
            diagnosticHeaders
        }, buildCatalogPayload, {
            hideAutoCombos: settingsForAuth?.hideAutoCombos === true,
            hideNoThinkVariants: settingsForAuth?.hideNoThinkVariants === true
        });
    } catch (err) {
        // Hard rule #12: never put a raw err.message/err.stack in a response body.
        // Route it through the shared sanitizer instead — same status/type/code as
        // before, minus the stack-trace/path leak.
        const message = err instanceof Error ? err.message : String(err);
        return Response.json((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildErrorBody"])(500, message, undefined, {
            type: "server_error",
            code: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["INTERNAL_PROXY_ERROR"]
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                ...diagnosticHeaders
            }
        });
    }
}
async function buildCatalogPayload(request) {
    const built = await buildUnifiedModelsResponseCore(request);
    const body = await built.text();
    const headers = {};
    built.headers.forEach((value, key)=>{
        headers[key] = value;
    });
    // Read the configurable cache TTL from database settings.
    // Falls back to the hardcoded default if not set or on error.
    let cacheTTL = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CATALOG_CACHE_TTL_MS_DEFAULT"];
    try {
        const dbSettings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabaseSettings"])();
        cacheTTL = dbSettings.cache?.modelCatalogCacheTtlMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CATALOG_CACHE_TTL_MS_DEFAULT"];
    } catch  {
    // Swallow — use default TTL on DB error
    }
    return {
        body,
        headers,
        status: built.status,
        cacheTTL
    };
}
/**
 * Original catalog builder. Runs once per unique cache key per TTL window.
 */ async function buildUnifiedModelsResponseCore(request, corsHeaders = {}) {
    const diagnosticHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCatalogDiagnosticsHeaders"])({
        request
    });
    try {
        let settings = {};
        try {
            settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        } catch  {}
        const authRejection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogAuthRejection"])(request, settings, {
            ...corsHeaders,
            ...diagnosticHeaders
        });
        if (authRejection) return authRejection;
        const { aliasToProviderId, providerIdToAlias } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogProviderMaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAliasMaps"])();
        const _qp = new URL(request.url).searchParams.get("prefix");
        const prefixMode = _qp === "alias" || _qp === "canonical" || _qp === "dual" ? _qp : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelsCatalogPrefixMode"])();
        const includeAlias = prefixMode !== "canonical";
        const includeCanonical = prefixMode !== "alias";
        const resolveCanonicalProviderId = (aliasOrProviderId, fallbackProviderId)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogProviderMaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCanonicalProviderId"])(aliasToProviderId, aliasOrProviderId, fallbackProviderId);
        const aliasMaps = {
            aliasToProviderId,
            providerIdToAlias
        };
        // Issue #96: Allow blocking specific providers from the models list
        const blockedProviders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeBlockedProviderSet"])(settings.blockedProviders);
        // #6316: Opt-in filter — hide paid-only models via `isFreeModel()`. Only applied to
        // PROVIDER_MODELS + OpenRouter loops (where pricing metadata / :free suffix / catalog
        // membership is available). Modality registries (embedding/image/rerank/audio/
        // moderation/video/music) represent local capabilities without pricing, so they are
        // exempt. Combos + auto/* + synced/custom/alias-backed rows also stay unfiltered —
        // extending v1 scope to those requires per-entry pricing lookup not available today.
        const hidePaid = settings.hidePaidModels === true;
        // #9418: Opt-in filter — skip the entire auto/* synthesis loop when the operator
        // does not want built-in virtual combos advertised in the catalog. User-defined
        // combos are unaffected; routing still works for ids sent explicitly.
        const hideAuto = settings.hideAutoCombos === true;
        const shouldHidePaid = (providerKey, modelId, pricing)=>{
            if (!hidePaid) return false;
            const provider = aliasToProviderId[providerKey] || providerKey;
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["providerHasFreeModels"])(provider)) return true;
            return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFreeModel"])(provider, {
                id: modelId,
                pricing: pricing
            });
        };
        // Get active provider connections
        let connections = [];
        let totalConnectionCount = 0; // Track if DB has ANY connections (even disabled)
        try {
            connections = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedRawProviderConnections"])()).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createLazyConnectionView"]);
            totalConnectionCount = connections.length;
            // Filter to only active connections
            connections = connections.filter((c)=>c.isActive !== false);
        } catch (e) {
            // If database not available, show no provider models (safe default)
            console.log("[catalog] Could not fetch providers:", e);
        }
        // Get provider nodes (for compatible providers with custom prefixes)
        let providerNodes = [];
        try {
            providerNodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])();
        } catch (e) {
            console.log("Could not fetch provider nodes");
        }
        // Build map of provider node ID to prefix and type for compatible providers
        const providerIdToPrefix = {};
        const nodeIdToProviderType = {};
        for (const node of providerNodes){
            const resolvedPrefix = node.prefix?.trim() || node.name?.trim()?.toLowerCase()?.replace(/\s+/g, "-")?.replace(/[^a-z0-9-]/g, "") || null;
            if (resolvedPrefix) {
                providerIdToPrefix[node.id] = resolvedPrefix;
            }
            if (node.type) {
                nodeIdToProviderType[node.id] = node.type;
            }
        }
        // #8327: `resolveCanonicalProviderId`/`canonicalProviderId` only know the static
        // AI_PROVIDERS/PROVIDER_MODELS alias maps, so a compatible-provider node (whose raw
        // `id` is an internal UUID, never present in those static maps) falls through every
        // lookup and returns the raw UUID verbatim. That UUID is still required for the
        // internal registry/connection/hidden-model lookups that key off `canonicalProviderId`
        // (getConnectionsForProvider, getModelIsHidden, etc. are keyed by the raw node id, not
        // the prefix) — so `canonicalProviderId` itself must stay untouched. What must NOT leak
        // is the raw UUID in the *public* `owned_by` field: resolve it to the operator's
        // configured prefix there, and only there.
        const resolvePublicOwnerId = (providerId, canonicalProviderId)=>providerIdToPrefix[providerId] || canonicalProviderId;
        // Get combos
        let combos = [];
        try {
            combos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCombos"])();
        } catch (e) {
            console.log("Could not fetch combos");
        }
        // Build set of active provider aliases
        const activeAliases = new Set();
        const connectionsByProvider = new Map();
        const registerConnectionKey = (key, connection)=>{
            if (!key) return;
            const existing = connectionsByProvider.get(key) || [];
            existing.push(connection);
            connectionsByProvider.set(key, existing);
        };
        for (const conn of connections){
            const alias = providerIdToAlias[conn.provider] || conn.provider;
            activeAliases.add(alias);
            activeAliases.add(conn.provider);
            registerConnectionKey(alias, conn);
            registerConnectionKey(conn.provider, conn);
        }
        // noAuth providers have no DB rows; settings.blockedProviders disables them.
        for (const p of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"])){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoAuthProviderBlocked"])(blockedProviders, p.id, "alias" in p ? p.alias : null)) continue;
            activeAliases.add(p.id);
            if ("alias" in p && typeof p.alias === "string") activeAliases.add(p.alias);
        }
        const getConnectionsForProvider = (...keys)=>{
            const seen = new Set();
            const collected = [];
            for (const key of keys){
                if (!key) continue;
                for (const connection of connectionsByProvider.get(key) || []){
                    if (!connection?.id || seen.has(connection.id)) continue;
                    seen.add(connection.id);
                    collected.push(connection);
                }
            }
            return collected;
        };
        const providerSupportsModel = (providerKey, modelId)=>{
            const providerId = aliasToProviderId[providerKey] || providerKey;
            const alias = providerIdToAlias[providerId] || providerKey;
            // noAuth providers have no connection rows — treat every model as eligible. (#2798)
            const isNoAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoAuthProviderKey"])(providerId, providerKey, alias);
            if (isNoAuth && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoAuthProviderBlocked"])(blockedProviders, providerId, providerKey, alias)) return true;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasEligibleConnectionForModel"])(getConnectionsForProvider(providerKey, providerId, alias), modelId);
        };
        const getRegistryModel = (providerId, modelId)=>{
            const alias = providerIdToAlias[providerId] || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][providerId] || providerId;
            const providerModels = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][alias] || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][providerId] || [];
            return providerModels.find((model)=>model?.id === modelId) || null;
        };
        // prefixRoutesToProvider is imported directly from catalogProviderMaps.ts (no
        // map dependency — pure parseModel() probe), used both here and at the two
        // includeCanonical prefix-collision checks below.
        const getProviderPrefixes = (providerId, rawProvider)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogProviderMaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProviderPrefixes"])(aliasMaps, providerId, rawProvider);
        const getComboTargetModelId = (target)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogProviderMaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboTargetModelId"])(aliasMaps, target);
        const getComboTargetCatalogMetadata = (target)=>{
            const targetModel = getComboTargetModelId(target);
            if (!targetModel) return null;
            const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCanonicalModelMetadata"])({
                provider: targetModel.providerId,
                model: targetModel.modelId
            });
            if (!canonical) return null;
            const source = canonical.metadata.source;
            if (!source.providerRegistry && !source.staticSpec && !source.syncedCapability) return null;
            const providerId = canonical.provider || targetModel.providerId;
            const modelId = canonical.model || targetModel.modelId;
            const synced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedCapability"])(providerId, modelId);
            const spec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelSpec"])(modelId);
            const registryModel = getRegistryModel(providerId, modelId);
            const syncedInputModalities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseJsonStringArray"])(synced?.modalities_input);
            const syncedOutputModalities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseJsonStringArray"])(synced?.modalities_output);
            const syncedContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPositiveFiniteNumber"])(synced?.limit_context) ? synced.limit_context : undefined;
            const registryContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPositiveFiniteNumber"])(registryModel?.contextLength) ? registryModel.contextLength : undefined;
            const specContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPositiveFiniteNumber"])(spec?.contextWindow) ? spec.contextWindow : undefined;
            const contextLength = syncedContext ?? registryContext ?? specContext ?? ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTokenLimit"])(providerId, modelId) || undefined);
            const registryInputLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPositiveFiniteNumber"])(registryModel?.maxInputTokens) ? registryModel.maxInputTokens : undefined;
            const syncedInputLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPositiveFiniteNumber"])(synced?.limit_input) ? synced.limit_input : undefined;
            const maxInputTokens = registryInputLimit ?? syncedInputLimit ?? contextLength;
            const maxOutputTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPositiveFiniteNumber"])(synced?.limit_output) ? synced.limit_output : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPositiveFiniteNumber"])(spec?.maxOutputTokens) ? spec.maxOutputTokens : undefined;
            const syncedVision = typeof synced?.attachment === "boolean" ? synced.attachment : syncedInputModalities.length > 0 || syncedOutputModalities.length > 0 ? [
                ...syncedInputModalities,
                ...syncedOutputModalities
            ].some((entry)=>// eslint-disable-next-line no-restricted-syntax -- teknik string kontrolü, kullanıcı metni araması değil
                entry.toLowerCase().includes("image")) : undefined;
            const registryVision = typeof registryModel?.supportsVision === "boolean" ? registryModel.supportsVision : undefined;
            const specVision = typeof spec?.supportsVision === "boolean" ? spec.supportsVision : undefined;
            const knownVision = syncedVision ?? registryVision ?? specVision;
            const inputModalities = syncedInputModalities.length > 0 ? syncedInputModalities : knownVision === true ? [
                "text",
                "image"
            ] : undefined;
            const outputModalities = syncedOutputModalities.length > 0 ? syncedOutputModalities : knownVision === true ? [
                "text"
            ] : undefined;
            const capabilities = {};
            capabilities.tool_calling = canonical.capabilities.toolCalling;
            capabilities.reasoning = canonical.capabilities.reasoning;
            if (typeof canonical.capabilities.vision === "boolean") {
                capabilities.vision = canonical.capabilities.vision;
            }
            if (typeof canonical.capabilities.attachment === "boolean") {
                capabilities.attachment = canonical.capabilities.attachment;
            }
            if (typeof canonical.capabilities.structuredOutput === "boolean") {
                capabilities.structured_output = canonical.capabilities.structuredOutput;
            }
            if (typeof canonical.capabilities.temperature === "boolean") {
                capabilities.temperature = canonical.capabilities.temperature;
            }
            Object.assign(capabilities, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getThinkingCapabilityFields"])(providerId, modelId, canonical.capabilities.supportsThinking, registryModel?.supportedThinkingEfforts));
            return {
                ...contextLength ? {
                    contextLength
                } : {},
                ...maxInputTokens ? {
                    maxInputTokens
                } : {},
                ...maxOutputTokens ? {
                    maxOutputTokens
                } : {},
                ...inputModalities && inputModalities.length > 0 ? {
                    inputModalities
                } : {},
                ...outputModalities && outputModalities.length > 0 ? {
                    outputModalities
                } : {},
                capabilities
            };
        };
        const buildComboCatalogMetadata = (combo, targets)=>{
            const explicitContextLength = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPositiveFiniteNumber"])(combo.context_length) ? combo.context_length : undefined;
            const baseMetadata = explicitContextLength ? {
                context_length: explicitContextLength
            } : {};
            if (targets.length === 0) return baseMetadata;
            const targetMetadata = targets.map((target)=>getComboTargetCatalogMetadata(target));
            const knownMetadata = targetMetadata.filter((metadata)=>metadata !== null);
            if (knownMetadata.length === 0) return baseMetadata;
            const contextLength = explicitContextLength ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["minKnownNumber"])(knownMetadata.map((metadata)=>metadata.contextLength));
            const maxInputTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["minKnownNumber"])(knownMetadata.map((metadata)=>metadata.maxInputTokens));
            const maxOutputTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["minKnownNumber"])(knownMetadata.map((metadata)=>metadata.maxOutputTokens));
            const inputModalities = knownMetadata.every((metadata)=>Array.isArray(metadata.inputModalities) && metadata.inputModalities.length > 0) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["intersectStringArrays"])(knownMetadata.map((metadata)=>metadata.inputModalities || [])) : [];
            const outputModalities = knownMetadata.every((metadata)=>Array.isArray(metadata.outputModalities) && metadata.outputModalities.length > 0) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["intersectStringArrays"])(knownMetadata.map((metadata)=>metadata.outputModalities || [])) : [];
            const capabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeComboCapabilities"])(knownMetadata);
            return {
                ...baseMetadata,
                ...contextLength ? {
                    context_length: contextLength
                } : {},
                ...maxInputTokens ? {
                    max_input_tokens: maxInputTokens
                } : {},
                ...maxOutputTokens ? {
                    max_output_tokens: maxOutputTokens
                } : {},
                ...inputModalities.length > 0 ? {
                    input_modalities: inputModalities
                } : {},
                ...outputModalities.length > 0 ? {
                    output_modalities: outputModalities
                } : {},
                ...Object.keys(capabilities).length > 0 ? {
                    capabilities
                } : {}
            };
        };
        // Collect models from active providers (or all if none active)
        const models = [];
        const timestamp = Math.floor(Date.now() / 1000);
        const listedIds = new Set();
        // #8770 follow-up: a quota-exclusive key (allowedQuotas non-empty) only ever
        // receives the pool's `qtSd/*` combos — the key-permission step further down
        // discards the entire catalog for it. Building that catalog first costs ~1.2s
        // of CPU on a 1 vCPU host (measured), enough for Claude Code's 3s gateway model
        // discovery to time out under contention, and every byte of it is thrown away.
        // Everything the quota path needs (`combos`, `timestamp`,
        // `buildComboCatalogMetadata`) already exists here, so return before the
        // provider/auto-combo/registry loops start.
        const earlyApiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])(request);
        if (earlyApiKey) {
            const { getApiKeyMetadata } = await __turbopack_context__.A("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript, async loader)");
            const earlyKeyMeta = await getApiKeyMetadata(earlyApiKey);
            if (earlyKeyMeta?.allowedQuotas && earlyKeyMeta.allowedQuotas.length > 0) {
                const { buildQuotaExclusiveModels } = await __turbopack_context__.A("[project]/src/lib/quota/quotaCombos.ts [app-route] (ecmascript, async loader)");
                const quotaModels = await buildQuotaExclusiveModels(earlyKeyMeta.allowedQuotas, combos, timestamp, (c)=>buildComboCatalogMetadata(c, combos));
                const quotaFinal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyCatalogPostFilters"])(request, quotaModels, {
                    connections,
                    prefixMode,
                    aliasToProviderId,
                    hideNoThinkVariants: settings.hideNoThinkVariants === true
                });
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["finalizeCatalogResponse"])(request, quotaFinal, ()=>undefined, {
                    ...corsHeaders,
                    ...diagnosticHeaders
                });
            }
        }
        // #4164: advertise the built-in zero-setup `auto/*` combos at the very top.
        // #4189: enrich each with the combo's advertised context/output limits (computed
        // by createBuiltinAutoCombo from its candidate pool) + baseline capabilities, so
        // OpenAI-compatible clients that build their picker from /v1/models (e.g. Hermes)
        // receive token metadata before the first request instead of a bare entry. If the
        // combo cannot be materialized (e.g. no eligible connections yet) the minimal
        // #4164 entry is emitted instead, so the id is never dropped.
        // #4235 Phase B: also advertise the curated `auto/<category>[:<tier>]` combos.
        // #6453: also advertise the `auto/<family>` combos (auto/glm, auto/minimax, ...).
        // #9418: skip the entire loop when hideAutoCombos is on — the ids are still
        // routable when sent explicitly, just not advertised in the catalog.
        if (!hideAuto) {
            for (const autoId of [
                ...Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AUTO_TEMPLATE_VARIANTS"]),
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AUTO_SUFFIX_VARIANTS"],
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modelFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AUTO_FAMILY_IDS"]
            ]){
                if (blockedProviders.has("auto") || listedIds.has(autoId)) continue; // #5192
                // #6328 (follow-up to #6495 / #6512): REMOVE — not just hide — paid-tier
                // auto/* ids (auto/pro-* + auto/*:pro) from the advertised catalog when the
                // operator opts into hidePaidModels. The candidate-pool filter in
                // virtualFactory (#6512) still gates request-time routing for the rest.
                if (hidePaid && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isPaidTierAutoId"])(autoId)) continue;
                listedIds.add(autoId);
                const baseAutoEntry = {
                    id: autoId,
                    object: "model",
                    created: timestamp,
                    owned_by: "combo",
                    permission: [],
                    root: autoId,
                    parent: null
                };
                try {
                    const suffix = autoId.replace(/^auto\/?/, "");
                    const virtualCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$builtinCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createBuiltinAutoCombo"])(autoId, suffix);
                    const contextLength = virtualCombo.advertisedContextLength || 128000;
                    const maxOutputTokens = virtualCombo.advertisedMaxOutputTokens || 8192;
                    models.push({
                        ...baseAutoEntry,
                        context_length: contextLength,
                        max_input_tokens: contextLength,
                        max_output_tokens: maxOutputTokens,
                        capabilities: {
                            tool_calling: true,
                            reasoning: true,
                            thinking: true,
                            temperature: true
                        }
                    });
                } catch (err) {
                    console.log(`[catalog] Could not materialize built-in auto model ${autoId}:`, err);
                    models.push(baseAutoEntry);
                }
            }
        }
        // Add combos first (they appear at the top) — only active ones
        for (const combo of combos){
            if (combo.isActive === false || combo.isHidden === true) continue;
            if (typeof combo.name !== "string" || combo.name.length === 0) continue;
            if (listedIds.has(combo.name)) continue; // #4164: don't shadow a built-in auto/* id
            // Skip combos whose any underlying target model is hidden
            const comboTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveNestedComboTargets"])(combo, combos);
            const visibleTargets = comboTargets.filter((target)=>{
                const resolved = getComboTargetModelId(target);
                return resolved ? !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(resolved.providerId, resolved.modelId) : true;
            });
            if (visibleTargets.length === 0) continue;
            const comboMetadata = buildComboCatalogMetadata(combo, visibleTargets);
            listedIds.add(combo.name);
            models.push({
                id: combo.name,
                object: "model",
                created: timestamp,
                owned_by: "combo",
                permission: [],
                root: combo.name,
                parent: null,
                ...comboMetadata
            });
        }
        let syncedModelsByProvider = {};
        try {
            syncedModelsByProvider = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllActiveSyncedModels"])();
        } catch (e) {
            // DB unavailable — log and fall through; static models remain as defaults.
            console.log("[catalog] Could not fetch synced available models:", e);
        }
        const providersWithSyncedModels = new Set(Object.keys(syncedModelsByProvider).filter((pid)=>{
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$modelListingCapability$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["providerUsesCuratedModelsOnly"])(pid)) return false;
            const models = syncedModelsByProvider[pid];
            return Array.isArray(models) && models.length > 0;
        }));
        const isRegisteredEffortVariant = (providerModels, modelId)=>{
            for (const suffix of [
                "none",
                "low",
                "medium",
                "high",
                "max",
                "xhigh"
            ]){
                const suffixWithSeparator = `-${suffix}`;
                if (!modelId.endsWith(suffixWithSeparator)) continue;
                const baseModelId = modelId.slice(0, -suffixWithSeparator.length);
                return providerModels.some((candidate)=>candidate.id === baseModelId);
            }
            return false;
        };
        // Map canonical provider id -> set of synced display-model ids, so the static
        // loop below can decide which static models a provider's synced discovery list
        // actually covers (and which static models it must preserve).
        const syncedModelIdsByCanonicalProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogSyncedCoverage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildSyncedModelIdsByCanonicalProvider"])(syncedModelsByProvider, resolveCanonicalProviderId, providerIdToPrefix, providerIdToAlias);
        // Add provider models (chat)
        for (const [alias, providerModels] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"])){
            const providerId = aliasToProviderId[alias] || alias;
            const canonicalProviderId = resolveCanonicalProviderId(alias, providerId);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoAuthProviderBlocked"])(blockedProviders, canonicalProviderId, alias) || blockedProviders.has(alias) || blockedProviders.has(canonicalProviderId)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoAuthRawProviderPrefix"])(canonicalProviderId, alias)) continue;
            if (!activeAliases.has(alias) && !activeAliases.has(canonicalProviderId)) {
                continue;
            }
            for (const model of providerModels){
                // Synced models replace static base entries they COVER, but they do not
                // carry aliases registered for provider-specific reasoning variants, and
                // static models the synced list does NOT cover must be preserved (the
                // gateway still routes them — e.g. command-code's static
                // `deepseek/deepseek-v4-flash` which its discovery never lists). Before
                // the fix, a provider with any synced model silently dropped ALL its
                // static models.
                const syncedForProvider = syncedModelIdsByCanonicalProvider.get(canonicalProviderId);
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogSyncedCoverage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldSuppressStaticModelBySyncedCoverage"])({
                    providerHasSynced: syncedForProvider !== undefined && syncedForProvider.size > 0,
                    staticModelId: model.id,
                    syncedModelIds: syncedForProvider ? [
                        ...syncedForProvider
                    ] : []
                }) && !isRegisteredEffortVariant(providerModels, model.id)) continue;
                if (!providerSupportsModel(canonicalProviderId, model.id)) continue;
                const aliasId = `${alias}/${model.id}`;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(canonicalProviderId, model.id)) continue;
                if (shouldHidePaid(canonicalProviderId, model.id, model.pricing)) continue;
                const visionFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVisionCapabilityFields"])(aliasId) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVisionCapabilityFields"])(model.id);
                if (includeAlias) {
                    models.push({
                        id: aliasId,
                        object: "model",
                        created: timestamp,
                        owned_by: canonicalProviderId,
                        permission: [],
                        root: model.id,
                        parent: null,
                        ...visionFields || {}
                    });
                }
                if (includeCanonical && canonicalProviderId !== alias && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoAuthProviderKey"])(canonicalProviderId) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogProviderMaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prefixRoutesToProvider"])(canonicalProviderId, canonicalProviderId)) {
                    const providerIdModel = `${canonicalProviderId}/${model.id}`;
                    const providerVisionFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVisionCapabilityFields"])(providerIdModel) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVisionCapabilityFields"])(model.id);
                    models.push({
                        id: providerIdModel,
                        object: "model",
                        created: timestamp,
                        owned_by: canonicalProviderId,
                        permission: [],
                        root: model.id,
                        parent: includeAlias ? aliasId : null,
                        ...providerVisionFields || {}
                    });
                }
            }
        }
        for (const modelId of __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CODEX_NATIVE_UNPREFIXED_MODELS"]){
            if (!providerSupportsModel("codex", modelId)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])("codex", modelId)) continue;
            const alias = providerIdToAlias.codex || "cx";
            const aliasId = `${alias}/${modelId}`;
            const providerIdModel = `codex/${modelId}`;
            const entries = [
                {
                    id: aliasId,
                    parent: null
                },
                {
                    id: providerIdModel,
                    parent: aliasId
                },
                {
                    id: modelId,
                    parent: providerIdModel
                }
            ];
            for (const entry of entries){
                if (models.some((existingModel)=>existingModel.id === entry.id)) continue;
                models.push({
                    id: entry.id,
                    object: "model",
                    created: timestamp,
                    owned_by: "codex",
                    permission: [],
                    root: modelId,
                    parent: entry.parent
                });
            }
        }
        try {
            for (const [providerId, syncedModels] of Object.entries(syncedModelsByProvider)){
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$modelListingCapability$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["providerUsesCuratedModelsOnly"])(providerId)) continue;
                if (!Array.isArray(syncedModels) || syncedModels.length === 0) continue;
                if (blockedProviders.has(providerId)) continue;
                if (providerId === "reka") continue;
                const prefix = providerIdToPrefix[providerId];
                const alias = prefix || providerIdToAlias[providerId] || providerId;
                const canonicalProviderId = resolveCanonicalProviderId(alias, providerId);
                const parentProviderType = nodeIdToProviderType[providerId];
                if (!activeAliases.has(alias) && !activeAliases.has(canonicalProviderId) && !activeAliases.has(providerId) && !(parentProviderType && activeAliases.has(parentProviderType))) {
                    continue;
                }
                for (const sm of syncedModels){
                    if (!providerSupportsModel(canonicalProviderId, sm.id)) continue;
                    if (canonicalProviderId === "codex" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$codexDiscoveryPolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCodexDiscoveryModelExcluded"])(sm)) {
                        continue;
                    }
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(providerId, sm.id)) continue;
                    // #6457: some upstream discovery catalogs (e.g. HuggingFace's live
                    // `/v1/models`) return image/diffusion models with no modality info,
                    // so `endpoints` below would default to ["chat"] and misrepresent
                    // them as chat-capable. Skip a registered image model only when its
                    // synced metadata does not explicitly advertise a chat endpoint.
                    // Multi-capability models may intentionally share an id between the
                    // chat and image catalogs; getAllImageModels() adds the image entry.
                    const explicitlySupportsChat = sm.supportedEndpoints?.some((endpoint)=>endpoint === "chat" || endpoint === "responses");
                    if (!explicitlySupportsChat && ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRegisteredImageModel"])(canonicalProviderId, sm.id) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRegisteredImageModel"])(providerId, sm.id))) {
                        continue;
                    }
                    // #6328: apply hidePaidModels to synced provider rows too. Synced rows
                    // rarely carry pricing metadata, so shouldHidePaid() falls through to
                    // the FREE_MODEL_IDS_BY_PROVIDER catalog — providers with a curated
                    // free roster show only those; providers with none fall through to
                    // hide-all via providerHasFreeModels() === false.
                    if (shouldHidePaid(canonicalProviderId, sm.id, sm.pricing)) continue;
                    const registryEntry = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REGISTRY"][providerId];
                    const displayModelId = registryEntry?.modelIdPrefix && sm.id.startsWith(registryEntry.modelIdPrefix) ? sm.id.slice(registryEntry.modelIdPrefix.length) : sm.id;
                    const aliasId = `${alias}/${displayModelId}`;
                    const endpoints = Array.isArray(sm.supportedEndpoints) ? sm.supportedEndpoints : [
                        "chat"
                    ];
                    const apiFormat = typeof sm.apiFormat === "string" ? sm.apiFormat : "chat-completions";
                    let modelType;
                    if (endpoints.includes("embeddings")) modelType = "embedding";
                    else if (endpoints.includes("rerank")) modelType = "rerank";
                    else if (endpoints.includes("images")) modelType = "image";
                    else if (endpoints.includes("audio")) modelType = "audio";
                    const syncedFields = {
                        ...modelType ? {
                            type: modelType
                        } : {},
                        ...apiFormat !== "chat-completions" ? {
                            api_format: apiFormat
                        } : {},
                        ...modelType === "audio" ? {
                            subtype: "transcription"
                        } : {},
                        ...sm.inputTokenLimit ? {
                            context_length: sm.inputTokenLimit
                        } : {},
                        ...typeof sm.outputTokenLimit === "number" ? {
                            max_output_tokens: sm.outputTokenLimit
                        } : {},
                        ...endpoints.length > 1 || !endpoints.includes("chat") ? {
                            supported_endpoints: endpoints
                        } : {},
                        // #4264/#7694: vision + reasoning-effort-tier flags captured at sync time,
                        // merged into a single capabilities object (see ./syncedCapabilities.ts).
                        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$syncedCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildSyncedCapabilities"])(sm) ? {
                            capabilities: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$syncedCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildSyncedCapabilities"])(sm)
                        } : {}
                    };
                    const existingAliasModel = models.find((model)=>model.id === aliasId);
                    if (existingAliasModel) {
                        const mergedCapabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$syncedCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeSyncedCapabilities"])(existingAliasModel.capabilities, sm);
                        Object.assign(existingAliasModel, syncedFields);
                        if (mergedCapabilities) existingAliasModel.capabilities = mergedCapabilities;
                        continue;
                    }
                    if (includeAlias) {
                        models.push({
                            id: aliasId,
                            object: "model",
                            created: timestamp,
                            owned_by: resolvePublicOwnerId(providerId, canonicalProviderId),
                            permission: [],
                            root: sm.id,
                            parent: null,
                            ...syncedFields
                        });
                    }
                    if (includeAlias && modelType === "audio") {
                        models.push({
                            id: aliasId,
                            object: "model",
                            created: timestamp,
                            owned_by: resolvePublicOwnerId(providerId, canonicalProviderId),
                            permission: [],
                            root: sm.id,
                            parent: null,
                            type: "audio",
                            subtype: "speech",
                            ...sm.inputTokenLimit ? {
                                context_length: sm.inputTokenLimit
                            } : {},
                            ...typeof sm.outputTokenLimit === "number" ? {
                                max_output_tokens: sm.outputTokenLimit
                            } : {},
                            ...endpoints.length > 1 || !endpoints.includes("chat") ? {
                                supported_endpoints: endpoints
                            } : {}
                        });
                    }
                    if (includeCanonical && canonicalProviderId !== alias && !prefix) {
                        const providerPrefixedId = `${canonicalProviderId}/${displayModelId}`;
                        if (!models.some((model)=>model.id === providerPrefixedId)) {
                            models.push({
                                id: providerPrefixedId,
                                object: "model",
                                created: timestamp,
                                owned_by: resolvePublicOwnerId(providerId, canonicalProviderId),
                                permission: [],
                                root: sm.id,
                                parent: includeAlias ? aliasId : null,
                                ...syncedFields
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.error("[catalog] Error fetching synced provider models:", err);
        }
        if (activeAliases.has("openrouter") && !blockedProviders.has("openrouter") && !providersWithSyncedModels.has("openrouter")) {
            try {
                const openRouterCatalog = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2f$openrouterCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpenRouterCatalog"])();
                for (const openRouterModel of openRouterCatalog.data || []){
                    if (!openRouterModel?.id || typeof openRouterModel.id !== "string") continue;
                    const qualifiedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogOpenrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["qualifyOpenRouterModelId"])(openRouterModel.id);
                    if (models.some((existingModel)=>existingModel?.id === qualifiedId)) continue;
                    const inputModalities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogOpenrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeOpenRouterModalities"])(openRouterModel.architecture?.input_modalities);
                    const outputModalities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogOpenrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeOpenRouterModalities"])(openRouterModel.architecture?.output_modalities);
                    const modelType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogOpenrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpenRouterModelType"])(inputModalities, outputModalities);
                    const isFree = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogOpenrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isOpenRouterFreeModel"])(openRouterModel);
                    if (hidePaid && !isFree) continue;
                    const supportedParameters = Array.isArray(openRouterModel.supported_parameters) ? openRouterModel.supported_parameters : [];
                    const capabilities = {};
                    if (inputModalities.includes("image")) capabilities.vision = true;
                    if (supportedParameters.includes("reasoning") || supportedParameters.includes("include_reasoning")) {
                        capabilities.reasoning = true;
                    }
                    if (supportedParameters.includes("tools")) capabilities.tool_calling = true;
                    if (supportedParameters.includes("structured_outputs") || supportedParameters.includes("response_format")) {
                        capabilities.structured_output = true;
                    }
                    models.push({
                        id: qualifiedId,
                        object: "model",
                        created: openRouterModel.created || timestamp,
                        owned_by: "openrouter",
                        permission: [],
                        root: openRouterModel.id,
                        parent: null,
                        name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogOpenrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpenRouterDisplayName"])(openRouterModel),
                        type: modelType,
                        ...isFree ? {
                            free: true
                        } : {},
                        ...typeof openRouterModel.context_length === "number" ? {
                            context_length: openRouterModel.context_length
                        } : {},
                        ...typeof openRouterModel.top_provider?.max_completion_tokens === "number" ? {
                            max_output_tokens: openRouterModel.top_provider.max_completion_tokens
                        } : {},
                        ...inputModalities.length > 0 ? {
                            input_modalities: inputModalities
                        } : {},
                        ...outputModalities.length > 0 ? {
                            output_modalities: outputModalities
                        } : {},
                        ...Object.keys(capabilities).length > 0 ? {
                            capabilities
                        } : {}
                    });
                }
            } catch (err) {
                console.error("[catalog] Error loading OpenRouter catalog:", err);
            }
        }
        // Helper: check if a provider is active (by provider id or alias)
        const isProviderActive = (provider)=>{
            if (activeAliases.size === 0) return false; // No active connections = show nothing
            const alias = providerIdToAlias[provider] || provider;
            const canonicalProviderId = resolveCanonicalProviderId(alias, provider);
            // FIX #1752: Ensure blocked providers are not returned for non-chat models
            if (blockedProviders.has(alias) || blockedProviders.has(canonicalProviderId) || blockedProviders.has(provider)) {
                return false;
            }
            return activeAliases.has(alias) || activeAliases.has(provider);
        };
        const hasEquivalentSpecialtyModel = (providerId, rawModelId, type, scopedModelId)=>models.some((model)=>{
                if (model?.id === scopedModelId) return true;
                if (model?.owned_by !== providerId || model?.type !== type) return false;
                const existingRoot = typeof model?.root === "string" ? model.root : typeof model?.id === "string" ? model.id.split("/").pop() : null;
                return existingRoot === rawModelId;
            });
        // Add embedding models (filtered by active providers)
        for (const embModel of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllEmbeddingModels"])()){
            if (!isProviderActive(embModel.provider)) continue;
            const rawModelId = embModel.id.startsWith(`${embModel.provider}/`) ? embModel.id.slice(embModel.provider.length + 1) : embModel.id;
            if (!providerSupportsModel(embModel.provider, rawModelId)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(embModel.provider, rawModelId)) continue;
            if (hasEquivalentSpecialtyModel(embModel.provider, rawModelId, "embedding", embModel.id)) {
                continue;
            }
            models.push({
                id: embModel.id,
                object: "model",
                created: timestamp,
                owned_by: embModel.provider,
                root: rawModelId,
                type: "embedding",
                dimensions: embModel.dimensions
            });
        }
        // Add image models (filtered by active providers)
        for (const imgModel of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllImageModels"])()){
            if (!isProviderActive(imgModel.provider)) continue;
            const rawModelId = imgModel.id.split("/").pop() || imgModel.id;
            if (!providerSupportsModel(imgModel.provider, rawModelId)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(imgModel.provider, rawModelId)) continue;
            models.push({
                id: imgModel.id,
                object: "model",
                created: timestamp,
                owned_by: imgModel.provider,
                type: "image",
                supported_sizes: imgModel.supportedSizes,
                input_modalities: imgModel.inputModalities || [
                    "text"
                ],
                output_modalities: [
                    "image"
                ],
                ...imgModel.description ? {
                    description: imgModel.description
                } : {}
            });
        }
        // Add rerank models (filtered by active providers)
        for (const rerankModel of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$rerankRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllRerankModels"])()){
            if (!isProviderActive(rerankModel.provider)) continue;
            const rawModelId = rerankModel.id.split("/").pop() || rerankModel.id;
            if (!providerSupportsModel(rerankModel.provider, rawModelId)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(rerankModel.provider, rawModelId)) continue;
            if (hasEquivalentSpecialtyModel(rerankModel.provider, rawModelId, "rerank", rerankModel.id)) {
                continue;
            }
            models.push({
                id: rerankModel.id,
                object: "model",
                created: timestamp,
                owned_by: rerankModel.provider,
                root: rawModelId,
                type: "rerank"
            });
        }
        // Add audio models (filtered by active providers)
        for (const audioModel of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$audioRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllAudioModels"])()){
            if (!isProviderActive(audioModel.provider)) continue;
            const rawModelId = audioModel.id.split("/").pop() || audioModel.id;
            if (!providerSupportsModel(audioModel.provider, rawModelId)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(audioModel.provider, rawModelId)) continue;
            models.push({
                id: audioModel.id,
                object: "model",
                created: timestamp,
                owned_by: audioModel.provider,
                type: "audio",
                subtype: audioModel.subtype
            });
        }
        // Add moderation models (filtered by active providers)
        for (const modModel of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$moderationRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllModerationModels"])()){
            if (!isProviderActive(modModel.provider)) continue;
            const rawModelId = modModel.id.split("/").pop() || modModel.id;
            if (!providerSupportsModel(modModel.provider, rawModelId)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(modModel.provider, rawModelId)) continue;
            models.push({
                id: modModel.id,
                object: "model",
                created: timestamp,
                owned_by: modModel.provider,
                type: "moderation"
            });
        }
        // Add video models (filtered by active providers)
        for (const videoModel of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$videoRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllVideoModels"])()){
            if (!isProviderActive(videoModel.provider)) continue;
            const rawModelId = videoModel.id.split("/").pop() || videoModel.id;
            if (!providerSupportsModel(videoModel.provider, rawModelId)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(videoModel.provider, rawModelId)) continue;
            models.push({
                id: videoModel.id,
                object: "model",
                created: timestamp,
                owned_by: videoModel.provider,
                type: "video"
            });
        }
        // Add music models (filtered by active providers)
        for (const musicModel of (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$musicRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllMusicModels"])()){
            if (!isProviderActive(musicModel.provider)) continue;
            const rawModelId = musicModel.id.split("/").pop() || musicModel.id;
            if (!providerSupportsModel(musicModel.provider, rawModelId)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(musicModel.provider, rawModelId)) continue;
            models.push({
                id: musicModel.id,
                object: "model",
                created: timestamp,
                owned_by: musicModel.provider,
                type: "music"
            });
        }
        // Add custom models (user-defined)
        try {
            const customModelsMap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAllCustomModels"])();
            for (const [providerId, rawProviderCustomModels] of Object.entries(customModelsMap)){
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$modelListingCapability$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["providerUsesCuratedModelsOnly"])(providerId)) continue;
                // Skip Gemini — handled by syncedAvailableModels above
                if (providerId === "gemini") continue;
                if (providerId === "reka") continue;
                const providerCustomModels = Array.isArray(rawProviderCustomModels) ? rawProviderCustomModels.filter((model)=>!!model && typeof model === "object" && !Array.isArray(model)) : [];
                // For compatible providers, use the prefix from provider nodes
                const prefix = providerIdToPrefix[providerId];
                const alias = prefix || providerIdToAlias[providerId] || providerId;
                const canonicalProviderId = resolveCanonicalProviderId(alias, providerId);
                // Only include if provider is active — check alias, canonical ID, raw providerId,
                // or the parent provider type (for compatible providers whose node ID is a UUID)
                const parentProviderType = nodeIdToProviderType[providerId];
                if (!activeAliases.has(alias) && !activeAliases.has(canonicalProviderId) && !activeAliases.has(providerId) && !(parentProviderType && activeAliases.has(parentProviderType))) continue;
                for (const model of providerCustomModels){
                    const modelId = typeof model.id === "string" ? model.id : null;
                    if (!modelId) continue;
                    if (model.isHidden === true) continue;
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(canonicalProviderId, modelId)) continue;
                    // #6328: apply hidePaidModels to user-defined custom rows too.
                    // Custom entries do not carry pricing, so shouldHidePaid() decides
                    // via FREE_MODEL_IDS_BY_PROVIDER — matches synced/PROVIDER_MODELS.
                    if (shouldHidePaid(canonicalProviderId, modelId, model.pricing)) continue;
                    // noAuth providers have no connection rows; keep auth providers gated. (#2798/#3200)
                    const isNoAuthProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoAuthProviderKey"])(canonicalProviderId, providerId, alias);
                    if ((!isNoAuthProvider || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoAuthProviderBlocked"])(blockedProviders, canonicalProviderId, providerId, alias)) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasEligibleConnectionForModel"])(getConnectionsForProvider(alias, canonicalProviderId, providerId, parentProviderType), modelId)) {
                        continue;
                    }
                    // Skip if already added as built-in
                    const aliasId = `${alias}/${modelId}`;
                    if (models.some((m)=>m.id === aliasId)) continue;
                    // Determine type from supportedEndpoints
                    const endpoints = Array.isArray(model.supportedEndpoints) ? model.supportedEndpoints : [
                        "chat"
                    ];
                    const apiFormat = typeof model.apiFormat === "string" ? model.apiFormat : "chat-completions";
                    let modelType;
                    if (endpoints.includes("embeddings")) modelType = "embedding";
                    else if (endpoints.includes("rerank")) modelType = "rerank";
                    else if (endpoints.includes("images")) modelType = "image";
                    else if (endpoints.includes("audio")) modelType = "audio";
                    if (modelType && hasEquivalentSpecialtyModel(canonicalProviderId, modelId, modelType, aliasId)) {
                        continue;
                    }
                    const visionFields = modelType === "chat" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCustomVisionCapabilityFields"])(model, aliasId, modelId) : null;
                    if (includeAlias) {
                        models.push({
                            id: aliasId,
                            object: "model",
                            created: timestamp,
                            owned_by: resolvePublicOwnerId(providerId, canonicalProviderId),
                            permission: [],
                            root: modelId,
                            parent: null,
                            custom: true,
                            ...modelType ? {
                                type: modelType
                            } : {},
                            ...apiFormat !== "chat-completions" ? {
                                api_format: apiFormat
                            } : {},
                            ...endpoints.length > 1 || !endpoints.includes("chat") ? {
                                supported_endpoints: endpoints
                            } : {},
                            ...typeof model.inputTokenLimit === "number" ? {
                                context_length: model.inputTokenLimit
                            } : {},
                            ...typeof model.outputTokenLimit === "number" ? {
                                max_output_tokens: model.outputTokenLimit
                            } : {},
                            ...visionFields || {}
                        });
                    }
                    if (includeCanonical && canonicalProviderId !== alias && !prefix && !isNoAuthProvider) {
                        const providerPrefixedId = `${canonicalProviderId}/${modelId}`;
                        if (models.some((m)=>m.id === providerPrefixedId)) continue;
                        const providerVisionFields = modelType === "chat" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCustomVisionCapabilityFields"])(model, providerPrefixedId, modelId) : null;
                        models.push({
                            id: providerPrefixedId,
                            object: "model",
                            created: timestamp,
                            owned_by: resolvePublicOwnerId(providerId, canonicalProviderId),
                            permission: [],
                            root: modelId,
                            parent: includeAlias ? aliasId : null,
                            custom: true,
                            ...modelType ? {
                                type: modelType
                            } : {},
                            ...typeof model.inputTokenLimit === "number" ? {
                                context_length: model.inputTokenLimit
                            } : {},
                            ...typeof model.outputTokenLimit === "number" ? {
                                max_output_tokens: model.outputTokenLimit
                            } : {},
                            ...providerVisionFields || {}
                        });
                    }
                }
            }
        } catch (e) {
            console.log("Could not fetch custom models");
        }
        // Port of decolua/9router#730 — surface models registered ONLY through a model
        // alias (`key_value` namespace `modelAliases`, value `"<providerKey>/<modelId>"`).
        // Without this walk, a compatible-provider entry like `setModelAlias("kimi-k2.6",
        // "custom/kimi-k2.6")` resolves at request time but never shows up in `/v1/models`.
        // We respect the same gating as the static/custom listing path: provider must be
        // active (or noAuth+unblocked), model must not be hidden, and the canonical alias
        // entry must not already exist (so we don't shadow combo / synced / custom rows).
        try {
            const modelAliases = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$aliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelAliases"])();
            const aliasBacked = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$aliasBackedModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractAliasBackedModels"])(modelAliases);
            for (const { providerKey, modelId } of aliasBacked){
                const canonicalProviderId = resolveCanonicalProviderId(providerKey);
                if (!canonicalProviderId) continue;
                if (blockedProviders.has(providerKey) || blockedProviders.has(canonicalProviderId) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoAuthProviderBlocked"])(blockedProviders, canonicalProviderId, providerKey)) {
                    continue;
                }
                // #8958: honor the compatible-provider node prefix (as the synced/custom
                // loops do) so an alias-backed entry publishes `prefix/model` instead of the
                // raw provider-node UUID. Without the providerIdToPrefix lookup, `alias` fell
                // through to `providerKey` (the UUID) and the dedupe below — which only checks
                // `alias/model` and `providerKey/model`, both UUID-prefixed — never matched the
                // correct `prefix/model` row already emitted, leaking a duplicate UUID entry
                // even under MODELS_CATALOG_PREFIX_MODE=alias.
                const nodePrefix = providerIdToPrefix[providerKey] || providerIdToPrefix[canonicalProviderId];
                const alias = nodePrefix || providerIdToAlias[canonicalProviderId] || providerKey;
                if (!activeAliases.has(alias) && !activeAliases.has(canonicalProviderId) && !activeAliases.has(providerKey)) {
                    continue;
                }
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(canonicalProviderId, modelId)) continue;
                // #6328: apply hidePaidModels to alias-backed rows too. Alias mappings
                // point at providerKey/modelId with no pricing, so shouldHidePaid()
                // decides via the FREE_MODEL_IDS_BY_PROVIDER catalog tier.
                if (shouldHidePaid(canonicalProviderId, modelId)) continue;
                const aliasId = `${alias}/${modelId}`;
                const rawPrefixedId = `${providerKey}/${modelId}`;
                if (models.some((m)=>m?.id === aliasId) || models.some((m)=>m?.id === rawPrefixedId)) {
                    continue;
                }
                const visionFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVisionCapabilityFields"])(aliasId) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVisionCapabilityFields"])(modelId);
                if (includeAlias) {
                    models.push({
                        id: aliasId,
                        object: "model",
                        created: timestamp,
                        owned_by: resolvePublicOwnerId(providerKey, canonicalProviderId),
                        permission: [],
                        root: modelId,
                        parent: null,
                        ...visionFields || {}
                    });
                }
                if (includeCanonical && canonicalProviderId !== alias && !nodePrefix && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNoAuthProviderKey"])(canonicalProviderId) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogProviderMaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prefixRoutesToProvider"])(canonicalProviderId, canonicalProviderId)) {
                    const providerPrefixedId = `${canonicalProviderId}/${modelId}`;
                    if (models.some((m)=>m?.id === providerPrefixedId)) continue;
                    const providerVisionFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVisionCapabilityFields"])(providerPrefixedId) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVisionCapabilityFields"])(modelId);
                    models.push({
                        id: providerPrefixedId,
                        object: "model",
                        created: timestamp,
                        owned_by: resolvePublicOwnerId(providerKey, canonicalProviderId),
                        permission: [],
                        root: modelId,
                        parent: includeAlias ? aliasId : null,
                        ...providerVisionFields || {}
                    });
                }
            }
        } catch (e) {
            console.log("Could not fetch model aliases");
        }
        // Add managed fallback models for compatible providers that don't import a model list.
        for (const conn of connections){
            const providerId = typeof conn.provider === "string" ? conn.provider : null;
            if (!providerId) continue;
            if (blockedProviders.has(providerId)) continue;
            const fallbackModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$managedAvailableModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompatibleFallbackModels"])(providerId);
            if (!Array.isArray(fallbackModels) || fallbackModels.length === 0) continue;
            const prefix = providerIdToPrefix[providerId];
            const alias = prefix || providerIdToAlias[providerId] || providerId;
            const canonicalProviderId = resolveCanonicalProviderId(alias, providerId);
            for (const model of fallbackModels){
                const modelId = typeof model.id === "string" ? model.id : null;
                if (!modelId) continue;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelIsHidden"])(canonicalProviderId, modelId)) continue;
                // #6328: apply hidePaidModels to managed-fallback rows too. Compatible
                // provider fallbacks lack pricing; shouldHidePaid() decides via the
                // FREE_MODEL_IDS_BY_PROVIDER catalog tier.
                if (shouldHidePaid(canonicalProviderId, modelId, model.pricing)) continue;
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasEligibleConnectionForModel"])([
                    conn
                ], modelId)) continue;
                const aliasId = `${alias}/${modelId}`;
                if (models.some((m)=>m.id === aliasId)) continue;
                const visionFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVisionCapabilityFields"])(aliasId) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogVision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getVisionCapabilityFields"])(modelId);
                const contextLength = typeof model.contextLength === "number" ? model.contextLength : undefined;
                models.push({
                    id: aliasId,
                    object: "model",
                    created: timestamp,
                    owned_by: resolvePublicOwnerId(providerId, canonicalProviderId),
                    permission: [],
                    root: modelId,
                    parent: null,
                    ...contextLength ? {
                        context_length: contextLength
                    } : {},
                    ...visionFields || {}
                });
            }
        }
        // Filter by API key permissions if requested
        const apiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])(request);
        let finalModels = models;
        if (apiKey) {
            const { isModelAllowedForKey, getApiKeyMetadata } = await __turbopack_context__.A("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript, async loader)");
            // Quota-exclusive keys (allowedQuotas non-empty): list ONLY the pool's qtSd/*
            // virtual models. #4806: build from the hidden qtSd/* combos directly — the base
            // `models` list drops hidden combos, so filtering it returned nothing (0 models).
            const keyMeta = await getApiKeyMetadata(apiKey);
            if (keyMeta && keyMeta.allowedQuotas && keyMeta.allowedQuotas.length > 0) {
                const { buildQuotaExclusiveModels } = await __turbopack_context__.A("[project]/src/lib/quota/quotaCombos.ts [app-route] (ecmascript, async loader)");
                finalModels = await buildQuotaExclusiveModels(keyMeta.allowedQuotas, combos, timestamp, (c)=>buildComboCatalogMetadata(c, combos));
            } else if (!keyMeta) {
            // #6406: A valid apiKey without a DB metadata row is an env-var master key
            // (OMNIROUTE_API_KEY / ROUTER_API_KEY per isValidApiKey). Those keys have no
            // per-key allow/deny/quota restrictions — they authenticate the request but
            // do NOT scope the catalog. Skipping the per-model filter matches the intent:
            // auth GATES access; env-var master keys see everything the unauth path sees.
            // Without this branch, isModelAllowedForKey returns false for every model
            // (metadata missing → deny), collapsing /v1/models to 0 entries.
            } else {
                const filtered = [];
                for (const m of models){
                    // m.id is the full identifier (e.g. openai/gpt-4o), m.root is the raw model string
                    // check either one as the config could use either patterns
                    if (await isModelAllowedForKey(apiKey, m.id) || await isModelAllowedForKey(apiKey, m.root)) {
                        filtered.push(m);
                    }
                }
                finalModels = filtered;
            }
        }
        // ?configuredOnly — hide models that have no eligible DB connection.
        finalModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyCatalogPostFilters"])(request, finalModels, {
            connections,
            prefixMode,
            aliasToProviderId,
            hideNoThinkVariants: settings.hideNoThinkVariants === true
        });
        const getDefaultContextFallback = (model)=>{
            if (typeof model.context_length === "number") return undefined;
            if (model.owned_by === "combo") return undefined;
            if (model.type && model.type !== "chat") return undefined;
            const provider = typeof model.owned_by === "string" ? model.owned_by : null;
            if (!provider) return undefined;
            const canonicalId = aliasToProviderId[provider] || provider;
            const registryFallback = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REGISTRY"][canonicalId]?.defaultContextLength;
            if (registryFallback) return registryFallback;
            const modelId = model.root || (typeof model.id === "string" ? model.id.split("/").pop() : undefined);
            return modelId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTokenLimit"])(canonicalId, modelId) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTokenLimit"])(canonicalId);
        };
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalogResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["finalizeCatalogResponse"])(request, finalModels, getDefaultContextFallback, {
            ...corsHeaders,
            ...diagnosticHeaders
        });
    } catch (error) {
        console.log("Error fetching models:", error);
        // Hard rule #12 — this is the realistically reachable 500 for the endpoint
        // (the wrapper's catch only fires on an in-flight rejection), so it must go
        // through the shared sanitizer too. Same status/type/code as before.
        return Response.json((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildErrorBody"])(500, error instanceof Error ? error.message : String(error), undefined, {
            type: "server_error",
            code: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelMetadataRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["INTERNAL_PROXY_ERROR"]
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                ...diagnosticHeaders
            }
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/v1/models/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "HEAD",
    ()=>HEAD,
    "OPTIONS",
    ()=>OPTIONS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/api/v1/models/catalog.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function OPTIONS() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    });
}
async function HEAD() {
    return new Response(null, {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    });
}
async function GET(request) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$v1$2f$models$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUnifiedModelsResponse"])(request);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_app_api_v1_models_0btw5us._.js.map