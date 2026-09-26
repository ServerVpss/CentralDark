module.exports = [
"[project]/open-sse/config/providers/registry/github/retiredModels.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isRetiredGitHubCopilotModelId",
    ()=>isRetiredGitHubCopilotModelId
]);
const RETIRED_GITHUB_COPILOT_MODEL_IDS = new Set([
    "gemini-2.5-pro",
    "gemini-3-flash",
    "gemini-3-flash-preview"
]);
function isRetiredGitHubCopilotModelId(providerId, modelId) {
    const provider = typeof providerId === "string" ? providerId.trim().toLowerCase() : "";
    if (provider !== "github" && provider !== "gh") return false;
    if (typeof modelId !== "string") return false;
    return RETIRED_GITHUB_COPILOT_MODEL_IDS.has(modelId.trim().toLowerCase());
}
}),
"[project]/src/lib/db/providers/lazyConnectionView.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createLazyConnectionView",
    ()=>createLazyConnectionView,
    "createLazyRowProxy",
    ()=>createLazyRowProxy,
    "toProviderConnection",
    ()=>toProviderConnection
]);
/**
 * Lazy-decrypting ProviderConnectionView.
 *
 * Wraps a raw (ciphertext) DB row in a JS Proxy that decrypts credential
 * fields (apiKey, accessToken, refreshToken) only on first access.
 * Non-credential reads hit the already-coerced view directly at zero cost.
 *
 * Extracted from sse/services/auth.ts for reuse across dashboard,
 * admin, and catalog callers during Phase 2/3 of the lazy-decrypt rollout.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [app-rsc] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrNull(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function toNullableNumber(value) {
    if (value === null || value === undefined) return null;
    const parsed = toNumber(value, Number.NaN);
    return Number.isFinite(parsed) ? parsed : null;
}
function toProviderConnection(value) {
    const row = asRecord(value);
    const rawThresholds = row.quotaWindowThresholds;
    const quotaWindowThresholds = rawThresholds && typeof rawThresholds === "object" && !Array.isArray(rawThresholds) ? rawThresholds : null;
    return {
        id: toStringOrNull(row.id) || "",
        provider: toStringOrNull(row.provider) || "",
        email: toStringOrNull(row.email),
        isActive: row.isActive === true,
        rateLimitedUntil: toStringOrNull(row.rateLimitedUntil),
        testStatus: toStringOrNull(row.testStatus),
        apiKey: toStringOrNull(row.apiKey),
        accessToken: toStringOrNull(row.accessToken),
        refreshToken: toStringOrNull(row.refreshToken),
        tokenExpiresAt: toStringOrNull(row.tokenExpiresAt),
        expiresAt: toStringOrNull(row.expiresAt),
        projectId: toStringOrNull(row.projectId),
        defaultModel: toStringOrNull(row.defaultModel),
        providerSpecificData: asRecord(row.providerSpecificData),
        lastUsedAt: toStringOrNull(row.lastUsedAt),
        consecutiveUseCount: toNumber(row.consecutiveUseCount, 0),
        priority: toNumber(row.priority, 999),
        lastError: toStringOrNull(row.lastError),
        lastErrorType: toStringOrNull(row.lastErrorType),
        lastErrorSource: toStringOrNull(row.lastErrorSource),
        errorCode: typeof row.errorCode === "string" || typeof row.errorCode === "number" ? row.errorCode : null,
        backoffLevel: toNumber(row.backoffLevel, 0),
        maxConcurrent: toNullableNumber(row.maxConcurrent),
        quotaWindowThresholds
    };
}
function createLazyConnectionView(row) {
    const base = toProviderConnection(row);
    let decrypted;
    const ensureDecrypted = ()=>{
        if (!decrypted) {
            decrypted = {
                apiKey: toStringOrNull((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decrypt"])(base.apiKey)),
                accessToken: toStringOrNull((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decrypt"])(base.accessToken)),
                refreshToken: toStringOrNull((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decrypt"])(base.refreshToken))
            };
        }
        return decrypted;
    };
    return new Proxy(base, {
        get: (_target, prop)=>{
            if (prop === "apiKey" || prop === "accessToken" || prop === "refreshToken") {
                return ensureDecrypted()[prop];
            }
            return Reflect.get(_target, prop);
        }
    });
}
const CREDENTIAL_FIELDS = new Set([
    "apiKey",
    "accessToken",
    "refreshToken",
    "idToken"
]);
function createLazyRowProxy(row) {
    let decrypted;
    const ensureDecrypted = ()=>{
        if (!decrypted) {
            decrypted = {
                apiKey: lazyDecrypt(row.apiKey),
                accessToken: lazyDecrypt(row.accessToken),
                refreshToken: lazyDecrypt(row.refreshToken),
                idToken: lazyDecrypt(row.idToken)
            };
        }
        return decrypted;
    };
    return new Proxy(row, {
        get (target, prop) {
            if (typeof prop === "string" && CREDENTIAL_FIELDS.has(prop)) {
                return ensureDecrypted()[prop];
            }
            if (prop === "toJSON") {
                return ()=>{
                    const result = {};
                    for (const key of Object.keys(target)){
                        result[key] = CREDENTIAL_FIELDS.has(key) ? ensureDecrypted()[key] : target[key];
                    }
                    return result;
                };
            }
            return Reflect.get(target, prop);
        },
        ownKeys (target) {
            return Reflect.ownKeys(target);
        },
        getOwnPropertyDescriptor (target, prop) {
            return Reflect.getOwnPropertyDescriptor(target, prop);
        }
    });
}
function lazyDecrypt(value) {
    if (typeof value !== "string") return undefined;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decrypt"])(value);
}
}),
"[project]/open-sse/services/apiKeyRotator.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "connectionHasExtraKeys",
    ()=>connectionHasExtraKeys,
    "getAllKeyHealth",
    ()=>getAllKeyHealth,
    "getApiKeyCount",
    ()=>getApiKeyCount,
    "getInvalidKeyCount",
    ()=>getInvalidKeyCount,
    "getKeyHealthStats",
    ()=>getKeyHealthStats,
    "getRotatingApiKey",
    ()=>getRotatingApiKey,
    "getValidApiKey",
    ()=>getValidApiKey,
    "recordKeyFailure",
    ()=>recordKeyFailure,
    "recordKeySuccess",
    ()=>recordKeySuccess,
    "recordKeyTerminal",
    ()=>recordKeyTerminal,
    "removeConnectionHealth",
    ()=>removeConnectionHealth,
    "removeConnectionIndex",
    ()=>removeConnectionIndex,
    "resetKeyStatus",
    ()=>resetKeyStatus,
    "resetRotationIndex",
    ()=>resetRotationIndex,
    "resolveKeyForRequest",
    ()=>resolveKeyForRequest,
    "syncHealthFromDB",
    ()=>syncHealthFromDB,
    "trackConnectionExtraKeys",
    ()=>trackConnectionExtraKeys
]);
/**
 * apiKeyRotator.ts — T07: API Key Round-Robin with Health Tracking
 *
 * Rotates between a primary API key and extra API keys stored in
 * providerSpecificData.extraApiKeys[]. Uses round-robin by default.
 *
 * Extra keys are stored as plain strings in providerSpecificData.extraApiKeys.
 * Example: { extraApiKeys: ["sk-abc...", "sk-def...", "sk-ghi..."] }
 *
 * The in-memory rotation index resets on process restart, which is intentional —
 * it ensures even distribution across restarts without persistence overhead.
 *
 * Health tracking: monitors per-key authentication failures. Keys that fail
 * 3+ consecutive times are marked as "invalid" and skipped during rotation.
 * Health status is persisted in providerSpecificData.apiKeyHealth.
 */ // In-memory round-robin index per connection
const _keyIndexes = new Map();
// Tracks which connections have extra API keys (for A3 guard in chatCore.ts)
// Used to prevent disabling an entire connection when only one key fails.
const _connectionExtraKeys = new Map();
// Eviction limits to prevent unbounded memory growth under heavy load
const MAX_KEY_HEALTH_ENTRIES = 500;
const MAX_CONNECTION_EXTRA_KEYS = 500;
function trackConnectionExtraKeys(connectionId, extraKeys) {
    const validExtras = extraKeys.filter((k)=>typeof k === "string" && k.trim().length > 0);
    if (!_connectionExtraKeys.has(connectionId) && _connectionExtraKeys.size >= MAX_CONNECTION_EXTRA_KEYS) {
        const oldest = _connectionExtraKeys.keys().next().value;
        if (oldest !== undefined) _connectionExtraKeys.delete(oldest);
    }
    _connectionExtraKeys.set(connectionId, validExtras.length > 0);
}
function connectionHasExtraKeys(connectionId, extraKeys) {
    // Direct data check is always authoritative
    if (extraKeys && extraKeys.length > 0) return true;
    // Fall back to in-memory cache (populated as side-effect during execution)
    return _connectionExtraKeys.get(connectionId) ?? false;
}
const _keyHealth = new Map();
const FAILURE_THRESHOLD = 2; // Mark as invalid after 2 consecutive failures
/**
 * Get or create health status for a specific key within a connection scope.
 */ function getOrCreateHealth(connectionId, keyId) {
    const scopedKey = `${connectionId}:${keyId}`;
    if (!_keyHealth.has(scopedKey)) {
        if (_keyHealth.size >= MAX_KEY_HEALTH_ENTRIES) {
            const oldest = _keyHealth.keys().next().value;
            if (oldest !== undefined) _keyHealth.delete(oldest);
        }
        _keyHealth.set(scopedKey, {
            status: "active",
            failures: 0,
            lastFailure: null,
            lastSuccess: null,
            totalRequests: 0,
            totalFailures: 0
        });
    }
    return _keyHealth.get(scopedKey);
}
function getValidApiKey(connectionId, primaryKey, extraKeys = [], health) {
    const validExtras = extraKeys.filter((k)=>typeof k === "string" && k.trim().length > 0);
    // Build list of all keys with their IDs
    const allKeys = [];
    // Add primary key if valid
    if (primaryKey) {
        const primaryHealth = health?.["primary"] || getOrCreateHealth(connectionId, "primary");
        if (primaryHealth.status !== "invalid") {
            allKeys.push({
                key: primaryKey,
                keyId: "primary"
            });
        } else {
            console.warn(`[KeyRotator] Skipping invalid primary key for connection ${connectionId.slice(0, 8)}`);
        }
    }
    // Add extra keys if valid
    for(let i = 0; i < validExtras.length; i++){
        const keyId = `extra_${i}`;
        const keyHealth = health?.[keyId] || getOrCreateHealth(connectionId, keyId);
        if (keyHealth.status !== "invalid") {
            allKeys.push({
                key: validExtras[i],
                keyId
            });
        }
    }
    if (allKeys.length === 0) return null;
    if (allKeys.length === 1) {
        return {
            key: allKeys[0].key,
            keyId: allKeys[0].keyId
        };
    }
    // Round-robin among valid keys only
    const current = _keyIndexes.get(connectionId) ?? 0;
    const idx = current % allKeys.length;
    _keyIndexes.set(connectionId, current + 1);
    return {
        key: allKeys[idx].key,
        keyId: allKeys[idx].keyId
    };
}
function getRotatingApiKey(connectionId, primaryKey, extraKeys = []) {
    const validExtras = extraKeys.filter((k)=>typeof k === "string" && k.trim().length > 0);
    if (validExtras.length === 0) return primaryKey;
    const allKeys = [
        primaryKey,
        ...validExtras
    ].filter(Boolean);
    if (allKeys.length <= 1) return primaryKey;
    const current = _keyIndexes.get(connectionId) ?? 0;
    const idx = current % allKeys.length;
    _keyIndexes.set(connectionId, current + 1);
    return allKeys[idx];
}
function recordKeyFailure(connectionId, keyId) {
    const health = getOrCreateHealth(connectionId, keyId);
    health.failures++;
    health.totalRequests++;
    health.totalFailures++;
    health.lastFailure = new Date().toISOString();
    if (health.failures >= FAILURE_THRESHOLD) {
        health.status = "invalid";
    } else if (health.failures > 0) {
        health.status = "warning";
    }
    return {
        ...health
    };
}
function recordKeyTerminal(connectionId, keyId) {
    const health = getOrCreateHealth(connectionId, keyId);
    health.failures = Math.max(health.failures + 1, FAILURE_THRESHOLD);
    health.totalRequests++;
    health.totalFailures++;
    health.lastFailure = new Date().toISOString();
    health.status = "invalid";
    return {
        ...health
    };
}
function recordKeySuccess(connectionId, keyId) {
    const health = getOrCreateHealth(connectionId, keyId);
    health.failures = 0;
    health.totalRequests++;
    health.lastSuccess = new Date().toISOString();
    health.status = "active";
    return {
        ...health
    };
}
function getInvalidKeyCount(health) {
    if (!health) return 0;
    return Object.values(health).filter((h)=>h.status === "invalid").length;
}
function getKeyHealthStats(connectionId, primaryKey, extraKeys = [], health) {
    const total = (primaryKey ? 1 : 0) + extraKeys.filter((k)=>k.trim().length > 0).length;
    const keys = [
        "primary",
        ...extraKeys.map((_, i)=>`extra_${i}`)
    ];
    let active = 0;
    let warning = 0;
    let invalid = 0;
    for (const keyId of keys){
        const h = health?.[keyId] || getOrCreateHealth(connectionId, keyId);
        if (h.status === "active") active++;
        else if (h.status === "warning") warning++;
        else if (h.status === "invalid") invalid++;
    }
    return {
        total,
        active,
        warning,
        invalid
    };
}
function resetKeyStatus(connectionId, keyId) {
    const health = getOrCreateHealth(connectionId, keyId);
    health.failures = 0;
    health.status = "active";
    health.lastFailure = null;
    return {
        ...health
    };
}
function getAllKeyHealth() {
    const result = {};
    for (const [keyId, health] of _keyHealth.entries()){
        result[keyId] = {
            ...health
        };
    }
    return result;
}
function syncHealthFromDB(connectionId, health) {
    if (!health) return;
    for (const [keyId, keyHealth] of Object.entries(health)){
        const scopedKey = `${connectionId}:${keyId}`;
        if (!_keyHealth.has(scopedKey) && _keyHealth.size >= MAX_KEY_HEALTH_ENTRIES) {
            const oldest = _keyHealth.keys().next().value;
            if (oldest !== undefined) _keyHealth.delete(oldest);
        }
        _keyHealth.set(scopedKey, keyHealth);
    }
}
function resetRotationIndex(connectionId) {
    _keyIndexes.delete(connectionId);
}
function getApiKeyCount(primaryKey, extraKeys = []) {
    const validExtras = extraKeys.filter((k)=>typeof k === "string" && k.trim().length > 0);
    return (primaryKey ? 1 : 0) + validExtras.length;
}
function resolveKeyForRequest(connectionId, primaryKey, extraKeys, selectedKeyId) {
    if (selectedKeyId) {
        const health = getOrCreateHealth(connectionId, selectedKeyId);
        if (health.status !== "invalid") {
            if (selectedKeyId === "primary" && primaryKey) {
                return {
                    key: primaryKey,
                    keyId: "primary"
                };
            }
            const match = /^extra_(\d+)$/.exec(selectedKeyId);
            if (match) {
                const idx = Number.parseInt(match[1], 10);
                if (idx >= 0 && idx < extraKeys.length && extraKeys[idx].trim().length > 0) {
                    return {
                        key: extraKeys[idx],
                        keyId: selectedKeyId
                    };
                }
            }
        }
    }
    return getValidApiKey(connectionId, primaryKey, extraKeys);
}
function removeConnectionHealth(connectionId) {
    for (const key of _keyHealth.keys()){
        if (key.startsWith(`${connectionId}:`)) {
            _keyHealth.delete(key);
        }
    }
}
function removeConnectionIndex(connectionId) {
    _keyIndexes.delete(connectionId);
    _connectionExtraKeys.delete(connectionId);
    for (const key of _keyHealth.keys()){
        if (key.startsWith(`${connectionId}:`)) {
            _keyHealth.delete(key);
        }
    }
}
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/src/lib/db/reasoningRoutingRules.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createReasoningRoutingRule",
    ()=>createReasoningRoutingRule,
    "deleteReasoningRoutingRule",
    ()=>deleteReasoningRoutingRule,
    "getReasoningRoutingRuleById",
    ()=>getReasoningRoutingRuleById,
    "getReasoningRoutingRuleReferenceErrors",
    ()=>getReasoningRoutingRuleReferenceErrors,
    "getReasoningRoutingRules",
    ()=>getReasoningRoutingRules,
    "invalidateReasoningRoutingRuleCache",
    ()=>invalidateReasoningRoutingRuleCache,
    "updateReasoningRoutingRule",
    ()=>updateReasoningRoutingRule
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/stateReset.ts [app-rsc] (ecmascript)");
;
;
;
let cache = null;
let version = 0;
function parseTags(value) {
    try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        return Array.isArray(parsed) ? [
            ...new Set(parsed.filter((tag)=>typeof tag === "string").map((tag)=>tag.trim().toLowerCase()).filter(Boolean))
        ] : [];
    } catch  {
        return [];
    }
}
function rowToRule(row) {
    return {
        id: String(row.id),
        name: String(row.name),
        description: typeof row.description === "string" ? row.description : "",
        scope: row.scope,
        apiKeyId: typeof row.api_key_id === "string" ? row.api_key_id : null,
        comboId: typeof row.combo_id === "string" ? row.combo_id : null,
        connectionId: typeof row.connection_id === "string" ? row.connection_id : null,
        modelPattern: typeof row.model_pattern === "string" ? row.model_pattern : null,
        sourceEffort: row.source_effort,
        requestTags: parseTags(row.request_tags),
        tagMatchMode: row.tag_match_mode === "all" ? "all" : "any",
        effortMode: row.effort_mode,
        targetEffort: typeof row.target_effort === "string" ? row.target_effort : null,
        targetKind: row.target_kind,
        targetModel: typeof row.target_model === "string" ? row.target_model : null,
        targetComboId: typeof row.target_combo_id === "string" ? row.target_combo_id : null,
        budgetAction: row.budget_action,
        budgetTokens: typeof row.budget_tokens === "number" ? row.budget_tokens : null,
        priority: typeof row.priority === "number" ? row.priority : 0,
        enabled: row.enabled === 1 || row.enabled === true,
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
    };
}
function invalidate() {
    version += 1;
    cache = null;
}
function referenceExists(table, id) {
    if (!id) return false;
    const allowedTables = new Set([
        "api_keys",
        "combos",
        "provider_connections"
    ]);
    if (!allowedTables.has(table)) return false;
    return Boolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare(`SELECT 1 FROM ${table} WHERE id = ?`).get(id));
}
function getReasoningRoutingRuleReferenceErrors(rule) {
    const errors = [];
    if (rule.scope === "apiKey" && !referenceExists("api_keys", rule.apiKeyId)) {
        errors.push("The referenced API key does not exist");
    }
    if (rule.scope === "combo" && !referenceExists("combos", rule.comboId)) {
        errors.push("The referenced source combo does not exist");
    }
    if (rule.scope === "connection" && !referenceExists("provider_connections", rule.connectionId)) {
        errors.push("The referenced provider connection does not exist");
    }
    if (rule.targetKind === "combo" && !referenceExists("combos", rule.targetComboId)) {
        errors.push("The referenced target combo does not exist");
    }
    return errors;
}
function assertReferences(rule) {
    const errors = getReasoningRoutingRuleReferenceErrors(rule);
    if (errors.length > 0) throw new Error(errors.join("; "));
}
async function getReasoningRoutingRules(options = {}) {
    if (!cache || cache.version !== version) {
        const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT * FROM reasoning_routing_rules ORDER BY priority DESC, created_at ASC, id ASC").all();
        cache = {
            version,
            rules: rows.map(rowToRule)
        };
    }
    const rules = options.enabledOnly ? cache.rules.filter((rule)=>rule.enabled) : cache.rules;
    return rules.map((rule)=>({
            ...rule,
            requestTags: [
                ...rule.requestTags
            ]
        }));
}
async function getReasoningRoutingRuleById(id) {
    const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT * FROM reasoning_routing_rules WHERE id = ?").get(id);
    return row ? rowToRule(row) : null;
}
function ruleParams(rule, id, createdAt, updatedAt) {
    return {
        id,
        name: rule.name,
        description: rule.description || "",
        scope: rule.scope,
        apiKeyId: rule.apiKeyId ?? null,
        comboId: rule.comboId ?? null,
        connectionId: rule.connectionId ?? null,
        modelPattern: rule.modelPattern ?? null,
        sourceEffort: rule.sourceEffort,
        requestTags: JSON.stringify(parseTags(rule.requestTags)),
        tagMatchMode: rule.tagMatchMode,
        effortMode: rule.effortMode,
        targetEffort: rule.effortMode === "inherit" ? null : rule.targetEffort,
        targetKind: rule.targetKind,
        targetModel: rule.targetKind === "model" ? rule.targetModel : null,
        targetComboId: rule.targetKind === "combo" ? rule.targetComboId : null,
        budgetAction: rule.targetEffort === "none" ? "remove" : rule.budgetAction,
        budgetTokens: rule.budgetAction === "set" ? rule.budgetTokens : null,
        priority: rule.priority,
        enabled: rule.enabled ? 1 : 0,
        createdAt,
        updatedAt
    };
}
async function createReasoningRoutingRule(rule) {
    assertReferences(rule);
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const now = new Date().toISOString();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare(`INSERT INTO reasoning_routing_rules (
      id, name, description, scope, api_key_id, combo_id, connection_id, model_pattern,
      source_effort, request_tags, tag_match_mode, effort_mode, target_effort, target_kind,
      target_model, target_combo_id, budget_action, budget_tokens, priority, enabled, created_at, updated_at
    ) VALUES (
      @id, @name, @description, @scope, @apiKeyId, @comboId, @connectionId, @modelPattern,
      @sourceEffort, @requestTags, @tagMatchMode, @effortMode, @targetEffort, @targetKind,
      @targetModel, @targetComboId, @budgetAction, @budgetTokens, @priority, @enabled, @createdAt, @updatedAt
    )`).run(ruleParams(rule, id, now, now));
    invalidate();
    return await getReasoningRoutingRuleById(id);
}
async function updateReasoningRoutingRule(id, patch) {
    const existing = await getReasoningRoutingRuleById(id);
    if (!existing) return null;
    const { id: _id, createdAt, updatedAt: _updatedAt, ...base } = existing;
    const next = {
        ...base,
        ...patch
    };
    assertReferences(next);
    const now = new Date().toISOString();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare(`UPDATE reasoning_routing_rules SET
      name=@name, description=@description, scope=@scope, api_key_id=@apiKeyId,
      combo_id=@comboId, connection_id=@connectionId, model_pattern=@modelPattern,
      source_effort=@sourceEffort, request_tags=@requestTags, tag_match_mode=@tagMatchMode,
      effort_mode=@effortMode, target_effort=@targetEffort, target_kind=@targetKind,
      target_model=@targetModel, target_combo_id=@targetComboId, budget_action=@budgetAction,
      budget_tokens=@budgetTokens, priority=@priority, enabled=@enabled, updated_at=@updatedAt
      WHERE id=@id`).run(ruleParams(next, id, createdAt, now));
    invalidate();
    return getReasoningRoutingRuleById(id);
}
async function deleteReasoningRoutingRule(id) {
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("DELETE FROM reasoning_routing_rules WHERE id = ?").run(id);
    if ((result.changes ?? 0) > 0) invalidate();
    return (result.changes ?? 0) > 0;
}
function invalidateReasoningRoutingRuleCache() {
    invalidate();
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$stateReset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerDbStateResetter"])(invalidateReasoningRoutingRuleCache);
}),
"[project]/src/lib/db/providers/columns.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * db/providers/columns.ts — Pure column-normalizer helpers for provider_connections rows.
 * No DB access; no imports — JSON/Object/builtins only.
 */ __turbopack_context__.s([
    "normalizeBooleanColumn",
    ()=>normalizeBooleanColumn,
    "sanitizeQuotaWindowThresholds",
    ()=>sanitizeQuotaWindowThresholds,
    "sanitizeRateLimitOverrides",
    ()=>sanitizeRateLimitOverrides,
    "serializeJsonField",
    ()=>serializeJsonField,
    "toNumberOrZero",
    ()=>toNumberOrZero,
    "toRecord",
    ()=>toRecord,
    "toStringOrNull",
    ()=>toStringOrNull,
    "withNullableMaxConcurrent",
    ()=>withNullableMaxConcurrent,
    "withNullableQuotaWindowThresholds",
    ()=>withNullableQuotaWindowThresholds,
    "withNullableRateLimitOverrides",
    ()=>withNullableRateLimitOverrides
]);
function withNullableMaxConcurrent(record, source) {
    if (!source || !Object.hasOwn(source, "maxConcurrent")) {
        return record;
    }
    const sourceMaxConcurrent = source.maxConcurrent;
    const normalizedMaxConcurrent = typeof sourceMaxConcurrent === "number" || sourceMaxConcurrent === null ? sourceMaxConcurrent : record.maxConcurrent;
    return {
        ...record,
        maxConcurrent: normalizedMaxConcurrent
    };
}
function withNullableQuotaWindowThresholds(record, source) {
    return {
        ...record,
        quotaWindowThresholds: source?.quotaWindowThresholds ?? null
    };
}
function withNullableRateLimitOverrides(record, source) {
    return {
        ...record,
        rateLimitOverrides: source?.rateLimitOverrides ?? null
    };
}
function normalizeBooleanColumn(value, fallback) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "1" || normalized === "true") return true;
        if (normalized === "0" || normalized === "false") return false;
    }
    return fallback;
}
function sanitizeRateLimitOverrides(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== "object" || Array.isArray(value)) return null;
    const allowedKeys = new Set([
        "rpm",
        "tpm",
        "tpd",
        "minTime",
        "maxConcurrent"
    ]);
    const map = {};
    for (const [key, v] of Object.entries(value)){
        if (!allowedKeys.has(key)) continue;
        if (typeof v === "number" && Number.isInteger(v) && v >= 0) {
            map[key] = v;
        }
    }
    return Object.keys(map).length === 0 ? null : map;
}
function serializeJsonField(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== "object" || Array.isArray(value)) return null;
    return JSON.stringify(value);
}
function toRecord(value) {
    return value && typeof value === "object" ? value : {};
}
function sanitizeQuotaWindowThresholds(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== "object" || Array.isArray(value)) return null;
    const map = {};
    for (const [key, v] of Object.entries(value)){
        if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 100) {
            map[key] = v;
        }
    }
    return Object.keys(map).length === 0 ? null : map;
}
function toStringOrNull(value) {
    return typeof value === "string" ? value : null;
}
function toNumberOrZero(value) {
    return typeof value === "number" ? value : 0;
}
}),
"[project]/src/lib/db/providers/deletion.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "deleteProviderConnection",
    ()=>deleteProviderConnection,
    "deleteProviderConnections",
    ()=>deleteProviderConnections,
    "deleteProviderConnectionsByProvider",
    ()=>deleteProviderConnectionsByProvider,
    "reorderConnections",
    ()=>reorderConnections,
    "reorderProviderConnections",
    ()=>reorderProviderConnections
]);
/**
 * db/providers/deletion.ts — Provider connection deletion & reordering.
 *
 * Extracted from db/providers.ts (god-file shrink): the three provider
 * connection delete paths plus the connection reorder helper they share.
 * Each delete path also purges the connection's account-scoped
 * proxy_assignments (#9232) so orphans never keep routing to removed
 * connections.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningRoutingRules.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/columns.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
// Purge account-scoped proxy_assignments for the deleted connections (#9232):
// orphan assignments otherwise keep routing to provider_connections that no
// longer exist. scope='account' lives in exactly this one place.
function _deleteAccountProxyAssignments(db, ids) {
    if (ids.length === 0) return;
    const placeholders = ids.map(()=>"?").join(",");
    db.prepare(`DELETE FROM proxy_assignments WHERE scope = 'account' AND scope_id IN (${placeholders})`).run(...ids);
}
async function deleteProviderConnection(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = db.prepare("SELECT provider FROM provider_connections WHERE id = ?").get(id);
    if (!existing) return false;
    db.transaction(()=>{
        _deleteAccountProxyAssignments(db, [
            id
        ]);
        db.prepare("DELETE FROM quota_snapshots WHERE connection_id = ?").run(id);
        db.prepare("DELETE FROM provider_connections WHERE id = ?").run(id);
    })();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeConnectionHealth"])(id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeConnectionIndex"])(id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bumpProxyConfigGeneration"])();
    const existingRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toRecord"])(existing);
    const providerId = typeof existingRecord.provider === "string" ? existingRecord.provider : String(existingRecord.provider || "");
    reorderConnections(db, providerId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections"); // Bust connections read cache
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateReasoningRoutingRuleCache"])();
    return true;
}
async function deleteProviderConnections(ids) {
    if (ids.length === 0) return 0;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const deletedCount = db.transaction(()=>{
        const placeholders = ids.map(()=>"?").join(",");
        db.prepare(`DELETE FROM quota_snapshots WHERE connection_id IN (${placeholders})`).run(...ids);
        _deleteAccountProxyAssignments(db, ids);
        const result = db.prepare(`DELETE FROM provider_connections WHERE id IN (${placeholders})`).run(...ids);
        return result.changes ?? 0;
    })();
    for (const id of ids){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeConnectionHealth"])(id);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeConnectionIndex"])(id);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateReasoningRoutingRuleCache"])();
    return deletedCount;
}
async function deleteProviderConnectionsByProvider(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const connectionIds = db.prepare("SELECT id FROM provider_connections WHERE provider = ?").all(providerId).map((row)=>{
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toRecord"])(row);
        return typeof record.id === "string" ? record.id : null;
    }).filter((id)=>id !== null);
    const result = db.transaction(()=>{
        if (connectionIds.length > 0) {
            const deleteSnapshots = db.prepare("DELETE FROM quota_snapshots WHERE connection_id = ?");
            for (const connectionId of connectionIds){
                deleteSnapshots.run(connectionId);
            }
            _deleteAccountProxyAssignments(db, connectionIds);
        }
        return db.prepare("DELETE FROM provider_connections WHERE provider = ?").run(providerId);
    })();
    for (const connectionId of connectionIds){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeConnectionHealth"])(connectionId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["removeConnectionIndex"])(connectionId);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateReasoningRoutingRuleCache"])();
    return result.changes;
}
async function reorderProviderConnections(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    reorderConnections(db, providerId);
}
function reorderConnections(db, providerId) {
    const rows = db.prepare("SELECT id, priority, updated_at FROM provider_connections WHERE provider = ? ORDER BY priority ASC, updated_at DESC").all(providerId);
    const update = db.prepare("UPDATE provider_connections SET priority = ? WHERE id = ?");
    rows.forEach((row, index)=>{
        const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toRecord"])(row);
        update.run(index + 1, current.id);
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/wildcardRouter.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @ts-nocheck
/**
 * Wildcard Model Routing — Phase 8
 *
 * Glob-style wildcard matching for model aliases with specificity ranking.
 * Integrates into the existing model resolution pipeline.
 */ /**
 * Match a model name against a pattern with glob wildcards.
 * Supports * (wildcard sequence) and ? (single char).
 *
 * @param {string} model - Model name to match
 * @param {string} pattern - Pattern with wildcards
 * @returns {boolean}
 */ __turbopack_context__.s([
    "getSpecificity",
    ()=>getSpecificity,
    "resolveModel",
    ()=>resolveModel,
    "resolveWildcardAlias",
    ()=>resolveWildcardAlias,
    "wildcardMatch",
    ()=>wildcardMatch
]);
function wildcardMatch(model, pattern) {
    if (!model || !pattern) return false;
    if (pattern === "*") return true;
    if (pattern === model) return true;
    // Convert glob pattern to regex
    const regexStr = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
    const regex = new RegExp(`^${regexStr}$`, "i");
    return regex.test(model);
}
function getSpecificity(pattern) {
    if (!pattern) return 0;
    let score = 0;
    // Exact segments (no wildcards) contribute most
    const segments = pattern.split(/[/*?]/);
    for (const seg of segments){
        if (seg.length > 0) score += seg.length * 10;
    }
    // Wildcards reduce specificity
    const wildcardCount = (pattern.match(/\*/g) || []).length;
    const questionCount = (pattern.match(/\?/g) || []).length;
    score -= wildcardCount * 50;
    score -= questionCount * 5;
    // Longer patterns tend to be more specific
    score += pattern.length;
    return score;
}
function resolveWildcardAlias(model, aliases) {
    if (!model || !aliases || !Array.isArray(aliases)) return null;
    const matches = [];
    for (const alias of aliases){
        const pattern = alias.pattern || alias.alias || alias.from;
        const target = alias.target || alias.model || alias.to;
        if (!pattern || !target) continue;
        if (wildcardMatch(model, pattern)) {
            matches.push({
                pattern,
                target,
                specificity: getSpecificity(pattern),
                ...alias
            });
        }
    }
    if (matches.length === 0) return null;
    // Sort by specificity (highest first)
    matches.sort((a, b)=>b.specificity - a.specificity);
    return matches[0];
}
function resolveModel(model, exactAliases = {}, wildcardAliases = []) {
    if (!model) return model;
    // 1. Check exact aliases first (fastest)
    if (exactAliases instanceof Map) {
        if (exactAliases.has(model)) return exactAliases.get(model);
    } else if (exactAliases[model]) {
        return exactAliases[model];
    }
    // 2. Check wildcard aliases
    const match = resolveWildcardAlias(model, wildcardAliases);
    if (match) return match.target;
    // 3. Return original
    return model;
}
}),
"[project]/src/domain/connectionModelRules.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnectionExcludedModels",
    ()=>getConnectionExcludedModels,
    "hasEligibleConnectionForModel",
    ()=>hasEligibleConnectionForModel,
    "isModelExcludedByConnection",
    ()=>isModelExcludedByConnection,
    "normalizeExcludedModelPatterns",
    ()=>normalizeExcludedModelPatterns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wildcardRouter.ts [app-rsc] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizePattern(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    if (!normalized || normalized === "**") return null;
    return normalized;
}
function toPatternList(value) {
    if (Array.isArray(value)) {
        return value.map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    if (typeof value === "string") {
        return value.split(",").map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    return [];
}
function uniquePatterns(patterns) {
    return Array.from(new Set(patterns));
}
function getModelMatchCandidates(modelId) {
    const normalized = modelId.trim();
    if (!normalized) return [];
    const withoutExtendedContext = normalized.endsWith("[1m]") ? normalized.slice(0, -4) : normalized;
    const lastSlashIndex = withoutExtendedContext.lastIndexOf("/");
    const rawModel = lastSlashIndex >= 0 ? withoutExtendedContext.slice(lastSlashIndex + 1) : withoutExtendedContext;
    return Array.from(new Set([
        normalized,
        withoutExtendedContext,
        rawModel
    ].filter(Boolean)));
}
function normalizeExcludedModelPatterns(value) {
    return uniquePatterns(toPatternList(value));
}
function getConnectionExcludedModels(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeExcludedModelPatterns(data.excludedModels ?? data.excluded_models);
}
function isModelExcludedByConnection(modelId, providerSpecificData) {
    if (typeof modelId !== "string" || modelId.trim().length === 0) return false;
    const candidates = getModelMatchCandidates(modelId);
    const excludedModels = getConnectionExcludedModels(providerSpecificData);
    if (candidates.length === 0 || excludedModels.length === 0) return false;
    return excludedModels.some((pattern)=>candidates.some((candidate)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wildcardMatch"])(candidate, pattern)));
}
function hasEligibleConnectionForModel(connections, modelId) {
    if (!Array.isArray(connections) || connections.length === 0) return false;
    return connections.some((connection)=>!isModelExcludedByConnection(modelId, connection?.providerSpecificData));
}
}),
"[project]/src/domain/tagRouter.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnectionRoutingTags",
    ()=>getConnectionRoutingTags,
    "matchesRoutingTags",
    ()=>matchesRoutingTags,
    "normalizeRoutingTagMatchMode",
    ()=>normalizeRoutingTagMatchMode,
    "normalizeRoutingTags",
    ()=>normalizeRoutingTags,
    "resolveRequestRoutingTags",
    ()=>resolveRequestRoutingTags
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeSingleRoutingTag(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
}
function normalizeRoutingTags(value) {
    const rawValues = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
    const deduped = new Set();
    for (const rawValue of rawValues){
        const normalized = normalizeSingleRoutingTag(rawValue);
        if (normalized) deduped.add(normalized);
    }
    return Array.from(deduped);
}
function normalizeRoutingTagMatchMode(value) {
    const normalized = typeof value === "string" ? value.trim().toLowerCase() : typeof value === "number" ? "" : "";
    return normalized === "all" ? "all" : "any";
}
function getConnectionRoutingTags(providerSpecificData) {
    return normalizeRoutingTags(asRecord(providerSpecificData).tags);
}
function matchesRoutingTags(connectionTags, requestTags, matchMode = "any") {
    if (requestTags.length === 0) return true;
    if (connectionTags.length === 0) return false;
    const tagSet = new Set(connectionTags);
    if (matchMode === "all") {
        return requestTags.every((tag)=>tagSet.has(tag));
    }
    return requestTags.some((tag)=>tagSet.has(tag));
}
function resolveRequestRoutingTags(body) {
    const metadata = asRecord(body?.metadata);
    return {
        tags: normalizeRoutingTags(metadata.tags),
        matchMode: normalizeRoutingTagMatchMode(metadata.tag_match_mode ?? metadata.tagMatchMode)
    };
}
}),
"[project]/src/shared/constants/openRouterPreset.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OPENROUTER_PRESET_MAX_LENGTH",
    ()=>OPENROUTER_PRESET_MAX_LENGTH,
    "isOpenRouterPresetValue",
    ()=>isOpenRouterPresetValue,
    "normalizeOpenRouterPreset",
    ()=>normalizeOpenRouterPreset
]);
const OPENROUTER_PRESET_MAX_LENGTH = 200;
function isOpenRouterPresetValue(value) {
    return typeof value === "string" && value.trim().length <= OPENROUTER_PRESET_MAX_LENGTH;
}
function normalizeOpenRouterPreset(value) {
    if (!isOpenRouterPresetValue(value)) return undefined;
    const normalized = value.trim();
    return normalized || undefined;
}
}),
"[project]/src/shared/constants/upstreamHeaders.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isForbiddenCustomHeaderName",
    ()=>isForbiddenCustomHeaderName,
    "isForbiddenUpstreamHeaderName",
    ()=>isForbiddenUpstreamHeaderName
]);
/**
 * User-supplied upstream extra headers: names we never forward (Host / hop-by-hop / framing).
 * Changing this list requires syncing: `sanitizeUpstreamHeadersMap` (models.ts), Zod
 * `upstreamHeaderNameSchema` / record refine (schemas.ts), and `upstream-headers-sanitize` tests.
 */ const FORBIDDEN = new Set([
    "host",
    "connection",
    "content-length",
    "keep-alive",
    "proxy-connection",
    "transfer-encoding",
    "te",
    "trailer",
    "upgrade"
].map((s)=>s.toLowerCase()));
function isForbiddenUpstreamHeaderName(name) {
    return FORBIDDEN.has(String(name).trim().toLowerCase());
}
/**
 * Auth headers that must come from the connection's credentials, never from
 * operator-set per-provider custom headers. Kept here as the single source of
 * truth so the Zod `customHeadersSchema` (schemas.ts) and the executor's
 * apply-loop (open-sse/executors/default.ts) cannot drift apart.
 */ const FORBIDDEN_AUTH = new Set([
    "authorization",
    "x-api-key",
    "x-goog-api-key",
    "api-key",
    "cookie"
].map((s)=>s.toLowerCase()));
function isForbiddenCustomHeaderName(name) {
    const n = String(name).trim().toLowerCase();
    return isForbiddenUpstreamHeaderName(n) || FORBIDDEN_AUTH.has(n);
}
}),
"[project]/src/lib/providers/requestDefaults.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_REASONING_EFFORT_VALUES",
    ()=>CODEX_REASONING_EFFORT_VALUES,
    "buildOpenAIStoreSessionId",
    ()=>buildOpenAIStoreSessionId,
    "ensureOpenAIStoreSessionFallback",
    ()=>ensureOpenAIStoreSessionFallback,
    "getClaudeCodeCompatibleRequestDefaults",
    ()=>getClaudeCodeCompatibleRequestDefaults,
    "getCodexRequestDefaults",
    ()=>getCodexRequestDefaults,
    "getProviderRequestDefaults",
    ()=>getProviderRequestDefaults,
    "isOpenAIResponsesStoreEnabled",
    ()=>isOpenAIResponsesStoreEnabled,
    "normalizeCacheOverride",
    ()=>normalizeCacheOverride,
    "normalizeClaudeCodeCompatibleContext1m",
    ()=>normalizeClaudeCodeCompatibleContext1m,
    "normalizeClaudeCodeCompatibleRedactThinking",
    ()=>normalizeClaudeCodeCompatibleRedactThinking,
    "normalizeClaudeCodeCompatibleSummarizeThinking",
    ()=>normalizeClaudeCodeCompatibleSummarizeThinking,
    "normalizeCodexReasoningEffort",
    ()=>normalizeCodexReasoningEffort,
    "normalizeCodexServiceTier",
    ()=>normalizeCodexServiceTier,
    "normalizeProviderSpecificData",
    ()=>normalizeProviderSpecificData,
    "normalizeRequestDefaults",
    ()=>normalizeRequestDefaults,
    "sanitizeProviderSpecificDataForResponse",
    ()=>sanitizeProviderSpecificDataForResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tagRouter.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/openRouterPreset.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [app-rsc] (ecmascript)");
const CLAUDE_CODE_COMPATIBLE_PROVIDER_PREFIX = "anthropic-compatible-cc-";
;
;
;
;
const CODEX_REASONING_EFFORT_VALUES = [
    "none",
    "low",
    "medium",
    "high",
    "xhigh",
    "max"
];
const CODEX_REASONING_EFFORT_SET = new Set(CODEX_REASONING_EFFORT_VALUES);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeString(value) {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim().toLowerCase();
    return normalized || undefined;
}
const BEDROCK_REGION_PATTERN = /^[a-z]{2}(?:-gov)?-[a-z]+-\d+$/i;
function normalizeAwsRegion(value) {
    const normalized = normalizeString(value);
    if (!normalized || !BEDROCK_REGION_PATTERN.test(normalized)) return undefined;
    return normalized;
}
function hasNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function isClaudeCodeCompatibleProvider(provider) {
    return typeof provider === "string" && provider.startsWith(CLAUDE_CODE_COMPATIBLE_PROVIDER_PREFIX);
}
function normalizeCodexReasoningEffort(value) {
    const normalized = normalizeString(value);
    if (!normalized || !CODEX_REASONING_EFFORT_SET.has(normalized)) {
        return undefined;
    }
    return normalized;
}
function normalizeCodexServiceTier(value) {
    const normalized = normalizeString(value);
    if (!normalized) return undefined;
    if (normalized === "fast" || normalized === "priority") return "priority";
    if (normalized === "default" || normalized === "flex") return normalized;
    return undefined;
}
function normalizeClaudeCodeCompatibleContext1m(value) {
    return value === true ? true : undefined;
}
function normalizeClaudeCodeCompatibleRedactThinking(value) {
    return value === true ? true : undefined;
}
function normalizeClaudeCodeCompatibleSummarizeThinking(value) {
    return value === true ? true : undefined;
}
function normalizeRequestDefaults(provider, value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {
        ...record
    };
    if (provider === "codex") {
        const reasoningEffort = normalizeCodexReasoningEffort(record.reasoningEffort);
        if (reasoningEffort) {
            normalized.reasoningEffort = reasoningEffort;
        } else {
            delete normalized.reasoningEffort;
        }
        const serviceTier = normalizeCodexServiceTier(record.serviceTier);
        if (serviceTier) {
            normalized.serviceTier = serviceTier;
        } else {
            delete normalized.serviceTier;
        }
    }
    if (isClaudeCodeCompatibleProvider(provider)) {
        const context1m = normalizeClaudeCodeCompatibleContext1m(record.context1m);
        if (context1m) {
            normalized.context1m = true;
        } else {
            delete normalized.context1m;
        }
        const redactThinking = normalizeClaudeCodeCompatibleRedactThinking(record.redactThinking);
        if (redactThinking) {
            normalized.redactThinking = true;
        } else {
            delete normalized.redactThinking;
        }
        const summarizeThinking = normalizeClaudeCodeCompatibleSummarizeThinking(record.summarizeThinking);
        if (summarizeThinking) {
            normalized.summarizeThinking = true;
        } else {
            delete normalized.summarizeThinking;
        }
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
const CACHE_PASSTHROUGH_VALUES = new Set([
    "strip",
    "openai-format",
    "claude-format"
]);
function normalizeCacheOverride(value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {};
    if (typeof record.supportsPromptCaching === "boolean") {
        normalized.supportsPromptCaching = record.supportsPromptCaching;
    }
    if (typeof record.cacheControlPassthrough === "string" && CACHE_PASSTHROUGH_VALUES.has(record.cacheControlPassthrough)) {
        normalized.cacheControlPassthrough = record.cacheControlPassthrough;
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
// #6880 — extracted so normalizeProviderSpecificData() stays under the
// max-lines-per-function gate: normalizes the two nested-object sub-fields
// (requestDefaults, cache) in one pass.
function normalizeNestedSubObjects(provider, normalized) {
    if ("requestDefaults" in normalized) {
        const requestDefaults = normalizeRequestDefaults(provider, normalized.requestDefaults);
        if (requestDefaults) {
            normalized.requestDefaults = requestDefaults;
        } else {
            delete normalized.requestDefaults;
        }
    }
    if ("cache" in normalized) {
        const cache = normalizeCacheOverride(normalized.cache);
        if (cache) {
            normalized.cache = cache;
        } else {
            delete normalized.cache;
        }
    }
}
function normalizeProviderSpecificData(provider, value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {
        ...record
    };
    normalizeNestedSubObjects(provider, normalized);
    if ("openaiStoreEnabled" in normalized && typeof normalized.openaiStoreEnabled !== "boolean") {
        delete normalized.openaiStoreEnabled;
    }
    if ("blockExtraUsage" in normalized && typeof normalized.blockExtraUsage !== "boolean") {
        delete normalized.blockExtraUsage;
    }
    // #2997: per-connection transient-cooldown opt-out — only persist a real boolean.
    if ("disableCooling" in normalized && typeof normalized.disableCooling !== "boolean") {
        delete normalized.disableCooling;
    }
    if ("autoFetchModels" in normalized && typeof normalized.autoFetchModels !== "boolean") {
        delete normalized.autoFetchModels;
    }
    if ("preset" in normalized) {
        const preset = provider === "openrouter" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeOpenRouterPreset"])(normalized.preset) : null;
        if (preset) {
            normalized.preset = preset;
        } else {
            delete normalized.preset;
        }
    }
    if (provider === "bedrock" && "region" in normalized) {
        const region = normalizeAwsRegion(normalized.region);
        if (region) {
            normalized.region = region;
        } else {
            delete normalized.region;
        }
    }
    if ("tag" in normalized) {
        if (typeof normalized.tag === "string") {
            const trimmedTag = normalized.tag.trim();
            if (trimmedTag) {
                normalized.tag = trimmedTag;
            } else {
                delete normalized.tag;
            }
        } else {
            delete normalized.tag;
        }
    }
    if ("tags" in normalized) {
        const tags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRoutingTags"])(normalized.tags);
        if (tags.length > 0) {
            normalized.tags = tags;
        } else {
            delete normalized.tags;
        }
    }
    if ("excludedModels" in normalized || "excluded_models" in normalized) {
        const excludedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeExcludedModelPatterns"])(normalized.excludedModels ?? normalized.excluded_models);
        if (excludedModels.length > 0) {
            normalized.excludedModels = excludedModels;
        } else {
            delete normalized.excludedModels;
        }
        delete normalized.excluded_models;
    }
    // #8369: connection-level custom upstream headers — sanitize each key against the
    // forbidden-header denylist and drop entries with non-string or empty values.
    if ("customHeaders" in normalized) {
        const raw = normalized.customHeaders;
        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
            const cleaned = {};
            for (const [key, value] of Object.entries(raw)){
                const trimmedKey = key.trim();
                if (!trimmedKey) continue;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isForbiddenCustomHeaderName"])(trimmedKey)) continue;
                if (typeof value === "string" && value.trim().length > 0) {
                    cleaned[trimmedKey] = value.trim();
                }
            }
            if (Object.keys(cleaned).length > 0) {
                normalized.customHeaders = cleaned;
            } else {
                delete normalized.customHeaders;
            }
        } else {
            delete normalized.customHeaders;
        }
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
function sanitizeProviderSpecificDataForResponse(value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const sanitized = {
        ...record
    };
    delete sanitized.consoleApiKey;
    delete sanitized.secretAccessKey;
    delete sanitized.awsSecretAccessKey;
    delete sanitized.sessionToken;
    delete sanitized.awsSessionToken;
    delete sanitized.openCodeGoAuthCookie;
    delete sanitized.opencodeGoAuthCookie;
    delete sanitized.authCookie;
    delete sanitized.ollamaUsageCookie;
    delete sanitized.ollamaCloudUsageCookie;
    delete sanitized.ollamaCloudCookie;
    delete sanitized.usageCookie;
    return sanitized;
}
function isOpenAIResponsesStoreEnabled(providerSpecificData) {
    return asRecord(providerSpecificData).openaiStoreEnabled === true;
}
function buildOpenAIStoreSessionId(sessionId) {
    if (!hasNonEmptyString(sessionId)) return undefined;
    const normalized = String(sessionId).trim().replace(/^ext:/i, "").replace(/[^a-zA-Z0-9._:-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
    if (!normalized) return undefined;
    return `omniroute-session-${normalized}`;
}
function ensureOpenAIStoreSessionFallback(body, sessionId) {
    const explicitSessionId = body.session_id;
    const explicitConversationId = body.conversation_id;
    const promptCacheKey = body.prompt_cache_key ?? body.promptCacheKey;
    if (hasNonEmptyString(explicitSessionId) || hasNonEmptyString(explicitConversationId) || hasNonEmptyString(promptCacheKey)) {
        return body;
    }
    const fallbackSessionId = buildOpenAIStoreSessionId(sessionId);
    if (!fallbackSessionId) return body;
    return {
        ...body,
        session_id: fallbackSessionId
    };
}
function getProviderRequestDefaults(provider, providerSpecificData) {
    return normalizeRequestDefaults(provider, asRecord(providerSpecificData).requestDefaults) || {};
}
function getCodexRequestDefaults(providerSpecificData) {
    const defaults = getProviderRequestDefaults("codex", providerSpecificData);
    const reasoningEffort = normalizeCodexReasoningEffort(defaults.reasoningEffort);
    const serviceTier = normalizeCodexServiceTier(defaults.serviceTier);
    return {
        ...reasoningEffort ? {
            reasoningEffort
        } : {},
        ...serviceTier ? {
            serviceTier
        } : {}
    };
}
function getClaudeCodeCompatibleRequestDefaults(providerSpecificData) {
    const defaults = getProviderRequestDefaults("anthropic-compatible-cc-default", providerSpecificData);
    const context1m = normalizeClaudeCodeCompatibleContext1m(defaults.context1m);
    const redactThinking = normalizeClaudeCodeCompatibleRedactThinking(defaults.redactThinking);
    const summarizeThinking = normalizeClaudeCodeCompatibleSummarizeThinking(defaults.summarizeThinking);
    return {
        ...context1m ? {
            context1m
        } : {},
        ...redactThinking ? {
            redactThinking
        } : {},
        ...summarizeThinking ? {
            summarizeThinking
        } : {}
    };
}
}),
"[project]/src/lib/db/webSessionDedup.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseProviderSpecificData",
    ()=>parseProviderSpecificData,
    "webSessionCredentialKey",
    ()=>webSessionCredentialKey
]);
/**
 * db/webSessionDedup.ts — pure helpers for de-duplicating web-session
 * (cookie/token) provider credentials. Extracted from providers.ts so the
 * cookie-dedup wiring there stays thin (#3368 PR6). No DB access here.
 */ /**
 * Reduce a `provider_specific_data` record to a single comparable credential
 * value. Cookie/token credentials are mirrored across a provider's storage
 * keys (e.g. `cookie`, `sessionToken`, `token`) with the same secret value, so
 * any one of them identifies the session. Returns the trimmed value, or null
 * when no usable string credential is present.
 */ const PREFERRED_CREDENTIAL_KEYS = [
    "cookie",
    "token",
    "sessionToken",
    "session-token",
    "sso",
    "access_token",
    "accessToken"
];
/** First trimmed non-empty string value among `keys` of `rec`, else null. */ function firstNonEmptyString(rec, keys) {
    for (const key of keys){
        const value = rec[key];
        if (typeof value === "string" && value.trim()) return value.trim();
    }
    return null;
}
function webSessionCredentialKey(psd) {
    if (!psd || typeof psd !== "object") return null;
    const rec = psd;
    // Prefer canonical credential keys, then fall back to the first non-empty
    // string value (sorted for determinism).
    return firstNonEmptyString(rec, PREFERRED_CREDENTIAL_KEYS) ?? firstNonEmptyString(rec, Object.keys(rec).sort());
}
function parseProviderSpecificData(raw) {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === "object" ? parsed : null;
        } catch  {
            return null;
        }
    }
    return null;
}
}),
"[project]/src/lib/oauth/utils/codexConnectionSelection.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickCodexConnectionForUser",
    ()=>pickCodexConnectionForUser
]);
function toRecord(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value !== "string" || !value) return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch  {
        return {};
    }
}
function nonEmptyString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}
function readIdentity(connection) {
    const providerSpecificData = toRecord(connection.providerSpecificData ?? connection.provider_specific_data);
    return {
        workspaceId: nonEmptyString(providerSpecificData.workspaceId),
        userId: nonEmptyString(providerSpecificData.chatgptUserId),
        email: nonEmptyString(connection.email)
    };
}
function pickCodexConnectionForUser(workspaceMatches, userId, email) {
    const identities = workspaceMatches.map((connection)=>({
            connection,
            identity: readIdentity(connection)
        }));
    const exact = identities.find(({ identity })=>identity.userId === userId);
    if (exact) return exact.connection;
    if (identities.some(({ identity })=>identity.userId !== null)) return null;
    const normalizedEmail = nonEmptyString(email);
    const compatibleEmail = normalizedEmail ? identities.find(({ identity })=>identity.email === normalizedEmail) : null;
    return compatibleEmail?.connection || identities.find(({ identity })=>identity.email === null)?.connection || null;
}
}),
"[project]/src/lib/usage/accountIdentity.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveImportedUsageAccountIdentity",
    ()=>resolveImportedUsageAccountIdentity,
    "resolveOrphanedUsageAccountIdentity",
    ()=>resolveOrphanedUsageAccountIdentity,
    "resolveUsageAccountIdentity",
    ()=>resolveUsageAccountIdentity
]);
function identityString(value) {
    return typeof value === "string" && value ? value : null;
}
function displayString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}
function sanePriority(value) {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 4 ? value : null;
}
function toProviderSpecificData(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
    }
    if (typeof value !== "string" || !value) return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch  {
        return {};
    }
}
function resolveUsageAccountIdentity(connection) {
    const provider = identityString(connection?.provider) || "unknown";
    const connectionId = identityString(connection?.id) || "unknown";
    const authType = identityString(connection?.authType ?? connection?.auth_type);
    const email = identityString(connection?.email);
    const providerSpecificData = toProviderSpecificData(connection?.providerSpecificData ?? connection?.provider_specific_data);
    const workspaceId = identityString(providerSpecificData.workspaceId);
    const chatgptUserId = identityString(providerSpecificData.chatgptUserId);
    const username = identityString(providerSpecificData.username);
    let identityParts;
    if (authType === "oauth" && provider === "codex" && workspaceId && chatgptUserId) {
        identityParts = [
            "oauth",
            provider,
            "workspace",
            workspaceId,
            "user",
            chatgptUserId
        ];
    } else if (authType === "oauth" && provider === "codex" && chatgptUserId) {
        identityParts = [
            "oauth",
            provider,
            "user",
            chatgptUserId
        ];
    } else if (authType === "oauth" && provider === "codex" && workspaceId && email) {
        identityParts = [
            "oauth",
            provider,
            "workspace",
            workspaceId,
            "email",
            email
        ];
    } else if (authType === "oauth" && provider !== "codex" && email) {
        identityParts = username ? [
            "oauth",
            provider,
            "email",
            email,
            "username",
            username
        ] : [
            "oauth",
            provider,
            "email",
            email
        ];
    } else {
        identityParts = [
            "connection",
            provider,
            connectionId
        ];
    }
    const displayName = displayString(connection?.displayName ?? connection?.display_name);
    const displayEmail = displayString(connection?.email);
    const name = displayString(connection?.name);
    const id = displayString(connection?.id);
    return {
        accountKey: JSON.stringify(identityParts),
        accountLabel: displayName || displayEmail || name || id || "unknown",
        accountLabelPriority: displayName ? 4 : displayEmail ? 3 : name ? 2 : id ? 1 : 0
    };
}
function resolveOrphanedUsageAccountIdentity(provider, connectionId) {
    return resolveUsageAccountIdentity({
        provider,
        id: connectionId
    });
}
function resolveImportedUsageAccountIdentity(row, fallback) {
    return {
        accountKey: identityString(row.account_key ?? row.accountKey) || fallback.accountKey,
        accountLabel: displayString(row.account_label ?? row.accountLabel) || fallback.accountLabel,
        accountLabelPriority: sanePriority(row.account_label_priority ?? row.accountLabelPriority) ?? fallback.accountLabelPriority
    };
}
}),
"[project]/src/lib/db/providers/usageIdentityReconciliation.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reconcileCodexUsageHistory",
    ()=>reconcileCodexUsageHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/accountIdentity.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webSessionDedup.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/columns.ts [app-rsc] (ecmascript)");
;
;
;
function nonEmptyString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}
function isSafeCodexIdentityEnrichment(existing, merged) {
    const oldProviderData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseProviderSpecificData"])(existing.provider_specific_data) || {};
    const newProviderData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseProviderSpecificData"])(merged.providerSpecificData) || {};
    const oldUserId = nonEmptyString(oldProviderData.chatgptUserId);
    const newUserId = nonEmptyString(newProviderData.chatgptUserId);
    const oldWorkspaceId = nonEmptyString(oldProviderData.workspaceId);
    const newWorkspaceId = nonEmptyString(newProviderData.workspaceId);
    const oldEmail = nonEmptyString(existing.email);
    const newEmail = nonEmptyString(merged.email);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(existing.provider) === "codex" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(existing.auth_type) === "oauth" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(merged.provider) === "codex" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(merged.authType) === "oauth" && oldUserId === null && newUserId !== null && (oldWorkspaceId === null || oldWorkspaceId === newWorkspaceId) && (oldEmail === null || oldEmail === newEmail);
}
function reconcileCodexUsageHistory(db, input) {
    const oldIdentity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveUsageAccountIdentity"])(input.existing);
    const newIdentity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveUsageAccountIdentity"])(input.merged);
    const identityChanged = oldIdentity.accountKey !== newIdentity.accountKey;
    const permitted = input.matchedExistingCodexByWorkspace === true || isSafeCodexIdentityEnrichment(input.existing, input.merged);
    if (!identityChanged || !permitted) return;
    db.prepare(`UPDATE usage_history
     SET account_key = @newAccountKey,
         account_label = CASE
           WHEN @newLabelPriority > COALESCE(account_label_priority, 0)
           THEN @newLabel
           ELSE account_label
         END,
         account_label_priority = MAX(
           COALESCE(account_label_priority, 0),
           @newLabelPriority
         )
     WHERE connection_id = @connectionId
       AND account_key = @oldAccountKey`).run({
        connectionId: input.connectionId,
        oldAccountKey: oldIdentity.accountKey,
        newAccountKey: newIdentity.accountKey,
        newLabel: newIdentity.accountLabel,
        newLabelPriority: newIdentity.accountLabelPriority
    });
}
}),
"[project]/src/lib/db/providers/migrations.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "autoMigrateLegacyEncryptedConnections",
    ()=>autoMigrateLegacyEncryptedConnections,
    "getGheCopilotHosts",
    ()=>getGheCopilotHosts
]);
/**
 * db/providers/migrations — Connection-level migration utilities and GHE Copilot host discovery.
 *
 * Split from provider.ts to keep the main CRUD file under the size ratchet.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/caseMapping.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-rsc] (ecmascript)");
;
;
;
;
function autoMigrateLegacyEncryptedConnections() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT * FROM provider_connections").all();
    let migratedCount = 0;
    for (const row of rows){
        const camelRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rowToCamel"])(row);
        if (!camelRow) continue;
        let updatedRow = false;
        const encryptedFields = [
            "apiKey",
            "idToken",
            "accessToken",
            "refreshToken"
        ];
        for (const field of encryptedFields){
            if (typeof camelRow[field] === "string") {
                const { updated, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["migrateLegacyEncryptedString"])(camelRow[field]);
                if (updated) {
                    camelRow[field] = value;
                    updatedRow = true;
                }
            }
        }
        if (updatedRow) {
            // camelRow[field] is already re-encrypted!
            // But _updateConnectionRow does not re-encrypt automatically, so we pass it safely.
            // Wait, _updateConnectionRow runs the full data through `encryptConnectionFields`,
            // but `encryptConnectionFields` will re-encrypt plain text.
            // BUT `migrateLegacyEncryptedString` returns ALREADY ENCRYPTED ciphertext!
            // Wait... if we pass ALREADY ENCRYPTED text to `_updateConnectionRow`,
            // `encryptConnectionFields` in `_updateConnectionRow` will encrypt it AGAIN!
            // Let's modify the DB directly so we don't double encrypt.
            db.prepare("UPDATE provider_connections SET api_key = @apiKey, id_token = @idToken, access_token = @accessToken, refresh_token = @refreshToken, updated_at = @updatedAt WHERE id = @id").run({
                id: camelRow.id,
                apiKey: camelRow.apiKey ?? null,
                idToken: camelRow.idToken ?? null,
                accessToken: camelRow.accessToken ?? null,
                refreshToken: camelRow.refreshToken ?? null,
                updatedAt: new Date().toISOString()
            });
            migratedCount++;
        }
    }
    if (migratedCount > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
        console.log(`[DB] Auto-migrated ${migratedCount} connection(s) to new static-salt encryption.`);
    }
    return migratedCount;
}
function getGheCopilotHosts() {
    const hosts = new Set();
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const rows = db.prepare("SELECT provider_specific_data FROM provider_connections WHERE provider = 'ghe-copilot' AND is_active = 1").all();
        for (const row of rows){
            if (!row.provider_specific_data) continue;
            try {
                const psd = JSON.parse(row.provider_specific_data);
                const urls = [
                    psd.gheUrl,
                    psd.copilotApiUrl,
                    psd.copilotProxyUrl
                ];
                for (const urlStr of urls){
                    if (typeof urlStr === "string" && urlStr.trim()) {
                        try {
                            const url = new URL(urlStr);
                            if (url.hostname) {
                                hosts.add(url.hostname.toLowerCase());
                            }
                        } catch  {
                        // Ignore invalid URLs
                        }
                    }
                }
            } catch  {
            // Ignore JSON parse errors
            }
        }
    } catch (err) {
        console.error("[DB] getGheCopilotHosts: failed to read GHE Copilot connections", err);
    }
    return [
        ...hosts
    ];
}
}),
"[project]/src/lib/db/providerNodeSelect.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pure provider-node selection helper (#4421).
 *
 * Kept dependency-free (no DB import) so it can be unit-tested without opening a
 * SQLite connection.
 */ __turbopack_context__.s([
    "nodeTypeFromId",
    ()=>nodeTypeFromId,
    "selectProviderNodeForConnection",
    ()=>selectProviderNodeForConnection
]);
const TRAILING_UUID = /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function nodeTypeFromId(id) {
    const s = String(id ?? "");
    return TRAILING_UUID.test(s) ? s.replace(TRAILING_UUID, "") : s;
}
function selectProviderNodeForConnection(idOrType, nodes) {
    if (!idOrType) return null;
    const exact = nodes.find((n)=>n.id === idOrType);
    if (exact) return exact;
    const ofType = nodes.filter((n)=>typeof n.id === "string" && nodeTypeFromId(n.id) === idOrType);
    return ofType.length === 1 ? ofType[0] : null;
}
}),
"[project]/src/lib/db/providers/nodes.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createProviderNode",
    ()=>createProviderNode,
    "deleteProviderNode",
    ()=>deleteProviderNode,
    "getProviderNodeById",
    ()=>getProviderNodeById,
    "getProviderNodes",
    ()=>getProviderNodes,
    "getProviderNodesCount",
    ()=>getProviderNodesCount,
    "resolveProviderNodeForConnection",
    ()=>resolveProviderNodeForConnection,
    "updateProviderNode",
    ()=>updateProviderNode
]);
/**
 * db/providers/nodes.ts — Provider nodes CRUD.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [app-rsc] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/caseMapping.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerNodeSelect$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerNodeSelect.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/columns.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function getProviderNodes(filter = {}, limit, offset) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let sql = "SELECT * FROM provider_nodes";
    const params = {};
    if (filter.type) {
        sql += " WHERE type = @type";
        params.type = filter.type;
    }
    sql += " ORDER BY id ASC";
    if (limit !== undefined) {
        sql += " LIMIT @limit OFFSET @offset";
        params.limit = limit;
        params.offset = offset ?? 0;
    }
    return db.prepare(sql).all(params).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rowToCamel"]);
}
function getProviderNodesCount(filter = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let sql = "SELECT count(*) as cnt FROM provider_nodes";
    const params = {};
    if (filter.type) {
        sql += " WHERE type = @type";
        params.type = filter.type;
    }
    const row = db.prepare(sql).get(params);
    return row.cnt;
}
async function getProviderNodeById(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM provider_nodes WHERE id = ?").get(id);
    return row ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rowToCamel"])(row) : null;
}
async function resolveProviderNodeForConnection(idOrType) {
    const exact = await getProviderNodeById(idOrType);
    if (exact) return exact;
    const all = await getProviderNodes();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerNodeSelect$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["selectProviderNodeForConnection"])(idOrType, all);
}
async function createProviderNode(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    const customHeadersJson = data.customHeaders ? JSON.stringify(data.customHeaders) : null;
    const node = {
        id: data.id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        type: data.type,
        name: data.name,
        prefix: data.prefix || null,
        apiType: data.apiType || null,
        baseUrl: data.baseUrl || null,
        chatPath: data.chatPath || null,
        modelsPath: data.modelsPath || null,
        // Optional operator-supplied remote icon URL (#2166) — plain TEXT, no JSON parsing needed.
        iconUrl: data.iconUrl || null,
        customHeadersJson,
        createdAt: now,
        updatedAt: now
    };
    db.prepare(`
    INSERT INTO provider_nodes (id, type, name, prefix, api_type, base_url, chat_path, models_path, icon_url, custom_headers_json, created_at, updated_at)
    VALUES (@id, @type, @name, @prefix, @apiType, @baseUrl, @chatPath, @modelsPath, @iconUrl, @customHeadersJson, @createdAt, @updatedAt)
  `).run(node);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("nodes");
    const result = {
        ...node
    };
    if (customHeadersJson) {
        try {
            result.customHeaders = JSON.parse(customHeadersJson);
        } catch  {
            result.customHeaders = null;
        }
    } else {
        result.customHeaders = null;
    }
    delete result.customHeadersJson;
    return result;
}
async function updateProviderNode(id, data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = db.prepare("SELECT * FROM provider_nodes WHERE id = ?").get(id);
    if (!existing) return null;
    const merged = {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rowToCamel"])(existing)),
        ...data,
        updatedAt: new Date().toISOString()
    };
    if (data.customHeaders !== undefined) {
        merged["customHeadersJson"] = data.customHeaders ? JSON.stringify(data.customHeaders) : null;
    } else {
        // Partial update that omits customHeaders must PRESERVE the stored value.
        // rowToCamel surfaces the column under `customHeaders` (suffix stripped),
        // never `customHeadersJson`, so read the raw stored JSON from `existing`
        // directly instead of relying on the (absent) merged key — otherwise the
        // UPDATE would bind null and silently wipe the saved headers.
        const existingJson = existing.custom_headers_json;
        merged["customHeadersJson"] = typeof existingJson === "string" ? existingJson : null;
    }
    db.prepare(`
    UPDATE provider_nodes SET type = @type, name = @name, prefix = @prefix,
    api_type = @apiType, base_url = @baseUrl, chat_path = @chatPath,
    models_path = @modelsPath, icon_url = @iconUrl,
    custom_headers_json = @customHeadersJson, updated_at = @updatedAt
    WHERE id = @id
  `).run({
        id,
        type: merged["type"],
        name: merged["name"],
        prefix: merged["prefix"] || null,
        apiType: merged["apiType"] || null,
        baseUrl: merged["baseUrl"] || null,
        chatPath: merged["chatPath"] || null,
        modelsPath: merged["modelsPath"] || null,
        // #2166: iconUrl is nullable — explicit `null` (not omission) clears a previously
        // stored custom icon when the caller submits an empty value.
        iconUrl: merged["iconUrl"] || null,
        customHeadersJson: merged["customHeadersJson"] || null,
        updatedAt: merged["updatedAt"]
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("nodes");
    const result = {
        ...merged
    };
    const storedJson = merged["customHeadersJson"];
    if (storedJson) {
        try {
            result.customHeaders = JSON.parse(storedJson);
        } catch  {
            result.customHeaders = null;
        }
    } else {
        result.customHeaders = null;
    }
    delete result.customHeadersJson;
    return result;
}
async function deleteProviderNode(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = db.prepare("SELECT * FROM provider_nodes WHERE id = ?").get(id);
    if (!existing) return null;
    db.prepare("DELETE FROM provider_nodes WHERE id = ?").run(id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("nodes");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rowToCamel"])(existing);
}
}),
"[project]/src/shared/utils/maskEmail.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * maskEmail — Privacy display utility for email addresses.
 *
 * Masks both username and domain portions of an email address.
 * - Username: keep the first `visibleChars`, mask the rest
 * - Domain: mask everything except the final `visibleChars`
 *
 * @example
 *   maskEmail("diego.souza@outlook.com.br")  // "die********@***********.br"
 *   maskEmail("user@gmail.com")              // "use*@******.com"
 *   maskEmail("a@b.com")                     // "a@b.com"  (too short to mask)
 */ __turbopack_context__.s([
    "maskEmail",
    ()=>maskEmail,
    "maskEmailLikeValue",
    ()=>maskEmailLikeValue,
    "pickDisplayValue",
    ()=>pickDisplayValue,
    "pickMaskedDisplayValue",
    ()=>pickMaskedDisplayValue
]);
function maskEmail(email, visibleChars = 3) {
    if (!email) return "";
    if (!email.includes("@")) return email;
    const atIndex = email.lastIndexOf("@");
    const username = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    // If username is too short to mask meaningfully, return as-is
    if (username.length <= visibleChars) return email;
    const maskedUser = username.slice(0, visibleChars) + "*".repeat(username.length - visibleChars);
    if (domain.length <= visibleChars) {
        return `${maskedUser}@${domain}`;
    }
    const maskedDomain = "*".repeat(domain.length - visibleChars) + domain.slice(domain.length - visibleChars);
    return `${maskedUser}@${maskedDomain}`;
}
function maskEmailLikeValue(value, visibleChars = 3) {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.includes("@") ? maskEmail(trimmed, visibleChars) : trimmed;
}
function pickMaskedDisplayValue(values, fallback = "") {
    for (const value of values){
        const masked = maskEmailLikeValue(value);
        if (masked) return masked;
    }
    return fallback;
}
function pickDisplayValue(values, showFull, fallback = "") {
    if (showFull) {
        for (const value of values){
            if (value?.trim()) return value.trim();
        }
        return fallback;
    }
    return pickMaskedDisplayValue(values, fallback);
}
}),
"[project]/src/shared/utils/formatting.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fmtCompact",
    ()=>fmtCompact,
    "fmtCost",
    ()=>fmtCost,
    "fmtFull",
    ()=>fmtFull,
    "formatApiKeyLabel",
    ()=>formatApiKeyLabel,
    "formatCost",
    ()=>formatCost,
    "formatDuration",
    ()=>formatDuration,
    "formatErrorForDisplay",
    ()=>formatErrorForDisplay,
    "formatResetCountdown",
    ()=>formatResetCountdown,
    "formatTime",
    ()=>formatTime,
    "maskAccount",
    ()=>maskAccount,
    "maskSegment",
    ()=>maskSegment,
    "safePercentage",
    ()=>safePercentage,
    "stableAccountSuffix",
    ()=>stableAccountSuffix,
    "truncateUrl",
    ()=>truncateUrl
]);
/**
 * Shared formatting utilities — DRY extraction from duplicated functions
 * across RequestLoggerV2.js, UsageAnalytics.js, ProxyLogger.js
 *
 * Prevents copy-paste duplication and provides a single source of truth.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-rsc] (ecmascript)");
;
function formatTime(isoString) {
    try {
        if (!isoString) return "-";
        const d = new Date(isoString);
        return d.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    } catch  {
        return "-";
    }
}
function formatDuration(ms) {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}
function maskSegment(value, start = 2, end = 2) {
    if (!value) return "";
    if (value.length <= start + end) return `${value.slice(0, 1)}***`;
    return `${value.slice(0, start)}***${value.slice(-end)}`;
}
function maskAccount(account, emailsVisible) {
    if (!account || account === "-") return "-";
    if (emailsVisible) return account;
    const atIdx = account.indexOf("@");
    if (atIdx > 3) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["maskEmail"])(account);
    }
    if (account.length > 8) {
        return account.slice(0, 5) + "***";
    }
    return account;
}
function stableAccountSuffix(account) {
    if (!account || account === "-") return "0000";
    let hash = 0x811c9dc5;
    for(let i = 0; i < account.length; i++){
        hash ^= account.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0").slice(0, 4);
}
function formatApiKeyLabel(apiKeyName, apiKeyId) {
    if (!apiKeyName && !apiKeyId) return "—";
    const displayName = apiKeyName || "key";
    if (!apiKeyId) return displayName;
    return `${displayName} (${maskSegment(apiKeyId, 4, 4)})`;
}
function fmtCompact(n) {
    if (n && n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n && n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n && n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return new Intl.NumberFormat().format(n || 0);
}
function fmtFull(n) {
    return new Intl.NumberFormat().format(n || 0);
}
function formatCost(usd) {
    const value = Number(usd || 0);
    if (!Number.isFinite(value) || value === 0) return "$0.00";
    if (value < 0.01) return `$${value.toFixed(6)}`;
    if (value < 1) return `$${value.toFixed(4)}`;
    return `$${value.toFixed(2)}`;
}
const fmtCost = formatCost;
function truncateUrl(url, max = 50) {
    if (!url) return "-";
    try {
        const parsed = new URL(url);
        const display = parsed.hostname + parsed.pathname;
        return display.length > max ? display.slice(0, max) + "…" : display;
    } catch  {
        return url.length > max ? url.slice(0, max) + "…" : url;
    }
}
function safePercentage(value) {
    return typeof value === "number" && isFinite(value) ? value : undefined;
}
function formatResetCountdown(resetAt) {
    if (!resetAt) return null;
    const resetTime = typeof resetAt === "number" ? resetAt : new Date(resetAt).getTime();
    if (isNaN(resetTime)) return null;
    const diffMs = resetTime - Date.now();
    if (diffMs <= 0) return null;
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}
function formatErrorForDisplay(err) {
    if (err == null) return null;
    if (typeof err === "string") return err;
    try {
        return JSON.stringify(err, null, 2);
    } catch  {
        return String(err);
    }
}
}),
"[project]/src/lib/db/providers/rateLimit.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearConnectionRateLimit",
    ()=>clearConnectionRateLimit,
    "clearStaleCrashCooldowns",
    ()=>clearStaleCrashCooldowns,
    "getEffectiveQuotaUsage",
    ()=>getEffectiveQuotaUsage,
    "getRateLimitedConnections",
    ()=>getRateLimitedConnections,
    "isConnectionRateLimited",
    ()=>isConnectionRateLimited,
    "markConnectionRateLimitedUntil",
    ()=>markConnectionRateLimitedUntil,
    "setConnectionRateLimitUntil",
    ()=>setConnectionRateLimitUntil
]);
/**
 * db/providers/rateLimit.ts — Rate-limit/quota runtime helpers for provider_connections.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-rsc] (ecmascript)");
// T13: Format a reset countdown as a human-readable string ("2h 35m" / "4m 30s").
// The implementation lives in the client-safe formatting utils so client
// components (e.g. CoolingConnectionsPanel) can import it without pulling this
// server-only DB module (better-sqlite3/ioredis) into the browser bundle.
// Re-exported here for existing server-side callers and the db/providers barrel.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-rsc] (ecmascript)");
;
;
function setConnectionRateLimitUntil(connectionId, until) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("UPDATE provider_connections SET rate_limited_until = ?, updated_at = ? WHERE id = ?").run(until, new Date().toISOString(), connectionId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
}
function markConnectionRateLimitedUntil(connectionId, retryAfterMs) {
    if (typeof connectionId !== "string" || connectionId.length === 0) return;
    if (!Number.isFinite(retryAfterMs) || retryAfterMs <= 0) return;
    try {
        setConnectionRateLimitUntil(connectionId, Date.now() + retryAfterMs);
    } catch  {
    // best-effort
    }
}
function clearConnectionRateLimit(connectionId) {
    if (typeof connectionId !== "string" || connectionId.length === 0) return;
    try {
        setConnectionRateLimitUntil(connectionId, null);
    } catch  {
    // best-effort
    }
}
function isConnectionRateLimited(connectionId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT rate_limited_until FROM provider_connections WHERE id = ?").get(connectionId);
    if (!row?.rate_limited_until) return false;
    return Date.now() < row.rate_limited_until;
}
function getRateLimitedConnections(provider) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = Date.now();
    const rows = db.prepare("SELECT id, rate_limited_until FROM provider_connections WHERE provider = ? AND rate_limited_until > ?").all(provider, now);
    return rows.map((r)=>({
            id: r.id,
            rateLimitedUntil: r.rate_limited_until
        }));
}
function getEffectiveQuotaUsage(used, resetAt) {
    if (!resetAt) return used;
    const resetTime = typeof resetAt === "number" ? resetAt : new Date(resetAt).getTime();
    if (isNaN(resetTime)) return used;
    // Window has passed — display should show 0 (pending next snapshot)
    if (Date.now() >= resetTime) return 0;
    return used;
}
function clearStaleCrashCooldowns() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    // Fetch all connections that have a rate_limited_until set and are NOT in
    // a terminal state.  We do the terminal-status filter in JS to reuse the
    // canonical `TERMINAL_STATUSES` set rather than duplicating the list in SQL.
    const TERMINAL_STATUSES = new Set([
        "banned",
        "expired",
        "credits_exhausted"
    ]);
    const rows = db.prepare(`SELECT id, test_status FROM provider_connections WHERE rate_limited_until IS NOT NULL`).all();
    const toReset = rows.filter((r)=>{
        const status = (r.test_status || "").trim().toLowerCase();
        return !TERMINAL_STATUSES.has(status);
    });
    if (toReset.length === 0) return {
        cleared: 0
    };
    const stmt = db.prepare(`UPDATE provider_connections SET
       rate_limited_until = NULL,
       test_status        = 'active',
       backoff_level      = 0,
       last_error         = NULL,
       last_error_at      = NULL,
       last_error_type    = NULL,
       last_error_source  = NULL,
       error_code         = NULL,
       updated_at         = ?
     WHERE id = ?`);
    for (const row of toReset){
        stmt.run(now, row.id);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
    return {
        cleared: toReset.length
    };
}
;
}),
"[project]/src/lib/db/providers.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "cleanupProviderConnections",
    ()=>cleanupProviderConnections,
    "clearConnectionErrorIfUnchanged",
    ()=>clearConnectionErrorIfUnchanged,
    "createProviderConnection",
    ()=>createProviderConnection,
    "getDistinctGroups",
    ()=>getDistinctGroups,
    "getProviderConnectionById",
    ()=>getProviderConnectionById,
    "getProviderConnections",
    ()=>getProviderConnections,
    "getProviderConnectionsCount",
    ()=>getProviderConnectionsCount,
    "getRawProviderConnections",
    ()=>getRawProviderConnections,
    "resetConnectionBackoff",
    ()=>resetConnectionBackoff,
    "touchConnectionLastUsed",
    ()=>touchConnectionLastUsed,
    "updateProviderConnection",
    ()=>updateProviderConnection
]);
/**
 * db/providers.js — Provider connections and nodes CRUD.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [app-rsc] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/caseMapping.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/lazyConnectionView.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$deletion$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/deletion.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webSessionDedup.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$codexConnectionSelection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/utils/codexConnectionSelection.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$usageIdentityReconciliation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/usageIdentityReconciliation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/columns.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$migrations$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/migrations.ts [app-rsc] (ecmascript)");
// ──────────────── Re-exports from leaf modules ────────────────
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$nodes$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/nodes.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$rateLimit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers/rateLimit.ts [app-rsc] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$deletion$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$deletion$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const CONNECTION_CREDENTIAL_FIELDS = [
    "apiKey",
    "accessToken",
    "refreshToken",
    "idToken"
];
// Real column set for provider_connections (must match the CREATE TABLE in
// core.ts's SCHEMA_SQL). getProviderConnections()'s optional `columns`
// projection is interpolated directly into the SELECT clause, so every
// requested name must be validated against this allowlist before use —
// there is no current caller that passes untrusted input, but the
// projection API itself must never accept an arbitrary string.
const PROVIDER_CONNECTIONS_COLUMNS = new Set([
    "id",
    "provider",
    "auth_type",
    "name",
    "email",
    "priority",
    "is_active",
    "access_token",
    "refresh_token",
    "expires_at",
    "token_expires_at",
    "scope",
    "project_id",
    "test_status",
    "error_code",
    "last_error",
    "last_error_at",
    "last_error_type",
    "last_error_source",
    "backoff_level",
    "rate_limited_until",
    "health_check_interval",
    "last_health_check_at",
    "last_tested",
    "api_key",
    "id_token",
    "provider_specific_data",
    "expires_in",
    "display_name",
    "global_priority",
    "default_model",
    "token_type",
    "consecutive_use_count",
    "rate_limit_protection",
    "last_used_at",
    "group",
    "max_concurrent",
    "proxy_enabled",
    "per_key_proxy_enabled",
    "quota_window_thresholds_json",
    "rate_limit_overrides_json",
    "created_at",
    "updated_at"
]);
async function getProviderConnections(filter = {}, limit, offset, columns) {
    const useCache = !columns?.length && limit === undefined && offset === undefined;
    const raw = useCache ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCachedRawProviderConnections"])(filter) : await getRawProviderConnections(filter, limit, offset, columns);
    return raw.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createLazyRowProxy"]);
}
async function getRawProviderConnections(filter = {}, limit, offset, columns) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let selectCols = "*";
    if (columns?.length) {
        const invalidColumns = columns.filter((col)=>!PROVIDER_CONNECTIONS_COLUMNS.has(col));
        if (invalidColumns.length > 0) {
            throw new Error(`getProviderConnections: invalid column(s) requested: ${invalidColumns.join(", ")}`);
        }
        // "group" is a reserved SQL keyword — the schema declares it quoted, so
        // it must be re-quoted here too or the generated SELECT is a syntax error.
        selectCols = columns.map((col)=>col === "group" ? `"group"` : col).join(", ");
    }
    let sql = `SELECT ${selectCols} FROM provider_connections`;
    const conditions = [];
    const params = {};
    if (filter.provider) {
        conditions.push("provider = @provider");
        params.provider = filter.provider;
    }
    if (filter.isActive !== undefined) {
        conditions.push("is_active = @isActive");
        params.isActive = filter.isActive ? 1 : 0;
    }
    if (filter.authType) {
        conditions.push("auth_type = @authType");
        params.authType = filter.authType;
    }
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY priority ASC, updated_at DESC";
    if (limit !== undefined) {
        sql += " LIMIT @limit OFFSET @offset";
        params.limit = limit;
        params.offset = offset ?? 0;
    }
    const rows = db.prepare(sql).all(params);
    return rows.map((r)=>{
        const camelRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rowToCamel"])(r);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableRateLimitOverrides"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableQuotaWindowThresholds"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableMaxConcurrent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cleanNulls"])(camelRow), camelRow), camelRow), camelRow);
    });
}
function getProviderConnectionsCount(filter = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let sql = "SELECT count(*) as cnt FROM provider_connections";
    const conditions = [];
    const params = {};
    if (filter.provider) {
        conditions.push("provider = @provider");
        params.provider = filter.provider;
    }
    if (filter.isActive !== undefined) {
        conditions.push("is_active = @isActive");
        params.isActive = filter.isActive ? 1 : 0;
    }
    if (filter.authType) {
        conditions.push("auth_type = @authType");
        params.authType = filter.authType;
    }
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }
    const row = db.prepare(sql).get(params);
    return row.cnt;
}
async function getProviderConnectionById(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM provider_connections WHERE id = ?").get(id);
    if (!row) return null;
    const camelRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rowToCamel"])(row);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decryptConnectionFields"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableRateLimitOverrides"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableQuotaWindowThresholds"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableMaxConcurrent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cleanNulls"])(camelRow), camelRow), camelRow), camelRow));
}
// #3368 PR6 — dedup web-session cookie/token credentials on connection create.
// Re-importing the same session (e.g. via bulk web-session import) under a
// different or blank name must update the existing connection instead of
// inserting a duplicate, mirroring the apikey dedup (#3023). Extracted from
// createProviderConnection to keep that function below the complexity baseline.
// provider_specific_data is plaintext JSON, so the value is compared directly
// without decryption.
function findExistingCookieConnection(db, provider, name, normalizedProviderSpecificData) {
    // 1) Name-based upsert for parity with the apikey path.
    if (name) {
        const byName = db.prepare("SELECT * FROM provider_connections WHERE provider = ? AND auth_type = 'cookie' AND name = ?").get(provider, name) || null;
        if (byName) return byName;
    }
    // 2) Credential-value dedup against existing cookie rows.
    const newCredKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["webSessionCredentialKey"])(normalizedProviderSpecificData);
    if (!newCredKey) return null;
    const cookieRows = db.prepare("SELECT * FROM provider_connections WHERE provider = ? AND auth_type = 'cookie'").all(provider);
    for (const row of cookieRows){
        const psd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseProviderSpecificData"])(row.provider_specific_data);
        if (psd && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["webSessionCredentialKey"])(psd) === newCredKey) return row;
    }
    return null;
}
async function createProviderConnection(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    const normalizedProviderSpecificData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeProviderSpecificData"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(data.provider), data.providerSpecificData);
    let existing = null;
    let promotedCodexIdentity = false;
    const providerSpecificData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toRecord"])(data.providerSpecificData);
    const workspaceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(providerSpecificData.workspaceId);
    const chatgptUserId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(providerSpecificData.chatgptUserId);
    if (data.authType === "oauth" && data.provider === "codex" && chatgptUserId) {
        const strongSql = workspaceId ? "SELECT * FROM provider_connections WHERE provider = ? AND auth_type = 'oauth' AND json_extract(provider_specific_data, '$.workspaceId') = ? AND json_extract(provider_specific_data, '$.chatgptUserId') = ?" : "SELECT * FROM provider_connections WHERE provider = ? AND auth_type = 'oauth' AND (json_extract(provider_specific_data, '$.workspaceId') IS NULL OR json_extract(provider_specific_data, '$.workspaceId') = '') AND json_extract(provider_specific_data, '$.chatgptUserId') = ?";
        existing = (workspaceId ? db.prepare(strongSql).get(data.provider, workspaceId, chatgptUserId) : db.prepare(strongSql).get(data.provider, chatgptUserId)) || null;
        if (!existing && workspaceId) {
            const workspaceMatches = db.prepare(`SELECT * FROM provider_connections
           WHERE provider = ? AND auth_type = 'oauth'
             AND json_extract(provider_specific_data, '$.workspaceId') = ?
           ORDER BY created_at`).all(data.provider, workspaceId);
            existing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$codexConnectionSelection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pickCodexConnectionForUser"])(workspaceMatches, chatgptUserId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(data.email));
            promotedCodexIdentity = existing !== null;
        }
    } else if (data.authType === "oauth" && data.email) {
        if (data.provider === "codex") {
            if (workspaceId) {
                existing = db.prepare(`SELECT * FROM provider_connections
               WHERE provider = ? AND auth_type = 'oauth'
                 AND json_extract(provider_specific_data, '$.workspaceId') = ?
                 AND email = ?
               LIMIT 1`).get(data.provider, workspaceId, data.email) || null;
            }
        } else {
            // For other providers (or Codex without workspaceId), match on email —
            // disambiguated by providerSpecificData.username when present on both
            // sides. Two different IdPs can share the same email address (e.g. a
            // Google account and a HuggingFace account); matching on email alone
            // would silently overwrite the other account's connection on the
            // second login. Only fall back to the bare email-only match when
            // neither side carries a username (legacy rows created before this
            // disambiguation existed).
            const incomingUsername = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(providerSpecificData.username);
            const emailMatches = db.prepare("SELECT * FROM provider_connections WHERE provider = ? AND auth_type = 'oauth' AND email = ?").all(data.provider, data.email);
            existing = emailMatches.find((row)=>{
                const existingUsername = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webSessionDedup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseProviderSpecificData"])(row.provider_specific_data)?.username);
                if (incomingUsername && existingUsername) {
                    return incomingUsername === existingUsername;
                }
                if (incomingUsername || existingUsername) return false;
                return true;
            }) || null;
        }
    } else if (data.authType === "apikey") {
        // Name-based upsert (existing behavior): same provider + same name → update.
        if (data.name) {
            existing = db.prepare("SELECT * FROM provider_connections WHERE provider = ? AND auth_type = 'apikey' AND name = ?").get(data.provider, data.name) || null;
        }
        // #3023 — dedup by API key value: re-adding the same key (under a different
        // or blank name) must update the existing connection, not insert a duplicate
        // row. Stored keys use non-deterministic AES-GCM, so ciphertext can't be
        // compared directly — decrypt each apikey row for this provider and match the
        // plaintext (trimmed) instead.
        const newApiKey = typeof data.apiKey === "string" ? data.apiKey.trim() : "";
        if (!existing && newApiKey) {
            const apiKeyRows = db.prepare("SELECT * FROM provider_connections WHERE provider = ? AND auth_type = 'apikey'").all(data.provider);
            for (const row of apiKeyRows){
                const decrypted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decryptConnectionFields"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rowToCamel"])(row)));
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(decrypted.apiKey)?.trim() === newApiKey) {
                    existing = row;
                    break;
                }
            }
        }
    } else if (data.authType === "cookie") {
        existing = findExistingCookieConnection(db, data.provider, data.name, normalizedProviderSpecificData);
    } else if (data.authType === "access_token") {
    // #1290 — bare access-token imports (e.g. a raw ChatGPT website access
    // token with no refresh token) are intentionally never deduped: every
    // import creates a new connection. Unlike oauth (workspace+email) or
    // apikey (key-value) imports, a bare access token has no refresh token
    // and no stable long-lived identity to safely dedup against — matching
    // on email alone here would risk silently overwriting an existing full
    // oauth connection for the same account.
    }
    if (existing) {
        const existingId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(existing.id);
        if (!existingId) return null;
        const rawExisting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rowToCamel"])(existing));
        const decryptedExisting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decryptConnectionFields"])({
            ...rawExisting
        });
        const merged = {
            ...decryptedExisting,
            ...data,
            updatedAt: now
        };
        merged.providerSpecificData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeProviderSpecificData"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(merged.provider), merged.providerSpecificData);
        const persistence = {
            ...merged
        };
        for (const field of CONNECTION_CREDENTIAL_FIELDS){
            if (!Object.hasOwn(data, field)) {
                persistence[field] = rawExisting[field];
            }
        }
        db.transaction(()=>{
            if (promotedCodexIdentity) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$usageIdentityReconciliation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reconcileCodexUsageHistory"])(db, {
                    connectionId: existingId,
                    existing,
                    merged,
                    matchedExistingCodexByWorkspace: true
                });
            }
            _updateConnectionRow(db, existingId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptConnectionFields"])(persistence));
        })();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableRateLimitOverrides"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableQuotaWindowThresholds"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableMaxConcurrent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cleanNulls"])(merged), merged), merged), merged);
    }
    // Generate name: prefer explicit name, then email, then a stable short-ID label.
    // Avoid sequential "Account N" — it reassigns when accounts are deleted/reordered.
    let connectionName = data.name || null;
    if (!connectionName && (data.authType === "oauth" || data.authType === "access_token")) {
        if (data.email) {
            connectionName = data.email;
        } else if (data.displayName) {
            connectionName = data.displayName;
        }
    // Otherwise leave null — UI will fall back to getAccountDisplayName() → "Account #<id>"
    }
    // Auto-increment priority
    let connectionPriority = data.priority;
    if (!connectionPriority) {
        const max = db.prepare("SELECT MAX(priority) as maxP FROM provider_connections WHERE provider = ?").get(data.provider);
        const maxPriority = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNumberOrZero"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toRecord"])(max).maxP);
        connectionPriority = maxPriority + 1;
    }
    const connection = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        provider: data.provider,
        authType: data.authType || "oauth",
        name: connectionName,
        priority: connectionPriority,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: now,
        updatedAt: now,
        proxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.proxyEnabled, true),
        perKeyProxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.perKeyProxyEnabled, false),
        quotaVisible: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.quotaVisible, true)
    };
    // Optional fields
    const optionalFields = [
        "displayName",
        "email",
        "globalPriority",
        "defaultModel",
        "accessToken",
        "refreshToken",
        "expiresAt",
        "tokenType",
        "scope",
        "idToken",
        "projectId",
        "apiKey",
        "testStatus",
        "lastTested",
        "lastError",
        "lastErrorAt",
        "lastErrorType",
        "lastErrorSource",
        "rateLimitedUntil",
        "expiresIn",
        "errorCode",
        "consecutiveUseCount",
        "rateLimitProtection",
        "group",
        "maxConcurrent",
        "proxyEnabled",
        "perKeyProxyEnabled",
        "quotaVisible",
        "quotaWindowThresholds",
        "rateLimitOverrides",
        "healthCheckInterval"
    ];
    for (const field of optionalFields){
        if (data[field] !== undefined && data[field] !== null) {
            connection[field] = data[field];
        }
    }
    if (normalizedProviderSpecificData && Object.keys(normalizedProviderSpecificData).length > 0) {
        connection.providerSpecificData = normalizedProviderSpecificData;
    }
    // Sanitize the window-thresholds map up front so the in-memory `connection`
    // matches the row we're about to insert. The serialize path runs the same
    // sanitizer on the way to SQLite. Assigning null (when sanitize collapses
    // to no-overrides) keeps the field present on the returned object so the
    // UI can tell "field was read, no overrides" apart from "field absent."
    if ("quotaWindowThresholds" in connection) {
        connection.quotaWindowThresholds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeQuotaWindowThresholds"])(connection.quotaWindowThresholds);
    }
    // Same sanitization for rateLimitOverrides — keep in-memory representation
    // in sync with what gets persisted.
    if ("rateLimitOverrides" in connection) {
        connection.rateLimitOverrides = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeRateLimitOverrides"])(connection.rateLimitOverrides);
    }
    _insertConnectionRow(db, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptConnectionFields"])({
        ...connection
    }));
    const providerId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(data.provider);
    if (providerId) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$deletion$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reorderConnections"])(db, providerId);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections"); // Bust connections read cache
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableRateLimitOverrides"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableQuotaWindowThresholds"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableMaxConcurrent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cleanNulls"])(connection), connection), connection), connection);
}
function _insertConnectionRow(db, conn) {
    db.prepare(`
    INSERT INTO provider_connections (
      id, provider, auth_type, name, email, priority, is_active,
      access_token, refresh_token, expires_at, token_expires_at,
      scope, project_id, test_status, error_code, last_error,
      last_error_at, last_error_type, last_error_source, backoff_level,
      rate_limited_until, health_check_interval, last_health_check_at,
      last_tested, api_key, id_token, provider_specific_data,
      expires_in, display_name, global_priority, default_model,
      token_type, consecutive_use_count, rate_limit_protection, last_used_at, "group", max_concurrent,
      proxy_enabled, per_key_proxy_enabled, quota_visible, quota_window_thresholds_json, rate_limit_overrides_json,
      created_at, updated_at
    ) VALUES (
      @id, @provider, @authType, @name, @email, @priority, @isActive,
      @accessToken, @refreshToken, @expiresAt, @tokenExpiresAt,
      @scope, @projectId, @testStatus, @errorCode, @lastError,
      @lastErrorAt, @lastErrorType, @lastErrorSource, @backoffLevel,
      @rateLimitedUntil, @healthCheckInterval, @lastHealthCheckAt,
      @lastTested, @apiKey, @idToken, @providerSpecificData,
      @expiresIn, @displayName, @globalPriority, @defaultModel,
      @tokenType, @consecutiveUseCount, @rateLimitProtection, @lastUsedAt, @group, @maxConcurrent,
      @proxyEnabled, @perKeyProxyEnabled, @quotaVisible, @quotaWindowThresholdsJson, @rateLimitOverridesJson,
      @createdAt, @updatedAt
    )
  `).run({
        id: conn.id,
        provider: conn.provider,
        authType: conn.authType || null,
        name: conn.name || null,
        email: conn.email || null,
        priority: conn.priority || 0,
        isActive: conn.isActive === false ? 0 : 1,
        accessToken: conn.accessToken || null,
        refreshToken: conn.refreshToken || null,
        expiresAt: conn.expiresAt || null,
        tokenExpiresAt: conn.tokenExpiresAt || null,
        scope: conn.scope || null,
        projectId: conn.projectId || null,
        testStatus: conn.testStatus || null,
        errorCode: conn.errorCode || null,
        lastError: conn.lastError || null,
        lastErrorAt: conn.lastErrorAt || null,
        lastErrorType: conn.lastErrorType || null,
        lastErrorSource: conn.lastErrorSource || null,
        backoffLevel: conn.backoffLevel || 0,
        rateLimitedUntil: conn.rateLimitedUntil || null,
        healthCheckInterval: conn.healthCheckInterval ?? null,
        lastHealthCheckAt: conn.lastHealthCheckAt || null,
        lastTested: conn.lastTested || null,
        apiKey: conn.apiKey || null,
        idToken: conn.idToken || null,
        providerSpecificData: conn.providerSpecificData ? JSON.stringify(conn.providerSpecificData) : null,
        expiresIn: conn.expiresIn || null,
        displayName: conn.displayName || null,
        globalPriority: conn.globalPriority || null,
        defaultModel: conn.defaultModel || null,
        tokenType: conn.tokenType || null,
        consecutiveUseCount: conn.consecutiveUseCount || 0,
        rateLimitProtection: conn.rateLimitProtection === true || conn.rateLimitProtection === 1 ? 1 : 0,
        lastUsedAt: conn.lastUsedAt || null,
        group: conn.group || null,
        maxConcurrent: conn.maxConcurrent ?? null,
        proxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(conn.proxyEnabled, true) ? 1 : 0,
        perKeyProxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(conn.perKeyProxyEnabled, false) ? 1 : 0,
        quotaVisible: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(conn.quotaVisible, true) ? 1 : 0,
        quotaWindowThresholdsJson: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serializeJsonField"])(conn.quotaWindowThresholds),
        rateLimitOverridesJson: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serializeJsonField"])(conn.rateLimitOverrides),
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt
    });
}
// Assembles the `.run()` params for _updateConnectionRow's UPDATE statement.
// Split out purely to keep _updateConnectionRow under the max-lines-per-function
// gate — same field mapping/normalization as before, just relocated.
function _buildUpdateConnectionRowParams(id, data, now) {
    return {
        id,
        provider: data.provider,
        authType: data.authType || null,
        name: data.name || null,
        email: data.email || null,
        priority: data.priority || 0,
        isActive: data.isActive === false ? 0 : 1,
        accessToken: data.accessToken || null,
        refreshToken: data.refreshToken || null,
        expiresAt: data.expiresAt || null,
        tokenExpiresAt: data.tokenExpiresAt || null,
        scope: data.scope || null,
        projectId: data.projectId || null,
        testStatus: data.testStatus || null,
        errorCode: data.errorCode || null,
        lastError: data.lastError || null,
        lastErrorAt: data.lastErrorAt || null,
        lastErrorType: data.lastErrorType || null,
        lastErrorSource: data.lastErrorSource || null,
        backoffLevel: data.backoffLevel || 0,
        rateLimitedUntil: data.rateLimitedUntil || null,
        healthCheckInterval: data.healthCheckInterval ?? null,
        lastHealthCheckAt: data.lastHealthCheckAt || null,
        lastTested: data.lastTested || null,
        apiKey: data.apiKey || null,
        idToken: data.idToken || null,
        providerSpecificData: data.providerSpecificData ? JSON.stringify(data.providerSpecificData) : null,
        expiresIn: data.expiresIn || null,
        displayName: data.displayName || null,
        globalPriority: data.globalPriority || null,
        defaultModel: data.defaultModel || null,
        tokenType: data.tokenType || null,
        consecutiveUseCount: data.consecutiveUseCount || 0,
        rateLimitProtection: data.rateLimitProtection === true || data.rateLimitProtection === 1 ? 1 : 0,
        lastUsedAt: data.lastUsedAt || null,
        group: data.group || null,
        maxConcurrent: data.maxConcurrent ?? null,
        quotaWindowThresholdsJson: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serializeJsonField"])(data.quotaWindowThresholds),
        proxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.proxyEnabled, true) ? 1 : 0,
        perKeyProxyEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.perKeyProxyEnabled, false) ? 1 : 0,
        quotaVisible: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooleanColumn"])(data.quotaVisible, true) ? 1 : 0,
        rateLimitOverridesJson: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serializeJsonField"])(data.rateLimitOverrides),
        lastPingAt: data.lastPingAt || null,
        lastPingedResetKey: data.lastPingedResetKey || null,
        updatedAt: now
    };
}
function _updateConnectionRow(db, id, data) {
    const now = data.updatedAt || new Date().toISOString();
    db.prepare(`
    UPDATE provider_connections SET
      provider = @provider, auth_type = @authType, name = @name, email = @email,
      priority = @priority, is_active = @isActive, access_token = @accessToken,
      refresh_token = @refreshToken, expires_at = @expiresAt, token_expires_at = @tokenExpiresAt,
      scope = @scope, project_id = @projectId, test_status = @testStatus, error_code = @errorCode,
      last_error = @lastError, last_error_at = @lastErrorAt, last_error_type = @lastErrorType,
      last_error_source = @lastErrorSource, backoff_level = @backoffLevel,
      rate_limited_until = @rateLimitedUntil, health_check_interval = @healthCheckInterval,
      last_health_check_at = @lastHealthCheckAt, last_tested = @lastTested, api_key = @apiKey,
      id_token = @idToken, provider_specific_data = @providerSpecificData,
      expires_in = @expiresIn, display_name = @displayName, global_priority = @globalPriority,
      default_model = @defaultModel, token_type = @tokenType,
      consecutive_use_count = @consecutiveUseCount,
      rate_limit_protection = @rateLimitProtection,
      last_used_at = @lastUsedAt,
      "group" = @group,
      max_concurrent = @maxConcurrent,
      quota_window_thresholds_json = @quotaWindowThresholdsJson,
      proxy_enabled = @proxyEnabled,
      per_key_proxy_enabled = @perKeyProxyEnabled,
      quota_visible = @quotaVisible,
      rate_limit_overrides_json = @rateLimitOverridesJson,
      last_ping_at = @lastPingAt,
      last_pinged_reset_key = @lastPingedResetKey,
      updated_at = @updatedAt
    WHERE id = @id
  `).run(_buildUpdateConnectionRowParams(id, data, now));
}
async function updateProviderConnection(id, data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = db.prepare("SELECT * FROM provider_connections WHERE id = ?").get(id);
    if (!existing) return null;
    const merged = {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rowToCamel"])(existing)),
        ...data,
        updatedAt: new Date().toISOString()
    };
    merged.providerSpecificData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeProviderSpecificData"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toStringOrNull"])(merged.provider), merged.providerSpecificData);
    // Mirror the sanitization the create path applies — keep the returned
    // object in lockstep with what we persist.
    if ("quotaWindowThresholds" in merged) {
        const sanitized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeQuotaWindowThresholds"])(merged.quotaWindowThresholds);
        // For updates we always carry the key forward (even as null) so the read
        // path surfaces the cleared state to callers that just patched it.
        merged.quotaWindowThresholds = sanitized;
    }
    if ("rateLimitOverrides" in merged) {
        merged.rateLimitOverrides = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeRateLimitOverrides"])(merged.rateLimitOverrides);
    }
    const existingRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toRecord"])(existing);
    db.transaction(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$usageIdentityReconciliation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reconcileCodexUsageHistory"])(db, {
            connectionId: id,
            existing: existingRecord,
            merged
        });
        _updateConnectionRow(db, id, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encryptConnectionFields"])({
            ...merged
        }));
    })();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections"); // Bust connections read cache
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bumpProxyConfigGeneration"])();
    if (data.priority !== undefined) {
        const existingRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toRecord"])(existing);
        const providerId = typeof existingRecord.provider === "string" ? existingRecord.provider : String(existingRecord.provider || "");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$deletion$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reorderConnections"])(db, providerId);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableRateLimitOverrides"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableQuotaWindowThresholds"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$columns$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["withNullableMaxConcurrent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$caseMapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cleanNulls"])(merged), merged), merged), merged);
}
async function clearConnectionErrorIfUnchanged(id, expected) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare(`
    UPDATE provider_connections SET
      test_status = 'active',
      last_error = NULL,
      last_error_at = NULL,
      last_error_type = NULL,
      last_error_source = NULL,
      error_code = NULL,
      rate_limited_until = NULL,
      backoff_level = 0,
      updated_at = ?
    WHERE id = ?
      AND IFNULL(test_status, '') = ?
      AND IFNULL(last_error_at, '') = ?
      AND IFNULL(rate_limited_until, '') = ?
    `).run(new Date().toISOString(), id, expected.testStatus ?? "", expected.lastErrorAt ?? "", expected.rateLimitedUntil ?? "");
    const applied = (result.changes ?? 0) > 0;
    if (applied) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bumpProxyConfigGeneration"])();
    }
    return applied;
}
async function touchConnectionLastUsed(id, consecutiveUseCount) {
    if (!id) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    db.prepare(`UPDATE provider_connections SET
      last_used_at = @lastUsedAt,
      consecutive_use_count = @consecutiveUseCount,
      updated_at = @updatedAt
    WHERE id = @id`).run({
        lastUsedAt: now,
        consecutiveUseCount,
        updatedAt: now,
        id
    });
}
async function resetConnectionBackoff(id) {
    if (!id) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date().toISOString();
    db.prepare(`UPDATE provider_connections SET
      backoff_level = 0,
      test_status = 'active',
      last_error = NULL,
      last_error_at = NULL,
      last_error_type = NULL,
      last_error_source = NULL,
      error_code = NULL,
      updated_at = @updatedAt
    WHERE id = @id`).run({
        updatedAt: now,
        id
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invalidateDbCache"])("connections");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bumpProxyConfigGeneration"])();
}
async function cleanupProviderConnections() {
    return 0;
}
async function getDistinctGroups() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare('SELECT DISTINCT "group" FROM provider_connections WHERE "group" IS NOT NULL ORDER BY "group"').all();
    return rows.map((r)=>String(r.group ?? "")).filter(Boolean);
}
;
;
;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db/models/shared.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** db/models/shared.ts — foundational JSON-record helpers shared across model sub-modules. */ __turbopack_context__.s([
    "asRecord",
    ()=>asRecord,
    "getKeyValue",
    ()=>getKeyValue,
    "toNonEmptyString",
    ()=>toNonEmptyString
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function getKeyValue(row) {
    const record = asRecord(row);
    return {
        key: typeof record.key === "string" ? record.key : null,
        value: typeof record.value === "string" ? record.value : null
    };
}
}),
"[project]/src/lib/db/models/synced.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeSyncedAvailableModels",
    ()=>normalizeSyncedAvailableModels
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/github/retiredModels.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [app-rsc] (ecmascript)");
;
;
function normalizeSyncedAvailableModel(model) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asRecord"])(model);
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.id) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.name) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.model);
    if (!id) return null;
    const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.name) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.displayName) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.model) || id;
    const supportedEndpoints = Array.isArray(record.supportedEndpoints) ? Array.from(new Set(record.supportedEndpoints.map((endpoint)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(endpoint)).filter((endpoint)=>Boolean(endpoint)))).sort() : undefined;
    return {
        id,
        name,
        source: "imported",
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.apiFormat) ? {
            apiFormat: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.apiFormat)
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.targetFormat) ? {
            targetFormat: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.targetFormat)
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.upstreamProtocol) ? {
            upstreamProtocol: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.upstreamProtocol)
        } : {},
        ...supportedEndpoints && supportedEndpoints.length > 0 ? {
            supportedEndpoints
        } : {},
        ...Array.isArray(record.supportedThinkingEfforts) ? {
            supportedThinkingEfforts: record.supportedThinkingEfforts.filter((effort)=>typeof effort === "string" && effort.length > 0)
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.defaultThinkingEffort) ? {
            defaultThinkingEffort: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.defaultThinkingEffort)
        } : {},
        ...typeof record.inputTokenLimit === "number" ? {
            inputTokenLimit: record.inputTokenLimit
        } : {},
        ...typeof record.outputTokenLimit === "number" ? {
            outputTokenLimit: record.outputTokenLimit
        } : {},
        ...typeof record.description === "string" ? {
            description: record.description
        } : {},
        ...typeof record.supportsThinking === "boolean" ? {
            supportsThinking: record.supportsThinking
        } : {},
        ...record.alwaysThinking === true ? {
            alwaysThinking: true
        } : {},
        ...typeof record.supportsTools === "boolean" ? {
            supportsTools: record.supportsTools
        } : {},
        ...typeof record.supportsVideo === "boolean" ? {
            supportsVideo: record.supportsVideo
        } : {},
        ...record.supportsVision === true ? {
            supportsVision: true
        } : {}
    };
}
function normalizeSyncedAvailableModels(models, providerId) {
    if (!Array.isArray(models)) return [];
    const deduped = new Map();
    for (const model of models){
        const normalized = normalizeSyncedAvailableModel(model);
        if (normalized && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isRetiredGitHubCopilotModelId"])(providerId, normalized.id)) {
            deduped.set(normalized.id, normalized);
        }
    }
    return Array.from(deduped.values());
}
}),
"[project]/src/shared/constants/modelCompat.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Model compatibility protocol keys — shared between client UI and server.
 * Must not import Node or DB code so client components can import safely.
 */ /** Client request shapes from detectFormat — compat options apply when the client uses this protocol */ __turbopack_context__.s([
    "MODEL_COMPAT_PROTOCOL_KEYS",
    ()=>MODEL_COMPAT_PROTOCOL_KEYS
]);
const MODEL_COMPAT_PROTOCOL_KEYS = [
    "openai",
    "openai-responses",
    "claude"
];
}),
"[project]/src/lib/db/models/compat.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compatByProtocolHasEntries",
    ()=>compatByProtocolHasEntries,
    "deepMergeCompatByProtocol",
    ()=>deepMergeCompatByProtocol,
    "getModelCompatOverrides",
    ()=>getModelCompatOverrides,
    "isCompatProtocolKey",
    ()=>isCompatProtocolKey,
    "mergeModelCompatOverride",
    ()=>mergeModelCompatOverride,
    "readCompatList",
    ()=>readCompatList,
    "removeModelCompatOverride",
    ()=>removeModelCompatOverride,
    "sanitizeUpstreamHeadersMap",
    ()=>sanitizeUpstreamHeadersMap,
    "writeCompatList",
    ()=>writeCompatList
]);
/** db/models/compat.ts — model-compat overrides (normalizeToolCallId, per-protocol flags, upstream headers). */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelCompat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelCompat.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [app-rsc] (ecmascript)");
;
;
;
;
;
/** Built-in / alias models: tool-call + developer-role flags without a full custom row */ const MODEL_COMPAT_NAMESPACE = "modelCompatOverrides";
;
function isCompatProtocolKey(p) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelCompat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MODEL_COMPAT_PROTOCOL_KEYS"].includes(p);
}
const UPSTREAM_HEADERS_MAX = 16;
const UPSTREAM_HEADER_NAME_MAX = 128;
const UPSTREAM_HEADER_VALUE_MAX = 4096;
function isValidUpstreamHeaderName(k) {
    if (!k || k.length > UPSTREAM_HEADER_NAME_MAX) return false;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isForbiddenUpstreamHeaderName"])(k)) return false;
    if (/[\r\n\0]/.test(k)) return false;
    if (/\s/.test(k)) return false;
    if (k.includes(":")) return false;
    return true;
}
function sanitizeUpstreamHeadersMap(raw) {
    const out = {};
    if (!raw || typeof raw !== "object") return out;
    for (const [k0, v0] of Object.entries(raw)){
        const k = String(k0).trim();
        if (!k || !isValidUpstreamHeaderName(k)) {
            continue;
        }
        const v = typeof v0 === "string" ? v0.trim().slice(0, UPSTREAM_HEADER_VALUE_MAX) : String(v0 ?? "").trim().slice(0, UPSTREAM_HEADER_VALUE_MAX);
        if (v.includes("\r") || v.includes("\n")) continue;
        out[k] = v;
        if (Object.keys(out).length >= UPSTREAM_HEADERS_MAX) break;
    }
    return out;
}
function deepMergeCompatByProtocol(prev, patch) {
    const out = {
        ...prev || {}
    };
    for (const key of Object.keys(patch)){
        if (!isCompatProtocolKey(key)) continue;
        const deltas = patch[key];
        if (!deltas || typeof deltas !== "object") continue;
        const hasDelta = Object.prototype.hasOwnProperty.call(deltas, "normalizeToolCallId") || Object.prototype.hasOwnProperty.call(deltas, "preserveOpenAIDeveloperRole") || Object.prototype.hasOwnProperty.call(deltas, "upstreamHeaders");
        if (!hasDelta) continue;
        const cur = {
            ...out[key] || {}
        };
        if ("normalizeToolCallId" in deltas) {
            cur.normalizeToolCallId = Boolean(deltas.normalizeToolCallId);
        }
        if ("preserveOpenAIDeveloperRole" in deltas) {
            cur.preserveOpenAIDeveloperRole = Boolean(deltas.preserveOpenAIDeveloperRole);
        }
        if ("upstreamHeaders" in deltas) {
            const uh = deltas.upstreamHeaders;
            if (uh === undefined) {
            /* skip */ } else {
                const s = sanitizeUpstreamHeadersMap(uh);
                if (Object.keys(s).length === 0) delete cur.upstreamHeaders;
                else cur.upstreamHeaders = s;
            }
        }
        if (Object.keys(cur).length === 0) delete out[key];
        else out[key] = cur;
    }
    return out;
}
function readCompatList(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(MODEL_COMPAT_NAMESPACE, providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch  {
        return [];
    }
}
function writeCompatList(providerId, list) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (list.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = ? AND key = ?").run(MODEL_COMPAT_NAMESPACE, providerId);
    } else {
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)").run(MODEL_COMPAT_NAMESPACE, providerId, JSON.stringify(list));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
function getModelCompatOverrides(providerId) {
    return readCompatList(providerId);
}
function compatByProtocolHasEntries(map) {
    if (!map || typeof map !== "object") return false;
    return Object.keys(map).some((k)=>{
        const v = map[k];
        return v && typeof v === "object" && Object.keys(v).length > 0;
    });
}
function mergeModelCompatOverride(providerId, modelId, patch) {
    const list = readCompatList(providerId);
    const idx = list.findIndex((e)=>e.id === modelId);
    const prev = idx >= 0 ? {
        ...list[idx]
    } : {
        id: modelId
    };
    const next = {
        ...prev,
        id: modelId
    };
    if ("normalizeToolCallId" in patch) {
        if (patch.normalizeToolCallId) next.normalizeToolCallId = true;
        else delete next.normalizeToolCallId;
    }
    if ("preserveOpenAIDeveloperRole" in patch) {
        if (patch.preserveOpenAIDeveloperRole === null) {
            delete next.preserveOpenAIDeveloperRole; // unset: revert to default (undefined at read time)
        } else {
            next.preserveOpenAIDeveloperRole = Boolean(patch.preserveOpenAIDeveloperRole);
        }
    }
    if (patch.compatByProtocol && Object.keys(patch.compatByProtocol).length > 0) {
        const merged = deepMergeCompatByProtocol(next.compatByProtocol, patch.compatByProtocol);
        if (compatByProtocolHasEntries(merged)) next.compatByProtocol = merged;
        else delete next.compatByProtocol;
    }
    if ("upstreamHeaders" in patch) {
        if (patch.upstreamHeaders === null) {
            delete next.upstreamHeaders;
        } else if (patch.upstreamHeaders && typeof patch.upstreamHeaders === "object") {
            const s = sanitizeUpstreamHeadersMap(patch.upstreamHeaders);
            if (Object.keys(s).length === 0) delete next.upstreamHeaders;
            else next.upstreamHeaders = s;
        }
    }
    const filtered = list.filter((e)=>e.id !== modelId);
    const hasPreserveFlag = Object.prototype.hasOwnProperty.call(next, "preserveOpenAIDeveloperRole");
    const hasTopUpstream = next.upstreamHeaders && Object.keys(next.upstreamHeaders).length > 0;
    if ("isHidden" in patch) {
        if (patch.isHidden === null) {
            delete next.isHidden;
        } else {
            next.isHidden = Boolean(patch.isHidden);
        }
    }
    if ("isDeleted" in patch) {
        if (patch.isDeleted === null || patch.isDeleted === false) {
            delete next.isDeleted;
        } else {
            next.isDeleted = Boolean(patch.isDeleted);
        }
    }
    const hasHiddenFlag = Object.prototype.hasOwnProperty.call(next, "isHidden");
    const hasDeletedFlag = Object.prototype.hasOwnProperty.call(next, "isDeleted");
    if (next.normalizeToolCallId || hasPreserveFlag || hasHiddenFlag || hasDeletedFlag || compatByProtocolHasEntries(next.compatByProtocol) || hasTopUpstream) {
        filtered.push(next);
    }
    writeCompatList(providerId, filtered);
}
function removeModelCompatOverride(providerId, modelId) {
    const list = readCompatList(providerId);
    const filtered = list.filter((e)=>e.id !== modelId);
    if (filtered.length === list.length) return;
    writeCompatList(providerId, filtered);
}
}),
"[project]/src/lib/db/models/aliases.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteModelAlias",
    ()=>deleteModelAlias,
    "deleteModelAliasesForProvider",
    ()=>deleteModelAliasesForProvider,
    "getModelAliases",
    ()=>getModelAliases,
    "getProviderAliases",
    ()=>getProviderAliases,
    "removeProviderAlias",
    ()=>removeProviderAlias,
    "setModelAlias",
    ()=>setModelAlias,
    "setProviderAlias",
    ()=>setProviderAlias
]);
/** db/models/aliases.ts — model alias CRUD (modelAliases namespace, providerAliases namespace). */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [app-rsc] (ecmascript)");
;
;
;
async function getModelAliases() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'modelAliases'").all();
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        result[key] = JSON.parse(value);
    }
    return result;
}
async function setModelAlias(alias, model) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('modelAliases', ?, ?)").run(alias, JSON.stringify(model));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
async function deleteModelAlias(alias) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'modelAliases' AND key = ?").run(alias);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
function getProviderAliases(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'providerAliases' AND key = ?").get(providerId);
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!parsed) return {};
    try {
        const v = JSON.parse(parsed);
        return typeof v === "object" && v !== null ? v : {};
    } catch  {
        return {};
    }
}
function setProviderAlias(providerId, alias, upstreamModelId) {
    const current = getProviderAliases(providerId);
    current[alias] = upstreamModelId;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('providerAliases', ?, ?)").run(providerId, JSON.stringify(current));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
function removeProviderAlias(providerId, alias) {
    const current = getProviderAliases(providerId);
    if (!(alias in current)) return;
    delete current[alias];
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (Object.keys(current).length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'providerAliases' AND key = ?").run(providerId);
    } else {
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('providerAliases', ?, ?)").run(providerId, JSON.stringify(current));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
async function deleteModelAliasesForProvider(providerId) {
    const prefix = `${providerId}/`;
    const aliases = await getModelAliases();
    const removed = [];
    for (const [alias, value] of Object.entries(aliases)){
        if (typeof value !== "string" || !value.startsWith(prefix)) continue;
        await deleteModelAlias(alias);
        removed.push(alias);
    }
    return removed;
}
}),
"[project]/src/lib/db/models/mitmAlias.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMitmAlias",
    ()=>getMitmAlias,
    "setMitmAliasAll",
    ()=>setMitmAliasAll
]);
/** db/models/mitmAlias.ts — MITM alias CRUD (mitmAlias namespace). */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [app-rsc] (ecmascript)");
;
;
;
async function getMitmAlias(toolName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (toolName) {
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'mitmAlias' AND key = ?").get(toolName);
        const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
        return value ? JSON.parse(value) : {};
    }
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'mitmAlias'").all();
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        result[key] = JSON.parse(value);
    }
    return result;
}
async function setMitmAliasAll(toolName, mappings) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('mitmAlias', ?, ?)").run(toolName, JSON.stringify(mappings || {}));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
}),
"[project]/src/lib/db/models.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "addCustomModel",
    ()=>addCustomModel,
    "cleanupProviderModelsAfterConnectionDelete",
    ()=>cleanupProviderModelsAfterConnectionDelete,
    "deleteImportedCustomModels",
    ()=>deleteImportedCustomModels,
    "deleteSyncedAvailableModelsForConnection",
    ()=>deleteSyncedAvailableModelsForConnection,
    "deleteSyncedAvailableModelsForProvider",
    ()=>deleteSyncedAvailableModelsForProvider,
    "getActiveProvidersWithSyncedModel",
    ()=>getActiveProvidersWithSyncedModel,
    "getAllCustomModels",
    ()=>getAllCustomModels,
    "getAllSyncedAvailableModels",
    ()=>getAllSyncedAvailableModels,
    "getCustomModels",
    ()=>getCustomModels,
    "getHiddenModelsByProvider",
    ()=>getHiddenModelsByProvider,
    "getModelIsDeleted",
    ()=>getModelIsDeleted,
    "getModelIsHidden",
    ()=>getModelIsHidden,
    "getModelNormalizeToolCallId",
    ()=>getModelNormalizeToolCallId,
    "getModelPreserveOpenAIDeveloperRole",
    ()=>getModelPreserveOpenAIDeveloperRole,
    "getModelUpstreamExtraHeaders",
    ()=>getModelUpstreamExtraHeaders,
    "getSyncedAvailableModels",
    ()=>getSyncedAvailableModels,
    "getSyncedAvailableModelsByConnection",
    ()=>getSyncedAvailableModelsByConnection,
    "getSyncedAvailableModelsForConnection",
    ()=>getSyncedAvailableModelsForConnection,
    "pruneStaleSyncedAvailableModelsForProvider",
    ()=>pruneStaleSyncedAvailableModelsForProvider,
    "removeCustomModel",
    ()=>removeCustomModel,
    "removeSyncedAvailableModel",
    ()=>removeSyncedAvailableModel,
    "replaceCustomModels",
    ()=>replaceCustomModels,
    "replaceSyncedAvailableModelsForConnection",
    ()=>replaceSyncedAvailableModelsForConnection,
    "setModelIsHidden",
    ()=>setModelIsHidden,
    "updateCustomModel",
    ()=>updateCustomModel
]);
/**
 * db/models.ts — Custom models, synced available models, and model-flag queries.
 * Compat overrides, model aliases, and MITM aliases have moved to sub-modules under
 * models/; this file re-exports their public APIs for backward compatibility.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/github/retiredModels.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/synced.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models/compat.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$aliases$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/aliases.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$mitmAlias$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/mitmAlias.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
async function getCustomModels(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (providerId) {
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
        const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
        return value ? JSON.parse(value) : [];
    }
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'customModels'").all();
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        result[key] = JSON.parse(value);
    }
    return result;
}
async function getAllCustomModels() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'customModels'").all();
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        result[key] = JSON.parse(value);
    }
    return result;
}
async function addCustomModel(providerId, modelId, modelName, source = "manual", apiFormat = "chat-completions", supportedEndpoints = [
    "chat"
], // #2905: optional per-model wire format override (e.g. "claude" for an
// opencode-go custom model). When unset, routing falls back to the provider
// default format.
targetFormat, // #1294: optional per-model token limits supplied from the "add custom model"
// form. Persisted under the same keys the /v1/models catalog reads back.
tokenLimits = {}, // #1904: optional manual vision-capability override for the "add custom model"
// form — read back by getCustomVisionCapabilityFields() in the /v1/models catalog.
supportsVision) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    const models = value ? JSON.parse(value) : [];
    const exists = models.find((m)=>m.id === modelId);
    if (exists) return exists;
    const model = {
        id: modelId,
        name: modelName || modelId,
        source,
        apiFormat,
        supportedEndpoints,
        ...targetFormat ? {
            targetFormat
        } : {},
        ...tokenLimits.inputTokenLimit != null ? {
            inputTokenLimit: tokenLimits.inputTokenLimit
        } : {},
        ...tokenLimits.outputTokenLimit != null ? {
            outputTokenLimit: tokenLimits.outputTokenLimit
        } : {},
        ...typeof supportsVision === "boolean" ? {
            supportsVision
        } : {}
    };
    models.push(model);
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('customModels', ?, ?)").run(providerId, JSON.stringify(models));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return model;
}
async function replaceCustomModels(providerId, models, { allowEmpty = false } = {}) {
    // Guard: skip destructive clear when the caller hasn't explicitly opted in.
    // This prevents callers from wiping manually added models when the
    // upstream /models endpoint fails, times out, or returns an empty list.
    if (models.length === 0 && !allowEmpty) {
        const existing = await getCustomModels(providerId);
        return Array.isArray(existing) ? existing : [];
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = await getCustomModels(providerId);
    const existingMap = new Map();
    if (Array.isArray(existing)) {
        for (const m of existing){
            if (m && typeof m === "object" && m.id) existingMap.set(m.id, m);
        }
    }
    // Merge: keep existing per-model compat flags if model still exists
    const merged = models.map((m)=>{
        const prev = existingMap.get(m.id);
        return {
            id: m.id,
            name: m.name || m.id,
            source: m.source || "auto-sync",
            apiFormat: m.apiFormat || prev?.apiFormat || "chat-completions",
            supportedEndpoints: m.supportedEndpoints || prev?.supportedEndpoints || [
                "chat"
            ],
            // #2905: preserve a per-model targetFormat override (new value wins, else prev).
            ...m.targetFormat ? {
                targetFormat: m.targetFormat
            } : prev?.targetFormat ? {
                targetFormat: prev.targetFormat
            } : {},
            // Preserve metadata from provider API (or previous sync)
            ...m.inputTokenLimit != null ? {
                inputTokenLimit: m.inputTokenLimit
            } : prev?.inputTokenLimit != null ? {
                inputTokenLimit: prev.inputTokenLimit
            } : {},
            ...m.outputTokenLimit != null ? {
                outputTokenLimit: m.outputTokenLimit
            } : prev?.outputTokenLimit != null ? {
                outputTokenLimit: prev.outputTokenLimit
            } : {},
            ...m.description != null ? {
                description: m.description
            } : prev?.description != null ? {
                description: prev.description
            } : {},
            ...m.supportsThinking != null ? {
                supportsThinking: m.supportsThinking
            } : prev?.supportsThinking != null ? {
                supportsThinking: prev.supportsThinking
            } : {},
            // Preserve existing compat flags
            ...prev && prev.normalizeToolCallId !== undefined ? {
                normalizeToolCallId: prev.normalizeToolCallId
            } : {},
            ...prev && prev.preserveOpenAIDeveloperRole !== undefined ? {
                preserveOpenAIDeveloperRole: prev.preserveOpenAIDeveloperRole
            } : {},
            ...prev && prev.compatByProtocol ? {
                compatByProtocol: prev.compatByProtocol
            } : {},
            ...prev && prev.upstreamHeaders ? {
                upstreamHeaders: prev.upstreamHeaders
            } : {}
        };
    });
    if (merged.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'customModels' AND key = ?").run(providerId);
    } else {
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('customModels', ?, ?)").run(providerId, JSON.stringify(merged));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return merged;
}
async function deleteImportedCustomModels(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    const removed = [];
    const retained = parsed.filter((model)=>{
        const source = typeof model?.source === "string" ? model.source.trim().toLowerCase() : "manual";
        const imported = source === "imported" || source === "api-sync" || source === "auto-sync";
        if (imported) removed.push(model);
        return !imported;
    });
    if (removed.length === 0) return [];
    if (retained.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'customModels' AND key = ?").run(providerId);
    } else {
        db.prepare("UPDATE key_value SET value = ? WHERE namespace = 'customModels' AND key = ?").run(JSON.stringify(retained), providerId);
    }
    const removedIds = removed.flatMap((model)=>typeof model.id === "string" && model.id ? [
            model.id
        ] : []);
    for (const modelId of removedIds)(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["removeModelCompatOverride"])(providerId, modelId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return removedIds;
}
async function removeCustomModel(providerId, modelId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    if (!row) return false;
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return false;
    const models = JSON.parse(value);
    const before = models.length;
    const filtered = models.filter((m)=>m.id !== modelId);
    if (filtered.length === before) return false;
    if (filtered.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'customModels' AND key = ?").run(providerId);
    } else {
        db.prepare("UPDATE key_value SET value = ? WHERE namespace = 'customModels' AND key = ?").run(JSON.stringify(filtered), providerId);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["removeModelCompatOverride"])(providerId, modelId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return true;
}
async function getSyncedAvailableModelsForConnection(providerId, connectionId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const key = `${providerId}:${connectionId}`;
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key = ?").get(key);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return [];
    try {
        const models = JSON.parse(value);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(models, providerId);
    } catch  {
        return [];
    }
}
async function getSyncedAvailableModels(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ?").all(`${providerId}:%`);
    const map = new Map();
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(JSON.parse(value), providerId);
        for (const m of models){
            if (m.id) map.set(m.id, m);
        }
    }
    return Array.from(map.values());
}
async function getSyncedAvailableModelsByConnection(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const prefix = `${providerId}:`;
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ?").all(`${prefix}%`);
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null || !key.startsWith(prefix)) continue;
        try {
            const connectionId = key.slice(prefix.length);
            result[connectionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(JSON.parse(value), providerId);
        } catch  {
        // Ignore malformed legacy entries.
        }
    }
    return result;
}
async function getAllSyncedAvailableModels() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels'").all();
    // Group by providerId (before the colon)
    const byProvider = new Map();
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        const providerId = key.split(":")[0];
        if (!byProvider.has(providerId)) byProvider.set(providerId, new Map());
        const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(JSON.parse(value), providerId);
        const map = byProvider.get(providerId);
        for (const m of models){
            if (m.id) map.set(m.id, m);
        }
    }
    const result = {};
    for (const [providerId, map] of byProvider){
        result[providerId] = Array.from(map.values());
    }
    return result;
}
async function getActiveProvidersWithSyncedModel(modelId) {
    if (!modelId) return [];
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare(`SELECT DISTINCT pc.provider AS provider
       FROM provider_connections pc
       JOIN key_value kv
         ON kv.namespace = 'syncedAvailableModels'
        AND kv.key = pc.provider || ':' || pc.id
       JOIN json_each(CASE WHEN json_valid(kv.value) THEN kv.value ELSE '[]' END) synced_model
       WHERE pc.is_active = 1
         AND COALESCE(
           json_extract(synced_model.value, '$.id'),
           json_extract(synced_model.value, '$.name'),
           json_extract(synced_model.value, '$.model')
         ) = ?`).all(modelId);
    return rows.map((row)=>row.provider).filter((provider)=>typeof provider === "string" && provider.length > 0).filter((provider)=>!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isRetiredGitHubCopilotModelId"])(provider, modelId));
}
async function replaceSyncedAvailableModelsForConnection(providerId, connectionId, models) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const key = `${providerId}:${connectionId}`;
    // #3199: drop ids the operator DELETED (trash) so a re-fetch does not re-import
    // a model that was explicitly removed.
    // #3782: key ONLY on the distinct `isDeleted` marker — NOT on `isHidden`.
    // Eye/visibility-hidden models (`isHidden:true`, no `isDeleted`) must stay in
    // the synced store so they remain listed-but-hidden across re-syncs instead of
    // churning back on through the managed-alias path ("Auto Sync Enabling all
    // Models"). See getModelIsDeleted for the legacy-row caveat.
    const normalizedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(models, providerId).filter((m)=>!getModelIsDeleted(providerId, m.id));
    if (normalizedModels.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND key = ?").run(key);
    } else {
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('syncedAvailableModels', ?, ?)").run(key, JSON.stringify(normalizedModels));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    // Return the full unioned list for the provider
    return getSyncedAvailableModels(providerId);
}
async function removeSyncedAvailableModel(providerId, modelId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const prefix = `${providerId}:`;
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ?").all(`${prefix}%`);
    let removedAny = false;
    const removeModel = db.transaction(()=>{
        for (const row of rows){
            const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
            if (!key || value === null) continue;
            let parsedModels;
            try {
                parsedModels = JSON.parse(value);
            } catch (error) {
                console.warn(`[DB] Skipping malformed syncedAvailableModels entry for key ${key}:`, error);
                continue;
            }
            const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(parsedModels, providerId);
            const filtered = models.filter((m)=>m.id !== modelId);
            if (filtered.length !== models.length) {
                removedAny = true;
                if (filtered.length === 0) {
                    db.prepare("DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND key = ?").run(key);
                } else {
                    db.prepare("UPDATE key_value SET value = ? WHERE namespace = 'syncedAvailableModels' AND key = ?").run(JSON.stringify(filtered), key);
                }
            }
        }
        if (removedAny) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    });
    removeModel();
    return removedAny;
}
async function deleteSyncedAvailableModelsForConnection(providerId, connectionId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const key = `${providerId}:${connectionId}`;
    db.prepare("DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND key = ?").run(key);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return getSyncedAvailableModels(providerId);
}
async function cleanupProviderModelsAfterConnectionDelete(providerId, connectionId) {
    const remainingSyncedModels = await deleteSyncedAvailableModelsForConnection(providerId, connectionId);
    const remainingConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnectionsCount"])({
        provider: providerId
    });
    const removedImportedModelIds = remainingConnections === 0 ? await deleteImportedCustomModels(providerId) : [];
    return {
        remainingConnections,
        removedImportedModelIds,
        remainingSyncedModels
    };
}
async function deleteSyncedAvailableModelsForProvider(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const keyPrefix = `${providerId}:`;
    const result = db.prepare("DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND substr(key, 1, ?) = ?").run(keyPrefix.length, keyPrefix);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return Number(result.changes || 0);
}
async function pruneStaleSyncedAvailableModelsForProvider(providerId, allowedConnectionIds) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (allowedConnectionIds.length === 0) {
        return deleteSyncedAvailableModelsForProvider(providerId);
    }
    const placeholders = allowedConnectionIds.map(()=>"?").join(",");
    const keyPrefix = `${providerId}:`;
    const allowedKeys = allowedConnectionIds.map((id)=>`${providerId}:${id}`);
    const result = db.prepare(`DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ? AND key NOT IN (${placeholders})`).run(`${keyPrefix}%`, ...allowedKeys);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return Number(result.changes || 0);
}
/**
 * Apply a tri-state boolean override from `updates` onto `next`:
 * field absent → keep whatever `next` already carries; explicit `null` → clear
 * the override (callers fall back to their heuristic); anything else → persist
 * the coerced boolean.
 */ function applyTriStateBooleanOverride(next, updates, field) {
    if (!Object.prototype.hasOwnProperty.call(updates, field)) return;
    if (updates[field] === null) {
        delete next[field];
        return;
    }
    next[field] = Boolean(updates[field]);
}
async function updateCustomModel(providerId, modelId, updates = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    if (!row) return null;
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return null;
    const models = JSON.parse(value);
    const index = models.findIndex((m)=>m.id === modelId);
    if (index === -1) return null;
    const current = models[index];
    const currentCompat = current.compatByProtocol;
    let mergedCompat = currentCompat;
    if (updates.compatByProtocol !== undefined && typeof updates.compatByProtocol === "object" && updates.compatByProtocol !== null && !Array.isArray(updates.compatByProtocol)) {
        mergedCompat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["deepMergeCompatByProtocol"])(currentCompat, updates.compatByProtocol);
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compatByProtocolHasEntries"])(mergedCompat)) mergedCompat = undefined;
    }
    const next = {
        ...current,
        ...updates.modelName !== undefined ? {
            name: updates.modelName || current.name
        } : {},
        ...updates.apiFormat !== undefined ? {
            apiFormat: updates.apiFormat
        } : {},
        ...updates.targetFormat !== undefined ? {
            targetFormat: updates.targetFormat
        } : {},
        ...updates.supportedEndpoints !== undefined ? {
            supportedEndpoints: updates.supportedEndpoints
        } : {},
        ...updates.normalizeToolCallId !== undefined ? {
            normalizeToolCallId: Boolean(updates.normalizeToolCallId)
        } : {},
        ...updates.isHidden !== undefined ? {
            isHidden: Boolean(updates.isHidden)
        } : {}
    };
    applyTriStateBooleanOverride(next, updates, "preserveOpenAIDeveloperRole");
    // #1904: manual vision-capability override — `null` clears back to the
    // id-based heuristic in getCustomVisionCapabilityFields().
    applyTriStateBooleanOverride(next, updates, "supportsVision");
    if (updates.compatByProtocol !== undefined) {
        if (mergedCompat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compatByProtocolHasEntries"])(mergedCompat)) {
            next.compatByProtocol = mergedCompat;
        } else {
            delete next.compatByProtocol;
        }
    }
    if (Object.prototype.hasOwnProperty.call(updates, "upstreamHeaders")) {
        const uh = updates.upstreamHeaders;
        if (uh === null || uh === undefined) {
            delete next.upstreamHeaders;
        } else if (typeof uh === "object" && !Array.isArray(uh)) {
            const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(uh);
            if (Object.keys(s).length === 0) delete next.upstreamHeaders;
            else next.upstreamHeaders = s;
        }
    }
    models[index] = next;
    db.prepare("UPDATE key_value SET value = ? WHERE namespace = 'customModels' AND key = ?").run(JSON.stringify(models), providerId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return next;
}
/** Single custom model row from key_value customModels, or null */ function getCustomModelRow(providerId, modelId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return null;
    try {
        const models = JSON.parse(value);
        if (!Array.isArray(models)) return null;
        const isIdMatch = (x, id)=>{
            if (!x || typeof x !== "object" || Array.isArray(x)) return false;
            return x.id === id;
        };
        // #7364: exact match first; case-insensitive fallback so "glm-4.6V" resolves a
        // custom model saved as "glm-4.6v" (see lookupCustomModelMeta in
        // src/sse/services/model.ts for the sibling lookup this mirrors).
        const m = models.find((x)=>isIdMatch(x, modelId)) ?? models.find((x)=>x && typeof x === "object" && !Array.isArray(x) && typeof x.id === "string" && x.id.toLowerCase() === modelId.toLowerCase());
        return m ?? null;
    } catch  {
        return null;
    }
}
function getModelNormalizeToolCallId(providerId, modelId, sourceFormat) {
    const m = getCustomModelRow(providerId, modelId);
    const protocol = sourceFormat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCompatProtocolKey"])(sourceFormat) ? sourceFormat : null;
    if (m) {
        if (protocol) {
            const pc = m.compatByProtocol?.[protocol];
            if (pc && Object.prototype.hasOwnProperty.call(pc, "normalizeToolCallId")) {
                return Boolean(pc.normalizeToolCallId);
            }
        }
        return Boolean(m.normalizeToolCallId);
    }
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    if (protocol && co?.compatByProtocol?.[protocol]) {
        const pc = co.compatByProtocol[protocol];
        if (Object.prototype.hasOwnProperty.call(pc, "normalizeToolCallId")) {
            return Boolean(pc.normalizeToolCallId);
        }
    }
    return Boolean(co?.normalizeToolCallId);
}
function getModelPreserveOpenAIDeveloperRole(providerId, modelId, sourceFormat) {
    const m = getCustomModelRow(providerId, modelId);
    const protocol = sourceFormat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCompatProtocolKey"])(sourceFormat) ? sourceFormat : null;
    if (m) {
        if (protocol) {
            const pc = m.compatByProtocol?.[protocol];
            if (pc && Object.prototype.hasOwnProperty.call(pc, "preserveOpenAIDeveloperRole")) {
                return Boolean(pc.preserveOpenAIDeveloperRole);
            }
        }
        if (Object.prototype.hasOwnProperty.call(m, "preserveOpenAIDeveloperRole")) {
            return Boolean(m.preserveOpenAIDeveloperRole);
        }
        return undefined;
    }
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    if (protocol && co?.compatByProtocol?.[protocol]) {
        const pc = co.compatByProtocol[protocol];
        if (Object.prototype.hasOwnProperty.call(pc, "preserveOpenAIDeveloperRole")) {
            return Boolean(pc.preserveOpenAIDeveloperRole);
        }
    }
    if (co && Object.prototype.hasOwnProperty.call(co, "preserveOpenAIDeveloperRole")) {
        return Boolean(co.preserveOpenAIDeveloperRole);
    }
    return undefined;
}
function getModelIsHidden(providerId, modelId) {
    const m = getCustomModelRow(providerId, modelId);
    if (m && Object.prototype.hasOwnProperty.call(m, "isHidden")) {
        return Boolean(m.isHidden);
    }
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    return Boolean(co?.isHidden);
}
function getHiddenModelsByProvider() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const visibilityByProvider = new Map();
    const rows = db.prepare("SELECT namespace, key, value FROM key_value WHERE namespace IN ('modelCompatOverrides', 'customModels')").all();
    for (const namespace of [
        "modelCompatOverrides",
        "customModels"
    ]){
        for (const row of rows){
            if (row.namespace !== namespace || !row.value) continue;
            try {
                const parsed = JSON.parse(row.value);
                if (!Array.isArray(parsed)) continue;
                for (const entry of parsed){
                    if (!entry || typeof entry !== "object") continue;
                    const modelId = entry.id;
                    if (typeof modelId !== "string" || modelId.length === 0) continue;
                    if (!Object.prototype.hasOwnProperty.call(entry, "isHidden")) continue;
                    let visibility = visibilityByProvider.get(row.key);
                    if (!visibility) {
                        visibility = new Map();
                        visibilityByProvider.set(row.key, visibility);
                    }
                    visibility.set(modelId, Boolean(entry.isHidden));
                }
            } catch  {
            // Skip malformed entries
            }
        }
    }
    return new Map([
        ...visibilityByProvider
    ].flatMap(([providerId, visibility])=>{
        const hiddenModels = [
            ...visibility
        ].flatMap(([modelId, isHidden])=>isHidden ? [
                modelId
            ] : []);
        return hiddenModels.length > 0 ? [
            [
                providerId,
                new Set(hiddenModels)
            ]
        ] : [];
    }));
}
function getModelIsDeleted(providerId, modelId) {
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    return Boolean(co?.isDeleted);
}
function setModelIsHidden(providerId, modelId, hidden) {
    const customRow = getCustomModelRow(providerId, modelId);
    if (customRow) {
        if (hidden) {
            updateCustomModel(providerId, modelId, {
                isHidden: true
            });
        } else if (Object.prototype.hasOwnProperty.call(customRow, "isHidden")) {
            updateCustomModel(providerId, modelId, {
                isHidden: false
            });
        }
        return;
    }
    const list = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId);
    const idx = list.findIndex((e)=>e.id === modelId);
    if (hidden) {
        const prev = idx >= 0 ? list[idx] : {
            id: modelId
        };
        const next = {
            ...prev,
            id: modelId,
            isHidden: true
        };
        if (idx >= 0) list[idx] = next;
        else list.push(next);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeCompatList"])(providerId, list);
        return;
    }
    if (idx < 0) return;
    if (Object.keys(list[idx]).length <= 1) {
        // Only `id` left; drop the entry entirely.
        const filtered = list.filter((_, i)=>i !== idx);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeCompatList"])(providerId, filtered);
        return;
    }
    delete list[idx].isHidden;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeCompatList"])(providerId, list);
}
function readUpstreamFromJsonRecord(row, key) {
    if (!row) return undefined;
    const raw = row[key];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
    const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(raw);
    return Object.keys(s).length > 0 ? s : undefined;
}
function getModelUpstreamExtraHeaders(providerId, modelId, sourceFormat) {
    const protocol = sourceFormat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCompatProtocolKey"])(sourceFormat) ? sourceFormat : null;
    const m = getCustomModelRow(providerId, modelId);
    const base = {};
    if (m) {
        const fromModel = readUpstreamFromJsonRecord(m, "upstreamHeaders");
        if (fromModel) Object.assign(base, fromModel);
        if (protocol) {
            const pc = m.compatByProtocol?.[protocol];
            const fromProto = pc?.upstreamHeaders;
            if (fromProto && typeof fromProto === "object") {
                Object.assign(base, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(fromProto));
            }
        }
        return base;
    }
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    if (co?.upstreamHeaders) {
        Object.assign(base, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(co.upstreamHeaders));
    }
    if (protocol && co?.compatByProtocol?.[protocol]?.upstreamHeaders) {
        Object.assign(base, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(co.compatByProtocol[protocol].upstreamHeaders));
    }
    return base;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db/models/activeSyncedCatalog.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-rsc] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function resolveStoredProviderId(aliasOrId) {
    const normalized = aliasOrId.trim();
    if (!normalized) return "";
    if (Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"], normalized)) {
        return normalized;
    }
    for (const [providerId, alias] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"])){
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
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRawProviderConnections"])({
                provider: storedProviderId,
                isActive: true
            }, undefined, undefined, [
                "id",
                "provider"
            ]),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedAvailableModelsByConnection"])(storedProviderId)
        ]);
        const activeConnectionIds = connections.map(readConnectionRef).filter((connection)=>connection !== null).map((connection)=>connection.id);
        const models = collectModelsForConnections(modelsByConnection, activeConnectionIds);
        return {
            authoritative: models.length > 0 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["providerUsesAuthoritativeLiveCatalog"])(providerId),
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
        const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRawProviderConnections"])({
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
            const modelsByConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedAvailableModelsByConnection"])(providerId);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__0crlfzg._.js.map