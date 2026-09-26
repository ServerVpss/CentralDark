module.exports = [
"[project]/src/lib/dataPaths.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_NAME",
    ()=>APP_NAME,
    "getDefaultDataDir",
    ()=>getDefaultDataDir,
    "getLegacyDotDataDir",
    ()=>getLegacyDotDataDir,
    "isSamePath",
    ()=>isSamePath,
    "resolveDataDir",
    ()=>resolveDataDir,
    "resolveWritableDataDir",
    ()=>resolveWritableDataDir
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
;
;
;
const APP_NAME = "omniroute";
function fallbackHomeDir() {
    const envHome = process.env.HOME || process.env.USERPROFILE;
    if (typeof envHome === "string" && envHome.trim().length > 0) {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(envHome);
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].tmpdir();
}
function safeHomeDir() {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir();
    } catch  {
        return fallbackHomeDir();
    }
}
function normalizeConfiguredPath(dir) {
    if (typeof dir !== "string") return null;
    const trimmed = dir.trim();
    if (!trimmed) return null;
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(trimmed);
}
function getLegacyDotDataDir() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(safeHomeDir(), `.${APP_NAME}`);
}
function getDefaultDataDir() {
    const homeDir = safeHomeDir();
    const legacyDir = getLegacyDotDataDir();
    // Preserve legacy path if it exists to avoid data loss on updates (e.g., Windows migration)
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(legacyDir)) {
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(legacyDir).isDirectory()) {
                return legacyDir;
            }
        } catch  {
        // Ignore stat errors
        }
    }
    if ("TURBOPACK compile-time truthy", 1) {
        const appData = process.env.APPDATA || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(homeDir, "AppData", "Roaming");
        return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(appData, APP_NAME);
    }
    //TURBOPACK unreachable
    ;
    // Support XDG on Linux/macOS when explicitly configured.
    const xdgConfigHome = undefined;
}
function resolveDataDir({ isCloud = false } = {}) {
    if (isCloud) return "/tmp";
    const configured = normalizeConfiguredPath(process.env.DATA_DIR);
    if (configured) return configured;
    return getDefaultDataDir();
}
function resolveWritableDataDir({ isCloud = false } = {}) {
    const resolved = resolveDataDir({
        isCloud
    });
    // Cloud/serverless never owns a writable home dir; leave its sentinel alone.
    if (isCloud) return resolved;
    // No explicit override → already the default user dir; nothing to fall back to.
    const configured = normalizeConfiguredPath(process.env.DATA_DIR);
    if (!configured) return resolved;
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(resolved, {
            recursive: true
        });
        return resolved;
    } catch (err) {
        const code = err?.code;
        if (code === "EACCES" || code === "EPERM") {
            const fallback = getDefaultDataDir();
            console.warn(`[DATA_DIR] '${resolved}' is not writable (${code}) → falling back to '${fallback}'`);
            return fallback;
        }
        throw err;
    }
}
function isSamePath(a, b) {
    if (!a || !b) return false;
    const normalizedA = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(a);
    const normalizedB = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(b);
    if ("TURBOPACK compile-time truthy", 1) {
        return normalizedA.toLowerCase() === normalizedB.toLowerCase();
    }
    //TURBOPACK unreachable
    ;
}
}),
"[project]/src/lib/combos/steps.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @file steps.ts
 * @description Combo step normalization helpers for model, combo-ref, provider-wildcard, and routing metadata.
 *
 * @changes
 * - [2026-07-25] [Composer] - Preserve provider-wildcard steps during combo normalization
 */ __turbopack_context__.s([
    "COMBO_SCHEMA_VERSION",
    ()=>COMBO_SCHEMA_VERSION,
    "getComboModelProvider",
    ()=>getComboModelProvider,
    "getComboModelString",
    ()=>getComboModelString,
    "getComboStepTarget",
    ()=>getComboStepTarget,
    "getComboStepWeight",
    ()=>getComboStepWeight,
    "normalizeComboModels",
    ()=>normalizeComboModels,
    "normalizeComboRecord",
    ()=>normalizeComboRecord,
    "normalizeComboStep",
    ()=>normalizeComboStep
]);
const COMBO_SCHEMA_VERSION = 2;
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function toTrimmedString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function toWeight(value) {
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : 0;
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(100, parsed));
}
function collectComboNames(allCombos) {
    const names = new Set();
    if (!allCombos) return names;
    if (!Array.isArray(allCombos) && typeof allCombos[Symbol.iterator] === "function" && !(isRecord(allCombos) && Array.isArray(allCombos.combos))) {
        for (const value of allCombos){
            const name = toTrimmedString(value);
            if (name) names.add(name);
        }
        return names;
    }
    const combosFromRecord = isRecord(allCombos) && Array.isArray(allCombos.combos) ? allCombos.combos : [];
    const combos = Array.isArray(allCombos) ? allCombos : combosFromRecord;
    for (const combo of combos){
        const name = typeof combo === "string" ? toTrimmedString(combo) : toTrimmedString(combo?.name);
        if (name) names.add(name);
    }
    return names;
}
function parseProviderId(model) {
    const trimmed = model.trim();
    const slashIndex = trimmed.indexOf("/");
    if (slashIndex <= 0) return null;
    const providerId = trimmed.slice(0, slashIndex).trim();
    return providerId.length > 0 ? providerId : null;
}
function parseProviderWildcardPattern(target) {
    const trimmed = target.trim();
    const slashIndex = trimmed.indexOf("/");
    if (slashIndex <= 0) return null;
    const providerId = trimmed.slice(0, slashIndex).trim();
    const modelPattern = trimmed.slice(slashIndex + 1).trim();
    if (!providerId || !modelPattern.includes("*")) return null;
    return {
        providerId,
        modelPattern
    };
}
function toFullModelString(model, providerId) {
    const trimmedModel = model.trim();
    if (trimmedModel.includes("/")) return trimmedModel;
    const normalizedProviderId = toTrimmedString(providerId);
    return normalizedProviderId ? `${normalizedProviderId}/${trimmedModel}` : trimmedModel;
}
function slugify(value) {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return slug.length > 0 ? slug : "step";
}
function buildStepId(kind, comboName, index, seed) {
    const kindSlug = kind === "combo-ref" ? "ref" : kind === "provider-wildcard" ? "wildcard" : "model";
    const parts = [
        slugify(comboName || "combo"),
        kindSlug,
        String(index + 1),
        slugify(seed)
    ];
    return parts.join("-").slice(0, 200);
}
function shouldTreatAsComboRef(target, providerId, options) {
    if (providerId) return false;
    const comboNames = collectComboNames(options.allCombos);
    return comboNames.has(target) || target === toTrimmedString(options.comboName);
}
function getComboStepWeight(value) {
    if (typeof value === "string") return 0;
    if (!isRecord(value)) return 0;
    return toWeight(value.weight);
}
function getComboModelString(value) {
    if (typeof value === "string") return toTrimmedString(value);
    if (!isRecord(value) || value.kind === "combo-ref") return null;
    const rawModel = toTrimmedString(value.model);
    if (!rawModel) return null;
    const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(rawModel);
    return toFullModelString(rawModel, providerId);
}
function getComboModelProvider(value) {
    if (typeof value === "string") return parseProviderId(value);
    if (!isRecord(value) || value.kind === "combo-ref") return null;
    return toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(toTrimmedString(value.model) || "");
}
function getComboStepTarget(value, options = {}) {
    if (typeof value === "string") {
        const target = toTrimmedString(value);
        if (!target) return null;
        return shouldTreatAsComboRef(target, null, options) ? target : target;
    }
    if (!isRecord(value)) return null;
    if (value.kind === "combo-ref") return toTrimmedString(value.comboName);
    if (value.kind === "provider-wildcard") {
        const providerId = toTrimmedString(value.providerId);
        const modelPattern = toTrimmedString(value.modelPattern) || "*";
        return providerId ? `${providerId}/${modelPattern}` : null;
    }
    const rawModel = toTrimmedString(value.model);
    if (!rawModel) return null;
    const isExplicitModel = value.kind === "model";
    const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(rawModel);
    if (!isExplicitModel && shouldTreatAsComboRef(rawModel, providerId, options)) {
        return rawModel;
    }
    return toFullModelString(rawModel, providerId);
}
function normalizeComboStep(value, options = {}) {
    const comboName = toTrimmedString(options.comboName);
    const index = typeof options.index === "number" ? options.index : 0;
    if (typeof value === "string") {
        const target = toTrimmedString(value);
        if (!target) return null;
        if (shouldTreatAsComboRef(target, null, options)) {
            return {
                id: buildStepId("combo-ref", comboName, index, target),
                kind: "combo-ref",
                comboName: target,
                weight: 0
            };
        }
        const wildcardPattern = parseProviderWildcardPattern(target);
        if (wildcardPattern) {
            return {
                id: buildStepId("provider-wildcard", comboName, index, `${wildcardPattern.providerId}/${wildcardPattern.modelPattern}`),
                kind: "provider-wildcard",
                providerId: wildcardPattern.providerId,
                modelPattern: wildcardPattern.modelPattern,
                weight: 0
            };
        }
        const providerId = parseProviderId(target);
        return {
            id: buildStepId("model", comboName, index, target),
            kind: "model",
            model: target,
            ...providerId ? {
                providerId
            } : {},
            weight: 0
        };
    }
    if (!isRecord(value)) return null;
    const explicitId = toTrimmedString(value.id);
    const weight = toWeight(value.weight);
    const label = toTrimmedString(value.label);
    const prompt = toTrimmedString(value.prompt);
    if (value.kind === "combo-ref") {
        const comboRefName = toTrimmedString(value.comboName);
        if (!comboRefName) return null;
        return {
            id: explicitId || buildStepId("combo-ref", comboName, index, comboRefName),
            kind: "combo-ref",
            comboName: comboRefName,
            weight,
            ...label ? {
                label
            } : {}
        };
    }
    if (value.kind === "provider-wildcard") {
        const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(toTrimmedString(value.model) || "");
        if (!providerId) return null;
        const modelPattern = toTrimmedString(value.modelPattern) || "*";
        const connectionId = value.connectionId === null ? null : toTrimmedString(value.connectionId) || undefined;
        const allowedConnectionIds = Array.isArray(value.allowedConnectionIds) ? value.allowedConnectionIds.map((connId)=>toTrimmedString(connId)).filter((connId)=>!!connId) : undefined;
        return {
            id: explicitId || buildStepId("provider-wildcard", comboName, index, connectionId ? `${providerId}/${modelPattern}:${connectionId}` : `${providerId}/${modelPattern}`),
            kind: "provider-wildcard",
            providerId,
            modelPattern,
            ...connectionId !== undefined ? {
                connectionId
            } : {},
            weight,
            ...label ? {
                label
            } : {},
            ...allowedConnectionIds && allowedConnectionIds.length > 0 ? {
                allowedConnectionIds
            } : {}
        };
    }
    const rawModel = toTrimmedString(value.model);
    if (!rawModel) return null;
    const isExplicitModel = value.kind === "model";
    const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(rawModel);
    const wildcardPattern = parseProviderWildcardPattern(rawModel);
    if (wildcardPattern) {
        const connectionId = value.connectionId === null ? null : toTrimmedString(value.connectionId) || undefined;
        const allowedConnectionIds = Array.isArray(value.allowedConnectionIds) ? value.allowedConnectionIds.map((connId)=>toTrimmedString(connId)).filter((connId)=>!!connId) : undefined;
        return {
            id: explicitId || buildStepId("provider-wildcard", comboName, index, connectionId ? `${wildcardPattern.providerId}/${wildcardPattern.modelPattern}:${connectionId}` : `${wildcardPattern.providerId}/${wildcardPattern.modelPattern}`),
            kind: "provider-wildcard",
            providerId: wildcardPattern.providerId,
            modelPattern: wildcardPattern.modelPattern,
            ...connectionId !== undefined ? {
                connectionId
            } : {},
            weight,
            ...label ? {
                label
            } : {},
            ...allowedConnectionIds && allowedConnectionIds.length > 0 ? {
                allowedConnectionIds
            } : {}
        };
    }
    if (!isExplicitModel && shouldTreatAsComboRef(rawModel, providerId, options)) {
        return {
            id: explicitId || buildStepId("combo-ref", comboName, index, rawModel),
            kind: "combo-ref",
            comboName: rawModel,
            weight,
            ...label ? {
                label
            } : {}
        };
    }
    const model = toFullModelString(rawModel, providerId);
    const connectionId = value.connectionId === null ? null : toTrimmedString(value.connectionId) || undefined;
    const tags = Array.isArray(value.tags) ? value.tags.map((tag)=>toTrimmedString(tag)).filter((tag)=>!!tag) : undefined;
    const allowedConnectionIds = Array.isArray(value.allowedConnectionIds) ? value.allowedConnectionIds.map((connId)=>toTrimmedString(connId)).filter((connId)=>!!connId) : undefined;
    return {
        id: explicitId || buildStepId("model", comboName, index, connectionId ? `${model}:${connectionId}` : model),
        kind: "model",
        model,
        ...providerId ? {
            providerId
        } : {},
        ...connectionId !== undefined ? {
            connectionId
        } : {},
        weight,
        ...label ? {
            label
        } : {},
        ...prompt ? {
            prompt
        } : {},
        ...tags && tags.length > 0 ? {
            tags
        } : {},
        ...allowedConnectionIds && allowedConnectionIds.length > 0 ? {
            allowedConnectionIds
        } : {}
    };
}
function normalizeComboModels(models, options = {}) {
    const list = Array.isArray(models) ? models : [];
    return list.map((value, index)=>normalizeComboStep(value, {
            ...options,
            index
        })).filter((value)=>value !== null);
}
function normalizeComboRecord(combo, options = {}) {
    const comboName = toTrimmedString(combo.name);
    return {
        ...combo,
        version: COMBO_SCHEMA_VERSION,
        models: normalizeComboModels(combo.models, {
            comboName,
            allCombos: options.allCombos
        })
    };
}
}),
"[project]/src/lib/combos/invariants.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ComboInvariantError",
    ()=>ComboInvariantError,
    "validateComboInvariant",
    ()=>validateComboInvariant
]);
class ComboInvariantError extends Error {
}
const FAMILY_PATTERNS = [
    [
        "gpt",
        /^gpt(?:-|$)/i
    ],
    [
        "claude",
        /^claude(?:-|$)/i
    ],
    [
        "gemini",
        /^gemini(?:-|$)/i
    ],
    [
        "glm",
        /^glm(?:-|$)/i
    ],
    [
        "kimi",
        /^kimi(?:-|$)/i
    ],
    [
        "llama",
        /^llama(?:-|$)/i
    ],
    [
        "minimax",
        /^minimax(?:-|$)/i
    ],
    [
        "mistral",
        /^(?:mistral|mixtral)(?:-|$)/i
    ]
];
function strings(value) {
    return Array.isArray(value) ? value.filter((item)=>typeof item === "string") : [];
}
function modelFamily(model) {
    const bare = model.slice(model.lastIndexOf("/") + 1);
    return FAMILY_PATTERNS.find(([, pattern])=>pattern.test(bare))?.[0] ?? null;
}
function validateComboInvariant(combo) {
    const invariant = combo.invariant && typeof combo.invariant === "object" && !Array.isArray(combo.invariant) ? combo.invariant : {};
    const providers = new Set([
        ...strings(combo.allowedProviders),
        ...strings(invariant.allowedProviders)
    ]);
    const families = new Set([
        ...strings(combo.allowedModelFamilies),
        ...strings(invariant.allowedModelFamilies)
    ]);
    if (providers.size === 0 && families.size === 0) return;
    const targets = Array.isArray(combo.models) ? combo.models : [];
    targets.forEach((value, index)=>{
        if (!value || typeof value !== "object" || Array.isArray(value)) return;
        const target = value;
        if (target.kind === "combo-ref") return;
        const model = typeof target.model === "string" ? target.model : "";
        const provider = typeof target.providerId === "string" ? target.providerId : typeof target.provider === "string" ? target.provider : model.includes("/") ? model.slice(0, model.indexOf("/")) : "";
        const family = modelFamily(model);
        if (providers.size > 0 && !providers.has(provider) || families.size > 0 && (!family || !families.has(family))) {
            const targetName = model.includes("/") ? model : `${provider}/${model}`;
            throw new ComboInvariantError(`Combo "${String(combo.name ?? "unnamed")}" target ${index + 1} (${targetName}) violates its invariant`);
        }
    });
}
}),
"[project]/src/lib/combos/autoPromote.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * combos/autoPromote.ts — pure reorder helper for the "auto-promote successful
 * combo model" feature.
 *
 * When the `comboAutoPromoteEnabled` setting is on and a combo model responds
 * successfully, the winning model is moved to position #1 of the persisted
 * combo so future requests try it first.
 *
 * OmniRoute stores `combo.models` as an array of `ComboStep` objects
 * (`{ kind: "model", model, ... }`), unlike the upstream project which stores
 * plain model strings. This helper accepts both shapes and reorders in place
 * without mutating the input, returning `null` when no change is required
 * (winner already first, winner absent, or empty list).
 */ __turbopack_context__.s([
    "comboStepModelId",
    ()=>comboStepModelId,
    "promoteModelToFront",
    ()=>promoteModelToFront,
    "promoteSuccessfulComboModel",
    ()=>promoteSuccessfulComboModel
]);
function comboStepModelId(step) {
    if (typeof step === "string") return step.trim().length > 0 ? step : null;
    if (step && typeof step === "object") {
        const model = step.model;
        if (typeof model === "string" && model.trim().length > 0) return model;
    }
    return null;
}
function promoteModelToFront(models, winningModel) {
    if (!Array.isArray(models) || models.length === 0) return null;
    if (typeof winningModel !== "string" || winningModel.length === 0) return null;
    const matchIndex = models.findIndex((step)=>comboStepModelId(step) === winningModel);
    // Winner not in the combo (e.g. global fallback) or already first → no-op.
    if (matchIndex <= 0) return null;
    const winner = models[matchIndex];
    const rest = models.filter((_, index)=>index !== matchIndex);
    return [
        winner,
        ...rest
    ];
}
async function promoteSuccessfulComboModel(combo, winningModel, settings, deps) {
    if (!combo || !settings || !settings.comboAutoPromoteEnabled) return false;
    const comboId = typeof combo.id === "string" ? combo.id : null;
    if (!comboId) return false;
    const reordered = promoteModelToFront(Array.isArray(combo.models) ? combo.models : null, winningModel);
    if (!reordered) return false;
    const label = typeof combo.name === "string" ? combo.name : comboId;
    try {
        await deps.updateCombo(comboId, {
            models: reordered
        });
        deps.info?.("COMBO", `Model "${winningModel}" succeeded — promoted to #1 in combo "${label}"`);
        return true;
    } catch (dbErr) {
        deps.warn?.("COMBO", `Failed to promote model "${winningModel}" in combo "${label}": ${dbErr?.message || "unknown error"}`);
        return false;
    }
}
}),
"[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAppLogFilePath",
    ()=>getAppLogFilePath,
    "getAppLogFormat",
    ()=>getAppLogFormat,
    "getAppLogLevel",
    ()=>getAppLogLevel,
    "getAppLogMaxFileSize",
    ()=>getAppLogMaxFileSize,
    "getAppLogMaxFiles",
    ()=>getAppLogMaxFiles,
    "getAppLogRetentionDays",
    ()=>getAppLogRetentionDays,
    "getAppLogRetentionDaysOverride",
    ()=>getAppLogRetentionDaysOverride,
    "getAppLogToFile",
    ()=>getAppLogToFile,
    "getCallLogMaxEntries",
    ()=>getCallLogMaxEntries,
    "getCallLogPipelineCaptureStreamChunks",
    ()=>getCallLogPipelineCaptureStreamChunks,
    "getCallLogPipelineMaxSizeBytes",
    ()=>getCallLogPipelineMaxSizeBytes,
    "getCallLogRetentionDays",
    ()=>getCallLogRetentionDays,
    "getCallLogRetentionDaysOverride",
    ()=>getCallLogRetentionDaysOverride,
    "getCallLogsTableMaxRows",
    ()=>getCallLogsTableMaxRows,
    "getChatLogArrayTailItems",
    ()=>getChatLogArrayTailItems,
    "getChatLogMaxDepth",
    ()=>getChatLogMaxDepth,
    "getChatLogMaxObjectKeys",
    ()=>getChatLogMaxObjectKeys,
    "getChatLogTextLimit",
    ()=>getChatLogTextLimit,
    "getProxyLogsTableMaxRows",
    ()=>getProxyLogsTableMaxRows,
    "isChatDebugFileEnabled",
    ()=>isChatDebugFileEnabled,
    "parseFileSize",
    ()=>parseFileSize
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [instrumentation] (ecmascript)");
;
;
const DEFAULT_APP_LOG_RETENTION_DAYS = 7;
const DEFAULT_CALL_LOG_RETENTION_DAYS = 7;
const DEFAULT_APP_LOG_MAX_SIZE = 50 * 1024 * 1024;
const DEFAULT_APP_LOG_MAX_FILES = 20;
const DEFAULT_CALL_LOG_MAX_ENTRIES = 10000;
const DEFAULT_CALL_LOGS_TABLE_MAX_ROWS = 100000;
const DEFAULT_CALL_LOG_PIPELINE_MAX_SIZE_KB = 512;
const DEFAULT_PROXY_LOGS_TABLE_MAX_ROWS = 100000;
/**
 * Default app log path, anchored to DATA_DIR (never `process.cwd()`).
 *
 * The globally-installed CLI runs from an arbitrary working directory, so anchoring
 * the default to cwd made file logging silently no-op under an unrelated directory
 * (#6197). Computed lazily so a per-process/per-test `DATA_DIR` override is honoured
 * (the env var is read at call time, not at module load). Uses the pure
 * `resolveDataDir()` resolver — no directory creation side effects in a path getter.
 */ function getDefaultAppLogPath() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])(), "logs", "application", "app.log");
}
function parsePositiveInt(value, fallback) {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function parseNonNegativeInt(value, fallback) {
    if (value === undefined || value === "") return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}
function parseBoolean(value, fallback) {
    if (!value) return fallback;
    const normalized = value.trim().toLowerCase();
    if ([
        "1",
        "true",
        "yes",
        "on"
    ].includes(normalized)) return true;
    if ([
        "0",
        "false",
        "no",
        "off"
    ].includes(normalized)) return false;
    return fallback;
}
function parseFileSize(raw) {
    if (!raw) return DEFAULT_APP_LOG_MAX_SIZE;
    const match = raw.match(/^(\d+)\s*(k|m|g|kb|mb|gb)?$/i);
    if (!match) return DEFAULT_APP_LOG_MAX_SIZE;
    const num = parseInt(match[1], 10);
    const unit = (match[2] || "").toLowerCase();
    switch(unit){
        case "k":
        case "kb":
            return num * 1024;
        case "m":
        case "mb":
            return num * 1024 * 1024;
        case "g":
        case "gb":
            return num * 1024 * 1024 * 1024;
        default:
            return num;
    }
}
function getAppLogToFile() {
    return process.env.APP_LOG_TO_FILE !== "false";
}
function getAppLogFilePath() {
    return process.env.APP_LOG_FILE_PATH || getDefaultAppLogPath();
}
function getAppLogMaxFileSize() {
    return parseFileSize(process.env.APP_LOG_MAX_FILE_SIZE);
}
function getAppLogRetentionDays() {
    return parsePositiveInt(process.env.APP_LOG_RETENTION_DAYS, DEFAULT_APP_LOG_RETENTION_DAYS);
}
function getCallLogRetentionDays() {
    return parsePositiveInt(process.env.CALL_LOG_RETENTION_DAYS, DEFAULT_CALL_LOG_RETENTION_DAYS);
}
/**
 * Returns the explicit operator-set retention override (a positive integer), or `null`
 * when the env var is unset/empty/invalid. Callers give an explicit env var precedence
 * over the dashboard's database retention, while falling back to the dashboard (not the
 * hardcoded 7-day default) when the operator did not set the env var. (#4354)
 */ function parsePositiveIntOrNull(value) {
    if (value === undefined || value === "") return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
function getAppLogRetentionDaysOverride() {
    return parsePositiveIntOrNull(process.env.APP_LOG_RETENTION_DAYS);
}
function getCallLogRetentionDaysOverride() {
    return parsePositiveIntOrNull(process.env.CALL_LOG_RETENTION_DAYS);
}
function getAppLogMaxFiles() {
    return parsePositiveInt(process.env.APP_LOG_MAX_FILES, DEFAULT_APP_LOG_MAX_FILES);
}
function getCallLogMaxEntries() {
    return parsePositiveInt(process.env.CALL_LOG_MAX_ENTRIES, DEFAULT_CALL_LOG_MAX_ENTRIES);
}
function getCallLogsTableMaxRows() {
    return parsePositiveInt(process.env.CALL_LOGS_TABLE_MAX_ROWS, DEFAULT_CALL_LOGS_TABLE_MAX_ROWS);
}
function getCallLogPipelineCaptureStreamChunks() {
    return parseBoolean(process.env.CALL_LOG_PIPELINE_CAPTURE_STREAM_CHUNKS, true);
}
function getCallLogPipelineMaxSizeBytes() {
    return parsePositiveInt(process.env.CALL_LOG_PIPELINE_MAX_SIZE_KB, DEFAULT_CALL_LOG_PIPELINE_MAX_SIZE_KB) * 1024;
}
function getProxyLogsTableMaxRows() {
    return parsePositiveInt(process.env.PROXY_LOGS_TABLE_MAX_ROWS, DEFAULT_PROXY_LOGS_TABLE_MAX_ROWS);
}
function getAppLogLevel(defaultLevel) {
    return process.env.APP_LOG_LEVEL || defaultLevel;
}
function getAppLogFormat(defaultFormat) {
    return process.env.APP_LOG_FORMAT || defaultFormat;
}
function getChatLogTextLimit() {
    return parsePositiveInt(process.env.CHAT_LOG_TEXT_LIMIT, 64 * 1024);
}
function getChatLogArrayTailItems() {
    return parsePositiveInt(process.env.CHAT_LOG_ARRAY_TAIL_ITEMS, 24);
}
function getChatLogMaxDepth() {
    return parsePositiveInt(process.env.CHAT_LOG_MAX_DEPTH, 6);
}
function getChatLogMaxObjectKeys() {
    return parseNonNegativeInt(process.env.CHAT_LOG_MAX_OBJECT_KEYS, 80);
}
function isChatDebugFileEnabled() {
    if (parseBoolean(process.env.CHAT_DEBUG_FILE, false)) return true;
    return process.env.APP_LOG_LEVEL?.trim().toLowerCase() === "debug";
}
}),
"[project]/src/lib/piiSanitizer.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sanitizePII",
    ()=>sanitizePII,
    "sanitizePIIChunk",
    ()=>sanitizePIIChunk,
    "sanitizePIIResponse",
    ()=>sanitizePIIResponse
]);
/**
 * Output PII Sanitization — L-3
 *
 * Scans LLM response text for PII patterns and optionally redacts them.
 * This is the OUTPUT-side counterpart to the input sanitizer.
 * Configurable via environment variables:
 *
 *   PII_RESPONSE_SANITIZATION=true|false  (default: false)
 *   PII_RESPONSE_SANITIZATION_MODE=redact|warn|block  (default: redact)
 *
 * @module lib/piiSanitizer
 */ // ── Configuration ──
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [instrumentation] (ecmascript)");
;
const isEnabled = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("PII_RESPONSE_SANITIZATION");
const VALID_MODES = [
    "redact",
    "warn",
    "block",
    "off"
];
const getMode = ()=>{
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveFeatureFlag"])("PII_RESPONSE_SANITIZATION_MODE");
    if (value === "" || value === undefined || value === null) return "redact";
    if (String(value) === "false") return "off";
    if (VALID_MODES.includes(value)) return value;
    console.error(`[PII] Invalid PII_RESPONSE_SANITIZATION_MODE: "${value}", defaulting to "redact"`);
    return "redact";
};
const PII_PATTERNS = [
    {
        name: "email",
        regex: /(?<=^|[^A-Za-z0-9])[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?=$|[^A-Za-z0-9])/g,
        replacement: "[EMAIL_REDACTED]",
        severity: "medium"
    },
    {
        name: "ssn",
        regex: /(?<=^|[^A-Za-z0-9])\d{3}-\d{2}-\d{4}(?=$|[^A-Za-z0-9])/g,
        replacement: "[SSN_REDACTED]",
        severity: "high"
    },
    {
        name: "credit_card",
        regex: /(?<=^|[^A-Za-z0-9])(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{6}[-\s]?\d{4,5})(?=$|[^A-Za-z0-9])/g,
        replacement: "[CC_REDACTED]",
        severity: "high"
    },
    {
        name: "phone_us",
        regex: /(?<=^|[^A-Za-z0-9])(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?=$|[^A-Za-z0-9])/g,
        replacement: "[PHONE_REDACTED]",
        severity: "medium"
    },
    {
        name: "phone_br",
        regex: /(?<=^|[^A-Za-z0-9])(?:\+?55[-.\s]?)?\(?\d{2}\)?[-.\s]?(?:9\d{4}|[2-5]\d{3})[-.\s]?\d{4}(?=$|[^A-Za-z0-9])/g,
        replacement: "[PHONE_REDACTED]",
        severity: "medium"
    },
    {
        name: "cpf",
        regex: /(?<=^|[^A-Za-z0-9])\d{3}\.?\d{3}\.?\d{3}-?\d{2}(?=$|[^A-Za-z0-9])/g,
        replacement: "[CPF_REDACTED]",
        severity: "high"
    },
    {
        name: "cnpj",
        regex: /(?<=^|[^A-Za-z0-9])\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}(?=$|[^A-Za-z0-9])/g,
        replacement: "[CNPJ_REDACTED]",
        severity: "high"
    },
    {
        name: "ip_address",
        regex: /(?<=^|[^A-Za-z0-9])(?:\d{1,3}\.){3}\d{1,3}(?=$|[^A-Za-z0-9])/g,
        replacement: "[IP_REDACTED]",
        severity: "low"
    },
    {
        name: "ipv6_address",
        regex: /(?<=^|[^A-Za-z0-9:])(?:[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4}){7}|(?:[0-9a-fA-F]{1,4}:){1,7}:|::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}|::|[0-9a-fA-F]{1,4}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){2}:(?:[0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){3}:(?:[0-9a-fA-F]{1,4}:){0,3}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){4}:(?:[0-9a-fA-F]{1,4}:){0,2}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){5}:(?:[0-9a-fA-F]{1,4}:){0,1}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){6}:[0-9a-fA-F]{1,4})(?=$|[^A-Za-z0-9])(?!:[0-9a-fA-F:])/g,
        replacement: "[IP_REDACTED]",
        severity: "low"
    },
    {
        name: "aws_key",
        regex: /(?<=^|[^A-Za-z0-9])AKIA[0-9A-Z]{16}(?=$|[^A-Za-z0-9])/g,
        replacement: "[AWS_KEY_REDACTED]",
        severity: "high"
    },
    {
        name: "api_key_generic",
        regex: /(?<=^|[^A-Za-z0-9])(?:sk|pk|api|key|token)[_-][a-zA-Z0-9]{20,}(?=$|[^A-Za-z0-9])/gi,
        replacement: "[API_KEY_REDACTED]",
        severity: "high"
    }
];
function sanitizePII(text, isStreaming = false) {
    if (!isEnabled() || !text || typeof text !== "string") {
        return {
            text,
            detections: [],
            redacted: false
        };
    }
    const mode = getMode();
    const detections = [];
    // Build a map of clean character index to original character index.
    // Ignore zero-width and invisible formatting characters to prevent obfuscation bypasses.
    const IGNORED_CHARS = new Set([
        "\u200B",
        "\u200C",
        "\u200D",
        "\u200E",
        "\u200F",
        "\uFEFF",
        "\u2060",
        "\u00AD",
        // Bidirectional formatting controls
        "\u202A",
        "\u202B",
        "\u202C",
        "\u202D",
        "\u202E",
        "\u2066",
        "\u2067",
        "\u2068",
        "\u2069"
    ]);
    const cleanToOrig = [];
    let cleanText = "";
    for(let i = 0; i < text.length; i++){
        const char = text[i];
        if (IGNORED_CHARS.has(char)) {
        // Obfuscator / joiner, ignore in clean text
        } else {
            cleanToOrig.push(i);
            cleanText += char;
        }
    }
    cleanToOrig.push(text.length);
    const ranges = [];
    let endMatchIndex = undefined;
    for (const pattern of PII_PATTERNS){
        pattern.regex.lastIndex = 0;
        let match;
        while((match = pattern.regex.exec(cleanText)) !== null){
            const cleanStart = match.index;
            const cleanEnd = cleanStart + match[0].length;
            const start = cleanToOrig[cleanStart];
            const end = cleanToOrig[cleanEnd];
            // Perform checksum validation to minimize false positives
            if (pattern.name === "credit_card" && !isValidLuhn(match[0].replace(/[-\s]/g, ""))) {
                continue;
            }
            if (pattern.name === "cpf" && !isValidCPF(match[0])) {
                continue;
            }
            if (pattern.name === "cnpj" && !isValidCNPJ(match[0])) {
                continue;
            }
            if (isStreaming && cleanEnd === cleanText.length) {
                // Prevent premature redaction of variable-length PII touching the end of the streaming buffer.
                // Clamp maximum match length to 100 to prevent infinite buffer accumulation (OOM).
                const matchLength = cleanEnd - cleanStart;
                if (matchLength < 100) {
                    if (endMatchIndex === undefined || start < endMatchIndex) {
                        endMatchIndex = start;
                    }
                }
            } else {
                ranges.push({
                    start,
                    end,
                    replacement: pattern.replacement,
                    pattern: pattern.name
                });
            }
            if (!pattern.regex.global) {
                break;
            }
        }
    }
    const patternCounts = new Map();
    for (const range of ranges){
        patternCounts.set(range.pattern, (patternCounts.get(range.pattern) || 0) + 1);
    }
    for (const [name, count] of patternCounts.entries()){
        const patternDef = PII_PATTERNS.find((p)=>p.name === name);
        detections.push({
            pattern: name,
            count,
            severity: patternDef?.severity || "medium"
        });
    }
    if (detections.length > 0) {
        if (mode === "warn") {
            console.warn(`[PII] Detected PII in response: ${detections.map((d)=>`${d.pattern}(${d.count})`).join(", ")}`);
        } else if (mode === "block") {
            // Log the matched pattern types server-side, but never put them in the
            // thrown message — it can surface to the client via controller.error
            // (Hard Rule #12: no internal detail in response/stream errors).
            console.warn(`[PII] Blocked response due to PII detection: ${detections.map((d)=>d.pattern).join(", ")}`);
            throw new Error("[PII] Blocked response due to PII detection");
        }
    }
    let sanitized = text;
    if (mode === "redact" && ranges.length > 0) {
        // Sort ranges from right to left to avoid shifting offsets
        ranges.sort((a, b)=>b.start - a.start);
        // Merge overlapping or adjacent ranges
        const mergedRanges = [];
        for (const r of ranges){
            if (mergedRanges.length === 0) {
                mergedRanges.push(r);
            } else {
                const last = mergedRanges[mergedRanges.length - 1];
                if (r.end >= last.start) {
                    last.start = Math.min(r.start, last.start);
                    last.end = Math.max(r.end, last.end);
                } else {
                    mergedRanges.push(r);
                }
            }
        }
        for (const range of mergedRanges){
            sanitized = sanitized.slice(0, range.start) + range.replacement + sanitized.slice(range.end);
        }
    }
    return {
        text: mode === "redact" ? sanitized : text,
        detections,
        redacted: mode === "redact" && detections.length > 0,
        endMatchIndex
    };
}
function sanitizePIIChunk(chunk, isStopSignal = false) {
    if (!isEnabled()) return chunk;
    // If it's a stop signal, we are flushing the final chunk, so we shouldn't treat it as a partial streaming buffer (force redaction)
    const { text } = sanitizePII(chunk, !isStopSignal);
    return text;
}
function sanitizePIIResponse(response) {
    if (!isEnabled() || !response) return response;
    try {
        const visited = new WeakSet();
        // Deep sanitize the entire response object recursively
        const deepSanitize = (obj, depth = 0)=>{
            if (depth > 100) {
                throw new Error("Maximum sanitization depth exceeded");
            }
            if (!obj) return obj;
            if (typeof obj === "string") {
                return sanitizePII(obj).text;
            }
            if (typeof obj === "object") {
                if (visited.has(obj)) {
                    return "[CIRCULAR_REFERENCE_REDACTED]";
                }
                visited.add(obj);
                if (Array.isArray(obj)) {
                    for(let i = 0; i < obj.length; i++){
                        obj[i] = deepSanitize(obj[i], depth + 1);
                    }
                } else {
                    for (const key of Object.keys(obj)){
                        // Skip known non-PII system metadata keys to optimize performance
                        if ([
                            "id",
                            "model",
                            "object",
                            "created",
                            "finish_reason",
                            "finishReason",
                            "role",
                            "type",
                            "index",
                            "stop_reason"
                        ].includes(key)) {
                            continue;
                        }
                        obj[key] = deepSanitize(obj[key], depth + 1);
                    }
                }
            }
            return obj;
        };
        return deepSanitize(response);
    } catch (err) {
        if (err?.message?.startsWith("[PII] Blocked response")) {
            throw err;
        }
        // Fail secure — try raw string sanitization instead of failing open
        try {
            const serialized = JSON.stringify(response);
            const { text: sanitized } = sanitizePII(serialized);
            return JSON.parse(sanitized);
        } catch (fallbackErr) {
            // Suppress err.message — never surface upstream error detail to the client
            // (Hard Rule #12). The underlying error is available in server logs.
            console.warn("[PII] Sanitization fallback failed:", err?.message);
            throw new Error("[PII] Blocked response due to sanitization failure");
        }
    }
}
// ── Checksum Validation Helpers ──
function isValidLuhn(digits) {
    let sum = 0;
    let shouldDouble = false;
    for(let i = digits.length - 1; i >= 0; i--){
        let digit = parseInt(digits[i], 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}
function isValidCPF(cpf) {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;
    let sum = 0;
    for(let i = 0; i < 9; i++){
        sum += parseInt(digits[i], 10) * (10 - i);
    }
    let rev = 11 - sum % 11;
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(digits[9], 10)) return false;
    sum = 0;
    for(let i = 0; i < 10; i++){
        sum += parseInt(digits[i], 10) * (11 - i);
    }
    rev = 11 - sum % 11;
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(digits[10], 10)) return false;
    return true;
}
function isValidCNPJ(cnpj) {
    const digits = cnpj.replace(/\D/g, "");
    if (digits.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(digits)) return false;
    let size = 12;
    let numbers = digits.substring(0, size);
    const tempDigits = digits.substring(size);
    let sum = 0;
    let pos = size - 7;
    for(let i = size; i >= 1; i--){
        sum += parseInt(numbers.charAt(size - i), 10) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(tempDigits.charAt(0), 10)) return false;
    size = 13;
    numbers = digits.substring(0, size);
    sum = 0;
    pos = size - 7;
    for(let i = size; i >= 1; i--){
        sum += parseInt(numbers.charAt(size - i), 10) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(tempDigits.charAt(1), 10)) return false;
    return true;
}
}),
"[project]/src/lib/logPayloads.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cloneLogPayload",
    ()=>cloneLogPayload,
    "normalizePayloadForLog",
    ()=>normalizePayloadForLog,
    "parseStoredPayload",
    ()=>parseStoredPayload,
    "protectPayloadForLog",
    ()=>protectPayloadForLog,
    "redactPayload",
    ()=>redactPayload,
    "sanitizePayloadPII",
    ()=>sanitizePayloadPII,
    "serializePayloadForStorage",
    ()=>serializePayloadForStorage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/piiSanitizer.ts [instrumentation] (ecmascript)");
;
const SENSITIVE_KEYS = new Set([
    "api_key",
    "apiKey",
    "api-key",
    "authorization",
    "Authorization",
    "x-api-key",
    "X-Api-Key",
    "x-goog-api-key",
    "access_token",
    "accessToken",
    "refresh_token",
    "refreshToken",
    "password",
    "secret",
    "token"
]);
/**
 * True for any binary/opaque byte view (Uint8Array, Buffer, DataView, other
 * typed arrays). `Array.isArray()` returns false for these, so callers that
 * branch on it before recursing would otherwise fall into the generic-object
 * branch and enumerate one JS property key per decoded byte (#7297).
 */ function isOpaqueBinary(value) {
    return ArrayBuffer.isView(value);
}
function describeOpaqueBinary(value) {
    const byteLength = value.byteLength;
    return `[binary ${byteLength} bytes]`;
}
function cloneLogPayload(value) {
    if (value === null || value === undefined) return value;
    if (typeof globalThis.structuredClone === "function") {
        return globalThis.structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}
function normalizePayloadForLog(payload) {
    if (typeof payload !== "string") return payload;
    const trimmed = payload.trim();
    if (!trimmed) return "";
    try {
        return JSON.parse(trimmed);
    } catch  {
        return {
            _rawText: payload
        };
    }
}
function redactPayload(payload) {
    if (!payload || typeof payload !== "object") return payload;
    if (isOpaqueBinary(payload)) return describeOpaqueBinary(payload);
    if (Array.isArray(payload)) return payload.map(redactPayload);
    const redacted = {};
    for (const [key, value] of Object.entries(payload)){
        if (SENSITIVE_KEYS.has(key)) {
            redacted[key] = "[REDACTED]";
        } else if (typeof value === "string" && value.startsWith("Bearer ")) {
            redacted[key] = "Bearer [REDACTED]";
        } else if (typeof value === "object" && value !== null) {
            redacted[key] = redactPayload(value);
        } else {
            redacted[key] = value;
        }
    }
    return redacted;
}
function sanitizePayloadPII(payload) {
    if (typeof payload === "string") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(payload).text;
    }
    if (!payload || typeof payload !== "object") {
        return payload;
    }
    if (isOpaqueBinary(payload)) {
        return describeOpaqueBinary(payload);
    }
    if (Array.isArray(payload)) {
        return payload.map(sanitizePayloadPII);
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(payload)){
        sanitized[key] = sanitizePayloadPII(value);
    }
    return sanitized;
}
function protectPayloadForLog(payload) {
    if (payload === null || payload === undefined) return null;
    const normalized = normalizePayloadForLog(payload);
    const piiSanitized = sanitizePayloadPII(normalized);
    return redactPayload(piiSanitized);
}
function serializePayloadForStorage(payload, maxLength = 65536) {
    if (payload === null || payload === undefined) return null;
    const exact = JSON.stringify(payload);
    if (exact.length <= maxLength) {
        return exact;
    }
    return JSON.stringify({
        _truncated: true,
        _originalSize: exact.length,
        _preview: exact.slice(0, maxLength)
    });
}
function parseStoredPayload(value) {
    if (typeof value !== "string" || value.trim().length === 0) return null;
    try {
        return JSON.parse(value);
    } catch  {
        return {
            _rawText: value
        };
    }
}
}),
"[project]/src/lib/oauth/gitlab.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GITLAB_DUO_DEFAULT_BASE_URL",
    ()=>GITLAB_DUO_DEFAULT_BASE_URL,
    "buildGitLabDirectGatewayUrl",
    ()=>buildGitLabDirectGatewayUrl,
    "buildGitLabOAuthEndpoints",
    ()=>buildGitLabOAuthEndpoints,
    "getCachedGitLabDirectAccess",
    ()=>getCachedGitLabDirectAccess,
    "isGitLabDirectAccessDisabled",
    ()=>isGitLabDirectAccessDisabled,
    "normalizeGitLabBaseUrl",
    ()=>normalizeGitLabBaseUrl,
    "parseGitLabDirectAccessDetails",
    ()=>parseGitLabDirectAccessDetails,
    "resolveGitLabOAuthBaseUrl",
    ()=>resolveGitLabOAuthBaseUrl
]);
const GITLAB_DUO_DEFAULT_BASE_URL = process.env.GITLAB_DUO_BASE_URL || process.env.GITLAB_BASE_URL || "https://gitlab.com";
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeGitLabBaseUrl(baseUrl) {
    const raw = typeof baseUrl === "string" ? baseUrl.trim() : "";
    return (raw || GITLAB_DUO_DEFAULT_BASE_URL).replace(/\/$/, "");
}
function resolveGitLabOAuthBaseUrl(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeGitLabBaseUrl(data.baseUrl);
}
function buildGitLabOAuthEndpoints(baseUrl) {
    const root = normalizeGitLabBaseUrl(baseUrl);
    return {
        root,
        authorizeUrl: `${root}/oauth/authorize`,
        tokenUrl: `${root}/oauth/token`,
        userUrl: `${root}/api/v4/user`,
        directAccessUrl: `${root}/api/v4/code_suggestions/direct_access`,
        publicCompletionsUrl: `${root}/api/v4/code_suggestions/completions`
    };
}
function buildGitLabDirectGatewayUrl(baseUrl) {
    const normalized = normalizeGitLabBaseUrl(baseUrl);
    if (normalized.endsWith("/ai/v2/completions")) {
        return normalized;
    }
    if (normalized.endsWith("/ai/v2")) {
        return `${normalized}/completions`;
    }
    return `${normalized}/ai/v2/completions`;
}
function parseGitLabDirectAccessDetails(payload) {
    const data = asRecord(payload);
    const token = typeof data.token === "string" ? data.token.trim() : "";
    const baseUrl = typeof data.base_url === "string" ? data.base_url.trim() : "";
    if (!token || !baseUrl) {
        return null;
    }
    const rawHeaders = asRecord(data.headers);
    const headers = Object.fromEntries(Object.entries(rawHeaders).filter((entry)=>typeof entry[0] === "string" && typeof entry[1] === "string"));
    const expiresAt = typeof data.expires_at === "number" && Number.isFinite(data.expires_at) ? new Date(data.expires_at * 1000).toISOString() : null;
    return {
        token,
        baseUrl: normalizeGitLabBaseUrl(baseUrl),
        expiresAt,
        headers
    };
}
function getCachedGitLabDirectAccess(providerSpecificData, minValidityMs = 60_000) {
    const data = asRecord(providerSpecificData);
    const cache = data.gitlabDirectAccess ?? data.directAccessCache;
    const parsed = parseGitLabDirectAccessDetails(cache);
    if (!parsed) {
        return null;
    }
    if (!parsed.expiresAt) {
        return parsed;
    }
    const expiresAtMs = new Date(parsed.expiresAt).getTime();
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now() + minValidityMs) {
        return null;
    }
    return parsed;
}
function isGitLabDirectAccessDisabled(status, bodyText) {
    return status === 403 && bodyText.toLowerCase().includes("direct connections are disabled");
}
}),
"[project]/src/lib/oauth/constants/oauth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AGY_CONFIG",
    ()=>AGY_CONFIG,
    "ANTIGRAVITY_CONFIG",
    ()=>ANTIGRAVITY_CONFIG,
    "AWS_REGION_PATTERN",
    ()=>AWS_REGION_PATTERN,
    "CLAUDE_CONFIG",
    ()=>CLAUDE_CONFIG,
    "CLINE_CONFIG",
    ()=>CLINE_CONFIG,
    "CODEBUDDY_CN_CONFIG",
    ()=>CODEBUDDY_CN_CONFIG,
    "CODEX_CONFIG",
    ()=>CODEX_CONFIG,
    "CURSOR_CONFIG",
    ()=>CURSOR_CONFIG,
    "GHE_COPILOT_CONFIG",
    ()=>GHE_COPILOT_CONFIG,
    "GITHUB_CONFIG",
    ()=>GITHUB_CONFIG,
    "GITLAB_DUO_CONFIG",
    ()=>GITLAB_DUO_CONFIG,
    "GROK_BUILD_OAUTH_CONFIG",
    ()=>GROK_BUILD_OAUTH_CONFIG,
    "GROK_CLI_CONFIG",
    ()=>GROK_CLI_CONFIG,
    "KILOCODE_CONFIG",
    ()=>KILOCODE_CONFIG,
    "KIMI_CODING_CONFIG",
    ()=>KIMI_CODING_CONFIG,
    "KIRO_CONFIG",
    ()=>KIRO_CONFIG,
    "OAUTH_TIMEOUT",
    ()=>OAUTH_TIMEOUT,
    "OPENAI_CONFIG",
    ()=>OPENAI_CONFIG,
    "PROVIDERS",
    ()=>PROVIDERS,
    "QODER_CONFIG",
    ()=>QODER_CONFIG,
    "RAYCAST_CONFIG",
    ()=>RAYCAST_CONFIG,
    "TRAE_CONFIG",
    ()=>TRAE_CONFIG,
    "WINDSURF_CONFIG",
    ()=>WINDSURF_CONFIG,
    "XAI_OAUTH_CONFIG",
    ()=>XAI_OAUTH_CONFIG,
    "ZED_CONFIG",
    ()=>ZED_CONFIG,
    "ZED_HOSTED_CONFIG",
    ()=>ZED_HOSTED_CONFIG,
    "assertValidAwsRegion",
    ()=>assertValidAwsRegion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityUpstream.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/grokBuild.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/gitlab.ts [instrumentation] (ecmascript)");
;
;
;
;
;
const CLAUDE_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("claude_id", "CLAUDE_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://claude.ai/oauth/authorize",
    tokenUrl: "https://api.anthropic.com/v1/oauth/token",
    redirectUri: process.env.CLAUDE_CODE_REDIRECT_URI || "https://platform.claude.com/oauth/code/callback",
    scopes: [
        "org:create_api_key",
        "user:profile",
        "user:inference",
        "user:sessions:claude_code",
        "user:mcp_servers"
    ],
    codeChallengeMethod: "S256"
};
const CODEX_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("codex_id", "CODEX_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://auth.openai.com/oauth/authorize",
    tokenUrl: "https://auth.openai.com/oauth/token",
    scope: "openid profile email offline_access",
    codeChallengeMethod: "S256",
    // Additional OpenAI-specific params
    extraParams: {
        id_token_add_organizations: "true",
        codex_cli_simplified_flow: "true",
        originator: "codex_cli_rs",
        // prompt=login forces Auth0/OpenAI to RE-AUTHENTICATE the user instead of
        // silently reusing an existing browser session. This is THE KEY parameter
        // that enables multi-account OAuth on the same device + same client_id:
        // without it, OAuth flow #2 carries over session state from OAuth flow #1
        // and Auth0 invalidates the previous account's refresh_token family as a
        // "session takeover". With prompt=login, each OAuth flow creates an
        // isolated session that does not trample siblings.
        // Ported from ndycode/codex-multi-auth (auth.ts: forceNewLogin option) —
        // the only known tool that sustains multiple Codex OAuth accounts.
        prompt: "login"
    }
};
// Qoder OAuth Configuration (Authorization Code)
const QODER_OAUTH_AUTHORIZE_URL = process.env.QODER_OAUTH_AUTHORIZE_URL || "";
const QODER_OAUTH_TOKEN_URL = process.env.QODER_OAUTH_TOKEN_URL || "";
const QODER_OAUTH_USERINFO_URL = process.env.QODER_OAUTH_USERINFO_URL || "";
const QODER_OAUTH_CLIENT_ID = process.env.QODER_OAUTH_CLIENT_ID || "";
const QODER_OAUTH_CLIENT_SECRET = process.env.QODER_OAUTH_CLIENT_SECRET || "";
const QODER_OAUTH_ENABLED = !!QODER_OAUTH_AUTHORIZE_URL && !!QODER_OAUTH_TOKEN_URL && !!QODER_OAUTH_USERINFO_URL && !!QODER_OAUTH_CLIENT_ID && !!QODER_OAUTH_CLIENT_SECRET;
const QODER_CONFIG = {
    enabled: QODER_OAUTH_ENABLED,
    clientId: QODER_OAUTH_CLIENT_ID,
    clientSecret: QODER_OAUTH_CLIENT_SECRET,
    authorizeUrl: QODER_OAUTH_AUTHORIZE_URL,
    tokenUrl: QODER_OAUTH_TOKEN_URL,
    userInfoUrl: QODER_OAUTH_USERINFO_URL,
    extraParams: {
        loginMethod: "phone",
        type: "phone"
    }
};
const CODEBUDDY_CN_CONFIG = {
    baseUrl: "https://copilot.tencent.com",
    stateUrl: "https://copilot.tencent.com/v2/plugin/auth/state",
    tokenUrl: "https://copilot.tencent.com/v2/plugin/auth/token",
    refreshUrl: "https://copilot.tencent.com/v2/plugin/auth/token/refresh",
    userAgent: "CLI/2.63.2 CodeBuddy/2.63.2",
    platform: "CLI",
    pollInterval: 5000
};
const GROK_CLI_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    issuer: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GROK_BUILD_OAUTH_ISSUER"],
    deviceCodeUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GROK_BUILD_DEVICE_CODE_URL"],
    tokenUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GROK_BUILD_TOKEN_URL"],
    scope: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GROK_BUILD_OAUTH_SCOPES"].join(" ")
};
const GROK_BUILD_OAUTH_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://auth.x.ai/oauth2/authorize",
    tokenUrl: "https://auth.x.ai/oauth2/token",
    scope: "openid profile email offline_access grok-cli:access",
    codeChallengeMethod: "S256",
    loopbackPort: 56122,
    callbackPath: "/callback",
    callbackHost: "127.0.0.1"
};
const XAI_OAUTH_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://auth.x.ai/oauth2/authorize",
    tokenUrl: "https://auth.x.ai/oauth2/token",
    scope: "openid profile email offline_access grok-cli:access api:access",
    codeChallengeMethod: "S256",
    loopbackPort: 56121,
    callbackPath: "/callback",
    callbackHost: "127.0.0.1"
};
const KIMI_CODING_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("kimi_id", "KIMI_CODING_OAUTH_CLIENT_ID"),
    deviceCodeUrl: "https://auth.kimi.com/api/oauth/device_authorization",
    tokenUrl: "https://auth.kimi.com/api/oauth/token"
};
const KILOCODE_CONFIG = {
    apiBaseUrl: "https://api.kilo.ai",
    initiateUrl: "https://api.kilo.ai/api/device-auth/codes",
    pollUrlBase: "https://api.kilo.ai/api/device-auth/codes"
};
const CLINE_CONFIG = {
    appBaseUrl: "https://app.cline.bot",
    apiBaseUrl: "https://api.cline.bot",
    authorizeUrl: "https://api.cline.bot/api/v1/auth/authorize",
    tokenExchangeUrl: "https://api.cline.bot/api/v1/auth/token",
    refreshUrl: "https://api.cline.bot/api/v1/auth/refresh"
};
const ANTIGRAVITY_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_id", "ANTIGRAVITY_OAUTH_CLIENT_ID"),
    clientSecret: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_alt", "ANTIGRAVITY_OAUTH_CLIENT_SECRET"),
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v1/userinfo",
    // No "openid" scope — the working 9router flow requests only the Cloud Code /
    // userinfo scopes below. "openid" (with PKCE) routed Google into the hanging
    // `firstparty/nativeapp` consent. Match 9router exactly (antigravity login fix).
    scopes: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/cclog",
        "https://www.googleapis.com/auth/experimentsandconfigs"
    ],
    // Antigravity specific
    apiEndpoint: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTIGRAVITY_RUNTIME_BASE_URLS"][0],
    apiVersion: "v1internal",
    loadCodeAssistEndpoints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"].map((baseUrl)=>`${baseUrl}/v1internal:loadCodeAssist`),
    onboardUserEndpoints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"].map((baseUrl)=>`${baseUrl}/v1internal:onboardUser`),
    fetchAvailableModelsEndpoints: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityFetchAvailableModelsUrls"])(),
    loadCodeAssistEndpoint: `${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"][0]}/v1internal:loadCodeAssist`,
    onboardUserEndpoint: `${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"][0]}/v1internal:onboardUser`,
    fetchAvailableModelsEndpoint: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityFetchAvailableModelsUrls"])()[0]
};
const AGY_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_id", "ANTIGRAVITY_OAUTH_CLIENT_ID"),
    clientSecret: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_alt", "ANTIGRAVITY_OAUTH_CLIENT_SECRET"),
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v1/userinfo",
    scopes: [
        ...ANTIGRAVITY_CONFIG.scopes
    ],
    // Reuse the antigravity Code Assist endpoints (identical backend).
    apiEndpoint: ANTIGRAVITY_CONFIG.apiEndpoint,
    apiVersion: ANTIGRAVITY_CONFIG.apiVersion,
    loadCodeAssistEndpoints: [
        ...ANTIGRAVITY_CONFIG.loadCodeAssistEndpoints
    ],
    onboardUserEndpoints: [
        ...ANTIGRAVITY_CONFIG.onboardUserEndpoints
    ],
    fetchAvailableModelsEndpoints: [
        ...ANTIGRAVITY_CONFIG.fetchAvailableModelsEndpoints
    ],
    loadCodeAssistEndpoint: ANTIGRAVITY_CONFIG.loadCodeAssistEndpoint,
    onboardUserEndpoint: ANTIGRAVITY_CONFIG.onboardUserEndpoint,
    fetchAvailableModelsEndpoint: ANTIGRAVITY_CONFIG.fetchAvailableModelsEndpoint
};
const OPENAI_CONFIG = {
    clientId: CODEX_CONFIG.clientId,
    authorizeUrl: "https://auth.openai.com/oauth/authorize",
    tokenUrl: "https://auth.openai.com/oauth/token",
    scope: "openid profile email offline_access",
    codeChallengeMethod: "S256",
    extraParams: {
        id_token_add_organizations: "true",
        originator: "openai_native",
        prompt: "login"
    }
};
const GITHUB_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("github_copilot_id", "GITHUB_OAUTH_CLIENT_ID"),
    deviceCodeUrl: "https://github.com/login/device/code",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scopes: "read:user",
    apiVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_API_VERSION"],
    copilotTokenUrl: "https://api.github.com/copilot_internal/v2/token",
    userAgent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_USER_AGENT"],
    editorVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_EDITOR_VERSION"],
    editorPluginVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_PLUGIN_VERSION"]
};
const GHE_COPILOT_CONFIG = {
    clientId: process.env.GHE_COPILOT_OAUTH_CLIENT_ID || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("github_copilot_id", "GITHUB_OAUTH_CLIENT_ID"),
    deviceCodeUrl: "",
    tokenUrl: "",
    userInfoUrl: "",
    scopes: "read:user",
    apiVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_API_VERSION"],
    copilotTokenUrl: "",
    userAgent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_USER_AGENT"],
    editorVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_EDITOR_VERSION"],
    editorPluginVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_PLUGIN_VERSION"]
};
const GITLAB_DUO_ENDPOINTS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGitLabOAuthEndpoints"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GITLAB_DUO_DEFAULT_BASE_URL"]);
const GITLAB_DUO_CONFIG = {
    baseUrl: GITLAB_DUO_ENDPOINTS.root,
    clientId: process.env.GITLAB_DUO_OAUTH_CLIENT_ID || process.env.GITLAB_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.GITLAB_DUO_OAUTH_CLIENT_SECRET || process.env.GITLAB_OAUTH_CLIENT_SECRET || "",
    authorizeUrl: GITLAB_DUO_ENDPOINTS.authorizeUrl,
    tokenUrl: GITLAB_DUO_ENDPOINTS.tokenUrl,
    userInfoUrl: GITLAB_DUO_ENDPOINTS.userUrl,
    directAccessUrl: GITLAB_DUO_ENDPOINTS.directAccessUrl,
    scope: "ai_features read_user",
    codeChallengeMethod: "S256"
};
const AWS_REGION_PATTERN = /^[a-z]{2}-[a-z]+-\d{1,2}$/;
function assertValidAwsRegion(region) {
    if (typeof region !== "string" || !AWS_REGION_PATTERN.test(region)) {
        throw new Error("Invalid region");
    }
    return region;
}
const KIRO_CONFIG = {
    // AWS SSO OIDC endpoints for Builder ID/IDC (Device Code Flow)
    ssoOidcEndpoint: "https://oidc.us-east-1.amazonaws.com",
    registerClientUrl: "https://oidc.us-east-1.amazonaws.com/client/register",
    deviceAuthUrl: "https://oidc.us-east-1.amazonaws.com/device_authorization",
    tokenUrl: "https://oidc.us-east-1.amazonaws.com/token",
    // AWS Builder ID default start URL
    startUrl: "https://view.awsapps.com/start",
    // Client registration params
    clientName: "kiro-oauth-client",
    clientType: "public",
    scopes: [
        "codewhisperer:completions",
        "codewhisperer:analysis",
        "codewhisperer:conversations"
    ],
    grantTypes: [
        "urn:ietf:params:oauth:grant-type:device_code",
        "refresh_token"
    ],
    issuerUrl: "https://identitycenter.amazonaws.com/ssoins-722374e8c3c8e6c6",
    // Social auth endpoints (Google/GitHub via AWS Cognito)
    socialAuthEndpoint: "https://prod.us-east-1.auth.desktop.kiro.dev",
    socialLoginUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/login",
    socialTokenUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/oauth/token",
    socialRefreshUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/refreshToken",
    // Social device-code flow (Google/GitHub).
    // `socialClientId` is a public CLI identifier — Kiro's device endpoint accepts
    // any non-empty string and behaves like a User-Agent rather than a secret.
    // The env override exists so operators on locked-down builds can pin a
    // custom value if AWS ever starts enforcing this field (Hard Rule #11 spirit).
    socialClientId: process.env.KIRO_OAUTH_CLIENT_ID || "kiro-cli",
    socialDeviceAuthorizeUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/oauth/device/authorization",
    socialDevicePollUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/oauth/device/poll",
    // Auth methods
    authMethods: [
        "builder-id",
        "idc",
        "google",
        "github",
        "import"
    ]
};
const CURSOR_CONFIG = {
    // API endpoints
    apiEndpoint: "https://api2.cursor.sh",
    chatEndpoint: "/aiserver.v1.ChatService/StreamUnifiedChatWithTools",
    modelsEndpoint: "/aiserver.v1.AiService/GetDefaultModelNudgeData",
    // Additional endpoints
    api3Endpoint: "https://api3.cursor.sh",
    agentEndpoint: "https://agent.api5.cursor.sh",
    agentNonPrivacyEndpoint: "https://agentn.api5.cursor.sh",
    // Client metadata
    clientVersion: "3.2.14",
    clientType: "ide",
    // Token storage locations (for user reference)
    tokenStoragePaths: {
        linux: "~/.config/Cursor/User/globalStorage/state.vscdb",
        macos: "/Users/<user>/Library/Application Support/Cursor/User/globalStorage/state.vscdb",
        windows: "%APPDATA%\\Cursor\\User\\globalStorage\\state.vscdb"
    },
    // Database keys
    dbKeys: {
        accessToken: "[REDIGIDO-PRESERVACAO]",
        machineId: "storage.serviceMachineId"
    }
};
const TRAE_CONFIG = {
    apiEndpoint: "https://api.trae.ai",
    clientType: "ide",
    tokenStoragePaths: {
        linux: "~/.config/Trae/User/globalStorage/state.vscdb",
        macos: "/Users/<user>/Library/Application Support/Trae/User/globalStorage/state.vscdb",
        windows: "%APPDATA%\\Trae\\User\\globalStorage\\state.vscdb"
    },
    // Chat completions path (mirrored from OpenAI-compatible providers)
    chatEndpoint: "/v1/chat/completions",
    // Trae website — users retrieve their token here after signing in
    webUrl: "https://trae.ai",
    // SOLO remote agent base — the executor's real upstream. Also set as the
    // provider registry baseUrl, which is the source of truth at request time.
    soloApiEndpoint: "https://core-normal.trae.ai/api/remote/v1",
    // SOLO model catalogue endpoint (relative to soloApiEndpoint).
    modelsEndpoint: "/models?functions=solo_agent_remote,solo_work_remote",
    // Authorization scheme: `Authorization: Cloud-IDE-JWT <token>` (RS256).
    authScheme: "Cloud-IDE-JWT",
    // Observed Cloud-IDE-JWT lifetime — drives default expiry hints.
    tokenLifetimeDays: 14,
    // Token storage note — solo.trae.ai exposes no public SQLite/keychain path,
    // so the token is captured via the /authorize flow or pasted manually.
    tokenNote: "Authorize via trae.ai in the popup, or sign in to solo.trae.ai and paste the Cloud-IDE-JWT from the Authorization header (~14-day lifetime)."
};
const RAYCAST_CONFIG = {
    apiEndpoint: "https://backend.raycast.com",
    chatEndpoint: "/api/v1/ai/chat_completions",
    modelsEndpoint: "/api/v1/ai/models",
    clientType: "macos-app",
    captureInstructions: "macOS only: use Auto-Import (Keychain + Raycast DB) or capture Bearer, X-Raycast-DeviceId, and optional X-Raycast-Signature JWT from backend.raycast.com traffic."
};
const WINDSURF_CONFIG = {
    // RETIRED 2026-05-29 — endpoint returns 404 post-rebrand. Phase 2 will replace.
    authorizeUrl: "https://app.devin.ai/editor/signin",
    // RETIRED 2026-05-29 — PKCE flow disabled, see header comment.
    codeChallengeMethod: "S256",
    // RETIRED 2026-05-29 — no callback server is started for windsurf/devin-cli.
    callbackPort: 0,
    // RETIRED 2026-05-29 — no callback path is registered for windsurf/devin-cli.
    callbackPath: "/auth/callback",
    // RETIRED 2026-05-29 — exchange endpoint no longer reached because PKCE is disabled.
    apiServerUrl: "https://server.codeium.com",
    // RETIRED 2026-05-29 — see apiServerUrl.
    exchangePath: "/exa.seat_management_pb.SeatManagementService/ExchangePKCEAuthorizationCode",
    // ── Active fields (still consumed by runtime) ─────────────────────────────
    // Inference server URL (gRPC-web requests go here)
    inferenceUrl: "https://server.self-serve.windsurf.com",
    // Primary login path: the user runs the "Windsurf: Provide Auth Token" command
    // inside the Windsurf/VS Code IDE (or clicks the Jupyter "Get Windsurf
    // Authentication Token" button), which opens this URL WITH an IDE-supplied
    // `?state=<xyz>` param and renders the token. Opening this bare URL directly
    // only shows a "Redirecting" page with no token (#3324).
    showAuthTokenUrl: "https://windsurf.com/show-auth-token",
    // Token refresh via Firebase Secure Token Service (reserved for Phase 2).
    // Default is the public Firebase Web client identifier embedded in the
    // Windsurf/Devin CLI binary; users may override via WINDSURF_FIREBASE_API_KEY.
    firebaseApiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("windsurf_fb", "WINDSURF_FIREBASE_API_KEY"),
    firebaseTokenUrl: "https://securetoken.googleapis.com/v1/token",
    // IDE identity sent with every gRPC request
    ideName: "windsurf",
    ideVersion: "3.14.0",
    extensionVersion: "3.14.0"
};
const ZED_CONFIG = {
    importUrl: "/api/providers/zed/import",
    discoverUrl: "/api/providers/zed/discover",
    manualImportUrl: "/api/providers/zed/manual-import"
};
const ZED_HOSTED_CONFIG = {
    webBaseUrl: "https://zed.dev",
    cloudBaseUrl: "https://cloud.zed.dev",
    llmBaseUrl: "https://cloud.zed.dev",
    nativeSignInPath: "/native_app_signin",
    userInfoUrl: "https://cloud.zed.dev/client/users/me",
    llmTokenUrl: "https://cloud.zed.dev/client/llm_tokens",
    modelsUrl: "https://cloud.zed.dev/models",
    completionsUrl: "https://cloud.zed.dev/completions",
    defaultNativeAppPort: 58443
};
const OAUTH_TIMEOUT = 300000;
const PROVIDERS = {
    CLAUDE: "claude",
    CODEX: "codex",
    GEMINI: "gemini",
    QODER: "qoder",
    ANTIGRAVITY: "antigravity",
    AGY: "agy",
    KIMI_CODING: "kimi-coding",
    OPENAI: "openai",
    GITHUB: "github",
    GHE_COPILOT: "ghe-copilot",
    GITLAB_DUO: "gitlab-duo",
    KIRO: "kiro",
    AMAZON_Q: "amazon-q",
    CURSOR: "cursor",
    KILOCODE: "kilocode",
    CLINE: "cline",
    CLINEPASS: "clinepass",
    WINDSURF: "windsurf",
    DEVIN_CLI: "devin-cli",
    TRAE: "trae",
    CODEBUDDY_CN: "codebuddy-cn",
    GROK_CLI: "grok-cli",
    XAI_OAUTH: "xai-oauth",
    ZED: "zed",
    ZED_HOSTED: "zed-hosted"
};
}),
"[project]/src/lib/oauth/utils/codexConnectionSelection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/modelsDevSync/transform.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * modelsDevSync/transform — pure data model + transform layer.
 *
 * Extracted verbatim from modelsDevSync.ts. Holds the models.dev data-model
 * types, the provider-id mapping table, and the raw→OmniRoute transform
 * functions. Zero imports, no DB access, no module state — pure functions and
 * static data. The host (modelsDevSync.ts) imports these for its sync
 * orchestration and re-exports the originally-public symbols.
 *
 * @module lib/modelsDevSync/transform
 */ __turbopack_context__.s([
    "MODELS_DEV_PROVIDER_MAP",
    ()=>MODELS_DEV_PROVIDER_MAP,
    "mapProviderId",
    ()=>mapProviderId,
    "transformModelsDevToCapabilities",
    ()=>transformModelsDevToCapabilities,
    "transformModelsDevToPricing",
    ()=>transformModelsDevToPricing
]);
const MODELS_DEV_PROVIDER_MAP = {
    // Major providers
    openai: [
        "openai",
        "cx"
    ],
    anthropic: [
        "anthropic",
        "cc"
    ],
    google: [
        "gemini"
    ],
    "google-vertex": [
        "gemini",
        "vertex"
    ],
    "google-vertex-anthropic": [
        "anthropic",
        "cc",
        "vertex"
    ],
    vertex_ai: [
        "gemini",
        "vertex"
    ],
    deepseek: [
        "deepseek",
        "if"
    ],
    groq: [
        "groq"
    ],
    xai: [
        "xai"
    ],
    mistral: [
        "mistral"
    ],
    togetherai: [
        "together",
        "openrouter"
    ],
    together_ai: [
        "together",
        "openrouter"
    ],
    "fireworks-ai": [
        "fireworks"
    ],
    fireworks: [
        "fireworks"
    ],
    cerebras: [
        "cerebras"
    ],
    cohere: [
        "cohere"
    ],
    nvidia: [
        "nvidia"
    ],
    nebius: [
        "nebius"
    ],
    siliconflow: [
        "siliconflow"
    ],
    hyperbolic: [
        "hyperbolic"
    ],
    huggingface: [
        "hf",
        "huggingface"
    ],
    openrouter: [
        "openrouter"
    ],
    perplexity: [
        "pplx",
        "perplexity"
    ],
    // OAuth / special providers
    bedrock: [
        "kiro",
        "kr"
    ],
    "github-copilot": [
        "github",
        "gh"
    ],
    "github-models": [
        "github",
        "gh"
    ],
    kilo: [
        "kilocode",
        "kc",
        "kilo-gateway"
    ],
    kilocode: [
        "kilocode",
        "kc",
        "kilo-gateway"
    ],
    "kimi-for-coding": [
        "kimi-coding",
        "kmc",
        "kimi-coding-apikey",
        "kmca"
    ],
    // The `opencode` models.dev entry used to map only to "opencode-zen" because
    // that is the historical alias pair. But OmniRoute's catalog & combo targets
    // reference models under BOTH provider IDs:
    //   - `opencode-zen/big-pickle` (alias form)
    //   - `opencode/big-pickle`    (canonical id form, used by live API catalog
    //                               and by combos like "Opencode FREE Omni")
    // If we only store synced capabilities under "opencode-zen", the canonical
    // `opencode/<model>` lookup in getCanonicalModelMetadata returns null and
    // any combo that targets `opencode/...` ends up with no computed context.
    // Symmetric mapping keeps both lookup paths populated.
    opencode: [
        "opencode",
        "opencode-zen"
    ],
    "opencode-go": [
        "opencode-go",
        "opencode-zen"
    ],
    // Additional providers that may overlap with OmniRoute
    alibaba: [
        "ali",
        "alibaba"
    ],
    "alibaba-cn": [
        "ali-cn",
        "alibaba-cn",
        "alibaba-china"
    ],
    "alibaba-coding-plan": [
        "bcp",
        "bailian-coding-plan"
    ],
    zai: [
        "zai",
        "glm"
    ],
    "zai-coding-plan": [
        "zai",
        "glm"
    ],
    moonshotai: [
        "moonshot",
        "kimi"
    ],
    "moonshotai-cn": [
        "moonshot",
        "kimi"
    ],
    moonshot: [
        "moonshot",
        "kimi",
        "kimi-coding",
        "kmc",
        "kmca"
    ],
    minimax: [
        "minimax",
        "minimax-cn"
    ],
    "minimax-cn": [
        "minimax-cn"
    ],
    longcat: [
        "lc",
        "longcat"
    ],
    pollinations: [
        "pol",
        "pollinations"
    ],
    puter: [
        "pu",
        "puter"
    ],
    cloudflare: [
        "cf"
    ],
    scaleway: [
        "scw"
    ],
    ollama: [
        "ollamacloud",
        "ollama-cloud"
    ],
    blackbox: [
        "bb",
        "blackbox"
    ],
    cline: [
        "cl",
        "cline"
    ],
    cursor: [
        "cu",
        "cursor"
    ],
    github: [
        "gh",
        "github"
    ]
};
function mapProviderId(modelsDevProviderId) {
    return MODELS_DEV_PROVIDER_MAP[modelsDevProviderId] || [
        modelsDevProviderId
    ];
}
function transformModelsDevToPricing(raw) {
    const result = {};
    for (const [providerId, providerData] of Object.entries(raw)){
        const omniRouteProviders = mapProviderId(providerId);
        for (const [modelId, model] of Object.entries(providerData.models || {})){
            if (!model.cost) continue;
            // Must have at least input pricing
            if (model.cost.input == null) continue;
            const entry = {
                input: model.cost.input,
                output: model.cost.output ?? 0
            };
            if (model.cost.cache_read != null) {
                entry.cached = model.cost.cache_read;
            }
            if (model.cost.cache_write != null) {
                entry.cache_creation = model.cost.cache_write;
            }
            if (model.cost.reasoning != null) {
                entry.reasoning = model.cost.reasoning;
            }
            // Write to ALL mapped OmniRoute providers
            for (const omniProvider of omniRouteProviders){
                if (!result[omniProvider]) result[omniProvider] = {};
                result[omniProvider][modelId] = entry;
            }
        }
    }
    return result;
}
function transformModelsDevToCapabilities(raw) {
    const result = {};
    for (const [providerId, providerData] of Object.entries(raw)){
        const omniRouteProviders = mapProviderId(providerId);
        for (const [modelId, model] of Object.entries(providerData.models || {})){
            const modalitiesInput = model.modalities?.input ?? [];
            const modalitiesOutput = model.modalities?.output ?? [];
            // #8250: models.dev can ship attachment=false while modalities.input still
            // lists image/video (Kimi K3). Normalize at sync so persisted rows stay
            // internally consistent before resolve-time reconciliation.
            let attachment = model.attachment ?? null;
            if (attachment === false && [
                ...modalitiesInput,
                ...modalitiesOutput
            ].some((entry)=>{
                const lower = String(entry).toLowerCase();
                return lower.includes("image") || lower.includes("video");
            })) {
                attachment = true;
            }
            const cap = {
                tool_call: model.tool_call ?? null,
                reasoning: model.reasoning ?? null,
                attachment,
                structured_output: model.structured_output ?? null,
                temperature: model.temperature ?? null,
                modalities_input: JSON.stringify(modalitiesInput),
                modalities_output: JSON.stringify(modalitiesOutput),
                knowledge_cutoff: model.knowledge ?? null,
                release_date: model.release_date ?? null,
                last_updated: model.last_updated ?? null,
                status: model.status ?? null,
                family: model.family ?? null,
                open_weights: model.open_weights ?? null,
                limit_context: model.limit?.context ?? null,
                limit_input: model.limit?.input ?? null,
                limit_output: model.limit?.output ?? null,
                interleaved_field: typeof model.interleaved === "object" && model.interleaved?.field ? model.interleaved.field : model.interleaved === true ? "reasoning_content" : null
            };
            for (const omniProvider of omniRouteProviders){
                if (!result[omniProvider]) result[omniProvider] = {};
                result[omniProvider][modelId] = cap;
            }
        }
    }
    return result;
}
}),
"[project]/src/lib/modelsDevSync.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearModelsDevCapabilities",
    ()=>clearModelsDevCapabilities,
    "clearModelsDevPricing",
    ()=>clearModelsDevPricing,
    "ensureCapabilitiesTable",
    ()=>ensureCapabilitiesTable,
    "fetchModelsDev",
    ()=>fetchModelsDev,
    "getModelsDevPricing",
    ()=>getModelsDevPricing,
    "getSyncStatus",
    ()=>getSyncStatus,
    "getSyncedCapabilities",
    ()=>getSyncedCapabilities,
    "getSyncedCapability",
    ()=>getSyncedCapability,
    "initModelsDevSync",
    ()=>initModelsDevSync,
    "saveModelsDevCapabilities",
    ()=>saveModelsDevCapabilities,
    "saveModelsDevPricing",
    ()=>saveModelsDevPricing,
    "startPeriodicSync",
    ()=>startPeriodicSync,
    "stopPeriodicSync",
    ()=>stopPeriodicSync,
    "syncModelsDev",
    ()=>syncModelsDev
]);
/**
 * modelsDevSync.ts — Fetch model specs, pricing, and capabilities from models.dev
 *
 * models.dev (https://github.com/anomalyco/models.dev) is an open-source database
 * of AI model specifications maintained by the SST/OpenCode team (MIT license).
 *
 * API: https://models.dev/api.json
 * - 109 providers, 4,146+ models
 * - Data: pricing, capabilities, limits, modalities, metadata
 *
 * Resolution order (highest → lowest):
 *   1. User overrides (`pricing` namespace)
 *   2. models.dev sync (`models_dev_pricing` namespace)
 *   3. LiteLLM sync (`pricing_synced` namespace)
 *   4. Hardcoded defaults (`pricing.ts`)
 *
 * Opt-in via MODELS_DEV_SYNC_ENABLED=true (default: false).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync/transform.ts [instrumentation] (ecmascript)");
;
;
;
;
;
// ─── Configuration ───────────────────────────────────────
const MODELS_DEV_API_URL = "https://models.dev/api.json";
const parsedInterval = parseInt(process.env.MODELS_DEV_SYNC_INTERVAL || "86400", 10);
const SYNC_INTERVAL_MS = Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval * 1000 : 86400 * 1000;
// ─── Periodic sync state ─────────────────────────────────
let syncTimer = null;
let activeSyncAbortController = null;
let activeSyncPromise = null;
let activePeriodicSyncToken = null;
let lastSyncTime = null;
let lastSyncModelCount = 0;
let lastSyncCapabilityCount = 0;
let activeSyncIntervalMs = SYNC_INTERVAL_MS;
let cachedData = null;
let cacheTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
let cachedCapabilities = null;
let cachedCapabilitiesLoadedAll = false;
const MODELS_DEV_ABORT_ERROR = "AbortError";
function createAbortError() {
    const error = new Error("models.dev sync aborted");
    error.name = MODELS_DEV_ABORT_ERROR;
    return error;
}
function isAbortError(error) {
    return error instanceof Error && error.name === MODELS_DEV_ABORT_ERROR;
}
function createAbortedSyncResult(dryRun) {
    return {
        success: false,
        modelCount: 0,
        providerCount: 0,
        capabilityCount: 0,
        dryRun,
        error: "aborted"
    };
}
async function sleepWithAbort(ms, signal) {
    if (signal?.aborted) {
        throw createAbortError();
    }
    await new Promise((resolve, reject)=>{
        const timeout = setTimeout(()=>{
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        const onAbort = ()=>{
            clearTimeout(timeout);
            reject(createAbortError());
        };
        signal?.addEventListener("abort", onAbort, {
            once: true
        });
    });
}
async function fetchModelsDev(signal) {
    // Return cached data if still fresh
    if (cachedData && Date.now() - cacheTime < CACHE_TTL_MS) {
        return cachedData;
    }
    const response = await fetch(MODELS_DEV_API_URL, {
        signal: signal ?? AbortSignal.timeout(30000)
    });
    if (!response.ok) {
        throw new Error(`models.dev fetch failed [${response.status}]: ${response.statusText}`);
    }
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        cachedData = data;
        cacheTime = Date.now();
        return data;
    } catch  {
        throw new Error(`models.dev returned invalid JSON (${text.slice(0, 100)}...)`);
    }
}
// ─── DB: models.dev pricing namespace ────────────────────
function toRecord(value) {
    return value && typeof value === "object" ? value : {};
}
function mapCapabilityRecord(record) {
    return {
        tool_call: record.tool_call === 1 ? true : record.tool_call === 0 ? false : null,
        reasoning: record.reasoning === 1 ? true : record.reasoning === 0 ? false : null,
        attachment: record.attachment === 1 ? true : record.attachment === 0 ? false : null,
        structured_output: record.structured_output === 1 ? true : record.structured_output === 0 ? false : null,
        temperature: record.temperature === 1 ? true : record.temperature === 0 ? false : null,
        modalities_input: typeof record.modalities_input === "string" ? record.modalities_input : "[]",
        modalities_output: typeof record.modalities_output === "string" ? record.modalities_output : "[]",
        knowledge_cutoff: typeof record.knowledge_cutoff === "string" ? record.knowledge_cutoff : null,
        release_date: typeof record.release_date === "string" ? record.release_date : null,
        last_updated: typeof record.last_updated === "string" ? record.last_updated : null,
        status: typeof record.status === "string" ? record.status : null,
        family: typeof record.family === "string" ? record.family : null,
        open_weights: record.open_weights === 1 ? true : record.open_weights === 0 ? false : null,
        limit_context: typeof record.limit_context === "number" ? record.limit_context : null,
        limit_input: typeof record.limit_input === "number" ? record.limit_input : null,
        limit_output: typeof record.limit_output === "number" ? record.limit_output : null,
        interleaved_field: typeof record.interleaved_field === "string" ? record.interleaved_field : null
    };
}
// #8697: getModelsDevPricing() re-ran the SELECT + JSON.parse of ~180 blobs on
// every call — called once per catalog model (up to ~6091x) instead of once per
// request, freezing the whole server 41-54s on a cold /v1/models rebuild.
// Memoized here, invalidated via the same modelCatalogCacheVersion signal
// save/clearModelsDevPricing already bump through invalidateDbCache("pricing") —
// reusing the existing pattern (getCachedRawProviderConnections et al. in
// db/readCache.ts) instead of introducing a new invalidation mechanism.
let pricingMemo = null;
let pricingMemoVersion = -1; // -1: never equals a real cacheVersion (starts at 0), guarantees a miss on the first call
function getModelsDevPricing() {
    const currentVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelCatalogCacheVersion"])();
    if (pricingMemo !== null && pricingMemoVersion === currentVersion) {
        return pricingMemo;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'models_dev_pricing'").all();
    const synced = {};
    for (const row of rows){
        const record = toRecord(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null) continue;
        try {
            synced[key] = JSON.parse(rawValue);
        } catch  {
            console.warn(`[MODELS_DEV] Corrupted pricing data for provider "${key}", skipping`);
        }
    }
    pricingMemo = synced;
    pricingMemoVersion = currentVersion;
    return synced;
}
function saveModelsDevPricing(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const del = db.prepare("DELETE FROM key_value WHERE namespace = 'models_dev_pricing'");
    const insert = db.prepare("INSERT INTO key_value (namespace, key, value) VALUES ('models_dev_pricing', ?, ?)");
    const tx = db.transaction(()=>{
        del.run();
        for (const [provider, models] of Object.entries(data)){
            insert.run(provider, JSON.stringify(models));
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function clearModelsDevPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'models_dev_pricing'").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function ensureCapabilitiesTable() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.exec(`
    CREATE TABLE IF NOT EXISTS model_capabilities (
      provider TEXT NOT NULL,
      model_id TEXT NOT NULL,
      tool_call BOOLEAN,
      reasoning BOOLEAN,
      attachment BOOLEAN,
      structured_output BOOLEAN,
      temperature BOOLEAN,
      modalities_input TEXT,
      modalities_output TEXT,
      knowledge_cutoff TEXT,
      release_date TEXT,
      last_updated TEXT,
      status TEXT,
      family TEXT,
      open_weights BOOLEAN,
      limit_context INTEGER,
      limit_input INTEGER,
      limit_output INTEGER,
      interleaved_field TEXT,
      last_synced TEXT,
      PRIMARY KEY (provider, model_id)
    )
  `);
}
function getSyncedCapabilities(provider, modelId) {
    if (cachedCapabilitiesLoadedAll) {
        if (!provider) {
            return cachedCapabilities || {};
        }
        if (!modelId) {
            return cachedCapabilities?.[provider] ? {
                [provider]: cachedCapabilities[provider]
            } : {};
        }
        const providerCaps = cachedCapabilities?.[provider];
        return providerCaps?.[modelId] ? {
            [provider]: {
                [modelId]: providerCaps[modelId]
            }
        } : {};
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    ensureCapabilitiesTable();
    let query = "SELECT * FROM model_capabilities";
    const params = [];
    if (provider) {
        query += " WHERE provider = ?";
        params.push(provider);
        if (modelId) {
            query += " AND model_id = ?";
            params.push(modelId);
        }
    }
    const rows = db.prepare(query).all(...params);
    const result = {};
    for (const row of rows){
        const record = toRecord(row);
        const prov = typeof record.provider === "string" ? record.provider : null;
        const mid = typeof record.model_id === "string" ? record.model_id : null;
        if (!prov || !mid) continue;
        if (!result[prov]) result[prov] = {};
        result[prov][mid] = mapCapabilityRecord(record);
    }
    if (!provider && !modelId) {
        cachedCapabilities = result;
        cachedCapabilitiesLoadedAll = true;
    }
    return result;
}
/**
 * Resolved providers/aliases to also try when looking up a synced capability.
 * Required because models.dev has historically stored capability rows under the
 * alias side of an alias pair (e.g. "opencode-zen") while the catalog & combo
 * targets reference the canonical id (e.g. "opencode"). Without this fallback,
 * combos whose targets use the canonical id (e.g. "Opencode FREE Omni" → all
 * `opencode/...` models) end up with `context_length: null` in the catalog.
 */ const SYNCED_CAPABILITY_FALLBACK_ALIASES = {
    opencode: [
        "opencode-zen"
    ],
    "opencode-zen": [
        "opencode"
    ],
    "opencode-go": [
        "opencode-zen"
    ]
};
function getSyncedCapability(provider, modelId) {
    if (!provider || !modelId) return null;
    // #8697-adjacent: this used to hit SQLite with a per-model SELECT on every cold
    // call, relying on some other caller (getSyncedCapabilities() with no args) to have
    // already warmed the whole-table cache first — no such caller sits in the /v1/models
    // catalog build path, so a cold rebuild ran one SQLite round-trip per model per call
    // site instead of one bulk read for the whole rebuild. Self-warm here instead of
    // depending on an external caller.
    if (!cachedCapabilitiesLoadedAll) {
        getSyncedCapabilities();
    }
    const lookupCached = (p)=>cachedCapabilities?.[p]?.[modelId] ?? null;
    const directCached = lookupCached(provider);
    if (directCached) return directCached;
    const fallbacks = SYNCED_CAPABILITY_FALLBACK_ALIASES[provider];
    if (fallbacks) {
        for (const alt of fallbacks){
            const found = lookupCached(alt);
            if (found) return found;
        }
    }
    return null;
}
function saveModelsDevCapabilities(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    ensureCapabilitiesTable();
    const del = db.prepare("DELETE FROM model_capabilities");
    const insert = db.prepare(`
    INSERT INTO model_capabilities (
      provider, model_id, tool_call, reasoning, attachment, structured_output,
      temperature, modalities_input, modalities_output, knowledge_cutoff,
      release_date, last_updated, status, family, open_weights,
      limit_context, limit_input, limit_output, interleaved_field, last_synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const now = new Date().toISOString();
    const tx = db.transaction(()=>{
        del.run();
        for (const [provider, models] of Object.entries(data)){
            for (const [modelId, cap] of Object.entries(models)){
                insert.run(provider, modelId, cap.tool_call === null ? null : cap.tool_call ? 1 : 0, cap.reasoning === null ? null : cap.reasoning ? 1 : 0, cap.attachment === null ? null : cap.attachment ? 1 : 0, cap.structured_output === null ? null : cap.structured_output ? 1 : 0, cap.temperature === null ? null : cap.temperature ? 1 : 0, cap.modalities_input, cap.modalities_output, cap.knowledge_cutoff, cap.release_date, cap.last_updated, cap.status, cap.family, cap.open_weights === null ? null : cap.open_weights ? 1 : 0, cap.limit_context, cap.limit_input, cap.limit_output, cap.interleaved_field, now);
            }
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    cachedCapabilities = data;
    cachedCapabilitiesLoadedAll = true;
}
function clearModelsDevCapabilities() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    ensureCapabilitiesTable();
    db.prepare("DELETE FROM model_capabilities").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    cachedCapabilities = {};
    cachedCapabilitiesLoadedAll = true;
}
async function syncModelsDev(opts) {
    const dryRun = opts?.dryRun ?? false;
    const syncCapabilities = opts?.syncCapabilities ?? true;
    const maxRetries = opts?.maxRetries ?? 3;
    const signal = opts?.signal;
    let lastError = null;
    for(let attempt = 0; attempt <= maxRetries; attempt++){
        if (signal?.aborted) {
            return createAbortedSyncResult(dryRun);
        }
        try {
            const raw = await fetchModelsDev(signal);
            const pricing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["transformModelsDevToPricing"])(raw);
            const capabilities = syncCapabilities ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["transformModelsDevToCapabilities"])(raw) : {};
            const modelCount = Object.values(pricing).reduce((sum, models)=>sum + Object.keys(models).length, 0);
            const providerCount = Object.keys(pricing).length;
            const capabilityCount = syncCapabilities ? Object.values(capabilities).reduce((sum, models)=>sum + Object.keys(models).length, 0) : 0;
            if (signal?.aborted) {
                return createAbortedSyncResult(dryRun);
            }
            if (!dryRun) {
                saveModelsDevPricing(pricing);
                if (syncCapabilities) {
                    ensureCapabilitiesTable();
                    saveModelsDevCapabilities(capabilities);
                }
                lastSyncTime = new Date().toISOString();
                lastSyncModelCount = modelCount;
                lastSyncCapabilityCount = capabilityCount;
            }
            return {
                success: true,
                modelCount,
                providerCount,
                capabilityCount,
                dryRun,
                ...dryRun ? {
                    data: {
                        pricing,
                        capabilities
                    }
                } : {}
            };
        } catch (err) {
            if (signal?.aborted || isAbortError(err)) {
                return createAbortedSyncResult(dryRun);
            }
            lastError = err instanceof Error ? err : new Error(String(err));
            if (attempt < maxRetries) {
                const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
                console.warn(`[MODELS_DEV] Sync attempt ${attempt + 1} failed, retrying in ${delayMs}ms:`, lastError.message);
                try {
                    await sleepWithAbort(delayMs, signal);
                } catch (sleepError) {
                    if (signal?.aborted || isAbortError(sleepError)) {
                        return createAbortedSyncResult(dryRun);
                    }
                    throw sleepError;
                }
            }
        }
    }
    const message = lastError?.message || "Unknown error";
    console.warn(`[MODELS_DEV] Sync failed after ${maxRetries + 1} attempts:`, message);
    return {
        success: false,
        modelCount: 0,
        providerCount: 0,
        capabilityCount: 0,
        dryRun,
        error: message
    };
}
function startPeriodicSync(intervalMs) {
    if (syncTimer) return; // Already running
    const interval = intervalMs ?? SYNC_INTERVAL_MS;
    activeSyncIntervalMs = interval;
    const syncToken = {
        stopped: false
    };
    activePeriodicSyncToken = syncToken;
    console.log(`[MODELS_DEV] Starting periodic sync every ${interval / 1000}s`);
    const launchSync = ()=>{
        if (syncToken.stopped) {
            return Promise.resolve(createAbortedSyncResult(false));
        }
        if (activeSyncPromise) return activeSyncPromise;
        const controller = new AbortController();
        activeSyncAbortController = controller;
        const promise = syncModelsDev({
            signal: controller.signal
        }).finally(()=>{
            if (activeSyncAbortController === controller) {
                activeSyncAbortController = null;
            }
            if (activeSyncPromise === promise) {
                activeSyncPromise = null;
            }
        });
        activeSyncPromise = promise;
        return promise;
    };
    // Initial sync (non-blocking)
    launchSync().then((result)=>{
        if (result.success) {
            console.log(`[MODELS_DEV] Initial sync complete: ${result.modelCount} pricing entries, ${result.capabilityCount} capabilities from ${result.providerCount} providers`);
        }
    }).catch((err)=>{
        console.warn("[MODELS_DEV] Initial sync error:", err instanceof Error ? err.message : err);
    });
    syncTimer = setInterval(()=>{
        launchSync().then((result)=>{
            if (result.success) {
                console.log(`[MODELS_DEV] Periodic sync complete: ${result.modelCount} pricing entries`);
            }
        }).catch((err)=>{
            console.warn("[MODELS_DEV] Periodic sync error:", err instanceof Error ? err.message : err);
        });
    }, interval);
    if (syncTimer && typeof syncTimer === "object" && "unref" in syncTimer) {
        syncTimer.unref?.();
    }
}
function stopPeriodicSync() {
    if (activePeriodicSyncToken) {
        activePeriodicSyncToken.stopped = true;
        activePeriodicSyncToken = null;
    }
    if (activeSyncAbortController) {
        activeSyncAbortController.abort();
        activeSyncAbortController = null;
    }
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
        console.log("[MODELS_DEV] Periodic sync stopped");
    }
}
function getSyncStatus() {
    // If the sync timer is active, it's enabled.
    const enabled = syncTimer !== null;
    return {
        enabled,
        lastSync: lastSyncTime,
        lastSyncModelCount,
        lastSyncCapabilityCount,
        nextSync: syncTimer && lastSyncTime ? new Date(new Date(lastSyncTime).getTime() + activeSyncIntervalMs).toISOString() : null,
        intervalMs: activeSyncIntervalMs
    };
}
async function initModelsDevSync() {
    const { getSettings } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
    const settings = await getSettings();
    if (settings.modelsDevSyncEnabled !== true) {
        console.log("[MODELS_DEV] Disabled (enable via Settings > AI)");
        return;
    }
    const interval = settings.modelsDevSyncInterval;
    startPeriodicSync(interval);
}
}),
"[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "capMaxOutputTokens",
    ()=>capMaxOutputTokens,
    "capThinkingBudget",
    ()=>capThinkingBudget,
    "getDefaultThinkingBudget",
    ()=>getDefaultThinkingBudget,
    "getExplicitModelOutputCap",
    ()=>getExplicitModelOutputCap,
    "getModelContextLimit",
    ()=>getModelContextLimit,
    "getResolvedModelCapabilities",
    ()=>getResolvedModelCapabilities,
    "getResolvedModelContextOverride",
    ()=>getResolvedModelContextOverride,
    "isNonChatCatalogSurface",
    ()=>isNonChatCatalogSurface,
    "modelIdLikelyVision",
    ()=>modelIdLikelyVision,
    "resolveInputTokenCapForGate",
    ()=>resolveInputTokenCapForGate,
    "supportsMaxTokens",
    ()=>supportsMaxTokens,
    "supportsReasoning",
    ()=>supportsReasoning,
    "supportsToolCalling",
    ()=>supportsToolCalling
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync/transform.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelContextOverrides.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelCapabilityOverrides.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/visionModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/learnedThinkingCaps.ts [instrumentation] (ecmascript)");
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
const TOOL_CALLING_UNSUPPORTED_PATTERNS = [
    // Specialty / non-chat surfaces must never inherit optimistic tool defaults (#8016)
    "whisper",
    "tts-1",
    "gpt-4o-mini-tts",
    "omni-moderation",
    "moderation",
    "eleven_multilingual",
    "eleven_turbo",
    "seedance",
    "/veo",
    "veo-",
    "rerank",
    "embedding",
    "dall-e",
    "flux-",
    "stable-diffusion"
];
const REASONING_UNSUPPORTED_PATTERNS = [
    "antigravity/claude-sonnet-4-6",
    "antigravity/claude-sonnet-4-5",
    "antigravity/claude-sonnet-4",
    // Non-Claude antigravity models don't support thinking params (#1361)
    "antigravity/gemini-",
    "antigravity/gpt-oss-",
    "antigravity/gemini-3",
    "antigravity/tab_",
    // Specialty / non-chat surfaces (#8016)
    "whisper",
    "tts-1",
    "gpt-4o-mini-tts",
    "omni-moderation",
    "moderation",
    "eleven_multilingual",
    "eleven_turbo",
    "seedance",
    "/veo",
    "veo-",
    "rerank",
    "embedding",
    "dall-e",
    "flux-",
    "stable-diffusion"
];
/** Catalog/API surface types that are not chat completions. */ const NON_CHAT_SURFACE_TYPES = new Set([
    "audio",
    "video",
    "image",
    "moderation",
    "rerank",
    "embedding",
    "music"
]);
function isNonChatCatalogSurface(type) {
    return typeof type === "string" && NON_CHAT_SURFACE_TYPES.has(type);
}
const MAX_TOKENS_UNSUPPORTED_PATTERNS = [
    "o1-preview",
    "o1-mini",
    "o1",
    "o3-mini",
    "o3",
    "gpt-5.4",
    "gpt-5.5"
];
function toNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function parseModalities(value) {
    if (typeof value !== "string" || value.trim().length === 0) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((entry)=>typeof entry === "string" && entry.length > 0) : [];
    } catch  {
        return [];
    }
}
function getRegistryModel(providerIdOrAlias, modelId) {
    if (!providerIdOrAlias || !modelId) return null;
    const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][providerIdOrAlias] || providerIdOrAlias;
    const models = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][providerAlias];
    if (!Array.isArray(models)) return null;
    return models.find((model)=>model?.id === modelId) || null;
}
function resolveCapabilityInput(input) {
    if (typeof input === "string") {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseModel"])(input);
        const rawModel = toNonEmptyString(parsed.model);
        if (parsed.provider) {
            const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveCanonicalProviderModel"])(parsed.provider, rawModel);
            return {
                provider: canonical.provider,
                model: toNonEmptyString(canonical.model),
                rawModel,
                lookupKey: input
            };
        }
        return {
            provider: null,
            model: rawModel,
            rawModel,
            lookupKey: input
        };
    }
    const rawProvider = toNonEmptyString(input.provider);
    const rawModel = toNonEmptyString(input.model);
    if (rawProvider) {
        const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveCanonicalProviderModel"])(rawProvider, rawModel);
        return {
            provider: canonical.provider,
            model: toNonEmptyString(canonical.model),
            rawModel,
            lookupKey: rawModel ? `${canonical.provider}/${rawModel}` : canonical.provider
        };
    }
    return {
        provider: null,
        model: rawModel,
        rawModel,
        lookupKey: rawModel || ""
    };
}
function heuristicToolCalling(modelStr) {
    const normalized = String(modelStr || "").toLowerCase();
    if (!normalized) return false;
    const blocked = TOOL_CALLING_UNSUPPORTED_PATTERNS.some((pattern)=>{
        if (normalized === pattern) return true;
        if (normalized.endsWith(`/${pattern}`)) return true;
        return normalized.includes(pattern);
    });
    return !blocked;
}
function heuristicReasoning(modelStr) {
    const normalized = String(modelStr || "").toLowerCase();
    if (!normalized) return true;
    const blocked = REASONING_UNSUPPORTED_PATTERNS.some((pattern)=>normalized === pattern || normalized.endsWith(`/${pattern}`) || normalized.includes(pattern));
    return !blocked;
}
function heuristicMaxTokens(modelStr) {
    const normalized = String(modelStr || "").toLowerCase();
    if (!normalized) return true;
    const blocked = MAX_TOKENS_UNSUPPORTED_PATTERNS.some((pattern)=>normalized === pattern || normalized.endsWith(`/${pattern}`) || normalized.includes(pattern));
    return !blocked;
}
/** Last path segment of a path-shaped model id (`cline-pass/kimi-k3` → `kimi-k3`). */ function leafModelId(modelId) {
    if (!modelId || !modelId.includes("/")) return null;
    const leaf = modelId.split("/").filter(Boolean).pop() ?? null;
    return leaf && leaf !== modelId ? leaf : null;
}
function getStaticSpec(modelId, rawModel) {
    if (modelId) {
        const byCanonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelSpec"])(modelId);
        if (byCanonical) return byCanonical;
    }
    if (rawModel && rawModel !== modelId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelSpec"])(rawModel);
    }
    return undefined;
}
/**
 * #8032: vision-only leaf fallback for path-shaped routed ids.
 *
 * Must NOT live in getStaticSpec() — that helper also feeds supportsTools /
 * supportsThinking / contextWindow / maxOutputTokens. A shared leaf lookup
 * incorrectly promotes e.g. aihorde/deepseek/deepseek-v4-flash to the real
 * DeepSeek V4 Flash tool-calling spec (#8212 regression).
 */ function getVisionStaticSpec(modelId, rawModel) {
    const direct = getStaticSpec(modelId, rawModel);
    if (direct) return direct;
    for (const candidate of [
        modelId,
        rawModel
    ]){
        const leaf = leafModelId(candidate);
        if (!leaf) continue;
        const byLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelSpec"])(leaf);
        if (byLeaf) return byLeaf;
    }
    return undefined;
}
function getAuthoritativeStaticContextWindow(provider, modelId, rawModel) {
    for (const candidate of [
        modelId,
        rawModel
    ]){
        const providerContextWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAuthoritativeProviderContextWindow"])(provider, candidate);
        if (typeof providerContextWindow === "number") return providerContextWindow;
    }
    for (const candidate of [
        modelId,
        rawModel
    ]){
        const contextWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAuthoritativeContextWindow"])(candidate);
        if (typeof contextWindow === "number") return contextWindow;
    }
    return null;
}
// #8697-adjacent: this used to rescan Object.entries(MODEL_SPECS) per candidate per
// call — the top hotspot in a full catalog-rebuild profile once the pricing-path and
// getCanonicalModelSpecId() bottlenecks were fixed. Reuses the lazy index already built
// for getCanonicalModelSpecId() (@/shared/constants/modelSpecs) instead of duplicating a
// second cache over the same static table.
function getStaticSpecCanonicalModelId(modelId, rawModel) {
    const candidates = [
        modelId,
        rawModel
    ].filter((candidate)=>typeof candidate === "string" && candidate.length > 0);
    for (const candidate of candidates){
        const hit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["findModelSpecIdByExactOrAlias"])(candidate);
        if (hit) return hit;
    }
    return null;
}
/**
 * Strip a trailing `-latest` alias suffix from a model id (#4073). Returns the
 * short id (`pixtral-12b-latest` → `pixtral-12b`) or `null` when there is no
 * `-latest` suffix to drop. Used only as a last-resort synced-lookup fallback.
 */ function stripLatestAlias(modelId) {
    if (!modelId) return null;
    const stripped = modelId.replace(/-latest$/i, "");
    return stripped && stripped !== modelId ? stripped : null;
}
// #8697-adjacent: MODELS_DEV_PROVIDER_MAP is a static module constant, so the result
// of reverseModelsDevProviders() never changes for a given provider — memoized by
// provider key instead of rescanning Object.entries(MODELS_DEV_PROVIDER_MAP) on every
// call (called once per model in a catalog rebuild). Never evicted — bounded by the
// number of distinct providers ever queried (~50-100 in practice), negligible memory.
const reverseModelsDevProvidersCache = new Map();
function reverseModelsDevProviders(provider) {
    // models.dev may store capabilities under a different OmniRoute provider id
    // that also maps from the same upstream models.dev provider. Build reverse
    // candidates from MODELS_DEV_PROVIDER_MAP (e.g. openai ↔ cx).
    //
    // MODELS_DEV_PROVIDER_MAP's RHS is inconsistent: most providers list their
    // canonical id directly, but the OAuth CLI providers (codex/claude) only
    // list their alias (cx/cc), never the canonical id. Also probe the
    // provider's alias so a canonical id like "codex"/"claude" still matches
    // the map entries keyed only by "cx"/"cc" (#8429).
    const cached = reverseModelsDevProvidersCache.get(provider);
    if (cached) return cached;
    const out = new Set();
    const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][provider] || provider;
    for (const [modelsDevId, omniIds] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODELS_DEV_PROVIDER_MAP"])){
        if (omniIds.includes(provider) || omniIds.includes(providerAlias) || modelsDevId === provider || modelsDevId === providerAlias) {
            out.add(modelsDevId);
            for (const id of omniIds)out.add(id);
        }
    }
    // Frozen: the result is now shared across every future call for this provider (via
    // the cache above) instead of a fresh array per call — freeze prevents an accidental
    // caller mutation (e.g. .push()) from corrupting the cache for everyone else.
    const result = Object.freeze([
        ...out
    ]);
    reverseModelsDevProvidersCache.set(provider, result);
    return result;
}
function getSyncedCapabilityForResolved(provider, model, rawModel) {
    if (!provider || !model) return null;
    const modelCandidates = Array.from(new Set([
        model,
        rawModel,
        getStaticSpecCanonicalModelId(model, rawModel)
    ].filter((value)=>typeof value === "string" && value.length > 0).flatMap((candidate)=>{
        const values = [
            candidate
        ];
        const stripped = stripLatestAlias(candidate);
        if (stripped) values.push(stripped);
        const leaf = leafModelId(candidate);
        if (leaf) values.push(leaf);
        // models.dev often stores OpenAI-family specialty models as qualified
        // ids under another mapped provider, e.g. vercel + "openai/whisper-1".
        if (!candidate.includes("/")) {
            values.push(`${provider}/${candidate}`);
        }
        return values;
    })));
    // Include common host providers that re-publish OpenAI specialty models under
    // qualified ids (observed: vercel/openai/whisper-1, vercel/openai/tts-1).
    const providerCandidates = Array.from(new Set([
        provider,
        ...reverseModelsDevProviders(provider),
        "vercel"
    ]));
    for (const prov of providerCandidates){
        for (const mid of modelCandidates){
            const found = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedCapability"])(prov, mid);
            if (found) return found;
        }
    }
    return null;
}
function modelIdLikelyVision(modelId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isVisionModelId"])(modelId);
}
/**
 * Models that upstream catalogs (notably models.dev) mislabel as vision-capable but
 * are TEXT-ONLY per the vendor's own docs. Listed here so a wrong synced
 * `attachment:true` cannot route an image request to a blind model (the #4071 failure
 * mode). Keep this list tiny and doc-backed.
 *
 * Xiaomi MiMo: only `mimo-v2.5` and `mimo-v2-omni` accept images; the `*-pro` chat
 * models are text-only (mimo.mi.com .../image-understanding; hermes-agent#18884).
 * Anchored to the full id (`$`) and tolerant of a `provider/` prefix so `mimo-v2.5-pro`
 * never matches the multimodal `mimo-v2.5`, and `mimo-v2-pro` never matches `mimo-v2-omni`.
 */ const KNOWN_TEXT_ONLY_DESPITE_SYNC = [
    /(?:^|\/)mimo-v2\.5-pro$/i,
    /(?:^|\/)mimo-v2-pro$/i
];
function isKnownTextOnlyDespiteSync(modelId) {
    if (!modelId) return false;
    const id = String(modelId);
    return KNOWN_TEXT_ONLY_DESPITE_SYNC.some((pattern)=>pattern.test(id));
}
/** True when a modality list declares image and/or video input/output. */ function modalitiesDeclareVision(modalities) {
    return modalities.some((entry)=>{
        const lower = String(entry).toLowerCase();
        return lower.includes("image") || lower.includes("video");
    });
}
function resolveVisionCapability(spec, registryModel, synced, modalitiesInput, modalitiesOutput, modelId) {
    const allModalities = [
        ...modalitiesInput,
        ...modalitiesOutput
    ].map((entry)=>String(entry).toLowerCase());
    // Hard override FIRST: a wrong synced `attachment:true` (or image modality) must not
    // win for models the vendor documents as text-only. Beats every branch below so an
    // image request can never be routed to a blind model (#4071).
    if (isKnownTextOnlyDespiteSync(modelId)) return false;
    if (typeof synced?.attachment === "boolean") {
        // #8250: models.dev sometimes ships attachment=false alongside image/video
        // modalities (observed for Kimi K3). Prefer the richer modality signal over
        // the contradictory false flag so supportsVision / attachment / modalities
        // can be reconciled to a single vision-capable verdict.
        if (synced.attachment === false && modalitiesDeclareVision(allModalities)) {
            return true;
        }
        // #8032: attachment=false without modalities must not beat authoritative
        // registry/spec vision for path-shaped custom/routed ids (e.g. Cline Pass
        // `cp/cline-pass/kimi-k3` → MODEL_SPECS["kimi-k3"].supportsVision).
        if (synced.attachment === false) {
            if (registryModel?.supportsVision === true) return true;
            if (spec?.supportsVision === true) return true;
            return false;
        }
        return synced.attachment;
    }
    if (allModalities.some((entry)=>entry.includes("image"))) {
        return true;
    }
    if (allModalities.length > 0) {
        return false;
    }
    if (typeof registryModel?.supportsVision === "boolean") return registryModel.supportsVision;
    if (typeof spec?.supportsVision === "boolean") return spec.supportsVision;
    // Last resort: no capability data at all. Positively confirm known multimodal
    // families by model id so image requests can be routed to them; everything
    // else stays `null` (unknown).
    if (modelIdLikelyVision(modelId)) return true;
    return null;
}
/**
 * Issue #6524: an operator-set `max_output_tokens` capability override (see
 * `src/lib/db/modelCapabilityOverrides.ts`) is the manual escape hatch for a
 * wrong/stale synced `limit_output` value (e.g. a provider's models.dev catalog
 * row reporting `limit_output` equal to `limit_context`). It already won over the
 * synced value in `getResolvedModelCapabilities().maxOutputTokens` — this helper
 * makes `getExplicitModelOutputCap()` (used by the reasoning-token-buffer clamp)
 * consult the same override so both read paths agree.
 */ /**
 * Exact-match capability override lookup with intentional raw-alias fallback.
 *
 * An override may be stored under either the canonical model id or the exact
 * provider-scoped raw alias the operator used (e.g. `github/claude-opus-4.5`
 * resolving to canonical `claude-opus-4-5-20251101`). We consult the canonical
 * id first, then the raw alias — both are exact provider/model matches. There is
 * deliberately NO suffix/effort/family inheritance: an override for
 * `codex/gpt-5.6` never applies to `codex/gpt-5.6-high`.
 */ function getCapabilityOverride(resolved, key) {
    const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelCapabilityOverride"])(resolved.provider, resolved.model, key);
    if (canonical !== null) return canonical;
    return resolved.rawModel && resolved.rawModel !== resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelCapabilityOverride"])(resolved.provider, resolved.rawModel, key) : null;
}
function getContextOverride(resolved) {
    const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelContextOverride"])(resolved.provider, resolved.model);
    if (canonical !== null) return canonical;
    return resolved.rawModel && resolved.rawModel !== resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelContextOverride"])(resolved.provider, resolved.rawModel) : null;
}
function getResolvedModelContextOverride(input) {
    return getContextOverride(resolveCapabilityInput(input));
}
function getInputTokenCapabilityOverride(resolved) {
    return getCapabilityOverride(resolved, "max_input_tokens");
}
function getOutputTokenCapabilityOverride(resolved) {
    return getCapabilityOverride(resolved, "max_output_tokens");
}
function getExplicitModelOutputCap(input) {
    const resolved = resolveCapabilityInput(input);
    const maxTokenOverride = getOutputTokenCapabilityOverride(resolved);
    if (maxTokenOverride !== null) return maxTokenOverride;
    const synced = getSyncedCapabilityForResolved(resolved.provider, resolved.model, resolved.rawModel);
    if (synced && typeof synced.limit_output === "number") return synced.limit_output;
    const registryModel = getRegistryModel(resolved.provider, resolved.model);
    if (typeof registryModel?.maxOutputTokens === "number") return registryModel.maxOutputTokens;
    const spec = getStaticSpec(resolved.model, resolved.rawModel);
    return spec?.maxOutputTokens ?? null;
}
function getResolvedModelCapabilities(input, options) {
    // Reconciliation / auto-discovery needs the override-free catalog view so a
    // persisted override never feeds back into the comparison that (re)writes it.
    const usePersistedOverrides = options?.persistedOverrides !== false;
    const resolved = resolveCapabilityInput(input);
    const spec = getStaticSpec(resolved.model, resolved.rawModel);
    const registryModel = getRegistryModel(resolved.provider, resolved.model);
    const synced = getSyncedCapabilityForResolved(resolved.provider, resolved.model, resolved.rawModel);
    const modalitiesInput = parseModalities(synced?.modalities_input);
    const modalitiesOutput = parseModalities(synced?.modalities_output);
    const lookupKey = toNonEmptyString(resolved.provider && resolved.model ? `${resolved.provider}/${resolved.model}` : resolved.model || resolved.rawModel || resolved.lookupKey) || "";
    const reasoningDenied = !heuristicReasoning(lookupKey);
    // Provider-level fallback: a live-discovered model (passthroughModels
    // providers like AI Horde) has no per-model registry entry, synced
    // capability, or static spec — every source above resolves to null, so
    // toolCalling would otherwise fall through to heuristicToolCalling's
    // optimistic default (true). Reuse the same unsupportedParams signal the
    // request-time strip already relies on: if the provider declares "tools"
    // unsupported for every model it serves, that's authoritative here too.
    const providerDeniesTools = resolved.provider && resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUnsupportedParams"])(resolved.provider, resolved.model).includes("tools") : false;
    const supportsTools = synced?.tool_call ?? (typeof registryModel?.toolCalling === "boolean" ? registryModel.toolCalling : null) ?? (typeof spec?.supportsTools === "boolean" ? spec.supportsTools : null) ?? (providerDeniesTools ? false : null);
    const supportsThinking = reasoningDenied ? false : synced?.reasoning ?? (typeof registryModel?.supportsReasoning === "boolean" ? registryModel.supportsReasoning : null) ?? (typeof spec?.supportsThinking === "boolean" ? spec.supportsThinking : null);
    const authoritativeContextWindow = getAuthoritativeStaticContextWindow(resolved.provider, resolved.model, resolved.rawModel);
    // A persisted context-window override (operator-set or auto-discovered)
    // reflects the real *total* window and wins over every static/synced source.
    // `maxInputTokens` still follows its own precedence chain; only when that
    // chain has no narrower source does it naturally fall back to this window.
    const persistedContextWindow = usePersistedOverrides ? getContextOverride(resolved) : null;
    const contextWindow = persistedContextWindow ?? authoritativeContextWindow ?? synced?.limit_context ?? (typeof registryModel?.contextLength === "number" ? registryModel.contextLength : null) ?? spec?.contextWindow ?? null;
    const maxInputOverride = usePersistedOverrides ? getInputTokenCapabilityOverride(resolved) : null;
    const maxTokenOverride = usePersistedOverrides ? getOutputTokenCapabilityOverride(resolved) : null;
    // Vision consults leaf static metadata for path-shaped ids; other capability
    // fields keep using the non-leaf `spec` from getStaticSpec() above.
    const visionSpec = getVisionStaticSpec(resolved.model, resolved.rawModel);
    const supportsVision = resolveVisionCapability(visionSpec, registryModel, synced, modalitiesInput, modalitiesOutput, lookupKey);
    // #8250: when resolve promoted vision over a contradictory attachment=false,
    // expose attachment=true so catalog / Vision Bridge / clients see one verdict.
    let attachment = synced?.attachment ?? null;
    if (supportsVision === true && attachment === false) {
        attachment = true;
    }
    return {
        provider: resolved.provider,
        model: resolved.model,
        rawModel: resolved.rawModel,
        toolCalling: supportsTools ?? heuristicToolCalling(lookupKey),
        reasoning: supportsThinking ?? heuristicReasoning(lookupKey),
        supportsThinking,
        supportsTools,
        supportsVision,
        supportsMaxTokens: heuristicMaxTokens(lookupKey),
        attachment,
        structuredOutput: synced?.structured_output ?? null,
        temperature: synced?.temperature ?? null,
        contextWindow,
        maxInputTokens: (()=>{
            // Input cap is input-only. An explicit `max_input_tokens` override wins;
            // otherwise fall back to the existing per-source input limits, then to the
            // total window. The effective cap can never exceed the total window
            // (input + output), so clamp it — but never double-count a requested
            // output against this input cap.
            const candidate = maxInputOverride ?? (typeof registryModel?.maxInputTokens === "number" ? registryModel.maxInputTokens : null) ?? authoritativeContextWindow ?? synced?.limit_input ?? contextWindow;
            return candidate !== null && contextWindow !== null ? Math.min(candidate, contextWindow) : candidate;
        })(),
        maxOutputTokens: maxTokenOverride ?? synced?.limit_output ?? (typeof registryModel?.maxOutputTokens === "number" ? registryModel.maxOutputTokens : null) ?? spec?.maxOutputTokens ?? null,
        defaultThinkingBudget: spec?.defaultThinkingBudget ?? 0,
        thinkingBudgetCap: spec?.thinkingBudgetCap ?? null,
        thinkingOverhead: spec?.thinkingOverhead ?? null,
        adaptiveMaxTokens: spec?.adaptiveMaxTokens ?? null,
        family: synced?.family ?? null,
        status: synced?.status ?? null,
        openWeights: synced?.open_weights ?? null,
        knowledgeCutoff: synced?.knowledge_cutoff ?? null,
        releaseDate: synced?.release_date ?? null,
        lastUpdated: synced?.last_updated ?? null,
        modalitiesInput,
        modalitiesOutput,
        interleavedField: synced?.interleaved_field ?? (typeof registryModel?.interleavedField === "string" ? registryModel.interleavedField : null)
    };
}
function resolveInputTokenCapForGate(input, { isCombo = false } = {}) {
    const resolved = resolveCapabilityInput(input);
    // 1. An explicit `max_input_tokens` override always wins and is never bypassed.
    const explicitInputOverride = getInputTokenCapabilityOverride(resolved);
    if (explicitInputOverride !== null) return explicitInputOverride;
    // 2. Combo rescue: an exact persisted context override supersedes the smaller
    //    catalog/client input hint (mirrors contextOverrideGate.evaluateContextLimit).
    if (isCombo) {
        const contextOverride = getContextOverride(resolved);
        if (contextOverride !== null) return contextOverride;
    }
    // 3. Canonical chain (already clamped to the total window by the resolver).
    return getResolvedModelCapabilities(input).maxInputTokens;
}
function supportsToolCalling(input) {
    if (typeof input === "string" && !String(input || "").trim()) return false;
    return getResolvedModelCapabilities(input).toolCalling;
}
function supportsReasoning(input) {
    if (typeof input === "string" && !String(input || "").trim()) return true;
    return getResolvedModelCapabilities(input).reasoning;
}
function supportsMaxTokens(input) {
    if (typeof input === "string" && !String(input || "").trim()) return true;
    return getResolvedModelCapabilities(input).supportsMaxTokens;
}
function capMaxOutputTokens(input, requested) {
    const cap = getResolvedModelCapabilities(input).maxOutputTokens;
    const hasRequested = typeof requested === "number" && Number.isFinite(requested);
    if (cap === null) return hasRequested ? requested : null;
    return hasRequested ? Math.min(requested, cap) : cap;
}
function getDefaultThinkingBudget(input) {
    return getResolvedModelCapabilities(input).defaultThinkingBudget;
}
function capThinkingBudget(input, budget) {
    const resolved = getResolvedModelCapabilities(input);
    let cap = resolved.thinkingBudgetCap;
    const modelId = resolved.model ?? resolved.rawModel ?? "";
    const modelLower = modelId.toLowerCase();
    // Learned-cap lookup needs a concrete provider key (the executor records under
    // `this.provider`). When the input is a bare Gemini id, `resolved.provider` is
    // null — but bare Gemini ids always route to the native Gemini provider, so
    // default to "gemini". Without this a cap learned via the executor would be
    // invisible to bare-model callers. Provider-qualified inputs keep their own
    // provider, preserving per-provider independence.
    const providerForLearned = resolved.provider ?? (modelLower.includes("gemini") ? "gemini" : null);
    const learned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLearnedThinkingCap"])(providerForLearned, modelId);
    if (learned !== null) {
        cap = cap === null ? learned : Math.min(cap, learned);
    }
    if (cap === null && modelLower.includes("gemini")) {
        cap = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GEMINI_FALLBACK_THINKING_CAP"];
    }
    return Math.min(budget, cap ?? budget);
}
function getModelContextLimit(providerOrInput, modelId) {
    const resolved = typeof providerOrInput === "string" && modelId !== undefined ? getResolvedModelCapabilities({
        provider: providerOrInput,
        model: modelId
    }) : getResolvedModelCapabilities(providerOrInput);
    return resolved.contextWindow;
}
}),
"[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tagRouter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/openRouterPreset.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [instrumentation] (ecmascript)");
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
        const preset = provider === "openrouter" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOpenRouterPreset"])(normalized.preset) : null;
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
        const tags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeRoutingTags"])(normalized.tags);
        if (tags.length > 0) {
            normalized.tags = tags;
        } else {
            delete normalized.tags;
        }
    }
    if ("excludedModels" in normalized || "excluded_models" in normalized) {
        const excludedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeExcludedModelPatterns"])(normalized.excludedModels ?? normalized.excluded_models);
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
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isForbiddenCustomHeaderName"])(trimmedKey)) continue;
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
"[project]/src/lib/providers/claudeExtraUsage.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLAUDE_EXTRA_USAGE_ERROR_MESSAGE",
    ()=>CLAUDE_EXTRA_USAGE_ERROR_MESSAGE,
    "CLAUDE_EXTRA_USAGE_ERROR_SOURCE",
    ()=>CLAUDE_EXTRA_USAGE_ERROR_SOURCE,
    "buildClaudeExtraUsageConnectionUpdate",
    ()=>buildClaudeExtraUsageConnectionUpdate,
    "buildClaudeExtraUsageStateClearUpdate",
    ()=>buildClaudeExtraUsageStateClearUpdate,
    "isClaudeExtraUsageBlockEnabled",
    ()=>isClaudeExtraUsageBlockEnabled,
    "isClaudeExtraUsageQueued",
    ()=>isClaudeExtraUsageQueued,
    "isClaudeExtraUsageState",
    ()=>isClaudeExtraUsageState,
    "resolveClaudeExtraUsageResetAt",
    ()=>resolveClaudeExtraUsageResetAt
]);
const EXTRA_USAGE_FALLBACK_BLOCK_MS = 5 * 60 * 1000;
const SESSION_RESET_WINDOW_KEYS = [
    "session (5h)",
    "session",
    "five_hour"
];
const CLAUDE_EXTRA_USAGE_ERROR_SOURCE = "extra_usage";
const CLAUDE_EXTRA_USAGE_ERROR_MESSAGE = "Claude extra usage was detected and blocked by this connection policy.";
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrNull(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function toFutureIso(value) {
    const raw = toStringOrNull(value);
    if (!raw) return null;
    const ms = new Date(raw).getTime();
    if (!Number.isFinite(ms) || ms <= Date.now()) return null;
    return raw;
}
function isClaudeExtraUsageBlockEnabled(provider, providerSpecificData) {
    if (provider !== "claude") return false;
    return asRecord(providerSpecificData).blockExtraUsage !== false;
}
function isClaudeExtraUsageQueued(usage) {
    return asRecord(asRecord(usage).extraUsage).queued === true;
}
function isClaudeExtraUsageState(connection) {
    return toStringOrNull(connection.lastErrorSource) === CLAUDE_EXTRA_USAGE_ERROR_SOURCE;
}
function resolveClaudeExtraUsageResetAt(usage) {
    const quotas = asRecord(asRecord(usage).quotas);
    for (const key of SESSION_RESET_WINDOW_KEYS){
        const resetAt = toFutureIso(asRecord(quotas[key]).resetAt);
        if (resetAt) return resetAt;
    }
    let earliest = null;
    let earliestMs = Number.POSITIVE_INFINITY;
    for (const quota of Object.values(quotas)){
        const resetAt = toFutureIso(asRecord(quota).resetAt);
        if (!resetAt) continue;
        const ms = new Date(resetAt).getTime();
        if (ms < earliestMs) {
            earliest = resetAt;
            earliestMs = ms;
        }
    }
    return earliest;
}
function hasClaudeUsageSnapshot(usage) {
    const record = asRecord(usage);
    return Object.prototype.hasOwnProperty.call(record, "extraUsage") || !!record.quotas;
}
function buildClearUpdate() {
    return {
        testStatus: "active",
        lastError: null,
        lastErrorAt: null,
        lastErrorType: null,
        lastErrorSource: null,
        errorCode: null,
        rateLimitedUntil: null,
        backoffLevel: 0
    };
}
function buildClaudeExtraUsageStateClearUpdate(connection) {
    return isClaudeExtraUsageState(connection) ? buildClearUpdate() : null;
}
function buildClaudeExtraUsageConnectionUpdate(connection, usage) {
    if (connection.provider !== "claude" || !hasClaudeUsageSnapshot(usage)) {
        return null;
    }
    const snapshot = asRecord(usage);
    const blockingEnabled = isClaudeExtraUsageBlockEnabled(connection.provider, connection.providerSpecificData);
    const currentIsExtraUsageState = isClaudeExtraUsageState(connection);
    if (!blockingEnabled) {
        return buildClaudeExtraUsageStateClearUpdate(connection);
    }
    if (!isClaudeExtraUsageQueued(snapshot)) {
        return buildClaudeExtraUsageStateClearUpdate(connection);
    }
    const rateLimitedUntil = resolveClaudeExtraUsageResetAt(snapshot) || new Date(Date.now() + EXTRA_USAGE_FALLBACK_BLOCK_MS).toISOString();
    if (currentIsExtraUsageState && toStringOrNull(connection.rateLimitedUntil) === rateLimitedUntil && toStringOrNull(connection.testStatus) === "unavailable" && toStringOrNull(connection.lastErrorType) === "quota_exhausted") {
        return null;
    }
    return {
        testStatus: "unavailable",
        lastError: CLAUDE_EXTRA_USAGE_ERROR_MESSAGE,
        lastErrorAt: new Date().toISOString(),
        lastErrorType: "quota_exhausted",
        lastErrorSource: CLAUDE_EXTRA_USAGE_ERROR_SOURCE,
        errorCode: 429,
        rateLimitedUntil,
        backoffLevel: Math.max(1, Number(connection.backoffLevel) || 0)
    };
}
}),
"[project]/src/lib/providers/validation/urlHelpers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GEMINI_LIKE_FORMATS",
    ()=>GEMINI_LIKE_FORMATS,
    "OPENAI_LIKE_FORMATS",
    ()=>OPENAI_LIKE_FORMATS,
    "addModelsSuffix",
    ()=>addModelsSuffix,
    "normalizeAnthropicBaseUrl",
    ()=>normalizeAnthropicBaseUrl,
    "normalizeAzureOpenAIBaseUrl",
    ()=>normalizeAzureOpenAIBaseUrl,
    "normalizeBaseUrl",
    ()=>normalizeBaseUrl,
    "normalizeClaudeCodeCompatibleBaseUrl",
    ()=>normalizeClaudeCodeCompatibleBaseUrl,
    "normalizeDatabricksChatUrl",
    ()=>normalizeDatabricksChatUrl,
    "normalizeGigachatChatUrl",
    ()=>normalizeGigachatChatUrl,
    "normalizeHerokuChatUrl",
    ()=>normalizeHerokuChatUrl,
    "normalizeSnowflakeChatUrl",
    ()=>normalizeSnowflakeChatUrl,
    "resolveBaseUrl",
    ()=>resolveBaseUrl,
    "resolveChatUrl",
    ()=>resolveChatUrl
]);
// URL/format normalizers for provider key validation. Pure string helpers extracted from
// validation.ts (god-file decomposition): no I/O, no side effects — they only shape base URLs
// and chat endpoints per provider format. Behavior is byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const OPENAI_LIKE_FORMATS = new Set([
    "openai",
    "openai-responses"
]);
const GEMINI_LIKE_FORMATS = new Set([
    "gemini"
]);
function normalizeBaseUrl(baseUrl) {
    // Guard against a non-string baseUrl reaching .trim() / .replace() — see #2463
    // where NVIDIA NIM validation surfaced as `e.startsWith is not a function`
    // after the bundler renamed `baseUrl` to `e`. Any malformed providerSpecificData
    // (e.g. saved as object from a UI bug) would otherwise crash mid-validation.
    const value = typeof baseUrl === "string" ? baseUrl : "";
    return value.trim().replace(/\/$/, "");
}
function normalizeAzureOpenAIBaseUrl(baseUrl) {
    return normalizeBaseUrl(baseUrl).replace(/\/openai$/i, "").replace(/\/openai\/deployments\/[^/]+\/chat\/completions.*$/i, "");
}
function normalizeAnthropicBaseUrl(baseUrl) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["stripAnthropicMessagesSuffix"])(baseUrl || "");
}
function normalizeClaudeCodeCompatibleBaseUrl(baseUrl) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["stripClaudeCodeCompatibleEndpointSuffix"])(baseUrl || "");
}
function addModelsSuffix(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    // Endpoint URLs can carry request-only query flags (for example Kimi Code's
    // `/messages?beta=true`). A models probe targets a sibling path, so preserve
    // only the URL before the query/hash before replacing the endpoint suffix.
    const separatorIndex = normalized.search(/[?#]/);
    const endpoint = separatorIndex === -1 ? normalized : normalized.slice(0, separatorIndex);
    const suffixes = [
        "/chat/completions",
        "/responses",
        "/chat",
        "/messages"
    ];
    if (endpoint.endsWith("/models")) {
        return endpoint;
    }
    for (const suffix of suffixes){
        if (endpoint.endsWith(suffix)) {
            return `${endpoint.slice(0, -suffix.length)}/models`;
        }
    }
    return `${endpoint}/models`;
}
function resolveBaseUrl(entry, providerSpecificData = {}) {
    if (providerSpecificData?.baseUrl) return normalizeBaseUrl(providerSpecificData.baseUrl);
    if (entry?.baseUrl) return normalizeBaseUrl(entry.baseUrl);
    return "";
}
function resolveChatUrl(provider, baseUrl, providerSpecificData = {}) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(provider)) {
        if (providerSpecificData?.chatPath) {
            return `${normalized}${providerSpecificData.chatPath}`;
        }
        if (providerSpecificData?.apiType === "responses") {
            return `${normalized}/responses`;
        }
        return `${normalized}/chat/completions`;
    }
    if (normalized.endsWith("/chat/completions") || normalized.endsWith("/responses") || normalized.endsWith("/chat")) {
        return normalized;
    }
    if (normalized.endsWith("/v1")) {
        return `${normalized}/chat/completions`;
    }
    return normalized;
}
function normalizeHerokuChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    return normalized.endsWith("/v1/chat/completions") ? normalized : `${normalized}/v1/chat/completions`;
}
function normalizeDatabricksChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    return normalized.endsWith("/chat/completions") ? normalized : `${normalized}/chat/completions`;
}
function normalizeSnowflakeChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl).replace(/\/cortex\/inference:complete$/, "").replace(/\/api\/v2$/, "");
    if (!normalized) return "";
    return `${normalized}/api/v2/cortex/inference:complete`;
}
function normalizeGigachatChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl).replace(/\/chat\/completions$/, "");
    if (!normalized) return "";
    return `${normalized}/chat/completions`;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/webCookieAuth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildGrokCookieHeader",
    ()=>buildGrokCookieHeader,
    "buildQwenCookieHeader",
    ()=>buildQwenCookieHeader,
    "extractCookieValue",
    ()=>extractCookieValue,
    "extractKimiAccessToken",
    ()=>extractKimiAccessToken,
    "extractKimiJwt",
    ()=>extractKimiJwt,
    "extractQwenToken",
    ()=>extractQwenToken,
    "normalizeSessionCookieHeader",
    ()=>normalizeSessionCookieHeader,
    "normalizeSessionCookieHeaders",
    ()=>normalizeSessionCookieHeaders,
    "stripCookieInputPrefix",
    ()=>stripCookieInputPrefix
]);
function stripCookieInputPrefix(rawValue) {
    const trimmed = (rawValue || "").trim();
    if (!trimmed) return "";
    const withoutBearer = trimmed.replace(/^bearer\s+/i, "");
    return withoutBearer.replace(/^cookie:/i, "").trim();
}
function normalizeSessionCookieHeader(rawValue, defaultCookieName) {
    const normalized = stripCookieInputPrefix(rawValue);
    if (!normalized) return "";
    if (normalized.includes("=")) {
        return normalized;
    }
    return `${defaultCookieName}=${normalized}`;
}
function extractCookieValue(rawValue, cookieName) {
    const trimmed = stripCookieInputPrefix(rawValue);
    if (!trimmed) return "";
    if (trimmed.includes(";")) {
        const escaped = cookieName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = trimmed.match(new RegExp("(?:^|;\\s*)" + escaped + "=([^;\\s]+)"));
        return match ? match[1] : "";
    }
    const prefix = `${cookieName}=`;
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
    return trimmed;
}
function buildGrokCookieHeader(rawValue) {
    const sso = extractCookieValue(rawValue, "sso");
    if (!sso) return "";
    const parts = [
        `sso=${sso}`
    ];
    for (const name of [
        "sso-rw",
        "cf_clearance",
        "__cf_bm"
    ]){
        if (new RegExp("(?:^|;\\s*)" + name + "=").test(rawValue)) {
            const value = extractCookieValue(rawValue, name);
            if (value) parts.push(`${name}=${value}`);
        }
    }
    return parts.join("; ");
}
function buildQwenCookieHeader(rawValue) {
    const trimmed = stripCookieInputPrefix(rawValue);
    if (!trimmed || !trimmed.includes("=")) return "";
    return trimmed;
}
function extractQwenToken(rawValue) {
    const trimmed = stripCookieInputPrefix(rawValue);
    if (!trimmed) return "";
    if (!trimmed.includes("=")) return trimmed;
    const match = trimmed.match(/(?:^|;\s*)token=([^;\s]+)/);
    return match ? match[1] : "";
}
function extractKimiAccessToken(rawValue) {
    const raw = String(rawValue ?? "").trim();
    if (!raw) return "";
    const bearer = raw.match(/^(?:authorization:\s*)?bearer\s+([^;\s]+)/i);
    if (bearer) return bearer[1];
    const trimmed = stripCookieInputPrefix(raw);
    for (const key of [
        "access_token",
        "kimi-auth"
    ]){
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = trimmed.match(new RegExp(`(?:^|[\\s;])${escaped}=([^;\\s]+)`));
        if (match) return match[1];
    }
    return !trimmed.includes("=") && !trimmed.includes(";") ? trimmed : "";
}
function extractKimiJwt(rawValue) {
    return extractKimiAccessToken(rawValue);
}
function normalizeSessionCookieHeaders(rawValues, defaultCookieName) {
    const seen = new Set();
    const normalizedHeaders = [];
    for (const rawValue of rawValues){
        if (typeof rawValue !== "string") continue;
        const normalized = normalizeSessionCookieHeader(rawValue, defaultCookieName);
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        normalizedHeaders.push(normalized);
    }
    return normalizedHeaders;
}
}),
"[project]/src/lib/providers/codexFastTier.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_FAST_TIER_DEFAULT_SUPPORTED_MODELS",
    ()=>CODEX_FAST_TIER_DEFAULT_SUPPORTED_MODELS,
    "applyCodexGlobalFastServiceTier",
    ()=>applyCodexGlobalFastServiceTier,
    "getCodexConnectionServiceTier",
    ()=>getCodexConnectionServiceTier,
    "getCodexEffectiveFastServiceTier",
    ()=>getCodexEffectiveFastServiceTier,
    "getCodexEffectiveServiceTier",
    ()=>getCodexEffectiveServiceTier,
    "getCodexGlobalServiceMode",
    ()=>getCodexGlobalServiceMode,
    "isCodexGlobalFastServiceTierEnabled",
    ()=>isCodexGlobalFastServiceTierEnabled,
    "resolveCodexGlobalFastServiceTier",
    ()=>resolveCodexGlobalFastServiceTier
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
const CODEX_FAST_TIER_DEFAULT_SUPPORTED_MODELS = [
    "gpt-5.6-sol",
    "gpt-5.6-terra",
    "gpt-5.6-luna",
    "gpt-5.5"
];
function resolveCodexGlobalFastServiceTier(settings) {
    const record = asRecord(settings);
    const raw = record.codexServiceTier;
    let enabled = false;
    let tier = "priority";
    let supportedModels = CODEX_FAST_TIER_DEFAULT_SUPPORTED_MODELS;
    if (typeof raw === "boolean") {
        enabled = raw;
    } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        const obj = raw;
        if (obj.enabled === true) enabled = true;
        if (typeof obj.tier === "string") {
            const t = obj.tier.trim().toLowerCase();
            if (t === "default" || t === "priority" || t === "flex") {
                tier = t;
            }
        }
        if (Array.isArray(obj.supportedModels)) {
            const list = obj.supportedModels.filter((m)=>typeof m === "string").map((m)=>m.trim()).filter((m)=>m.length > 0);
            if (list.length > 0) supportedModels = list;
        }
    } else if (record.codexFastServiceTier === true) {
        enabled = true;
    }
    return {
        enabled,
        tier,
        supportedModels
    };
}
function isCodexGlobalFastServiceTierEnabled(settings) {
    const resolved = resolveCodexGlobalFastServiceTier(settings);
    return resolved.enabled && resolved.tier !== "default";
}
function getCodexGlobalServiceMode(settings) {
    const resolved = resolveCodexGlobalFastServiceTier(settings);
    return resolved.enabled ? resolved.tier : "none";
}
function getCodexConnectionServiceTier(providerSpecificData) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexRequestDefaults"])(providerSpecificData).serviceTier ?? "default";
}
function getCodexEffectiveServiceTier(providerSpecificData, globalServiceMode) {
    // Dashboard global modes are explicit overrides; use "none" to preserve the
    // per-connection requestDefaults.serviceTier value.
    if (globalServiceMode === true) return "priority";
    if (globalServiceMode && globalServiceMode !== "none") {
        return globalServiceMode;
    }
    return getCodexConnectionServiceTier(providerSpecificData);
}
function getCodexEffectiveFastServiceTier(providerSpecificData, globalFastServiceTierEnabled) {
    return getCodexEffectiveServiceTier(providerSpecificData, globalFastServiceTierEnabled) !== "default";
}
function modelMatchesSupportedList(model, supportedModels) {
    if (typeof model !== "string" || model.length === 0) return false;
    const normalizedModel = model.trim().toLowerCase().split("/").pop() || "";
    if (!normalizedModel) return false;
    for (const supported of supportedModels){
        const candidate = supported.trim().toLowerCase();
        if (!candidate) continue;
        if (normalizedModel === candidate || normalizedModel.startsWith(candidate)) {
            return true;
        }
    }
    return false;
}
function applyCodexGlobalFastServiceTier(provider, credentials, settings, options = {}) {
    if (provider !== "codex") return credentials;
    const resolved = resolveCodexGlobalFastServiceTier(settings);
    if (!resolved.enabled) return credentials;
    // Per-model gate for paid fast/flex modes. A global "default" mode intentionally
    // disables account-level overrides for every Codex model.
    if (resolved.tier !== "default" && options.model !== undefined) {
        if (!modelMatchesSupportedList(options.model, resolved.supportedModels)) {
            return credentials;
        }
    }
    if (!credentials || typeof credentials !== "object" || Array.isArray(credentials)) {
        return credentials;
    }
    const providerSpecificData = asRecord(credentials.providerSpecificData);
    const requestDefaults = asRecord(providerSpecificData.requestDefaults);
    const body = options.body;
    const rawBodyTier = body && typeof body === "object" ? body.service_tier : null;
    const normalizedBodyTier = typeof rawBodyTier === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeCodexServiceTier"])(rawBodyTier) : null;
    if (normalizedBodyTier) {
        if (body && typeof body === "object" && !Array.isArray(body)) {
            body.service_tier = normalizedBodyTier;
        }
        return credentials;
    }
    if (resolved.tier === "default") {
        const nextRequestDefaults = {
            ...requestDefaults
        };
        delete nextRequestDefaults.serviceTier;
        const nextProviderSpecificData = {
            ...providerSpecificData
        };
        if (Object.keys(nextRequestDefaults).length > 0) {
            nextProviderSpecificData.requestDefaults = nextRequestDefaults;
        } else {
            delete nextProviderSpecificData.requestDefaults;
        }
        return {
            ...credentials,
            providerSpecificData: nextProviderSpecificData
        };
    }
    if (body && typeof body === "object" && !Array.isArray(body)) {
        // Write the wire value directly to the outbound body when possible, so combo
        // request previews and logs show the same effective tier that the executor sends.
        // The executor also accepts requestDefaults.serviceTier for downstream accounting.
        body.service_tier = resolved.tier;
    }
    // Intentional precedence: body service_tier > global mode > connection defaults.
    // Use "none" globally if each account should keep its individual service-tier setting.
    return {
        ...credentials,
        providerSpecificData: {
            ...providerSpecificData,
            requestDefaults: {
                ...requestDefaults,
                serviceTier: resolved.tier
            }
        }
    };
}
}),
"[project]/src/lib/providers/claudeFastMode.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLAUDE_FAST_MODE_DEFAULT_MODELS",
    ()=>CLAUDE_FAST_MODE_DEFAULT_MODELS,
    "CPA_FORCE_FAST_MODE_HEADER",
    ()=>CPA_FORCE_FAST_MODE_HEADER,
    "getClaudeFastModeSupportedModels",
    ()=>getClaudeFastModeSupportedModels,
    "isClaudeFastModeEnabled",
    ()=>isClaudeFastModeEnabled,
    "shouldRequestClaudeFastMode",
    ()=>shouldRequestClaudeFastMode
]);
const CLAUDE_FAST_MODE_DEFAULT_MODELS = [
    "claude-fable-5",
    "claude-opus-5",
    "claude-opus-4-8",
    "claude-opus-4-7",
    "claude-opus-4-6"
];
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function asStringArray(value) {
    if (!Array.isArray(value)) return null;
    const out = [];
    for (const item of value){
        if (typeof item === "string" && item.trim().length > 0) out.push(item.trim());
    }
    return out;
}
function isClaudeFastModeEnabled(settings) {
    const record = asRecord(settings);
    const claudeFastMode = record.claudeFastMode;
    if (typeof claudeFastMode === "boolean") return claudeFastMode;
    const claudeFastModeRecord = asRecord(claudeFastMode);
    return claudeFastModeRecord.enabled === true;
}
function getClaudeFastModeSupportedModels(settings) {
    const record = asRecord(settings);
    const claudeFastMode = asRecord(record.claudeFastMode);
    const fromSettings = asStringArray(claudeFastMode.supportedModels);
    if (fromSettings && fromSettings.length > 0) return fromSettings;
    return [
        ...CLAUDE_FAST_MODE_DEFAULT_MODELS
    ];
}
function shouldRequestClaudeFastMode(settings, modelId) {
    if (!isClaudeFastModeEnabled(settings)) return false;
    if (typeof modelId !== "string" || modelId.length === 0) return false;
    const supported = getClaudeFastModeSupportedModels(settings);
    return supported.some((m)=>modelId === m || modelId.startsWith(`${m}-`));
}
const CPA_FORCE_FAST_MODE_HEADER = "X-CPA-Force-Fast-Mode";
}),
"[project]/src/lib/proxyHealth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__setProxyHealthTcpCheckForTesting",
    ()=>__setProxyHealthTcpCheckForTesting,
    "getAllProxyHealthStatuses",
    ()=>getAllProxyHealthStatuses,
    "getCachedProxyHealth",
    ()=>getCachedProxyHealth,
    "invalidateProxyHealth",
    ()=>invalidateProxyHealth,
    "isProxyReachable",
    ()=>isProxyReachable
]);
/**
 * T14: Proxy Fast-Fail — TCP health check with in-memory cache.
 *
 * When a configured HTTP/SOCKS5 proxy is unreachable, every request
 * through OmniRoute used to wait for the full PROXY_TIMEOUT_MS (30s)
 * before failing. This module detects dead proxies in <2s via a quick
 * TCP connection check, caching the result to avoid overhead per request.
 *
 * Ref: sub2api PR #1167 (fix: proxy-fast-fail)
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:net [external] (node:net, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFamily.ts [instrumentation] (ecmascript)");
;
;
// Configurable via env vars
const FAST_FAIL_TIMEOUT_MS = parseInt(process.env.PROXY_FAST_FAIL_TIMEOUT_MS ?? "2000", 10);
const HEALTH_CACHE_TTL_MS = parseInt(process.env.PROXY_HEALTH_CACHE_TTL_MS ?? "30000", 10);
const UNHEALTHY_CACHE_TTL_MS = parseInt(process.env.PROXY_HEALTH_UNHEALTHY_CACHE_TTL_MS ?? "2000", 10);
// In-memory cache: proxyUrl → health entry
const proxyHealthCache = new Map();
const proxyHealthInflight = new Map();
let tcpCheckImpl = tcpCheck;
async function isProxyReachable(proxyUrl, timeoutMs = FAST_FAIL_TIMEOUT_MS, cacheTtlMs = HEALTH_CACHE_TTL_MS) {
    const cached = proxyHealthCache.get(proxyUrl);
    if (cached && Date.now() - cached.checkedAt < cached.ttlMs) {
        return cached.healthy;
    }
    let url;
    try {
        url = new URL(proxyUrl);
    } catch  {
        // Malformed URL — treat as unreachable
        proxyHealthCache.set(proxyUrl, {
            healthy: false,
            checkedAt: Date.now(),
            ttlMs: cacheTtlMs
        });
        return false;
    }
    const host = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripIpv6Brackets"])(url.hostname);
    const port = parseInt(url.port || defaultPortForScheme(url.protocol), 10);
    if (!host || isNaN(port)) {
        proxyHealthCache.set(proxyUrl, {
            healthy: false,
            checkedAt: Date.now(),
            ttlMs: cacheTtlMs
        });
        return false;
    }
    const existingProbe = proxyHealthInflight.get(proxyUrl);
    if (existingProbe) {
        return existingProbe;
    }
    const probe = tcpCheckImpl(host, port, timeoutMs).then((healthy)=>{
        proxyHealthCache.set(proxyUrl, {
            healthy,
            checkedAt: Date.now(),
            ttlMs: healthy ? cacheTtlMs : Math.min(cacheTtlMs, UNHEALTHY_CACHE_TTL_MS)
        });
        return healthy;
    });
    proxyHealthInflight.set(proxyUrl, probe);
    try {
        return await probe;
    } finally{
        if (proxyHealthInflight.get(proxyUrl) === probe) {
            proxyHealthInflight.delete(proxyUrl);
        }
    }
}
function getCachedProxyHealth(proxyUrl) {
    const cached = proxyHealthCache.get(proxyUrl);
    if (!cached) return null;
    if (Date.now() - cached.checkedAt >= cached.ttlMs) return null; // stale
    return cached.healthy;
}
function invalidateProxyHealth(proxyUrl) {
    proxyHealthCache.delete(proxyUrl);
    proxyHealthInflight.delete(proxyUrl);
}
function getAllProxyHealthStatuses() {
    const now = Date.now();
    return [
        ...proxyHealthCache.entries()
    ].map(([proxyUrl, entry])=>({
            proxyUrl,
            healthy: entry.healthy,
            checkedAt: entry.checkedAt,
            stale: now - entry.checkedAt >= entry.ttlMs
        }));
}
// ─── Internals ────────────────────────────────────────────────────────────────
function defaultPortForScheme(protocol) {
    switch(protocol.replace(":", "").toLowerCase()){
        case "https":
            return "443";
        case "socks5":
        case "socks5h":
            return "1080";
        case "http":
        default:
            return "8080";
    }
}
function tcpCheck(host, port, timeoutMs) {
    return new Promise((resolve)=>{
        const socket = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["createConnection"])({
            host,
            port
        }, ()=>{
            socket.destroy();
            resolve(true);
        });
        socket.setTimeout(timeoutMs);
        socket.on("error", ()=>resolve(false));
        socket.on("timeout", ()=>{
            socket.destroy();
            resolve(false);
        });
    });
}
function __setProxyHealthTcpCheckForTesting(check) {
    tcpCheckImpl = check ?? tcpCheck;
}
}),
"[project]/src/lib/compliance/noLog.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isNoLog",
    ()=>isNoLog,
    "setNoLog",
    ()=>setNoLog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
// #2650: extracted from compliance/index.ts to break the
// callLogs.ts → compliance/index.ts → callLogs.ts cycle that deadlocks
// the bundled MCP server under Node.js 24's stricter ESM evaluation.
function getDb() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    } catch  {
        return null;
    }
}
const noLogKeys = new Set();
const noLogDbCache = new Map();
let noLogColumnVerified = false;
let hasNoLogColumn = false;
const NO_LOG_CACHE_TTL_MS = 30_000;
const noLogIdsFromEnv = (process.env.NO_LOG_API_KEY_IDS || "").split(",").map((value)=>value.trim()).filter(Boolean);
for (const id of noLogIdsFromEnv){
    noLogKeys.add(id);
}
function setNoLog(apiKeyId, noLog) {
    if (noLog) {
        noLogKeys.add(apiKeyId);
    } else {
        noLogKeys.delete(apiKeyId);
    }
    noLogDbCache.set(apiKeyId, {
        value: noLog,
        timestamp: Date.now()
    });
}
function ensureNoLogColumn(db) {
    if (noLogColumnVerified) {
        return hasNoLogColumn;
    }
    try {
        const columns = db.prepare("PRAGMA table_info(api_keys)").all();
        hasNoLogColumn = columns.some((column)=>column.name === "no_log");
    } catch  {
        hasNoLogColumn = false;
    }
    noLogColumnVerified = true;
    return hasNoLogColumn;
}
function readNoLogFromDb(apiKeyId) {
    const db = getDb();
    if (!db || !apiKeyId) return false;
    if (!ensureNoLogColumn(db)) return false;
    const cached = noLogDbCache.get(apiKeyId);
    if (cached && Date.now() - cached.timestamp < NO_LOG_CACHE_TTL_MS) {
        return cached.value;
    }
    try {
        const row = db.prepare("SELECT no_log FROM api_keys WHERE id = ?").get(apiKeyId);
        const value = Boolean(row && Number(row.no_log) === 1);
        noLogDbCache.set(apiKeyId, {
            value,
            timestamp: Date.now()
        });
        return value;
    } catch  {
        return false;
    }
}
function isNoLog(apiKeyId) {
    if (!apiKeyId) return false;
    if (noLogKeys.has(apiKeyId)) return true;
    const persistedNoLog = readNoLogFromDb(apiKeyId);
    if (persistedNoLog) {
        noLogKeys.add(apiKeyId);
    }
    return persistedNoLog;
}
}),
"[project]/src/lib/compliance/providerAudit.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractProviderWarnings",
    ()=>extractProviderWarnings,
    "getProviderAuditTarget",
    ()=>getProviderAuditTarget,
    "summarizeProviderConnectionForAudit",
    ()=>summarizeProviderConnectionForAudit
]);
const WARNING_PATTERNS = [
    /\[sanitizer\]/i,
    /prompt injection detected/i,
    /content(?:\s+has\s+been|\s+was)?\s+filtered/i,
    /safety filter/i,
    /policy violation/i
];
const WARNING_KEY_PATTERN = /warning/i;
const MAX_WARNING_HITS = 5;
const MAX_WARNING_DEPTH = 6;
const MAX_WARNING_LENGTH = 400;
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function truncateWarning(value) {
    const compact = value.replace(/\s+/g, " ").trim();
    return compact.length > MAX_WARNING_LENGTH ? `${compact.slice(0, MAX_WARNING_LENGTH)}...` : compact;
}
function matchesProviderWarning(value, keyHint) {
    if (!value) return false;
    if (WARNING_PATTERNS.some((pattern)=>pattern.test(value))) return true;
    return Boolean(keyHint && WARNING_KEY_PATTERN.test(keyHint));
}
function collectProviderWarnings(value, hits, keyHint, depth = 0) {
    if (hits.size >= MAX_WARNING_HITS || depth >= MAX_WARNING_DEPTH || value === null || value === undefined) {
        return;
    }
    if (typeof value === "string") {
        if (matchesProviderWarning(value, keyHint)) {
            hits.add(truncateWarning(value));
        }
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((item)=>collectProviderWarnings(item, hits, keyHint, depth + 1));
        return;
    }
    if (typeof value !== "object") {
        return;
    }
    for (const [key, entryValue] of Object.entries(value)){
        collectProviderWarnings(entryValue, hits, key, depth + 1);
        if (hits.size >= MAX_WARNING_HITS) {
            break;
        }
    }
}
function summarizeProviderConnectionForAudit(connection) {
    const record = toRecord(connection);
    if (Object.keys(record).length === 0) return null;
    const sanitized = {
        ...record
    };
    delete sanitized.apiKey;
    delete sanitized.accessToken;
    delete sanitized.refreshToken;
    delete sanitized.idToken;
    const providerSpecificData = toRecord(record.providerSpecificData);
    if (Object.keys(providerSpecificData).length > 0) {
        const sanitizedProviderSpecificData = {
            ...providerSpecificData
        };
        delete sanitizedProviderSpecificData.consoleApiKey;
        sanitized.providerSpecificData = sanitizedProviderSpecificData;
    }
    return sanitized;
}
function getProviderAuditTarget(connection) {
    const record = toRecord(connection);
    const provider = typeof record.provider === "string" ? record.provider : null;
    const name = typeof record.name === "string" ? record.name : null;
    const id = typeof record.id === "string" ? record.id : null;
    return [
        provider,
        name || id
    ].filter(Boolean).join(":") || "provider-connection";
}
function extractProviderWarnings(...payloads) {
    const hits = new Set();
    payloads.forEach((payload)=>collectProviderWarnings(payload, hits));
    return Array.from(hits);
}
}),
"[project]/src/lib/compliance/index.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanupExpiredLogs",
    ()=>cleanupExpiredLogs,
    "countAuditLog",
    ()=>countAuditLog,
    "getAuditLog",
    ()=>getAuditLog,
    "getAuditRequestContext",
    ()=>getAuditRequestContext,
    "getRetentionDays",
    ()=>getRetentionDays,
    "initAuditLog",
    ()=>initAuditLog,
    "logAuditEvent",
    ()=>logAuditEvent
]);
/**
 * Compliance Controls — T-43
 *
 * Implements compliance features:
 * - APP_LOG_RETENTION_DAYS / CALL_LOG_RETENTION_DAYS: automatic log cleanup
 * - noLog opt-out per API key
 * - audit_log table for administrative actions
 *
 * @module lib/compliance
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ipUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ipUtils.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/requestId.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$highLevelActions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audit/highLevelActions.ts [instrumentation] (ecmascript)");
// ─── No-Log Opt-Out ────────────────
// Moved to ./noLog.ts to break the callLogs → compliance → callLogs ESM cycle
// that deadlocks the bundled MCP server under Node.js 24 (#2650). Re-exported
// here so downstream callers that import from "../compliance" keep working.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/compliance/noLog.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
/** @returns {SqliteAdapter | null} */ function getDb() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    } catch  {
        return null;
    }
}
const AUDIT_LOG_REQUIRED_COLUMNS = {
    resource_type: "TEXT",
    status: "TEXT",
    request_id: "TEXT",
    metadata: "TEXT"
};
const SENSITIVE_AUDIT_KEYS = new Set([
    "apikey",
    "accesstoken",
    "refreshtoken",
    "idtoken",
    "authtoken",
    "jwttoken",
    "token",
    "secret",
    "password",
    "authorization",
    "cookie",
    "setcookie",
    "consoleapikey",
    "clientsecret"
]);
function normalizeAuditKey(key) {
    return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}
function isSensitiveAuditKey(key) {
    const normalized = normalizeAuditKey(key);
    if (!normalized) return false;
    if (SENSITIVE_AUDIT_KEYS.has(normalized)) return true;
    return normalized.endsWith("apikey") || normalized.endsWith("token") || normalized.endsWith("secret") || normalized.endsWith("password");
}
function sanitizeAuditValue(value) {
    if (Array.isArray(value)) {
        return value.map((item)=>sanitizeAuditValue(item));
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, nestedValue])=>[
                key,
                isSensitiveAuditKey(key) ? "[redacted]" : sanitizeAuditValue(nestedValue)
            ]));
    }
    return value;
}
function serializeAuditValue(value) {
    if (value === undefined || value === null || value === "") return null;
    const sanitizedValue = sanitizeAuditValue(value);
    if (typeof sanitizedValue === "string") {
        return sanitizedValue;
    }
    try {
        return JSON.stringify(sanitizedValue);
    } catch  {
        return String(sanitizedValue);
    }
}
function parseAuditValue(value) {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch  {
        return value;
    }
}
function ensureAuditLogSchema(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      action TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT 'system',
      target TEXT,
      details TEXT,
      ip_address TEXT,
      resource_type TEXT,
      status TEXT,
      request_id TEXT,
      metadata TEXT
    );
  `);
    let columns = [];
    try {
        columns = db.prepare("PRAGMA table_info(audit_log)").all();
    } catch  {
        columns = [];
    }
    const existingColumns = new Set(columns.map((column)=>column.name));
    for (const [columnName, columnType] of Object.entries(AUDIT_LOG_REQUIRED_COLUMNS)){
        if (existingColumns.has(columnName)) continue;
        try {
            db.exec(`ALTER TABLE audit_log ADD COLUMN ${columnName} ${columnType}`);
        } catch  {
        // Another worker may have upgraded the schema first. Ignore.
        }
    }
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
    CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor);
    CREATE INDEX IF NOT EXISTS idx_audit_resource_type ON audit_log(resource_type);
    CREATE INDEX IF NOT EXISTS idx_audit_status ON audit_log(status);
    CREATE INDEX IF NOT EXISTS idx_audit_request_id ON audit_log(request_id);
  `);
}
function buildAuditLogQuery(filter = {}) {
    const conditions = [];
    const params = [];
    const addLikeFilter = (column, value)=>{
        if (!value) return;
        conditions.push(`${column} LIKE ?`);
        params.push(`%${value}%`);
    };
    addLikeFilter("action", filter.action);
    addLikeFilter("actor", filter.actor);
    addLikeFilter("target", filter.target);
    addLikeFilter("resource_type", filter.resourceType);
    addLikeFilter("status", filter.status);
    addLikeFilter("request_id", filter.requestId);
    if (filter.from) {
        conditions.push("datetime(timestamp) >= datetime(?)");
        params.push(filter.from);
    }
    if (filter.to) {
        conditions.push("datetime(timestamp) <= datetime(?)");
        params.push(filter.to);
    }
    // B7: level=high filter — restrict to HIGH_LEVEL_ACTIONS via parameterized IN clause
    if (filter.levelFilter === "high" && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$highLevelActions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["HIGH_LEVEL_ACTIONS"].length > 0) {
        const placeholders = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$highLevelActions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["HIGH_LEVEL_ACTIONS"].map(()=>"?").join(", ");
        conditions.push(`action IN (${placeholders})`);
        // HIGH_LEVEL_ACTIONS is readonly — create a mutable copy for spread
        params.push(...Array.from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$highLevelActions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["HIGH_LEVEL_ACTIONS"]));
    }
    return {
        where: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
        params
    };
}
function normalizeAuditLogRow(row) {
    const details = parseAuditValue(row.details);
    const metadata = parseAuditValue(row.metadata);
    const resourceType = typeof row.resource_type === "string" ? row.resource_type : null;
    const requestId = typeof row.request_id === "string" ? row.request_id : null;
    const ip = typeof row.ip_address === "string" ? row.ip_address : null;
    const timestamp = typeof row.timestamp === "string" ? row.timestamp : new Date().toISOString();
    return {
        ...row,
        timestamp,
        createdAt: timestamp,
        details,
        metadata: metadata ?? (details && typeof details === "object" ? details : null),
        ip_address: ip,
        ip,
        resource_type: resourceType,
        resourceType,
        request_id: requestId,
        requestId,
        status: typeof row.status === "string" ? row.status : null
    };
}
function getAuditRequestContext(request) {
    return {
        ipAddress: request ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ipUtils$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getClientIpFromRequest"])(request) : null,
        requestId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRequestId"])() || request?.headers?.get?.("x-request-id") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateRequestId"])()
    };
}
function initAuditLog() {
    const db = getDb();
    if (!db) return;
    ensureAuditLogSchema(db);
}
function logAuditEvent(entry) {
    const db = getDb();
    if (!db) return;
    try {
        ensureAuditLogSchema(db);
        const createdAt = entry.createdAt || new Date().toISOString();
        const serializedDetails = serializeAuditValue(entry.details ?? entry.metadata);
        const metadataSource = entry.metadata !== undefined ? entry.metadata : entry.details && typeof entry.details === "object" ? entry.details : null;
        const stmt = db.prepare(`
      INSERT INTO audit_log (
        timestamp,
        action,
        actor,
        target,
        details,
        ip_address,
        resource_type,
        status,
        request_id,
        metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(createdAt, entry.action, entry.actor || "system", entry.target || null, serializedDetails, entry.ipAddress || null, entry.resourceType || null, entry.status || null, entry.requestId || null, serializeAuditValue(metadataSource));
    } catch  {
    // Silently fail — audit logging should never break the main flow
    }
}
function getAuditLog(filter = {}) {
    const db = getDb();
    if (!db) return [];
    ensureAuditLogSchema(db);
    const { where, params } = buildAuditLogQuery(filter);
    const limit = Number.isFinite(filter.limit) ? Math.max(1, Math.min(500, filter.limit || 100)) : 100;
    const offset = Number.isFinite(filter.offset) ? Math.max(0, filter.offset || 0) : 0;
    const rows = db.prepare(`SELECT * FROM audit_log ${where} ORDER BY timestamp DESC, id DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
    return rows.map((row)=>normalizeAuditLogRow(row));
}
function countAuditLog(filter = {}) {
    const db = getDb();
    if (!db) return 0;
    ensureAuditLogSchema(db);
    const { where, params } = buildAuditLogQuery(filter);
    const row = db.prepare(`SELECT COUNT(*) as count FROM audit_log ${where}`).get(...params);
    return Number(row?.count || 0);
}
;
function getRetentionDays() {
    return {
        app: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogRetentionDays"])(),
        call: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogRetentionDays"])()
    };
}
async function cleanupExpiredLogs() {
    const db = getDb();
    const appRetentionDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogRetentionDays"])();
    const callRetentionDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogRetentionDays"])();
    const callLogsMaxRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogsTableMaxRows"])();
    const proxyLogsMaxRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProxyLogsTableMaxRows"])();
    if (!db) {
        return {
            deletedUsage: 0,
            deletedCallLogs: 0,
            deletedProxyLogs: 0,
            deletedRequestDetailLogs: 0,
            deletedAuditLogs: 0,
            deletedMcpAuditLogs: 0,
            trimmedCallLogs: 0,
            trimmedProxyLogs: 0,
            appRetentionDays,
            callRetentionDays,
            callLogsMaxRows,
            proxyLogsMaxRows
        };
    }
    // #4354: retention precedence is explicit env override > dashboard DB setting > 7-day
    // default. Previously this path always used the env default (7d), silently overriding a
    // configured dashboard "Data Retention" (e.g. 90d) on every startup and trimming
    // usage_history before the dashboard-based runAutoCleanup() could run. We now honor the
    // dashboard retention per table when the operator did not set the env var, while still
    // letting an explicit env var win (and falling back to env for non-DB deployments).
    const callOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogRetentionDaysOverride"])();
    const appOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogRetentionDaysOverride"])();
    let dbRetention = null;
    try {
        const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getUserDatabaseSettings"])().retention;
        dbRetention = {
            usageHistory: r.usageHistory,
            callLogs: r.callLogs,
            mcpAudit: r.mcpAudit
        };
    } catch  {
    /* settings table unavailable (e.g. very early startup) — keep env fallback */ }
    const usageHistoryRetentionDays = callOverride ?? dbRetention?.usageHistory ?? callRetentionDays;
    const callLogRetentionDays = callOverride ?? dbRetention?.callLogs ?? callRetentionDays;
    const mcpAuditRetentionDays = appOverride ?? dbRetention?.mcpAudit ?? appRetentionDays;
    const day = 24 * 60 * 60 * 1000;
    const usageCutoff = new Date(Date.now() - usageHistoryRetentionDays * day).toISOString();
    const callCutoff = new Date(Date.now() - callLogRetentionDays * day).toISOString();
    const appCutoff = new Date(Date.now() - appRetentionDays * day).toISOString();
    const mcpCutoff = new Date(Date.now() - mcpAuditRetentionDays * day).toISOString();
    let deletedUsage = 0;
    let deletedCallLogs = 0;
    let deletedProxyLogs = 0;
    let deletedRequestDetailLogs = 0;
    let deletedAuditLogs = 0;
    let deletedMcpAuditLogs = 0;
    let trimmedCallLogs = 0;
    let trimmedProxyLogs = 0;
    try {
        const r1 = db.prepare("DELETE FROM usage_history WHERE timestamp < ?").run(usageCutoff);
        deletedUsage = r1.changes;
    } catch  {
    /* table may not exist */ }
    try {
        const { deleteCallLogsBefore } = await __turbopack_context__.A("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript, async loader)");
        const r2 = deleteCallLogsBefore(callCutoff);
        deletedCallLogs = r2.deletedRows;
    } catch  {
    /* table may not exist */ }
    try {
        const r3 = db.prepare("DELETE FROM proxy_logs WHERE timestamp < ?").run(callCutoff);
        deletedProxyLogs = r3.changes;
    } catch  {
    /* table may not exist */ }
    try {
        const r4 = db.prepare("DELETE FROM request_detail_logs WHERE timestamp < ?").run(callCutoff);
        deletedRequestDetailLogs = r4.changes;
    } catch  {
    /* legacy table may not exist */ }
    try {
        const r5 = db.prepare("DELETE FROM audit_log WHERE timestamp < ?").run(appCutoff);
        deletedAuditLogs = r5.changes;
    } catch  {
    /* table may not exist */ }
    try {
        const r6 = db.prepare("DELETE FROM mcp_tool_audit WHERE created_at < ?").run(mcpCutoff);
        deletedMcpAuditLogs = r6.changes;
    } catch  {
    /* table may not exist */ }
    // Enforce row count limits to prevent unbounded DB growth (batched to avoid long locks)
    const BATCH_SIZE = 5000;
    if (callLogsMaxRows > 0) {
        try {
            const { trimCallLogsToMaxRows } = await __turbopack_context__.A("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript, async loader)");
            const trimmed = trimCallLogsToMaxRows(callLogsMaxRows);
            trimmedCallLogs = trimmed.deletedRows;
        } catch  {
        /* best effort */ }
    }
    if (proxyLogsMaxRows > 0) {
        try {
            let currentProxyCount = db.prepare("SELECT COUNT(*) as cnt FROM proxy_logs").get();
            while(currentProxyCount.cnt > proxyLogsMaxRows){
                const toDelete = Math.min(currentProxyCount.cnt - proxyLogsMaxRows, BATCH_SIZE);
                const trimmed = db.prepare(`DELETE FROM proxy_logs WHERE id IN (
              SELECT id FROM proxy_logs ORDER BY timestamp ASC LIMIT ?
            )`).run(toDelete);
                trimmedProxyLogs += trimmed.changes;
                currentProxyCount.cnt -= trimmed.changes;
                if (trimmed.changes === 0) break;
            }
        } catch  {
        /* best effort */ }
    }
    logAuditEvent({
        action: "compliance.cleanup",
        actor: "system",
        target: "log-retention",
        resourceType: "maintenance",
        status: "success",
        details: {
            deletedUsage,
            deletedCallLogs,
            deletedProxyLogs,
            deletedRequestDetailLogs,
            deletedAuditLogs,
            deletedMcpAuditLogs,
            trimmedCallLogs,
            trimmedProxyLogs,
            appRetentionDays,
            callRetentionDays,
            callLogsMaxRows,
            proxyLogsMaxRows
        }
    });
    return {
        deletedUsage,
        deletedCallLogs,
        deletedProxyLogs,
        deletedRequestDetailLogs,
        deletedAuditLogs,
        deletedMcpAuditLogs,
        trimmedCallLogs,
        trimmedProxyLogs,
        appRetentionDays,
        callRetentionDays,
        callLogsMaxRows,
        proxyLogsMaxRows
    };
}
}),
"[project]/src/lib/pricingSync.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSyncedPricing",
    ()=>clearSyncedPricing,
    "fetchLiteLLMPricing",
    ()=>fetchLiteLLMPricing,
    "getSyncStatus",
    ()=>getSyncStatus,
    "getSyncedPricing",
    ()=>getSyncedPricing,
    "initPricingSync",
    ()=>initPricingSync,
    "saveSyncedPricing",
    ()=>saveSyncedPricing,
    "startPeriodicSync",
    ()=>startPeriodicSync,
    "stopPeriodicSync",
    ()=>stopPeriodicSync,
    "syncPricingFromSources",
    ()=>syncPricingFromSources,
    "transformToOmniRoute",
    ()=>transformToOmniRoute
]);
/**
 * pricingSync.ts — External pricing sync engine.
 *
 * Fetches pricing data from external sources (LiteLLM) and stores it
 * in a separate namespace (`pricing_synced`) so user overrides are
 * never touched.
 *
 * Resolution order: user overrides > synced external > hardcoded defaults
 *
 * Opt-in via PRICING_SYNC_ENABLED=true (default: false).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
;
;
;
// ─── Configuration ───────────────────────────────────────
const SUPPORTED_SOURCES = [
    "litellm"
];
const parsedInterval = parseInt(process.env.PRICING_SYNC_INTERVAL || "86400", 10);
const SYNC_INTERVAL_MS = Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval * 1000 : 86400 * 1000;
const SYNC_SOURCES = (process.env.PRICING_SYNC_SOURCES || "litellm").split(",").map((s)=>s.trim()).filter((s)=>SUPPORTED_SOURCES.includes(s));
const LITELLM_PRICING_URL = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
// ─── Provider mapping: LiteLLM provider → OmniRoute aliases ─────
const LITELLM_PROVIDER_MAP = {
    openai: [
        "openai",
        "cx"
    ],
    anthropic: [
        "anthropic",
        "cc"
    ],
    vertex_ai: [
        "gemini"
    ],
    "vertex_ai-anthropic_models": [
        "anthropic"
    ],
    google: [
        "gemini"
    ],
    deepseek: [
        "if"
    ],
    groq: [
        "groq"
    ],
    together_ai: [
        "openrouter"
    ],
    bedrock: [
        "kiro"
    ],
    fireworks_ai: [
        "fireworks"
    ],
    cerebras: [
        "cerebras"
    ],
    nvidia_nim: [
        "nvidia"
    ],
    siliconflow: [
        "siliconflow"
    ],
    "vertex_ai-language_models": [
        "gemini"
    ],
    "vertex_ai-mistral_models": [
        "mistral"
    ],
    gemini: [
        "gemini"
    ],
    bedrock_converse: [
        "kiro"
    ],
    cloudflare: [
        "cloudflare-ai"
    ],
    stability: [
        "stability-ai"
    ]
};
// ─── Periodic sync state ─────────────────────────────────
let syncTimer = null;
let lastSyncTime = null;
let lastSyncModelCount = 0;
let activeSyncIntervalMs = SYNC_INTERVAL_MS;
async function fetchLiteLLMPricing() {
    const response = await fetch(LITELLM_PRICING_URL, {
        signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) {
        throw new Error(`LiteLLM fetch failed [${response.status}]: ${response.statusText}`);
    }
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch  {
        throw new Error(`LiteLLM returned invalid JSON (${text.slice(0, 100)}...)`);
    }
}
function transformToOmniRoute(raw) {
    const result = {};
    for (const [modelKey, info] of Object.entries(raw)){
        const NON_TOKEN_FIELDS = [
            "input_cost_per_second",
            "output_cost_per_second",
            "input_cost_per_image",
            "output_cost_per_image",
            "input_cost_per_pixel",
            "output_cost_per_pixel",
            "input_cost_per_character",
            "output_cost_per_character",
            "input_cost_per_video_per_second",
            "output_cost_per_video_per_second",
            "search_unit_cost",
            "ocr_cost_per_page"
        ];
        const hasToken = info.input_cost_per_token != null || info.output_cost_per_token != null;
        const hasNonToken = NON_TOKEN_FIELDS.some((f)=>info[f] != null);
        if (!hasToken && !hasNonToken) continue;
        const inputCost = (info.input_cost_per_token || 0) * 1_000_000;
        const outputCost = (info.output_cost_per_token || 0) * 1_000_000;
        const entry = {
            input: Math.round(inputCost * 1000) / 1000,
            output: Math.round(outputCost * 1000) / 1000
        };
        if (info.mode) entry.mode = info.mode;
        if (info.cache_read_input_token_cost != null) {
            entry.cached = Math.round(info.cache_read_input_token_cost * 1_000_000 * 1000) / 1000;
        }
        if (info.cache_creation_input_token_cost != null) {
            entry.cache_creation = Math.round(info.cache_creation_input_token_cost * 1_000_000 * 1000) / 1000;
        }
        for (const f of NON_TOKEN_FIELDS){
            const v = info[f];
            if (typeof v === "number" && Number.isFinite(v)) entry[f] = v;
        }
        // Extract model name (strip provider prefix from key)
        // LiteLLM keys look like: "openai/gpt-4o", "anthropic/claude-3-opus"
        const slashIdx = modelKey.indexOf("/");
        const modelName = slashIdx >= 0 ? modelKey.slice(slashIdx + 1) : modelKey;
        // Map to OmniRoute providers
        const litellmProvider = info.litellm_provider || "";
        const omniRouteProviders = LITELLM_PROVIDER_MAP[litellmProvider];
        if (omniRouteProviders) {
            for (const provider of omniRouteProviders){
                if (!result[provider]) result[provider] = {};
                result[provider][modelName] = entry;
            }
        } else if (litellmProvider) {
            // Use litellm_provider as-is for unknown providers
            if (!result[litellmProvider]) result[litellmProvider] = {};
            result[litellmProvider][modelName] = entry;
        }
    }
    return result;
}
// ─── DB: Synced pricing namespace ────────────────────────
function toRecord(value) {
    return value && typeof value === "object" ? value : {};
}
function getSyncedPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'pricing_synced'").all();
    const synced = {};
    for (const row of rows){
        const record = toRecord(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null) continue;
        try {
            synced[key] = JSON.parse(rawValue);
        } catch  {
            console.warn(`[PRICING_SYNC] Corrupted data for provider "${key}", skipping`);
        }
    }
    return synced;
}
function saveSyncedPricing(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const del = db.prepare("DELETE FROM key_value WHERE namespace = 'pricing_synced'");
    const insert = db.prepare("INSERT INTO key_value (namespace, key, value) VALUES ('pricing_synced', ?, ?)");
    const tx = db.transaction(()=>{
        del.run();
        for (const [provider, models] of Object.entries(data)){
            insert.run(provider, JSON.stringify(models));
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function clearSyncedPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'pricing_synced'").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
// ─── DB: Sync status namespace ───────────────────────────
//
// Persisted separately from `pricing_synced` because Next.js standalone
// builds load this module from independent webpack chunks (e.g. the
// instrumentation hook vs an API route handler) — each gets its OWN
// top-level module state. Module-level vars (`lastSyncTime`,
// `lastSyncModelCount`) are therefore invisible across those instances;
// persisting them to the DB lets any instance read the real status.
const SYNC_STATUS_NAMESPACE = "pricing_sync_status";
const SYNC_STATUS_KEY = "last_sync";
function readPersistedSyncStatus() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(SYNC_STATUS_NAMESPACE, SYNC_STATUS_KEY);
    const record = toRecord(row);
    const rawValue = typeof record.value === "string" ? record.value : null;
    if (!rawValue) return null;
    try {
        const parsed = JSON.parse(rawValue);
        if (typeof parsed.lastSyncTime !== "string") return null;
        return {
            lastSyncTime: parsed.lastSyncTime,
            lastSyncModelCount: typeof parsed.lastSyncModelCount === "number" ? parsed.lastSyncModelCount : 0
        };
    } catch  {
        return null;
    }
}
function writePersistedSyncStatus(lastSync, modelCount) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT INTO key_value (namespace, key, value) VALUES (?, ?, ?) " + "ON CONFLICT(namespace, key) DO UPDATE SET value = excluded.value").run(SYNC_STATUS_NAMESPACE, SYNC_STATUS_KEY, JSON.stringify({
        lastSyncTime: lastSync,
        lastSyncModelCount: modelCount
    }));
}
async function syncPricingFromSources(opts) {
    const requestedSources = opts?.sources || SYNC_SOURCES;
    const dryRun = opts?.dryRun ?? false;
    // Validate sources
    const validSources = requestedSources.filter((s)=>SUPPORTED_SOURCES.includes(s));
    const invalidSources = requestedSources.filter((s)=>!SUPPORTED_SOURCES.includes(s));
    if (validSources.length === 0) {
        const supported = SUPPORTED_SOURCES.join(", ");
        return {
            success: false,
            modelCount: 0,
            providerCount: 0,
            source: requestedSources.join(","),
            dryRun,
            error: `No valid sources provided. Supported: ${supported}. Invalid: ${invalidSources.join(", ")}`
        };
    }
    try {
        const aggregated = {};
        for (const source of validSources){
            if (source === "litellm") {
                const raw = await fetchLiteLLMPricing();
                const transformed = transformToOmniRoute(raw);
                for (const [provider, models] of Object.entries(transformed)){
                    if (!aggregated[provider]) aggregated[provider] = {};
                    Object.assign(aggregated[provider], models);
                }
            }
        }
        const modelCount = Object.values(aggregated).reduce((sum, models)=>sum + Object.keys(models).length, 0);
        const providerCount = Object.keys(aggregated).length;
        if (!dryRun) {
            saveSyncedPricing(aggregated);
            lastSyncTime = new Date().toISOString();
            lastSyncModelCount = modelCount;
            writePersistedSyncStatus(lastSyncTime, modelCount);
        }
        return {
            success: true,
            modelCount,
            providerCount,
            source: validSources.join(","),
            dryRun,
            ...invalidSources.length > 0 ? {
                warnings: [
                    `Unknown sources ignored: ${invalidSources.join(", ")}`
                ]
            } : {},
            ...dryRun ? {
                data: aggregated
            } : {}
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn("[PRICING_SYNC] Sync failed:", message);
        return {
            success: false,
            modelCount: 0,
            providerCount: 0,
            source: requestedSources.join(","),
            dryRun,
            error: message
        };
    }
}
function startPeriodicSync(intervalMs) {
    if (syncTimer) return; // Already running
    const interval = intervalMs ?? SYNC_INTERVAL_MS;
    activeSyncIntervalMs = interval;
    console.log(`[PRICING_SYNC] Starting periodic sync every ${interval / 1000}s`);
    // Initial sync (non-blocking)
    syncPricingFromSources().then((result)=>{
        if (result.success) {
            console.log(`[PRICING_SYNC] Initial sync complete: ${result.modelCount} models from ${result.providerCount} providers`);
        }
    }).catch((err)=>{
        console.warn("[PRICING_SYNC] Initial sync error:", err instanceof Error ? err.message : err);
    });
    syncTimer = setInterval(()=>{
        syncPricingFromSources().then((result)=>{
            if (result.success) {
                console.log(`[PRICING_SYNC] Periodic sync complete: ${result.modelCount} models`);
            }
        }).catch((err)=>{
            console.warn("[PRICING_SYNC] Periodic sync error:", err instanceof Error ? err.message : err);
        });
    }, interval);
    if (syncTimer && typeof syncTimer === "object" && "unref" in syncTimer) {
        syncTimer.unref?.();
    }
}
function stopPeriodicSync() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
        console.log("[PRICING_SYNC] Periodic sync stopped");
    }
}
function getSyncStatus() {
    const enabled = process.env.PRICING_SYNC_ENABLED === "true";
    // `lastSyncTime`/`lastSyncModelCount` are only reliably populated on the
    // module instance that performed the sync (see note above
    // writePersistedSyncStatus) — fall back to the persisted DB record so
    // status reads from a different module instance still see it.
    const persisted = lastSyncTime === null ? readPersistedSyncStatus() : null;
    const effectiveLastSync = lastSyncTime ?? persisted?.lastSyncTime ?? null;
    const effectiveModelCount = lastSyncTime !== null ? lastSyncModelCount : persisted?.lastSyncModelCount ?? 0;
    return {
        enabled,
        lastSync: effectiveLastSync,
        lastSyncModelCount: effectiveModelCount,
        nextSync: enabled && effectiveLastSync ? new Date(new Date(effectiveLastSync).getTime() + activeSyncIntervalMs).toISOString() : null,
        intervalMs: activeSyncIntervalMs,
        sources: SYNC_SOURCES
    };
}
async function initPricingSync() {
    if (process.env.PRICING_SYNC_ENABLED !== "true") {
        console.log("[PRICING_SYNC] Disabled (set PRICING_SYNC_ENABLED=true to enable)");
        return;
    }
    startPeriodicSync();
}
}),
"[project]/src/lib/gamification/xp.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * XP/Level Engine for OmniRoute Gamification
 *
 * Pure functions for XP calculations, level progression, and reward definitions.
 * No side effects or DB calls — all stateful logic lives in the persistence layer.
 */ // ─── XP Curve ────────────────────────────────────────────────────────────────
/**
 * XP required for a specific level (delta, not cumulative).
 * Polynomial curve: `xp_for_level(n) = floor(100 * n^1.5)`
 *
 * @param level - Target level (must be >= 1)
 * @returns XP needed to gain this level (0 for level 1)
 *
 * @example
 * xpForLevel(1)  // 0
 * xpForLevel(10) // 3162
 * xpForLevel(50) // 35355
 */ __turbopack_context__.s([
    "XP_REWARDS",
    ()=>XP_REWARDS,
    "calculateLevel",
    ()=>calculateLevel,
    "cumulativeXpForLevel",
    ()=>cumulativeXpForLevel,
    "getLevelTier",
    ()=>getLevelTier,
    "getLevelTitle",
    ()=>getLevelTitle,
    "xpForLevel",
    ()=>xpForLevel,
    "xpToNextLevel",
    ()=>xpToNextLevel
]);
function xpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level, 1.5));
}
function cumulativeXpForLevel(level) {
    if (level <= 1) return 0;
    let total = 0;
    for(let i = 2; i <= level; i++){
        total += xpForLevel(i);
    }
    return total;
}
function calculateLevel(totalXp) {
    if (totalXp <= 0) return 1;
    return Math.max(1, Math.floor(Math.pow(totalXp * 2.5 / 100, 0.4)));
}
function xpToNextLevel(totalXp) {
    const currentLevel = calculateLevel(totalXp);
    const nextLevelXp = cumulativeXpForLevel(currentLevel + 1);
    return nextLevelXp - totalXp;
}
function getLevelTitle(level) {
    if (level >= 76) return "Legend";
    if (level >= 51) return "Master";
    if (level >= 26) return "Expert";
    if (level >= 11) return "Explorer";
    return "Beginner";
}
function getLevelTier(level) {
    if (level >= 76) return "diamond";
    if (level >= 51) return "platinum";
    if (level >= 26) return "gold";
    if (level >= 11) return "silver";
    return "bronze";
}
const XP_REWARDS = {
    /** Per API request routed through OmniRoute */ request: 1,
    /** Switching to a different provider */ provider_switch: 5,
    /** Switching to a different model */ model_switch: 3,
    /** Creating a new combo */ combo_create: 10,
    /** Using a combo for a request */ combo_use: 2,
    /** Per 1 000 tokens shared with another user */ token_share: 1,
    /** Redeeming an invite code */ invite_redeem: 50,
    /** Daily active usage (once per day) */ daily_login: 5,
    /** Per consecutive streak day (multiplied by streak length) */ streak_bonus: 2,
    /** Unlocking a badge */ badge_unlock: 10
};
}),
"[project]/src/lib/spend/batchWriter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SpendBatchWriter",
    ()=>SpendBatchWriter,
    "discardSpendBatchEntries",
    ()=>discardSpendBatchEntries,
    "flushSpendBatchWriter",
    ()=>flushSpendBatchWriter,
    "resetSpendBatchWriterForTests",
    ()=>resetSpendBatchWriterForTests,
    "spendBatchWriter",
    ()=>spendBatchWriter,
    "startSpendBatchWriter",
    ()=>startSpendBatchWriter,
    "stopSpendBatchWriter",
    ()=>stopSpendBatchWriter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/domainState.ts [instrumentation] (ecmascript)");
;
const DEFAULT_FLUSH_INTERVAL_MS = 60_000;
const DEFAULT_MAX_BUFFER_SIZE = 1_000;
function getFlushIntervalMs() {
    const parsed = Number.parseInt(process.env.OMNIROUTE_SPEND_FLUSH_INTERVAL_MS || "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_FLUSH_INTERVAL_MS;
}
function getMaxBufferSize() {
    const parsed = Number.parseInt(process.env.OMNIROUTE_SPEND_MAX_BUFFER_SIZE || "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_BUFFER_SIZE;
}
function normalizeEntry(entry) {
    if (!entry?.apiKeyId || !Number.isFinite(entry.cost) || entry.cost <= 0) return null;
    return {
        apiKeyId: entry.apiKeyId,
        cost: entry.cost,
        timestamp: Number.isFinite(entry.timestamp) ? entry.timestamp : Date.now()
    };
}
class SpendBatchWriter {
    buffer = [];
    inFlightEntries = [];
    discardedApiKeyIds = new Set();
    timer = null;
    started = false;
    flushPromise = null;
    persistEntries;
    logger;
    flushIntervalMs;
    maxBufferSize;
    constructor(options = {}){
        this.persistEntries = options.persistEntries || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["batchSaveCostEntries"];
        this.logger = options.logger || console;
        this.flushIntervalMs = options.flushIntervalMs ?? getFlushIntervalMs();
        this.maxBufferSize = options.maxBufferSize ?? getMaxBufferSize();
    }
    start() {
        if (this.started) return;
        this.started = true;
        this.timer = setInterval(()=>{
            void this.flush();
        }, this.flushIntervalMs);
        this.timer.unref?.();
    }
    increment(apiKeyId, cost, timestamp = Date.now()) {
        const entry = normalizeEntry({
            apiKeyId,
            cost,
            timestamp
        });
        if (!entry) return;
        this.start();
        this.discardedApiKeyIds.delete(entry.apiKeyId);
        this.buffer.push(entry);
        if (this.buffer.length >= this.maxBufferSize) {
            void this.flush();
        }
    }
    getBufferedEntries(apiKeyId, sinceTimestamp = 0, untilTimestamp = Number.POSITIVE_INFINITY) {
        const matchesWindow = (entry)=>entry.apiKeyId === apiKeyId && entry.timestamp >= sinceTimestamp && entry.timestamp < untilTimestamp;
        return [
            ...this.inFlightEntries,
            ...this.buffer
        ].filter(matchesWindow);
    }
    getPendingCostTotal(apiKeyId, sinceTimestamp = 0, untilTimestamp = Number.POSITIVE_INFINITY) {
        return this.getBufferedEntries(apiKeyId, sinceTimestamp, untilTimestamp).reduce((sum, entry)=>sum + entry.cost, 0);
    }
    discardEntries(apiKeyId) {
        this.discardedApiKeyIds.add(apiKeyId);
        this.buffer = this.buffer.filter((entry)=>entry.apiKeyId !== apiKeyId);
        this.inFlightEntries = this.inFlightEntries.filter((entry)=>entry.apiKeyId !== apiKeyId);
    }
    async flush() {
        if (this.flushPromise) {
            return this.flushPromise;
        }
        if (this.buffer.length === 0) {
            return {
                flushedEntries: 0,
                uniqueKeys: 0,
                requeued: false
            };
        }
        const entriesToFlush = [
            ...this.buffer
        ];
        this.buffer = [];
        this.inFlightEntries = entriesToFlush;
        this.flushPromise = (async ()=>{
            const entriesToPersist = entriesToFlush.filter((entry)=>!this.discardedApiKeyIds.has(entry.apiKeyId));
            const uniqueKeys = new Set(entriesToPersist.map((entry)=>entry.apiKeyId)).size;
            try {
                if (entriesToPersist.length > 0) {
                    await this.persistEntries(entriesToPersist);
                }
                this.logger.log(`[SpendWriter] Flushed ${entriesToPersist.length} cost entr${entriesToPersist.length === 1 ? "y" : "ies"} across ${uniqueKeys} key(s)`);
                return {
                    flushedEntries: entriesToPersist.length,
                    uniqueKeys,
                    requeued: false
                };
            } catch (error) {
                this.buffer = [
                    ...entriesToPersist,
                    ...this.buffer
                ];
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`[SpendWriter] Flush error: ${message}`);
                return {
                    flushedEntries: 0,
                    uniqueKeys,
                    requeued: true
                };
            } finally{
                this.inFlightEntries = [];
                this.flushPromise = null;
            }
        })();
        return this.flushPromise;
    }
    async stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.started = false;
        return this.flush();
    }
    resetForTests() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.started = false;
        this.buffer = [];
        this.inFlightEntries = [];
        this.discardedApiKeyIds.clear();
        this.flushPromise = null;
    }
}
const spendBatchWriter = new SpendBatchWriter();
function startSpendBatchWriter() {
    spendBatchWriter.start();
}
async function flushSpendBatchWriter() {
    return spendBatchWriter.flush();
}
async function stopSpendBatchWriter() {
    return spendBatchWriter.stop();
}
function resetSpendBatchWriterForTests() {
    spendBatchWriter.resetForTests();
}
function discardSpendBatchEntries(apiKeyId) {
    spendBatchWriter.discardEntries(apiKeyId);
}
}),
"[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
/**
 * localDb.js — Re-export layer for backward compatibility.
 *
 * All 27+ consumer files import from "@/lib/localDb".
 * This thin layer re-exports everything from the domain-specific DB modules,
 * so zero consumer changes are needed.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccrBlocks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccrBlocks.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCacheStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionCacheStats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCombos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionCombos.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionContextBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionContextBudget.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionRunTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionRunTelemetry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelContextOverrides.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$evals$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/evals.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricingSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pricingSync.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$skills$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/skills.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$registeredKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/registeredKeys.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelComboMappings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelComboMappings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$files$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/files.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$batches$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/batches.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningRoutingRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$autoCandidateOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/autoCandidateOverrides.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webhooks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webhooks.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webhookDeliveries$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webhookDeliveries.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$discoveryResults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/discoveryResults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaSnapshots.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/sessionAccountAffinity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaResetEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaResetEvents.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$versionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/versionManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$syncTokens$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/syncTokens.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$upstreamProxy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/upstreamProxy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerLimits.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$creditBalance$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/creditBalance.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionAnalytics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionAnalytics.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$oneproxy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/oneproxy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$gamification$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/gamification.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/featureFlags.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/contextHandoffs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$middleware$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/middleware.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyGroups$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeyGroups.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$relayProxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/relayProxies.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$freeProxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/freeProxies.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$playgroundPresets$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/playgroundPresets.ts [instrumentation] (ecmascript)");
// Plan 21 — Memory Engine Redesign
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/memoryVec.ts [instrumentation] (ecmascript)");
// T-A-F2: AgentBridge state/mappings/bypass + Inspector custom hosts/sessions
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeState.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeMappings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeMappings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeBypass$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeBypass.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorCustomHosts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/inspectorCustomHosts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/inspectorSessions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$omp$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/omp.ts [instrumentation] (ecmascript)");
// Quota Sharing — Group B (planos 16+22)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [instrumentation] (ecmascript)");
// Quota per-(key, model) caps — Group B Fase 3 #7
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaModelCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaModelCaps.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaGroups.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaConsumption.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerPlans$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerPlans.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$tokenLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/tokenLimits.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/plugins.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyContextSources$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeyContextSources.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$localCorpus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/localCorpus.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageSummary$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/usageSummary.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelIntelligence$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelIntelligence.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$callLogStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/callLogStats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/usageAnalytics.ts [instrumentation] (ecmascript) <locals>");
// ---------------------------------------------------------------------------
// usage_logs — auto-routing analytics (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/usageLogs.ts [instrumentation] (ecmascript)");
// ---------------------------------------------------------------------------
// semantic_cache — cache entries CRUD (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/semanticCache.ts [instrumentation] (ecmascript)");
// ---------------------------------------------------------------------------
// proxy_logs — export query (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxyLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxyLogs.ts [instrumentation] (ecmascript)");
// Provider param filters — denylist/allowlist config per provider/model (#6625)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/paramFilters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$interceptionRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/interceptionRules.ts [instrumentation] (ecmascript)"); // Per-model web-search/web-fetch interception rules (#3384)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryAliases.ts [instrumentation] (ecmascript)"); // Claude Code discovery-alias gate (flag + per-provider/model overrides)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryMetrics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryMetrics.ts [instrumentation] (ecmascript)"); // Claude Code discovery-alias usage counters (alias requests + discovery hits)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$functionalGatewayMirrors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/functionalGatewayMirrors.ts [instrumentation] (ecmascript)"); // Functional-gateway mirror gate (flag + per-provider/model overrides)
// Radar client — local feed cache + settings (opt-in, encrypted supporter key)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$radar$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/radar.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/resilience/settings/normalize.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "asRecord",
    ()=>asRecord,
    "normalizeComboCooldownWaitSettings",
    ()=>normalizeComboCooldownWaitSettings,
    "normalizeConnectionCooldownProfile",
    ()=>normalizeConnectionCooldownProfile,
    "normalizeLegacyConnectionCooldownProfile",
    ()=>normalizeLegacyConnectionCooldownProfile,
    "normalizeProviderBreakerProfile",
    ()=>normalizeProviderBreakerProfile,
    "normalizeProviderCooldownSettings",
    ()=>normalizeProviderCooldownSettings,
    "normalizeProviderQuotaOverrides",
    ()=>normalizeProviderQuotaOverrides,
    "normalizeProviderWindowDefaults",
    ()=>normalizeProviderWindowDefaults,
    "normalizeQuotaPreflightSettings",
    ()=>normalizeQuotaPreflightSettings,
    "normalizeQuotaShareConcurrencyLimitSettings",
    ()=>normalizeQuotaShareConcurrencyLimitSettings,
    "normalizeRequestQueueSettings",
    ()=>normalizeRequestQueueSettings,
    "normalizeStreamRecoverySettings",
    ()=>normalizeStreamRecoverySettings,
    "normalizeWaitForCooldownSettings",
    ()=>normalizeWaitForCooldownSettings,
    "parseFeatureFlagBoolean",
    ()=>parseFeatureFlagBoolean,
    "resolveBooleanFeatureFlag",
    ()=>resolveBooleanFeatureFlag,
    "resolveStreamRecoveryDefaults",
    ()=>resolveStreamRecoveryDefaults,
    "toBoolean",
    ()=>toBoolean,
    "toInteger",
    ()=>toInteger
]);
/**
 * resilience/settings/normalize — coercion + per-section normalizers (pure).
 *
 * Extracted verbatim from resilience/settings.ts. Pure functions: no DB, no
 * module state. Depends only on the feature-flag resolver and the settings
 * types. The host imports these for its resolve/merge/legacy orchestration.
 *
 * @module lib/resilience/settings/normalize
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [instrumentation] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toInteger(value, fallback, options = {}) {
    const min = options.min ?? 0;
    const max = options.max ?? Number.MAX_SAFE_INTEGER;
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, Math.trunc(parsed)));
}
function toBoolean(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}
function parseFeatureFlagBoolean(value, fallback) {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
        return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
        return false;
    }
    return fallback;
}
function resolveBooleanFeatureFlag(key, fallback) {
    try {
        return parseFeatureFlagBoolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveFeatureFlag"])(key), fallback);
    } catch (error) {
        const envValue = process.env[key];
        if (typeof envValue === "string" && envValue.trim() !== "") {
            return parseFeatureFlagBoolean(envValue, fallback);
        }
        console.error(`[resilience] Failed to resolve ${key}, falling back to ${String(fallback)}:`, error instanceof Error ? error.message : error);
        return fallback;
    }
}
function resolveStreamRecoveryDefaults() {
    return {
        enabled: resolveBooleanFeatureFlag("STREAM_RECOVERY_ENABLED", false),
        continueMidStream: resolveBooleanFeatureFlag("STREAM_RECOVERY_MIDSTREAM_ENABLED", false)
    };
}
function normalizeRequestQueueSettings(next, fallback) {
    const record = asRecord(next);
    const requestsPerMinute = toInteger(record.requestsPerMinute, fallback.requestsPerMinute, {
        min: 1,
        max: 1_000_000
    });
    const minTimeBetweenRequestsMs = toInteger(record.minTimeBetweenRequestsMs, fallback.minTimeBetweenRequestsMs, {
        min: 0,
        max: 60 * 60 * 1000
    });
    const concurrentRequests = toInteger(record.concurrentRequests, fallback.concurrentRequests, {
        min: 1,
        max: 10_000
    });
    const maxWaitMs = toInteger(record.maxWaitMs, fallback.maxWaitMs, {
        min: 1,
        max: 24 * 60 * 60 * 1000
    });
    const maxQueueDepth = toInteger(record.maxQueueDepth, fallback.maxQueueDepth, {
        min: 0,
        max: 100_000
    });
    return {
        autoEnableApiKeyProviders: toBoolean(record.autoEnableApiKeyProviders, fallback.autoEnableApiKeyProviders),
        requestsPerMinute,
        minTimeBetweenRequestsMs,
        concurrentRequests,
        maxWaitMs,
        maxQueueDepth
    };
}
function normalizeConnectionCooldownProfile(next, fallback) {
    const record = asRecord(next);
    // useUpstream429BreakerHints uses a 3-state input contract:
    //   - boolean  → user override, store as-is
    //   - null     → explicit unset sentinel, drop key so the per-provider
    //                default in `providerHints.ts` resolves at runtime
    //   - omitted  → leave existing fallback value unchanged (partial-merge)
    // Never coerce via `toBoolean(value, fallback)` because that would
    // collapse the unset state.
    const hasHintsKey = Object.prototype.hasOwnProperty.call(record, "useUpstream429BreakerHints");
    const rawHints = record.useUpstream429BreakerHints;
    let useUpstream429BreakerHints;
    if (!hasHintsKey) {
        useUpstream429BreakerHints = fallback.useUpstream429BreakerHints;
    } else if (rawHints === null) {
        useUpstream429BreakerHints = undefined;
    } else if (typeof rawHints === "boolean") {
        useUpstream429BreakerHints = rawHints;
    } else {
        useUpstream429BreakerHints = fallback.useUpstream429BreakerHints;
    }
    const out = {
        baseCooldownMs: toInteger(record.baseCooldownMs, fallback.baseCooldownMs, {
            min: 0,
            max: 24 * 60 * 60 * 1000
        }),
        useUpstreamRetryHints: toBoolean(record.useUpstreamRetryHints, fallback.useUpstreamRetryHints),
        maxBackoffSteps: toInteger(record.maxBackoffSteps, fallback.maxBackoffSteps, {
            min: 0,
            max: 32
        })
    };
    // Only attach the key when defined — preserves omission across round-trips.
    if (useUpstream429BreakerHints !== undefined) {
        out.useUpstream429BreakerHints = useUpstream429BreakerHints;
    }
    return out;
}
function normalizeLegacyConnectionCooldownProfile(next, fallback) {
    const record = asRecord(next);
    const transientCooldown = toInteger(record.transientCooldown, fallback.baseCooldownMs, {
        min: 0,
        max: 24 * 60 * 60 * 1000
    });
    const legacyRateLimitCooldown = toInteger(record.rateLimitCooldown, transientCooldown, {
        min: 0,
        max: 24 * 60 * 60 * 1000
    });
    const useUpstreamRetryHints = typeof record.rateLimitCooldown === "number" ? record.rateLimitCooldown === 0 : fallback.useUpstreamRetryHints;
    return {
        baseCooldownMs: useUpstreamRetryHints ? transientCooldown : Math.max(transientCooldown, legacyRateLimitCooldown),
        useUpstreamRetryHints,
        maxBackoffSteps: toInteger(record.maxBackoffLevel, fallback.maxBackoffSteps, {
            min: 0,
            max: 32
        })
    };
}
function normalizeProviderBreakerProfile(next, fallback) {
    const record = asRecord(next);
    const failureThreshold = toInteger(record.failureThreshold, fallback.failureThreshold, {
        min: 1,
        max: 1000
    });
    const degradationThreshold = Math.min(toInteger(record.degradationThreshold, fallback.degradationThreshold, {
        min: 1,
        max: 1000
    }), failureThreshold <= 1 ? 1 : failureThreshold - 1);
    return {
        failureThreshold,
        degradationThreshold,
        resetTimeoutMs: toInteger(record.resetTimeoutMs, fallback.resetTimeoutMs, {
            min: 1000,
            max: 24 * 60 * 60 * 1000
        })
    };
}
function normalizeProviderWindowDefaults(next, fallback) {
    // Accept either an explicit object or fall back. Drop providers/windows
    // whose values are not a valid 0-100 integer so a malformed setting can't
    // accidentally disable cutoffs entirely.
    const rawProviders = asRecord(next ?? fallback);
    const out = {};
    for (const [provider, windows] of Object.entries(rawProviders)){
        if (!provider || typeof windows !== "object" || windows === null) continue;
        const windowMap = {};
        for (const [windowName, percent] of Object.entries(windows)){
            if (!windowName) continue;
            const parsed = typeof percent === "number" ? percent : typeof percent === "string" && percent.trim() !== "" ? Number(percent) : NaN;
            if (Number.isFinite(parsed)) {
                const clamped = Math.min(100, Math.max(0, Math.trunc(parsed)));
                windowMap[windowName] = clamped;
            }
        }
        if (Object.keys(windowMap).length > 0) {
            out[provider] = windowMap;
        }
    }
    return out;
}
function normalizeQuotaPreflightSettings(next, fallback) {
    const record = asRecord(next);
    // Remaining-% semantics: cutoff is the lowest acceptable remaining %, warn
    // is the higher "you're getting close" remaining %. So warn MUST be greater
    // than cutoff — otherwise the warn log would only fire after the request
    // is already blocked.
    const defaultThresholdPercent = toInteger(record.defaultThresholdPercent, fallback.defaultThresholdPercent, {
        min: 0,
        max: 99
    });
    const warnRaw = toInteger(record.warnThresholdPercent, fallback.warnThresholdPercent, {
        min: 0,
        max: 100
    });
    const warnThresholdPercent = warnRaw <= defaultThresholdPercent ? Math.min(100, defaultThresholdPercent + 1) : warnRaw;
    const providerWindowDefaults = normalizeProviderWindowDefaults(record.providerWindowDefaults, fallback.providerWindowDefaults);
    const enabled = typeof record.enabled === "boolean" ? record.enabled : fallback.enabled;
    return {
        enabled,
        defaultThresholdPercent,
        warnThresholdPercent,
        providerWindowDefaults
    };
}
function normalizeWaitForCooldownSettings(next, fallback) {
    const record = asRecord(next);
    const maxRetryWaitSec = toInteger(record.maxRetryWaitSec, fallback.maxRetryWaitSec, {
        min: 0,
        max: 300
    });
    const maxRetries = toInteger(record.maxRetries, fallback.maxRetries, {
        min: 0,
        max: 10
    });
    const maxRetryWaitMs = maxRetryWaitSec * 1000;
    // Cumulative cap across all waits for one request (#7360 follow-up) — mirrors
    // comboCooldownWait.budgetMs. Floored at maxRetryWaitMs so at least one wait
    // can always fire; ceiling matches the same 5-minute give-up point.
    const budgetMs = toInteger(record.budgetMs, fallback.budgetMs, {
        min: maxRetryWaitMs,
        max: 5 * 60 * 1000
    });
    const enabled = toBoolean(record.enabled, fallback.enabled) && maxRetries > 0 && maxRetryWaitSec > 0;
    return {
        enabled,
        maxRetries,
        maxRetryWaitSec,
        maxRetryWaitMs,
        budgetMs
    };
}
function normalizeComboCooldownWaitSettings(next, fallback) {
    const record = asRecord(next);
    // Hard ceiling of 5 minutes on a single wait (#7360 follow-up — raised from
    // 90s now that streaming clients get an immediate synthetic keep-alive
    // event via withEarlyStreamKeepalive, so a long wait no longer risks a
    // client-side first-byte timeout). This layer exists for transient cooldowns
    // (including Gemini-class TPM/RPM windows, which report ~60s retry-after
    // live); anything the upstream itself reports as longer than this should
    // fall through to the existing 429 crystallization (and the cross-request
    // cooldown layers).
    const maxWaitMs = toInteger(record.maxWaitMs, fallback.maxWaitMs, {
        min: 0,
        max: 300000
    });
    const maxAttempts = toInteger(record.maxAttempts, fallback.maxAttempts, {
        min: 0,
        max: 10
    });
    // Budget can never be smaller than a single wait, otherwise no wait could
    // ever fire; floor it at maxWaitMs.
    const budgetMs = toInteger(record.budgetMs, fallback.budgetMs, {
        min: maxWaitMs,
        max: 5 * 60 * 1000
    });
    const enabled = toBoolean(record.enabled, fallback.enabled) && maxWaitMs > 0 && maxAttempts > 0;
    return {
        enabled,
        maxWaitMs,
        maxAttempts,
        budgetMs
    };
}
function normalizeQuotaShareConcurrencyLimitSettings(next, fallback) {
    const record = asRecord(next);
    return {
        enabled: toBoolean(record.enabled, fallback.enabled)
    };
}
function normalizeProviderCooldownSettings(next, fallback) {
    const record = asRecord(next);
    const enabled = toBoolean(record.enabled, fallback.enabled);
    const minRetryCooldownMs = toInteger(record.minRetryCooldownMs, fallback.minRetryCooldownMs, {
        min: 0,
        max: 60 * 60 * 1000
    });
    const maxRetryCooldownMs = toInteger(record.maxRetryCooldownMs, fallback.maxRetryCooldownMs, {
        min: minRetryCooldownMs,
        max: 24 * 60 * 60 * 1000
    });
    return {
        enabled,
        minRetryCooldownMs,
        maxRetryCooldownMs
    };
}
function normalizeStreamRecoverySettings(next, fallback) {
    const record = asRecord(next);
    return {
        enabled: toBoolean(record.enabled, fallback.enabled),
        continueMidStream: toBoolean(record.continueMidStream, fallback.continueMidStream)
    };
}
// #6846 Phase 1: parse a single provider's { rpm?, concurrency? } override entry,
// dropping non-positive/non-finite fields so a malformed value falls back to that
// provider's static default rather than disabling its budget outright (0 would
// mean "no cap" for rpm, mirroring the resolveRpm/resolveMaxConcurrent convention
// elsewhere in this file).
function normalizeProviderQuotaOverrideEntry(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const record = raw;
    const out = {};
    const rpm = typeof record.rpm === "number" ? record.rpm : Number(record.rpm);
    if (Number.isFinite(rpm) && rpm > 0) out.rpm = Math.trunc(rpm);
    const concurrency = typeof record.concurrency === "number" ? record.concurrency : Number(record.concurrency);
    if (Number.isFinite(concurrency) && concurrency > 0) out.concurrency = Math.trunc(concurrency);
    return Object.keys(out).length > 0 ? out : null;
}
function normalizeProviderQuotaOverrides(next, fallback) {
    const rawProviders = asRecord(next ?? fallback);
    const out = {};
    for (const [provider, entry] of Object.entries(rawProviders)){
        if (!provider) continue;
        const normalized = normalizeProviderQuotaOverrideEntry(entry);
        if (normalized) out[provider] = normalized;
    }
    return out;
}
}),
"[project]/src/lib/resilience/settings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_REQUEST_QUEUE_MAX_DEPTH",
    ()=>DEFAULT_REQUEST_QUEUE_MAX_DEPTH,
    "DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS",
    ()=>DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS,
    "DEFAULT_RESILIENCE_SETTINGS",
    ()=>DEFAULT_RESILIENCE_SETTINGS,
    "buildLegacyResilienceCompat",
    ()=>buildLegacyResilienceCompat,
    "isStreamRecoveryExplicitlyConfigured",
    ()=>isStreamRecoveryExplicitlyConfigured,
    "mergeResilienceSettings",
    ()=>mergeResilienceSettings,
    "resolveResilienceSettings",
    ()=>resolveResilienceSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings/normalize.ts [instrumentation] (ecmascript)");
;
;
const DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS = (()=>{
    const parsed = Number(process.env.RATE_LIMIT_MAX_WAIT_MS || "15000");
    return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 15000;
})();
const DEFAULT_REQUEST_QUEUE_MAX_DEPTH = (()=>{
    const parsed = Number(process.env.RATE_LIMIT_MAX_QUEUE_DEPTH || "0");
    return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0;
})();
const DEFAULT_RESILIENCE_SETTINGS = {
    requestQueue: {
        autoEnableApiKeyProviders: true,
        requestsPerMinute: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].requestsPerMinute,
        minTimeBetweenRequestsMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].minTimeBetweenRequests,
        concurrentRequests: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].concurrentRequests,
        maxWaitMs: DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS,
        maxQueueDepth: DEFAULT_REQUEST_QUEUE_MAX_DEPTH
    },
    connectionCooldown: {
        oauth: {
            baseCooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.transientCooldown,
            useUpstreamRetryHints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.rateLimitCooldown === 0,
            maxBackoffSteps: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.maxBackoffLevel
        },
        apikey: {
            baseCooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.transientCooldown,
            useUpstreamRetryHints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.rateLimitCooldown === 0,
            maxBackoffSteps: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.maxBackoffLevel
        }
    },
    providerBreaker: {
        oauth: {
            failureThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.circuitBreakerThreshold,
            degradationThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.degradationThreshold,
            resetTimeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.circuitBreakerReset
        },
        apikey: {
            failureThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.circuitBreakerThreshold,
            degradationThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.degradationThreshold,
            resetTimeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.circuitBreakerReset
        }
    },
    // Wait at most 90s for a single connection cooldown (covers Gemini-class
    // TPM/RPM windows, which report ~60s retry-after live), at most 5 retry
    // cycles, never more than 300s (5 min) total (#7360 follow-up — raised now
    // that withEarlyStreamKeepalive gives streaming clients an immediate
    // synthetic keep-alive, eliminating the client-side first-byte-timeout risk
    // a long wait used to carry). Applies to direct (non-combo) model requests.
    waitForCooldown: {
        enabled: true,
        maxRetries: 5,
        maxRetryWaitSec: 90,
        maxRetryWaitMs: 90000,
        budgetMs: 300000
    },
    // Wait at most 90s for a single short transient cooldown (covers Gemini-class
    // TPM/RPM windows, which report ~60s retry-after live — #7360), at most 5
    // redispatch cycles, never more than 300s (5 min) total. Active for every
    // combo strategy when enabled, and only for transient (non quota_exhausted)
    // reasons.
    comboCooldownWait: {
        enabled: true,
        maxWaitMs: 90000,
        maxAttempts: 5,
        budgetMs: 300000
    },
    // FASE 2.1: serialize concurrent quota-share requests per connection when the
    // connection sets a max_concurrent cap, so a subscription account is not
    // flooded past its concurrency ceiling. Kill-switch only (default on); the cap
    // comes from each connection's max_concurrent.
    quotaShareConcurrencyLimit: {
        enabled: true
    },
    providerCooldown: {
        minRetryCooldownMs: Number(process.env.PROVIDER_COOLDOWN_MIN_MS || "5000"),
        maxRetryCooldownMs: Number(process.env.PROVIDER_COOLDOWN_MAX_MS || "300000"),
        // Opt-in (default OFF): this global cross-request cooldown overlaps the
        // existing Connection Cooldown / Provider Circuit Breaker layers, so it is
        // disabled by default and must be explicitly enabled by the operator until
        // its interaction with those layers is validated in production.
        enabled: [
            "true",
            "1",
            "on"
        ].includes((process.env.PROVIDER_COOLDOWN_ENABLED || "").trim().toLowerCase())
    },
    quotaPreflight: {
        // Opt-in (default OFF): the auto-routing hard cutoff drops low-quota candidates
        // before scoring, overlapping the existing soft quota penalty + connection
        // cooldown, so it must be explicitly enabled by the operator until its
        // interaction with the scorer is validated in production.
        enabled: [
            "true",
            "1",
            "on"
        ].includes((process.env.QUOTA_PREFLIGHT_CUTOFF_ENABLED || "").trim().toLowerCase()),
        // Remaining-% semantics. 2 = "stop when only 2% remaining" (= 98% used).
        // Uniform across all providers and windows; operators set per-window
        // overrides per connection via the Cutoff modal in Dashboard › Limits,
        // or per-(provider, window) globally via the providerWindowDefaults map
        // below (no factory seeds — keep behavior consistent across providers).
        defaultThresholdPercent: 2,
        warnThresholdPercent: 20,
        providerWindowDefaults: {}
    },
    streamRecovery: {
        // Opt-in (default OFF): the holdback that powers transparent early-retry adds
        // up to STREAM_RECOVERY.HOLDBACK_MS of time-to-first-token latency on every
        // streaming request, so it must be explicitly enabled by the operator.
        enabled: [
            "true",
            "1",
            "on"
        ].includes((process.env.STREAM_RECOVERY_ENABLED || "").trim().toLowerCase()),
        // Opt-in (default OFF): mid-stream continuation re-requests after a post-commit cut.
        continueMidStream: [
            "true",
            "1",
            "on"
        ].includes((process.env.STREAM_RECOVERY_MIDSTREAM_ENABLED || "").trim().toLowerCase())
    },
    // #6846 Phase 1: empty by default — nvidia (and any future header-less
    // provider registered in providerDefaultRateLimit.ts) uses its static
    // default until an operator adds an override here.
    providerQuotaOverrides: {}
};
function buildLegacyFallback(settings) {
    const profiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(settings.providerProfiles);
    const defaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(settings.rateLimitDefaults);
    const streamRecoveryDefaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveStreamRecoveryDefaults"])();
    const oauthLegacy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(profiles.oauth);
    const apikeyLegacy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(profiles.apikey);
    const waitMaxRetrySec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toInteger"])(settings.maxRetryIntervalSec, DEFAULT_RESILIENCE_SETTINGS.waitForCooldown.maxRetryWaitSec, {
        min: 0,
        max: 300
    });
    const waitMaxRetries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toInteger"])(settings.requestRetry, DEFAULT_RESILIENCE_SETTINGS.waitForCooldown.maxRetries, {
        min: 0,
        max: 10
    });
    return {
        requestQueue: {
            autoEnableApiKeyProviders: DEFAULT_RESILIENCE_SETTINGS.requestQueue.autoEnableApiKeyProviders,
            requestsPerMinute: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toInteger"])(defaults.requestsPerMinute, DEFAULT_RESILIENCE_SETTINGS.requestQueue.requestsPerMinute, {
                min: 1,
                max: 1_000_000
            }),
            minTimeBetweenRequestsMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toInteger"])(defaults.minTimeBetweenRequests, DEFAULT_RESILIENCE_SETTINGS.requestQueue.minTimeBetweenRequestsMs, {
                min: 0,
                max: 60 * 60 * 1000
            }),
            concurrentRequests: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toInteger"])(defaults.concurrentRequests, DEFAULT_RESILIENCE_SETTINGS.requestQueue.concurrentRequests, {
                min: 1,
                max: 10_000
            }),
            maxWaitMs: DEFAULT_RESILIENCE_SETTINGS.requestQueue.maxWaitMs,
            maxQueueDepth: DEFAULT_RESILIENCE_SETTINGS.requestQueue.maxQueueDepth
        },
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeLegacyConnectionCooldownProfile"])(oauthLegacy, DEFAULT_RESILIENCE_SETTINGS.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeLegacyConnectionCooldownProfile"])(apikeyLegacy, DEFAULT_RESILIENCE_SETTINGS.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: {
                failureThreshold: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toInteger"])(oauthLegacy.circuitBreakerThreshold, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.failureThreshold, {
                    min: 1,
                    max: 1000
                }),
                degradationThreshold: DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.degradationThreshold,
                resetTimeoutMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toInteger"])(oauthLegacy.circuitBreakerReset, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.resetTimeoutMs, {
                    min: 1000,
                    max: 24 * 60 * 60 * 1000
                })
            },
            apikey: {
                failureThreshold: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toInteger"])(apikeyLegacy.circuitBreakerThreshold, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.failureThreshold, {
                    min: 1,
                    max: 1000
                }),
                degradationThreshold: DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.degradationThreshold,
                resetTimeoutMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toInteger"])(apikeyLegacy.circuitBreakerReset, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.resetTimeoutMs, {
                    min: 1000,
                    max: 24 * 60 * 60 * 1000
                })
            }
        },
        waitForCooldown: {
            enabled: waitMaxRetries > 0 && waitMaxRetrySec > 0,
            maxRetries: waitMaxRetries,
            maxRetryWaitSec: waitMaxRetrySec,
            maxRetryWaitMs: waitMaxRetrySec * 1000,
            budgetMs: Math.max(waitMaxRetrySec * 1000, DEFAULT_RESILIENCE_SETTINGS.waitForCooldown.budgetMs)
        },
        comboCooldownWait: DEFAULT_RESILIENCE_SETTINGS.comboCooldownWait,
        quotaShareConcurrencyLimit: DEFAULT_RESILIENCE_SETTINGS.quotaShareConcurrencyLimit,
        providerCooldown: DEFAULT_RESILIENCE_SETTINGS.providerCooldown,
        quotaPreflight: DEFAULT_RESILIENCE_SETTINGS.quotaPreflight,
        streamRecovery: streamRecoveryDefaults,
        providerQuotaOverrides: DEFAULT_RESILIENCE_SETTINGS.providerQuotaOverrides
    };
}
function isStreamRecoveryExplicitlyConfigured(settings) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(settings);
    const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(record.resilienceSettings);
    const streamRecoveryRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(current.streamRecovery);
    if (typeof streamRecoveryRecord.enabled === "boolean") {
        return true;
    }
    return (process.env.STREAM_RECOVERY_ENABLED || "").trim().length > 0;
}
function resolveResilienceSettings(settings) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(settings);
    const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(record.resilienceSettings);
    const fallback = buildLegacyFallback(record);
    return {
        requestQueue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeRequestQueueSettings"])(current.requestQueue, fallback.requestQueue),
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(current.connectionCooldown).oauth, fallback.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(current.connectionCooldown).apikey, fallback.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(current.providerBreaker).oauth, fallback.providerBreaker.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["asRecord"])(current.providerBreaker).apikey, fallback.providerBreaker.apikey)
        },
        waitForCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeWaitForCooldownSettings"])(current.waitForCooldown, fallback.waitForCooldown),
        comboCooldownWait: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeComboCooldownWaitSettings"])(current.comboCooldownWait, fallback.comboCooldownWait),
        quotaShareConcurrencyLimit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeQuotaShareConcurrencyLimitSettings"])(current.quotaShareConcurrencyLimit, fallback.quotaShareConcurrencyLimit),
        providerCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProviderCooldownSettings"])(current.providerCooldown, fallback.providerCooldown),
        quotaPreflight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeQuotaPreflightSettings"])(current.quotaPreflight, fallback.quotaPreflight),
        streamRecovery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeStreamRecoverySettings"])(current.streamRecovery, fallback.streamRecovery),
        providerQuotaOverrides: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProviderQuotaOverrides"])(current.providerQuotaOverrides, fallback.providerQuotaOverrides)
    };
}
function mergeResilienceSettings(current, updates) {
    return {
        requestQueue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeRequestQueueSettings"])(updates.requestQueue, current.requestQueue),
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])(updates.connectionCooldown?.oauth, current.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])(updates.connectionCooldown?.apikey, current.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])(updates.providerBreaker?.oauth, current.providerBreaker.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])(updates.providerBreaker?.apikey, current.providerBreaker.apikey)
        },
        waitForCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeWaitForCooldownSettings"])(updates.waitForCooldown, current.waitForCooldown),
        comboCooldownWait: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeComboCooldownWaitSettings"])(updates.comboCooldownWait, current.comboCooldownWait),
        quotaShareConcurrencyLimit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeQuotaShareConcurrencyLimitSettings"])(updates.quotaShareConcurrencyLimit, current.quotaShareConcurrencyLimit),
        providerCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProviderCooldownSettings"])(updates.providerCooldown, current.providerCooldown),
        quotaPreflight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeQuotaPreflightSettings"])(updates.quotaPreflight, current.quotaPreflight),
        streamRecovery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeStreamRecoverySettings"])(updates.streamRecovery, current.streamRecovery),
        providerQuotaOverrides: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeProviderQuotaOverrides"])(updates.providerQuotaOverrides, current.providerQuotaOverrides)
    };
}
function buildLegacyResilienceCompat(settings) {
    return {
        profiles: {
            oauth: {
                transientCooldown: settings.connectionCooldown.oauth.baseCooldownMs,
                rateLimitCooldown: settings.connectionCooldown.oauth.useUpstreamRetryHints ? 0 : settings.connectionCooldown.oauth.baseCooldownMs,
                maxBackoffLevel: settings.connectionCooldown.oauth.maxBackoffSteps,
                circuitBreakerThreshold: settings.providerBreaker.oauth.failureThreshold,
                degradationThreshold: settings.providerBreaker.oauth.degradationThreshold,
                circuitBreakerReset: settings.providerBreaker.oauth.resetTimeoutMs
            },
            apikey: {
                transientCooldown: settings.connectionCooldown.apikey.baseCooldownMs,
                rateLimitCooldown: settings.connectionCooldown.apikey.useUpstreamRetryHints ? 0 : settings.connectionCooldown.apikey.baseCooldownMs,
                maxBackoffLevel: settings.connectionCooldown.apikey.maxBackoffSteps,
                circuitBreakerThreshold: settings.providerBreaker.apikey.failureThreshold,
                degradationThreshold: settings.providerBreaker.apikey.degradationThreshold,
                circuitBreakerReset: settings.providerBreaker.apikey.resetTimeoutMs
            }
        },
        defaults: {
            requestsPerMinute: settings.requestQueue.requestsPerMinute,
            minTimeBetweenRequests: settings.requestQueue.minTimeBetweenRequestsMs,
            concurrentRequests: settings.requestQueue.concurrentRequests
        }
    };
}
}),
"[project]/src/lib/resilience/modelLockoutSettings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MODEL_LOCKOUT_SETTINGS",
    ()=>DEFAULT_MODEL_LOCKOUT_SETTINGS,
    "resolveModelLockoutSettings",
    ()=>resolveModelLockoutSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [instrumentation] (ecmascript)");
;
const DEFAULT_MODEL_LOCKOUT_SETTINGS = {
    enabled: false,
    errorCodes: [
        403,
        404,
        429,
        502,
        503,
        504
    ],
    baseCooldownMs: 120_000,
    maxCooldownMs: 1_800_000,
    maxBackoffSteps: 10,
    useExponentialBackoff: true
};
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toInteger(value, fallback, options = {}) {
    const min = options.min ?? 0;
    const max = options.max ?? Number.MAX_SAFE_INTEGER;
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;
    return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.trunc(parsed))) : fallback;
}
function toBoolean(value, fallback) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return value === "true" || value === "1";
    return fallback;
}
function toNumberArray(value, fallback) {
    if (Array.isArray(value)) {
        const nums = value.map((v)=>typeof v === "number" ? v : Number(v)).filter((n)=>Number.isFinite(n) && n >= 100 && n <= 599);
        return nums.length > 0 ? nums : fallback;
    }
    return fallback;
}
function resolveModelLockoutSettings(settings) {
    const record = asRecord(settings);
    const raw = asRecord(record.modelLockout);
    const isTest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
    const baseCooldownMs = toInteger(raw.baseCooldownMs, DEFAULT_MODEL_LOCKOUT_SETTINGS.baseCooldownMs, {
        min: isTest ? 0 : 5_000,
        max: 600_000
    });
    const maxCooldownMs = Math.max(toInteger(raw.maxCooldownMs, DEFAULT_MODEL_LOCKOUT_SETTINGS.maxCooldownMs, {
        min: isTest ? 0 : 5_000,
        max: 3_600_000
    }), baseCooldownMs // cap must be >= base or exponential backoff is meaningless
    );
    return {
        enabled: toBoolean(raw.enabled, DEFAULT_MODEL_LOCKOUT_SETTINGS.enabled),
        errorCodes: toNumberArray(raw.errorCodes, DEFAULT_MODEL_LOCKOUT_SETTINGS.errorCodes),
        baseCooldownMs,
        maxCooldownMs,
        maxBackoffSteps: toInteger(raw.maxBackoffSteps, DEFAULT_MODEL_LOCKOUT_SETTINGS.maxBackoffSteps, {
            min: 0,
            max: 20
        }),
        useExponentialBackoff: toBoolean(raw.useExponentialBackoff, DEFAULT_MODEL_LOCKOUT_SETTINGS.useExponentialBackoff)
    };
}
}),
"[project]/src/lib/cli-helper/config-generator/hermesHome.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getHermesConfigPath",
    ()=>getHermesConfigPath,
    "getHermesHome",
    ()=>getHermesHome
]);
/**
 * Shared Hermes home-directory resolver (#3628).
 *
 * The Hermes PowerShell installer (Windows) writes its default config under
 * `%LOCALAPPDATA%\hermes`, exposed as the `HERMES_HOME` env var.  OmniRoute
 * previously hard-coded `~/.hermes` everywhere, so the two config files never
 * met on Windows.
 *
 * IMPORTANT: the env var MUST be read at call-time (i.e. inside a function),
 * never at module-load time.  `TOOL_CONFIG_PATHS` in index.ts is evaluated
 * eagerly — any constant defined there would freeze the path at import.
 * That's why this module exports plain functions instead of constants.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
;
;
function getHermesHome() {
    const override = (process.env.HERMES_HOME || "").trim();
    return override || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir(), ".hermes");
}
function getHermesConfigPath() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(getHermesHome(), "config.yaml");
}
}),
"[project]/src/lib/logRotation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanupOldLogs",
    ()=>cleanupOldLogs,
    "cleanupOverflowLogs",
    ()=>cleanupOverflowLogs,
    "closeLogRotation",
    ()=>closeLogRotation,
    "ensureLogDir",
    ()=>ensureLogDir,
    "getAppLogRotationCheckInterval",
    ()=>getAppLogRotationCheckInterval,
    "getLogConfig",
    ()=>getLogConfig,
    "initLogRotation",
    ()=>initLogRotation,
    "rotateIfNeeded",
    ()=>rotateIfNeeded
]);
/**
 * Log Rotation & Cleanup — manages application log file rotation.
 *
 * Handles:
 *   - Rotating log files when they exceed max size (startup + periodic during runtime)
 *   - Cleaning up old log files past retention period
 *   - Capping the number of rotated log files kept on disk
 *   - Creating the log directory on startup
 *
 * Configuration via env vars:
 *   - APP_LOG_TO_FILE: enable file logging (default: true)
 *   - APP_LOG_FILE_PATH: path to log file (default: logs/application/app.log)
 *   - APP_LOG_MAX_FILE_SIZE: max file size before rotation (default: 50MB)
 *   - APP_LOG_RETENTION_DAYS: days to keep old logs (default: 7)
 *   - APP_LOG_MAX_FILES: max number of rotated log files to keep (default: 20)
 *   - APP_LOG_ROTATION_CHECK_INTERVAL_MS: how often to check log size at runtime (default: 60000ms)
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
;
;
;
const DEFAULT_ROTATION_CHECK_INTERVAL_MS = 60_000;
function parsePositiveInt(value, fallback) {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function getAppLogRotationCheckInterval() {
    return parsePositiveInt(process.env.APP_LOG_ROTATION_CHECK_INTERVAL_MS, DEFAULT_ROTATION_CHECK_INTERVAL_MS);
}
/** Module-level timer handle — cleared by closeLogRotation(). */ let rotationTimer = null;
function getLogConfig() {
    const logToFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogToFile"])();
    const logFilePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogFilePath"])() || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), "logs/application/app.log");
    const maxFileSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogMaxFileSize"])();
    const retentionDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogRetentionDays"])();
    const maxFiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogMaxFiles"])();
    return {
        logToFile,
        logFilePath,
        maxFileSize,
        retentionDays,
        maxFiles
    };
}
function ensureLogDir(logFilePath) {
    const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(logFilePath);
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(dir)) {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["mkdirSync"])(dir, {
            recursive: true
        });
    }
}
function rotateIfNeeded(logFilePath, maxFileSize) {
    try {
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(logFilePath)) return;
        const stats = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["statSync"])(logFilePath);
        if (stats.size < maxFileSize) return;
        const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(logFilePath);
        const ext = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["extname"])(logFilePath);
        const base = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["basename"])(logFilePath, ext);
        const now = new Date();
        const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
        const rotatedPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(dir, `${base}.${ts}${ext}`);
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["renameSync"])(logFilePath, rotatedPath);
    } catch  {
    // If rotation fails, continue writing to the same file
    }
}
function cleanupOldLogs(logFilePath, retentionDays) {
    try {
        const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(logFilePath);
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(dir)) return;
        const ext = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["extname"])(logFilePath);
        const base = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["basename"])(logFilePath, ext);
        const files = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readdirSync"])(dir);
        const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
        for (const file of files){
            // Match rotated files like app.2026-02-19_030000.log
            if (file.startsWith(base + ".") && file.endsWith(ext) && file !== (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["basename"])(logFilePath)) {
                const filePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(dir, file);
                try {
                    const stats = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["statSync"])(filePath);
                    if (stats.mtimeMs < cutoff) {
                        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["unlinkSync"])(filePath);
                    }
                } catch  {
                // Skip files we can't stat
                }
            }
        }
    } catch  {
    // Cleanup is best-effort
    }
}
function cleanupOverflowLogs(logFilePath, maxFiles) {
    try {
        const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(logFilePath);
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(dir) || maxFiles < 1) return;
        const ext = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["extname"])(logFilePath);
        const base = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["basename"])(logFilePath, ext);
        const rotatedFiles = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readdirSync"])(dir).filter((file)=>file !== (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["basename"])(logFilePath) && file.startsWith(base + ".") && file.endsWith(ext)).map((file)=>{
            const filePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(dir, file);
            try {
                return {
                    filePath,
                    mtimeMs: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["statSync"])(filePath).mtimeMs
                };
            } catch  {
                return null;
            }
        }).filter((entry)=>!!entry).sort((a, b)=>b.mtimeMs - a.mtimeMs);
        for (const entry of rotatedFiles.slice(maxFiles)){
            try {
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["unlinkSync"])(entry.filePath);
            } catch  {
            // Best effort only.
            }
        }
    } catch  {
    // Cleanup is best-effort
    }
}
function initLogRotation() {
    const config = getLogConfig();
    if (!config.logToFile) return;
    ensureLogDir(config.logFilePath);
    rotateIfNeeded(config.logFilePath, config.maxFileSize);
    cleanupOldLogs(config.logFilePath, config.retentionDays);
    cleanupOverflowLogs(config.logFilePath, config.maxFiles);
    const intervalMs = getAppLogRotationCheckInterval();
    rotationTimer = setInterval((filePath, maxSize, maxFiles)=>{
        rotateIfNeeded(filePath, maxSize);
        cleanupOverflowLogs(filePath, maxFiles);
    }, intervalMs, config.logFilePath, config.maxFileSize, config.maxFiles);
    rotationTimer.unref?.();
}
function closeLogRotation() {
    if (rotationTimer !== null) {
        clearInterval(rotationTimer);
        rotationTimer = null;
    }
}
}),
"[project]/src/lib/ccDiscoveryAliasResolve.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveCcDiscoveryAliasStrip",
    ()=>resolveCcDiscoveryAliasStrip,
    "resolveCcDiscoveryAliasStripWith",
    ()=>resolveCcDiscoveryAliasStripWith
]);
/**
 * Request-path resolver for the `claude/…` cc-discovery aliases.
 *
 * The /v1/models catalog mirrors every enabled non-Claude model (and combo)
 * under a `claude/<id>` id so Claude Code's gateway model discovery — which only
 * lists ids starting with `claude`/`anthropic` — can surface them. When a client
 * sends one of those mirror ids back on a request, it must be resolved to the
 * real id BEFORE provider/combo resolution runs on the raw string. This module
 * is the single shared entry point for that, called from every request transport
 * that resolves a provider from the client model string:
 *   - src/sse/handlers/chat.ts (all /v1/chat, /v1/messages, /v1/responses, … )
 *   - src/app/api/internal/codex-responses-ws/route.ts (Codex Responses WS bridge)
 *
 * A legitimate `claude/<real-claude-model>` id (the actual Claude OAuth provider
 * namespace) is always left untouched — see the pure `stripCcDiscoveryAlias`.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$ccDiscoveryAliasStrip$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/ccDiscoveryAliasStrip.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryAliases.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryMetrics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryMetrics.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
// Virtual provider key combos are gated under (mirrors
// src/app/api/v1/models/ccAliasPredicate.ts — combos have no real provider id,
// so the gate addresses them via this synthetic key on BOTH the catalog and the
// request side; they must match or an alias could be listed yet rejected).
const CC_DISCOVERY_COMBO_PROVIDER_KEY = "combo";
const CC_DISCOVERY_PREFIX = "claude/";
/** Split the part after `claude/` into either a combo name or a provider/model pair. */ function parseCcAliasTarget(rest) {
    if (rest.startsWith("combo/")) {
        return {
            isComboAlias: true,
            comboName: rest.slice("combo/".length),
            providerPrefix: null,
            modelPart: null
        };
    }
    const slashIndex = rest.indexOf("/");
    if (slashIndex <= 0) {
        return {
            isComboAlias: false,
            comboName: null,
            providerPrefix: null,
            modelPart: null
        };
    }
    return {
        isComboAlias: false,
        comboName: null,
        providerPrefix: rest.slice(0, slashIndex),
        modelPart: rest.slice(slashIndex + 1)
    };
}
/** Resolve the three-level gate (model > provider > global) for a parsed alias target. */ function resolveGateFor(target, deps) {
    const gateProviderId = target.isComboAlias ? CC_DISCOVERY_COMBO_PROVIDER_KEY : target.providerPrefix;
    if (!gateProviderId) return deps.gateGlobal();
    const modelKey = target.isComboAlias ? target.comboName : target.modelPart;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveCcAliasEnabled"])({
        model: deps.gateModel(gateProviderId, modelKey),
        provider: deps.gateProvider(gateProviderId),
        global: deps.gateGlobal()
    });
}
async function resolveCcDiscoveryAliasStripWith(modelStr, deps) {
    if (typeof modelStr !== "string" || !modelStr.startsWith(CC_DISCOVERY_PREFIX)) {
        return {
            model: modelStr ?? "",
            stripped: false
        };
    }
    const rest = modelStr.slice(CC_DISCOVERY_PREFIX.length);
    // Legitimate Claude OAuth provider model — never touch it.
    if (deps.claudeModelIds.has(rest)) {
        return {
            model: modelStr,
            stripped: false
        };
    }
    const target = parseCcAliasTarget(rest);
    const combo = target.comboName ? await deps.getCombo(target.comboName) : null;
    const comboExists = combo !== null && Array.isArray(combo?.models) && combo.models.length > 0;
    const gateEnabled = resolveGateFor(target, deps);
    // NOTE: no DB side effects here — this injectable core stays pure so its unit
    // tests open no SQLite handle. The usage metric is recorded by the production
    // wrapper `resolveCcDiscoveryAliasStrip` below, which already touches the DB.
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$ccDiscoveryAliasStrip$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripCcDiscoveryAlias"])(modelStr, {
        isClaudeProviderModel: (r)=>deps.claudeModelIds.has(r),
        // Gap 1: recognize both built-in registry providers AND operator-defined
        // compatible nodes, matching exactly the prefixes the catalog can mirror.
        isKnownProviderPrefix: (prefix)=>deps.isRegistryProvider(prefix) || deps.customProviderPrefixes.has(prefix),
        hasCombo: ()=>comboExists,
        aliasEnabledFor: ()=>gateEnabled
    });
}
async function resolveCcDiscoveryAliasStrip(modelStr) {
    if (typeof modelStr !== "string" || !modelStr.startsWith(CC_DISCOVERY_PREFIX)) {
        return {
            model: modelStr ?? "",
            stripped: false
        };
    }
    const claudeModelIds = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelsByProviderId"])("claude").map((m)=>m.id));
    // Operator-defined compatible provider nodes (OpenAI/Anthropic-compatible),
    // keyed by their `prefix` — the same source catalog.ts uses to mirror them.
    const customProviderPrefixes = new Set();
    try {
        const nodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])();
        for (const node of nodes){
            if (typeof node?.prefix === "string" && node.prefix) {
                customProviderPrefixes.add(node.prefix);
            }
        }
    } catch  {
    // A node-fetch failure just means custom prefixes are unavailable this call;
    // built-in registry providers still resolve.
    }
    const { enabled: globalEnabled } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCcAliasGlobalState"])();
    const result = await resolveCcDiscoveryAliasStripWith(modelStr, {
        claudeModelIds,
        isRegistryProvider: (prefix)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(prefix) !== null,
        customProviderPrefixes,
        getCombo: (name)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboByName"])(name),
        gateGlobal: ()=>globalEnabled,
        gateProvider: (providerId)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCcAliasProviderSetting"])(providerId),
        gateModel: (providerId, modelId)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCcAliasModelSetting"])(providerId, modelId)
    });
    // Best-effort usage metric — never blocks/slows the request, never throws
    // (incrementCcAliasRequestCount already swallows its own errors). Lives in the
    // production wrapper (not the injectable core) so the core's unit tests stay
    // DB-free.
    if (result.stripped) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryMetrics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["incrementCcAliasRequestCount"])(result.model);
    }
    return result;
}
}),
"[project]/src/lib/credentialHealth/cache.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Credential Health Cache
 *
 * In-memory cache for provider credential health status.
 * Follows the same pattern as localHealthCheck.ts — globalThis singleton
 * survives HMR re-evaluation.
 *
 * Tracks testStatus, lastError, lastTested per connectionId with
 * configurable TTL. Auto-expiry on read for stale entries.
 */ __turbopack_context__.s([
    "getAllCredentialHealth",
    ()=>getAllCredentialHealth,
    "getCredentialHealth",
    ()=>getCredentialHealth,
    "getCredentialHealthSummary",
    ()=>getCredentialHealthSummary,
    "initCredentialCache",
    ()=>initCredentialCache,
    "isCredentialHealthy",
    ()=>isCredentialHealthy,
    "isCredentialStale",
    ()=>isCredentialStale,
    "removeCredentialHealth",
    ()=>removeCredentialHealth,
    "setCredentialHealth",
    ()=>setCredentialHealth
]);
// ── Config ────────────────────────────────────────────────────────────────
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes — considered stale
const MAX_ENTRIES = 500;
function getCacheState() {
    if (!globalThis.__omnirouteCredentialCache) {
        globalThis.__omnirouteCredentialCache = {
            initialized: false,
            cache: new Map()
        };
    }
    return globalThis.__omnirouteCredentialCache;
}
function getCredentialHealth(connectionId) {
    const state = getCacheState();
    const entry = state.cache.get(connectionId);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
        // Expired — remove and return undefined
        state.cache.delete(connectionId);
        return undefined;
    }
    return entry.status;
}
function isCredentialHealthy(connectionId) {
    const status = getCredentialHealth(connectionId);
    if (!status) return undefined;
    if (status.status === "active") return true;
    if (status.status === "error") return false;
    return undefined;
}
function isCredentialStale(connectionId) {
    const status = getCredentialHealth(connectionId);
    if (!status) return true; // Not cached = stale
    const age = Date.now() - status.lastTested.getTime();
    return age > STALE_THRESHOLD_MS;
}
function setCredentialHealth(connectionId, provider, status, lastError, lastErrorType, lastErrorSource, responseTimeMs) {
    const state = getCacheState();
    // Enforce max entries (evict oldest if full)
    if (state.cache.size >= MAX_ENTRIES) {
        const oldest = state.cache.entries().next().value;
        if (oldest) state.cache.delete(oldest[0]);
    }
    const prev = state.cache.get(connectionId);
    const consecutiveFailures = status === "error" ? (prev?.status.consecutiveFailures ?? 0) + 1 : status === "active" ? 0 : prev?.status.consecutiveFailures ?? 0;
    state.cache.set(connectionId, {
        status: {
            connectionId,
            provider,
            status,
            lastTested: new Date(),
            lastError,
            lastErrorType,
            lastErrorSource,
            consecutiveFailures,
            responseTimeMs
        },
        expiresAt: Date.now() + DEFAULT_TTL_MS
    });
}
function removeCredentialHealth(connectionId) {
    const state = getCacheState();
    state.cache.delete(connectionId);
}
function getAllCredentialHealth() {
    const state = getCacheState();
    const result = {};
    for (const [id, entry] of state.cache.entries()){
        if (Date.now() <= entry.expiresAt) {
            result[id] = entry.status;
        } else {
            state.cache.delete(id); // Clean expired on read
        }
    }
    return result;
}
function getCredentialHealthSummary() {
    const all = getAllCredentialHealth();
    const entries = Object.values(all);
    const now = Date.now();
    return {
        total: entries.length,
        healthy: entries.filter((e)=>e.status === "active").length,
        failed: entries.filter((e)=>e.status === "error").length,
        unknown: entries.filter((e)=>e.status === "unknown").length,
        stale: entries.filter((e)=>now - e.lastTested.getTime() > STALE_THRESHOLD_MS).length
    };
}
function initCredentialCache() {
    getCacheState().initialized = true;
}
}),
"[project]/src/lib/events/eventBus.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Event Bus
 *
 * Singleton typed EventEmitter for dashboard real-time events.
 * Uses globalThis pattern to survive HMR.
 *
 * Events are emitted by various parts of the system:
 *   - chatCore.ts: request.started
 *   - stream.ts: request.completed, request.failed
 *   - combo.ts: combo.target.*
 *   - credentialGate.ts: credential.health.changed
 *
 * Consumers (WebSocket server, dashboard hooks, etc.) subscribe
 * to specific event types via on/off.
 */ __turbopack_context__.s([
    "emit",
    ()=>emit,
    "getEventHistory",
    ()=>getEventHistory,
    "initEventBus",
    ()=>initEventBus,
    "on",
    ()=>on,
    "onAny",
    ()=>onAny
]);
function getBusState() {
    if (!globalThis.__omnirouteEventBus) {
        globalThis.__omnirouteEventBus = {
            initialized: false,
            listeners: new Map(),
            wildcardListeners: new Set(),
            history: [],
            maxHistory: 100,
            emitCount: 0
        };
    }
    return globalThis.__omnirouteEventBus;
}
function getEventHistory(sinceTimestamp, maxEntries = 50) {
    const state = getBusState();
    let history = state.history;
    if (sinceTimestamp) {
        history = history.filter((h)=>h.timestamp > sinceTimestamp);
    }
    return history.slice(-maxEntries);
}
function emit(event, payload) {
    const state = getBusState();
    state.emitCount++;
    const entry = {
        event,
        payload,
        timestamp: Date.now()
    };
    state.history.push(entry);
    if (state.history.length > state.maxHistory) {
        state.history.shift();
    }
    // Notify specific listeners
    const eventListeners = state.listeners.get(event);
    if (eventListeners) {
        for (const listener of eventListeners){
            try {
                listener(payload);
            } catch (err) {
                console.error(`[EventBus] Error in listener for ${event}:`, err);
            }
        }
    }
    // Notify wildcard listeners (\*)
    for (const listener of state.wildcardListeners){
        try {
            listener(event, payload);
        } catch (err) {
            console.error(`[EventBus] Error in wildcard listener for ${event}:`, err);
        }
    }
}
function on(event, listener) {
    const state = getBusState();
    if (!state.listeners.has(event)) {
        state.listeners.set(event, new Set());
    }
    state.listeners.get(event).add(listener);
    return ()=>{
        state.listeners.get(event)?.delete(listener);
    };
}
function onAny(listener) {
    const state = getBusState();
    state.wildcardListeners.add(listener);
    return ()=>{
        state.wildcardListeners.delete(listener);
    };
}
function initEventBus() {
    getBusState().initialized = true;
}
// Auto-initialize on import
initEventBus();
}),
"[project]/src/lib/webhookDispatcher.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decryptMetadata",
    ()=>decryptMetadata,
    "deliverWebhook",
    ()=>deliverWebhook,
    "dispatchEvent",
    ()=>dispatchEvent,
    "encryptMetadata",
    ()=>encryptMetadata,
    "notifyWebhookEvent",
    ()=>notifyWebhookEvent
]);
/**
 * Webhook Dispatcher
 * Dispatches events to registered webhooks with HMAC-SHA256 signing and retries.
 * Slack/Telegram/Discord use per-kind payload transformers (no HMAC wrapping).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuardPolicy.ts [instrumentation] (ecmascript)");
;
;
;
function signPayload(payload, secret) {
    return `sha256=${__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac("sha256", secret).update(payload).digest("hex")}`;
}
function encryptMetadata(meta) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encrypt"])(JSON.stringify(meta)) ?? JSON.stringify(meta);
}
function decryptMetadata(encrypted) {
    if (!encrypted) return null;
    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(encrypted);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch  {
        return null;
    }
}
async function deliverRaw(url, body) {
    const start = Date.now();
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAndValidateWebhookUrl"])(url);
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), 10_000);
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "OmniRoute-Webhook/1.0"
                },
                body: JSON.stringify(body),
                signal: controller.signal
            });
            return {
                success: res.ok,
                status: res.status,
                latencyMs: Date.now() - start
            };
        } finally{
            // Always clear the abort timer — on a non-timeout fetch error the previous code skipped
            // clearTimeout, leaving a dangling 10s timer (and AbortController) per failed call.
            clearTimeout(timeoutId);
        }
    } catch (error) {
        return {
            success: false,
            status: 0,
            latencyMs: Date.now() - start,
            error: error.message || "Network error"
        };
    }
}
async function deliverWebhook(url, payload, secret, maxRetries = 3) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAndValidateWebhookUrl"])(url);
    } catch (error) {
        return {
            success: false,
            status: 0,
            error: error.message || "Blocked outbound URL"
        };
    }
    const body = JSON.stringify(payload);
    const headers = {
        "Content-Type": "application/json",
        "User-Agent": "OmniRoute-Webhook/1.0",
        "X-Webhook-Event": payload.event,
        "X-Webhook-Timestamp": payload.timestamp
    };
    if (secret) {
        headers["X-Webhook-Signature"] = signPayload(body, secret);
    }
    for(let attempt = 0; attempt <= maxRetries; attempt++){
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 10_000);
            let res;
            try {
                res = await fetch(url, {
                    method: "POST",
                    headers,
                    body,
                    signal: controller.signal
                });
            } finally{
                // Clear the abort timer on every path — a non-timeout fetch error previously skipped
                // clearTimeout, leaking a dangling 10s timer + AbortController per failed attempt.
                clearTimeout(timeoutId);
            }
            if (res.ok || res.status < 500) {
                return {
                    success: res.ok,
                    status: res.status
                };
            }
            if (attempt < maxRetries) {
                await new Promise((r)=>setTimeout(r, Math.pow(2, attempt) * 1000));
            }
        } catch (error) {
            if (attempt === maxRetries) {
                return {
                    success: false,
                    status: 0,
                    error: error.message || "Network error"
                };
            }
            await new Promise((r)=>setTimeout(r, Math.pow(2, attempt) * 1000));
        }
    }
    return {
        success: false,
        status: 0,
        error: "Max retries exceeded"
    };
}
function notifyWebhookEvent(event, data) {
    // Intentionally not awaited. Promise.allSettled inside dispatchEvent already
    // absorbs per-delivery errors; this outer catch handles the import/loader
    // path so a misconfigured webhook table cannot break a request.
    dispatchEvent(event, data).catch(()=>{
    /* webhook delivery is best-effort */ });
}
async function dispatchEvent(event, data) {
    const { getEnabledWebhooks, recordWebhookDelivery, disableWebhooksWithHighFailures } = await __turbopack_context__.A("[project]/src/lib/db/webhooks.ts [instrumentation] (ecmascript, async loader)");
    const { insertDelivery } = await __turbopack_context__.A("[project]/src/lib/db/webhookDeliveries.ts [instrumentation] (ecmascript, async loader)");
    const { buildSlackPayload } = await __turbopack_context__.A("[project]/src/lib/webhooks/integrations/slack.ts [instrumentation] (ecmascript, async loader)");
    const { buildTelegramUrl, buildTelegramPayload } = await __turbopack_context__.A("[project]/src/lib/webhooks/integrations/telegram.ts [instrumentation] (ecmascript, async loader)");
    const { buildDiscordPayload } = await __turbopack_context__.A("[project]/src/lib/webhooks/integrations/discord.ts [instrumentation] (ecmascript, async loader)");
    const webhooks = getEnabledWebhooks();
    const payload = {
        event,
        timestamp: new Date().toISOString(),
        data
    };
    const deliveries = webhooks.filter((wh)=>wh.events.includes("*") || wh.events.includes(event)).map(async (wh)=>{
        const kind = wh.kind ?? "custom";
        const start = Date.now();
        let result;
        try {
            if (kind === "slack") {
                const slackPayload = buildSlackPayload(event, data);
                result = await deliverRaw(wh.url, slackPayload);
            } else if (kind === "discord") {
                const discordPayload = buildDiscordPayload(event, data);
                result = await deliverRaw(wh.url, discordPayload);
            } else if (kind === "telegram") {
                const meta = decryptMetadata(wh.metadata_encrypted ?? null);
                const botToken = meta?.botToken;
                if (!botToken) {
                    result = {
                        success: false,
                        status: 0,
                        error: "Missing Telegram botToken in metadata"
                    };
                } else {
                    const apiUrl = buildTelegramUrl(botToken);
                    // For Telegram, wh.url stores the chat_id
                    const tgPayload = buildTelegramPayload(event, data, wh.url);
                    result = await deliverRaw(apiUrl, tgPayload);
                }
            } else {
                result = await deliverWebhook(wh.url, payload, wh.secret);
            }
        } catch (err) {
            result = {
                success: false,
                status: 0,
                error: err.message || "Dispatch error"
            };
        }
        const latencyMs = Date.now() - start;
        try {
            insertDelivery({
                webhookId: wh.id,
                eventType: event,
                status: result.success ? "success" : "failed",
                httpStatus: result.status || null,
                latencyMs,
                error: result.error ?? null,
                payloadSnapshot: kind === "custom" ? JSON.stringify(payload).slice(0, 2000) : null
            });
        } catch  {
        // Delivery logging is best-effort
        }
        recordWebhookDelivery(wh.id, result.status, result.success);
        return {
            webhookId: wh.id,
            ...result
        };
    });
    await Promise.allSettled(deliveries);
    disableWebhooksWithHighFailures(10);
}
}),
"[project]/src/lib/promptCache/prefixAnalyzer.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzePrefix",
    ()=>analyzePrefix,
    "generatePromptCacheKey",
    ()=>generatePromptCacheKey
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
function normalizeContent(content) {
    if (typeof content === "string") return content;
    return JSON.stringify(content);
}
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}
function analyzePrefix(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return {
            prefixEndIdx: -1,
            prefixHash: "",
            prefixTokens: 0,
            prefixType: "system_only",
            confidence: 0
        };
    }
    let prefixEndIdx = -1;
    let prefixType = "system_only";
    let confidence = 0.5;
    for(let i = 0; i < messages.length; i++){
        const msg = messages[i];
        const role = msg.role || "user";
        if (role === "system") {
            prefixEndIdx = i;
            prefixType = "system_only";
            confidence = 0.9;
        } else if (role === "tool" || role === "assistant" && Array.isArray(msg.content)) {
            prefixEndIdx = i;
            prefixType = "system_and_tools";
            confidence = 0.8;
        } else if (role === "assistant") {
            prefixEndIdx = i;
            prefixType = "system_tools_history";
            confidence = 0.7;
        } else {
            break;
        }
    }
    const prefixMessages = messages.slice(0, prefixEndIdx + 1);
    const prefixText = prefixMessages.map((m)=>normalizeContent(m.content)).join("\n");
    const prefixHash = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(prefixText).digest("hex");
    const prefixTokens = estimateTokens(prefixText);
    return {
        prefixEndIdx,
        prefixHash,
        prefixTokens,
        prefixType,
        confidence
    };
}
function generatePromptCacheKey(messages) {
    const analysis = analyzePrefix(messages);
    if (analysis.prefixHash) {
        return `omni-${analysis.prefixHash.slice(0, 32)}`;
    }
    return "";
}
}),
"[project]/src/lib/quota/accountBuckets.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * accountBuckets.ts — Saturating per-connection, per-window buckets.
 *
 * Tracks whether a connection has hit 100 % of a quota window (5h / 7d /
 * per-model 7d). Each bucket is lazily reset: on read, if now >= resetsAtMs
 * the entry is cleared and the connection is eligible again. No cron needed —
 * the reset is probed on the read path.
 *
 * Fail-open: missing entry → not saturated. All time input is injectable
 * (the `nowMs` param) so unit tests drive the clock deterministically — the
 * tested path never calls Date.now() implicitly.
 *
 * Complementary to connectionRecovery.ts: that module recovers DB-backed
 * request-error cooldowns (testStatus 'unavailable' + rateLimitedUntil); this
 * module tracks in-process plan-window utilization. Orthogonal concerns.
 *
 * Part of: Quota Sharing Engine — Phase 3 (#3 multi-window buckets).
 */ // ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
/** In-process state for one (connectionId, windowKey) pair. */ __turbopack_context__.s([
    "SATURATION_THRESHOLD_PCT",
    ()=>SATURATION_THRESHOLD_PCT,
    "_bucketCountForTest",
    ()=>_bucketCountForTest,
    "_clearBucketsForTest",
    ()=>_clearBucketsForTest,
    "isBucketSaturated",
    ()=>isBucketSaturated,
    "recordUsage",
    ()=>recordUsage,
    "updateAccountBuckets",
    ()=>updateAccountBuckets
]);
const SATURATION_THRESHOLD_PCT = 100;
// ---------------------------------------------------------------------------
// In-process store
// ---------------------------------------------------------------------------
/** Key: `${connectionId}::${windowKey}`. */ const _buckets = new Map();
function storeKey(connectionId, windowKey) {
    return `${connectionId}::${windowKey}`;
}
/**
 * Parse an ISO 8601 `resetAt` string to epoch ms. Returns 0 on any failure
 * (unknown reset time → the lazy reset cannot fire for that bucket).
 */ function parseResetAtMs(resetAt) {
    if (!resetAt) return 0;
    const ms = Date.parse(resetAt);
    return Number.isFinite(ms) && ms > 0 ? ms : 0;
}
function isBucketSaturated(connectionId, windowKey, nowMs = Date.now()) {
    if (!connectionId || !windowKey) return false; // fail-open
    const key = storeKey(connectionId, windowKey);
    const entry = _buckets.get(key);
    if (!entry) return false; // fail-open
    // Lazy reset: the window rolled over → the saturation is stale.
    if (entry.resetsAtMs > 0 && nowMs >= entry.resetsAtMs) {
        _buckets.delete(key);
        return false;
    }
    return entry.saturated;
}
function recordUsage(connectionId, windowKey, usedPct, resetAt, nowMs = Date.now()) {
    if (!connectionId || !windowKey) return;
    const key = storeKey(connectionId, windowKey);
    const resetsAtMs = parseResetAtMs(resetAt);
    // Stale signal: the window already reset — discard any state and bail.
    if (resetsAtMs > 0 && nowMs >= resetsAtMs) {
        _buckets.delete(key);
        return;
    }
    const saturated = Number.isFinite(usedPct) && usedPct >= SATURATION_THRESHOLD_PCT;
    if (!saturated) {
        // Below threshold → clear any stale saturation so the bucket is eligible.
        _buckets.delete(key);
        return;
    }
    _buckets.set(key, {
        saturated: true,
        resetsAtMs
    });
}
function updateAccountBuckets(connectionId, usageResult, nowMs = Date.now()) {
    if (!connectionId || !usageResult?.quotas) return;
    const { quotas } = usageResult;
    // Fixed windows.
    processQuotaEntry(connectionId, "5h", quotas["session (5h)"], nowMs);
    processQuotaEntry(connectionId, "7d", quotas["weekly (7d)"], nowMs);
    // Per-model weekly windows: "weekly <model> (7d)" → "7d:<model>".
    for (const [key, entry] of Object.entries(quotas)){
        const match = /^weekly (.+) \(7d\)$/.exec(key);
        if (match?.[1]) {
            processQuotaEntry(connectionId, `7d:${match[1]}`, entry, nowMs);
        }
    }
}
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
function processQuotaEntry(connectionId, windowKey, entry, nowMs) {
    if (!entry || typeof entry.used !== "number") return;
    recordUsage(connectionId, windowKey, entry.used, entry.resetAt ?? null, nowMs);
}
function _clearBucketsForTest() {
    _buckets.clear();
}
function _bucketCountForTest() {
    return _buckets.size;
}
}),
"[project]/src/lib/quota/quotaModelNaming.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/quota/quotaKey.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/quotaModelNaming.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaGroups.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
        const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getPool"])(poolId);
        if (!pool) continue;
        groupIdSet.add(pool.groupId);
    }
    // For each distinct group, aggregate ALL pools in that group.
    for (const groupId of groupIdSet){
        const groupPools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getPoolsByGroup"])(groupId);
        // Group-level "anyValidConnection" gate: include the group slug only when
        // at least one pool in the group has a usable connection.
        let groupHasValidConnection = false;
        for (const groupPool of groupPools){
            // D2: iterate ALL member connections (defensive fallback for un-backfilled rows).
            const connIds = Array.isArray(groupPool.connectionIds) && groupPool.connectionIds.length > 0 ? groupPool.connectionIds : [
                groupPool.connectionId
            ];
            for (const connId of connIds){
                const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(connId);
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
            const groupName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getGroupName"])(groupId) ?? groupId;
            groupSlugSet.add((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["quotaGroupSlug"])(groupName));
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
            const keyRow = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getApiKeyById"])(keyId);
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updateApiKeyPermissions"])(keyId, {
                allowedQuotas: nextQuotas
            });
        } catch  {
        // Defensive: a single key failure must never abort reconciliation for others.
        }
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/middleware/registry.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearAllHooks",
    ()=>clearAllHooks,
    "createHookContext",
    ()=>createHookContext,
    "getAllHooks",
    ()=>getAllHooks,
    "getHook",
    ()=>getHook,
    "getHookLogs",
    ()=>getHookLogs,
    "getRegistryStats",
    ()=>getRegistryStats,
    "initPreRequestRegistry",
    ()=>initPreRequestRegistry,
    "loadHooksFromConfig",
    ()=>loadHooksFromConfig,
    "registerHook",
    ()=>registerHook,
    "runHooks",
    ()=>runHooks,
    "unregisterHook",
    ()=>unregisterHook,
    "updateHook",
    ()=>updateHook
]);
/**
 * Pre-request Hook Registry
 *
 * Singleton registry for pre-request middleware hooks.
 * Follows the same globalThis pattern as GuardrailRegistry.
 *
 * Hooks execute in priority order (lower = first) BEFORE provider
 * selection and combo routing. They can:
 *   - Mutate the request body/headers
 *   - Redirect to a different model/combo
 *   - Short-circuit with a custom response
 *   - Skip remaining hooks
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$vm__$5b$external$5d$__$28$vm$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/vm [external] (vm, cjs)");
;
function getRegistryState() {
    if (!globalThis.__omniroutePreRequestRegistry) {
        globalThis.__omniroutePreRequestRegistry = {
            initialized: false,
            hooks: new Map(),
            middlewares: new Map(),
            logs: [],
            maxLogs: 1000
        };
    }
    return globalThis.__omniroutePreRequestRegistry;
}
// ── Compile hook code into middleware function ────────────────────────────
/**
 * Max wall-clock time a single operator-authored hook may run.
 * Synchronous runaway loops are cut off by the `vm` timeout; async work that
 * never settles is cut off by the Promise.race guard below.
 */ const HOOK_EXECUTION_TIMEOUT_MS = 5000;
/**
 * Build the minimal, capability-free context object exposed to hook code.
 *
 * TRUST MODEL: Node's `vm` is NOT a hard security boundary (it shares the host
 * V8 heap and prototype-chain escapes exist). Its purpose here is to remove
 * *ambient* authority — hook code compiled from `HookConfig.code` must not see
 * `process`, `require`, `global`/`globalThis`, `fetch`, `Buffer`, timers, or
 * the module scope. Only the request `context` and pure/deterministic globals
 * are reachable, so a hook cannot read `process.env`, spawn processes, open
 * sockets, or `require()` arbitrary modules. Combined with the operator-only
 * write path (hooks are authored locally), this closes the `new Function()`
 * ambient-authority exposure (Hard Rule #3 / SonarCloud S1523).
 */ function createHookSandbox(context) {
    return {
        context,
        // Pure / deterministic globals only — no I/O, no ambient authority.
        JSON,
        Math,
        Date,
        Array,
        Object,
        String,
        Number,
        Boolean,
        RegExp,
        Error,
        TypeError,
        RangeError,
        SyntaxError,
        URIError,
        Map,
        Set,
        WeakMap,
        WeakSet,
        Symbol,
        Promise,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        URL,
        URLSearchParams
    };
}
function compileHookCode(code, hookName) {
    // Compile-once: parse the source into a reusable vm.Script. This throws on
    // syntax errors at registration time (preserving the original behavior) and
    // is cached in the returned closure so each execution only pays for a fresh
    // minimal context, not re-parsing.
    let script;
    try {
        script = new __TURBOPACK__imported__module__$5b$externals$5d2f$vm__$5b$external$5d$__$28$vm$2c$__cjs$29$__["Script"](`(async () => { ${code} })();`, {
            filename: `omniroute-hook:${hookName}`
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Compilation error";
        throw new Error(`Failed to compile hook "${hookName}": ${message}`);
    }
    return async (context)=>{
        const sandbox = createHookSandbox(context);
        const vmContext = __TURBOPACK__imported__module__$5b$externals$5d2f$vm__$5b$external$5d$__$28$vm$2c$__cjs$29$__["createContext"](sandbox, {
            codeGeneration: {
                strings: false,
                wasm: false
            }
        });
        let timer;
        try {
            // The `vm` timeout only interrupts *synchronous* runaway code; the
            // Promise.race below bounds async work that never settles.
            const execution = script.runInContext(vmContext, {
                timeout: HOOK_EXECUTION_TIMEOUT_MS
            });
            const timeoutGuard = new Promise((_resolve, reject)=>{
                timer = setTimeout(()=>{
                    reject(new Error(`Hook "${hookName}" timed out after ${HOOK_EXECUTION_TIMEOUT_MS}ms`));
                }, HOOK_EXECUTION_TIMEOUT_MS);
            });
            const result = await Promise.race([
                Promise.resolve(execution),
                timeoutGuard
            ]);
            return result ?? {};
        } catch (err) {
            // Errors thrown from inside the vm context use the context's own
            // constructors, so they are not `instanceof` the host Error. Normalize
            // to a host Error carrying a readable message so callers/observability
            // classify it correctly.
            const message = err instanceof Error ? err.message : typeof err === "object" && err !== null && "message" in err ? String(err.message) : String(err);
            throw new Error(message);
        } finally{
            if (timer) clearTimeout(timer);
        }
    };
}
function createHookContext(params) {
    const logger = params.log || console;
    return {
        body: {
            ...params.body
        },
        headers: {
            ...params.headers
        },
        model: params.model,
        combo: params.combo,
        apiKeyInfo: params.apiKeyInfo ? {
            ...params.apiKeyInfo
        } : undefined,
        metadata: {},
        log: {
            info: (tag, msg)=>logger.info?.(tag, msg) ?? console.log(`[${tag}] ${msg}`),
            warn: (tag, msg)=>logger.warn?.(tag, msg) ?? console.warn(`[${tag}] ${msg}`),
            error: (tag, msg)=>logger.error?.(tag, msg) ?? console.error(`[${tag}] ${msg}`)
        }
    };
}
function registerHook(config, middleware) {
    const state = getRegistryState();
    if (state.hooks.has(config.name)) {
        throw new Error(`Hook "${config.name}" is already registered`);
    }
    state.hooks.set(config.name, {
        ...config
    });
    if (middleware) {
        state.middlewares.set(config.name, middleware);
    } else {
        // Compile from code
        const compiled = compileHookCode(config.code, config.name);
        state.middlewares.set(config.name, compiled);
    }
}
function unregisterHook(name) {
    const state = getRegistryState();
    const removed = state.hooks.delete(name);
    state.middlewares.delete(name);
    return removed;
}
function updateHook(name, updates) {
    const state = getRegistryState();
    const existing = state.hooks.get(name);
    if (!existing) return false;
    const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString()
    };
    state.hooks.set(name, updated);
    // Recompile if code changed
    if (updates.code) {
        try {
            const compiled = compileHookCode(updated.code, name);
            state.middlewares.set(name, compiled);
        } catch (err) {
            state.hooks.set(name, {
                ...existing,
                lastError: err.message
            });
            throw err;
        }
    }
    return true;
}
function getHook(name) {
    return getRegistryState().hooks.get(name);
}
function getAllHooks() {
    return Array.from(getRegistryState().hooks.values());
}
function loadHooksFromConfig(rows) {
    const state = getRegistryState();
    for (const row of rows){
        if (!state.hooks.has(row.name)) {
            state.hooks.set(row.name, row);
            try {
                const compiled = compileHookCode(row.code, row.name);
                state.middlewares.set(row.name, compiled);
            } catch (err) {
                console.error(`[Middleware] Failed to compile hook "${row.name}":`, err);
            }
        }
    }
}
async function runHooks(context, comboId) {
    const state = getRegistryState();
    const hooks = Array.from(state.hooks.values()).filter((h)=>h.enabled && (h.scope.type === "global" || h.scope.type === "combo" && comboId && h.scope.comboId === comboId)).sort((a, b)=>a.priority - b.priority);
    for (const hook of hooks){
        const middleware = state.middlewares.get(hook.name);
        if (!middleware) continue;
        const startTime = Date.now();
        try {
            const result = await middleware(context);
            // Apply mutations
            if (result.body) {
                context.body = {
                    ...context.body,
                    ...result.body
                };
            }
            if (result.headers) {
                context.headers = {
                    ...context.headers,
                    ...result.headers
                };
            }
            if (result.model) {
                context.model = result.model;
            }
            if (result.combo) {
                context.combo = result.combo;
            }
            // Update run count
            hook.runCount = (hook.runCount || 0) + 1;
            // Record execution log
            const logEntry = {
                id: `${hook.name}-${Date.now()}`,
                hookName: hook.name,
                requestId: `${Date.now()}`,
                durationMs: Date.now() - startTime,
                mutated: !!(result.body || result.headers || result.model || result.combo),
                skipped: !!result.skipRemaining,
                timestamp: new Date().toISOString()
            };
            state.logs.push(logEntry);
            if (state.logs.length > state.maxLogs) {
                state.logs.splice(0, state.logs.length - state.maxLogs);
            }
            // Short-circuit
            if (result.response) {
                return {
                    context,
                    response: result.response
                };
            }
            // Skip remaining
            if (result.skipRemaining) {
                break;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            hook.lastError = message;
            hook.runCount = (hook.runCount || 0) + 1;
            state.logs.push({
                id: `${hook.name}-err-${Date.now()}`,
                hookName: hook.name,
                requestId: `${Date.now()}`,
                durationMs: Date.now() - startTime,
                mutated: false,
                skipped: false,
                error: message,
                timestamp: new Date().toISOString()
            });
            console.error(`[Middleware] Hook "${hook.name}" failed:`, message);
        }
    }
    return {
        context
    };
}
function getHookLogs(hookName, limit = 50) {
    const state = getRegistryState();
    let logs = state.logs;
    if (hookName) {
        logs = logs.filter((l)=>l.hookName === hookName);
    }
    return logs.slice(-limit);
}
function initPreRequestRegistry() {
    getRegistryState().initialized = true;
}
function clearAllHooks() {
    const state = getRegistryState();
    state.hooks.clear();
    state.middlewares.clear();
    state.logs = [];
}
function getRegistryStats() {
    const state = getRegistryState();
    const hooks = Array.from(state.hooks.values());
    return {
        totalHooks: hooks.length,
        enabledHooks: hooks.filter((h)=>h.enabled).length,
        globalHooks: hooks.filter((h)=>h.scope.type === "global").length,
        comboScopedHooks: hooks.filter((h)=>h.scope.type === "combo").length,
        recentLogs: state.logs.length
    };
}
}),
"[project]/src/lib/guardrails/base.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseGuardrail",
    ()=>BaseGuardrail
]);
class BaseGuardrail {
    enabled;
    name;
    priority;
    constructor(name, options = {}){
        this.name = name;
        this.enabled = options.enabled !== false;
        this.priority = options.priority ?? 100;
    }
    async preCall(_payload, _context) {
        return {
            block: false
        };
    }
    async postCall(_response, _context) {
        return {
            block: false
        };
    }
}
}),
"[project]/src/lib/guardrails/piiMasker.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PIIMaskerGuardrail",
    ()=>PIIMaskerGuardrail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/base.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$inputSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/inputSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/piiSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [instrumentation] (ecmascript)");
;
;
;
;
function isRequestPiiMaskingEnabled() {
    // Request PII redaction is controlled by PII_REDACTION_ENABLED feature flag (DB > env > default).
    // INPUT_SANITIZER_MODE only governs prompt-injection policy (warn/block/log).
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("PII_REDACTION_ENABLED");
}
function sanitizeStringValue(text) {
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$inputSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["processPII"])(text, isRequestPiiMaskingEnabled());
    return {
        detections: result.detections,
        modified: result.text !== text,
        text: result.text
    };
}
function applyToContentValue(value, detections) {
    if (typeof value === "string") {
        const result = sanitizeStringValue(value);
        detections.push(...result.detections);
        return {
            modified: result.modified,
            value: result.text
        };
    }
    if (Array.isArray(value)) {
        let modified = false;
        const nextValue = value.map((entry)=>{
            if (typeof entry === "string") {
                const result = sanitizeStringValue(entry);
                detections.push(...result.detections);
                modified ||= result.modified;
                return result.text;
            }
            if (entry && typeof entry === "object") {
                const record = {
                    ...entry
                };
                if (typeof record.text === "string") {
                    const result = sanitizeStringValue(record.text);
                    detections.push(...result.detections);
                    modified ||= result.modified;
                    record.text = result.text;
                }
                if (typeof record.content === "string") {
                    const result = sanitizeStringValue(record.content);
                    detections.push(...result.detections);
                    modified ||= result.modified;
                    record.content = result.text;
                }
                return record;
            }
            return entry;
        });
        return {
            modified,
            value: nextValue
        };
    }
    return {
        modified: false,
        value
    };
}
function cloneAndMaskRequestPayload(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return {
            detections: [],
            modified: false,
            payload
        };
    }
    const clonedPayload = JSON.parse(JSON.stringify(payload));
    const detections = [];
    let modified = false;
    const sanitizeMessageLikeList = (list)=>{
        if (!Array.isArray(list)) return list;
        return list.map((entry)=>{
            // Responses API can pass plain strings in input[]
            if (typeof entry === "string") {
                const result = sanitizeStringValue(entry);
                detections.push(...result.detections);
                modified ||= result.modified;
                return result.text;
            }
            if (!entry || typeof entry !== "object") return entry;
            const record = {
                ...entry
            };
            if ("content" in record) {
                const result = applyToContentValue(record.content, detections);
                modified ||= result.modified;
                record.content = result.value;
            }
            if (typeof record.text === "string") {
                const result = sanitizeStringValue(record.text);
                detections.push(...result.detections);
                modified ||= result.modified;
                record.text = result.text;
            }
            return record;
        });
    };
    if (typeof clonedPayload.system === "string") {
        const result = sanitizeStringValue(clonedPayload.system);
        detections.push(...result.detections);
        modified ||= result.modified;
        clonedPayload.system = result.text;
    } else if (Array.isArray(clonedPayload.system)) {
        clonedPayload.system = sanitizeMessageLikeList(clonedPayload.system);
    }
    if (Array.isArray(clonedPayload.messages)) {
        clonedPayload.messages = sanitizeMessageLikeList(clonedPayload.messages);
    }
    if (Array.isArray(clonedPayload.input)) {
        clonedPayload.input = sanitizeMessageLikeList(clonedPayload.input);
    } else if (typeof clonedPayload.input === "string") {
        const result = sanitizeStringValue(clonedPayload.input);
        detections.push(...result.detections);
        modified ||= result.modified;
        clonedPayload.input = result.text;
    }
    if (typeof clonedPayload.prompt === "string") {
        const result = sanitizeStringValue(clonedPayload.prompt);
        detections.push(...result.detections);
        modified ||= result.modified;
        clonedPayload.prompt = result.text;
    } else if (Array.isArray(clonedPayload.prompt)) {
        clonedPayload.prompt = sanitizeMessageLikeList(clonedPayload.prompt);
    }
    return {
        detections,
        modified,
        payload: modified ? clonedPayload : payload
    };
}
function maskResponsesOutput(response) {
    let modified = false;
    if (typeof response.output_text === "string") {
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(response.output_text);
        if (result.redacted) {
            response.output_text = result.text;
            modified = true;
        }
    }
    if (Array.isArray(response.output)) {
        response.output = response.output.map((item)=>{
            if (!item || typeof item !== "object") return item;
            const nextItem = {
                ...item
            };
            if (Array.isArray(nextItem.content)) {
                nextItem.content = nextItem.content.map((part)=>{
                    if (!part || typeof part !== "object") return part;
                    const nextPart = {
                        ...part
                    };
                    if (typeof nextPart.text === "string") {
                        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(nextPart.text);
                        if (result.redacted) {
                            nextPart.text = result.text;
                            modified = true;
                        }
                    }
                    return nextPart;
                });
            }
            return nextItem;
        });
    }
    return modified;
}
class PIIMaskerGuardrail extends __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseGuardrail"] {
    constructor(options = {}){
        super("pii-masker", {
            enabled: options.enabled,
            priority: options.priority ?? 10
        });
    }
    async preCall(payload, _context) {
        const result = cloneAndMaskRequestPayload(payload);
        if (!result.modified) {
            return {
                block: false,
                meta: result.detections.length > 0 ? {
                    detections: result.detections.length
                } : null
            };
        }
        return {
            block: false,
            meta: {
                detections: result.detections.length,
                redacted: true
            },
            modifiedPayload: result.payload
        };
    }
    async postCall(response, _context) {
        if (!response || typeof response !== "object" || Array.isArray(response)) {
            return {
                block: false
            };
        }
        const clonedResponse = JSON.parse(JSON.stringify(response));
        const before = JSON.stringify(clonedResponse);
        const sanitized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePIIResponse"])(clonedResponse);
        const modifiedResponsesShape = maskResponsesOutput(sanitized);
        const after = JSON.stringify(sanitized);
        const modified = before !== after || modifiedResponsesShape;
        if (!modified) return {
            block: false
        };
        return {
            block: false,
            meta: {
                redacted: true
            },
            modifiedResponse: sanitized
        };
    }
}
}),
"[project]/src/lib/guardrails/promptInjection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_GUARD_PATTERNS",
    ()=>DEFAULT_GUARD_PATTERNS,
    "PromptInjectionGuardrail",
    ()=>PromptInjectionGuardrail,
    "detectWithPatterns",
    ()=>detectWithPatterns,
    "evaluatePromptInjection",
    ()=>evaluatePromptInjection,
    "normalizePatternEntry",
    ()=>normalizePatternEntry,
    "shouldBlock",
    ()=>shouldBlock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/base.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$inputSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/inputSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/featureFlags.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$envBoolean$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/envBoolean.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$injectionSeverity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/injectionSeverity.ts [instrumentation] (ecmascript)");
;
;
;
;
;
const DEFAULT_GUARD_PATTERNS = [
    {
        name: "system_override_inline",
        pattern: /\bsystem\s*:\s*override\b/i,
        severity: "high"
    },
    {
        name: "markdown_system_block",
        pattern: /```+\s*system\b/i,
        severity: "high"
    }
];
const SEVERITY_SCORES = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$injectionSeverity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SEVERITY_SCORES"];
function normalizePatternEntry(entry, index) {
    if (entry instanceof RegExp) {
        return {
            name: `custom_${index}`,
            pattern: entry,
            severity: "high"
        };
    }
    if (typeof entry === "string") {
        return {
            name: `custom_${index}`,
            pattern: new RegExp(entry, "i"),
            severity: "high"
        };
    }
    if (!entry || !(entry.pattern instanceof RegExp) && typeof entry.pattern !== "string") {
        return null;
    }
    return {
        name: entry.name || `custom_${index}`,
        pattern: entry.pattern instanceof RegExp ? entry.pattern : new RegExp(entry.pattern, "i"),
        severity: entry.severity || "high"
    };
}
function detectWithPatterns(text, patterns) {
    const detections = [];
    for (const rule of patterns){
        if (!rule) continue;
        const match = text.match(rule.pattern);
        if (!match) continue;
        detections.push({
            pattern: rule.name,
            severity: rule.severity,
            match: match[0].slice(0, 50)
        });
    }
    return detections;
}
function shouldBlock(detections, threshold) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$injectionSeverity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldBlockDetections"])(detections, threshold);
}
function getLogger(options, context) {
    return options.logger || context.log || console;
}
function emitGuardrailLog(logger, level, message, meta) {
    const target = logger?.[level];
    if (typeof target !== "function") return;
    if (logger === console) {
        target.call(logger, message, meta || "");
        return;
    }
    target.call(logger, "GUARDRAIL", message, meta);
}
function getMode(options) {
    // A dashboard-set DB override for INJECTION_GUARD_MODE wins over env vars, so the
    // Feature Flags UI actually controls this guard (DB > ENV > default, matching
    // resolveFeatureFlag). Read DB-only here to preserve the existing env fallback
    // chain and "warn" default when no override is set — i.e. behavior is unchanged
    // for every deployment that has not explicitly set the flag. Fail-safe: any DB
    // read error falls back to the env-based behavior.
    let dbOverride;
    try {
        dbOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getFeatureFlagOverride"])("INJECTION_GUARD_MODE");
    } catch  {
        dbOverride = undefined;
    }
    return options.mode || dbOverride || process.env.INJECTION_GUARD_MODE || process.env.INPUT_SANITIZER_MODE || "warn";
}
function getThreshold(options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$injectionSeverity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveBlockThreshold"])(options.blockThreshold);
}
function isEnabled(options) {
    return options.enabled ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$envBoolean$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseEnvBoolean"])(process.env.INPUT_SANITIZER_ENABLED, true);
}
function evaluatePromptInjection(body, options = {}, context = {}) {
    if (!isEnabled(options) || !body || typeof body !== "object") {
        return {
            blocked: false,
            result: {
                flagged: false,
                detections: [],
                piiDetections: []
            }
        };
    }
    const logger = getLogger(options, context);
    const mode = getMode(options);
    const threshold = getThreshold(options);
    const patterns = [
        ...DEFAULT_GUARD_PATTERNS,
        ...options.customPatterns || []
    ].map(normalizePatternEntry).filter(Boolean);
    const sanitizerResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$inputSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeRequest"])(body, {
        info () {},
        warn () {}
    });
    const contents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$inputSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractMessageContents"])(body);
    // Bound the custom-pattern scan to the first 16 KB, matching detectInjection's
    // cap inside sanitizeRequest above (hot-path perf, #3932 / #4041). Injection
    // directives sit near the top; scanning the full join buys only CPU/GC.
    const joinedContents = contents.join("\n");
    const scanText = joinedContents.length > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$inputSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MAX_INJECTION_SCAN_BYTES"] ? joinedContents.slice(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$inputSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MAX_INJECTION_SCAN_BYTES"]) : joinedContents;
    const customDetections = detectWithPatterns(scanText, patterns);
    const existingDetections = new Set(sanitizerResult.detections.map((d)=>`${d.pattern}:${d.match}:${d.severity}`));
    for (const detection of customDetections){
        const key = `${detection.pattern}:${detection.match}:${detection.severity}`;
        if (!existingDetections.has(key)) {
            sanitizerResult.detections.push(detection);
        }
    }
    const result = {
        detections: sanitizerResult.detections,
        flagged: sanitizerResult.detections.length > 0 || sanitizerResult.piiDetections.length > 0,
        piiDetections: sanitizerResult.piiDetections
    };
    if (!result.flagged) {
        return {
            blocked: false,
            result
        };
    }
    if (mode === "block" && shouldBlock(result.detections, threshold)) {
        emitGuardrailLog(logger, "warn", "Request blocked by prompt injection guard", {
            detections: result.detections.map((detection)=>({
                    pattern: detection.pattern,
                    severity: detection.severity
                }))
        });
        return {
            blocked: true,
            result
        };
    }
    if (mode === "warn" || mode === "log") {
        const hasHighSeverity = result.detections.some((detection)=>detection.severity === "high");
        if (mode === "warn" && !hasHighSeverity) {
            return {
                blocked: false,
                result
            };
        }
        const level = mode === "log" ? "info" : "warn";
        emitGuardrailLog(logger, level, "Prompt injection guard flagged request", {
            detections: result.detections.map((detection)=>({
                    pattern: detection.pattern,
                    severity: detection.severity
                })),
            pii: result.piiDetections.length
        });
    }
    return {
        blocked: false,
        result
    };
}
class PromptInjectionGuardrail extends __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseGuardrail"] {
    options;
    constructor(options = {}){
        super("prompt-injection", {
            enabled: options.enabled,
            priority: options.priority ?? 20
        });
        this.options = options;
    }
    async preCall(payload, context) {
        const decision = evaluatePromptInjection(payload, this.options, context);
        if (decision.blocked) {
            return {
                block: true,
                message: "Request rejected: suspicious content detected",
                meta: {
                    detections: decision.result.detections.length,
                    piiDetections: decision.result.piiDetections.length
                }
            };
        }
        return {
            block: false,
            meta: decision.result.flagged ? {
                detections: decision.result.detections.length,
                piiDetections: decision.result.piiDetections.length
            } : null
        };
    }
}
;
}),
"[project]/src/lib/guardrails/visionBridgeCredentials.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared provider-credential checks for the Vision Bridge guardrail.
 * Extracted from visionBridge.ts so visionBridgeRouter.ts can reuse the same
 * "is this connection actually usable" logic without a circular import
 * (visionBridge.ts already imports getBestVisionModel from visionBridgeRouter.ts).
 */ /**
 * True when a provider connection can actually authenticate upstream.
 * `noauth` with no real API key is NOT usable (opencode-zen free tier often
 * surfaces as noauth and then 401 "Missing API key").
 */ __turbopack_context__.s([
    "hasUsableCredentialsForModel",
    ()=>hasUsableCredentialsForModel,
    "isProviderConnectionUsable",
    ()=>isProviderConnectionUsable
]);
const TERMINAL_CONNECTION_STATUSES = new Set([
    "disabled",
    "banned",
    "expired"
]);
// Free/noauth only counts when a real key is still present; apikey/cookie need the same.
const KEY_ONLY_AUTH_TYPES = new Set([
    "noauth",
    "none",
    "",
    "apikey",
    "cookie"
]);
const TOKEN_AUTH_TYPES = new Set([
    "oauth",
    "access_token",
    "external_idp"
]);
function hasNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function hasOAuthCredential(connection) {
    return hasNonEmptyString(connection.refreshToken) || hasNonEmptyString(connection.accessToken) || hasNonEmptyString(connection.idToken);
}
function isProviderConnectionUsable(connection) {
    const status = String(connection.testStatus || "").toLowerCase();
    if (TERMINAL_CONNECTION_STATUSES.has(status)) {
        return false;
    }
    const auth = String(connection.authType || "").toLowerCase();
    const hasKey = hasNonEmptyString(connection.apiKey);
    if (KEY_ONLY_AUTH_TYPES.has(auth)) {
        return hasKey;
    }
    if (TOKEN_AUTH_TYPES.has(auth)) {
        return hasOAuthCredential(connection) || hasKey;
    }
    return hasKey;
}
// Memoize the dynamic import itself (not just call it inline per-invocation).
// getVisionCapableModels() fans out to this function once per vision-capable
// catalog entry via Promise.all — tens of concurrent calls on every
// getBestVisionModel()/getFallbackModels() invocation. Issuing a fresh
// `await import(...)` per call means dozens of concurrent first-resolution
// import() calls for the *same* specifier land in the module loader at once;
// under Vitest/vite-node this observably races (some callers resolve against
// the mocked module, others against a real one loaded via a different
// resolution path such as readCache.ts's own relative `./providers` import —
// see tests/unit/guardrails/visionBridgeRouter.test.tsx). Resolving the
// import exactly once and reusing the settled module for every subsequent
// call removes the concurrent-first-load race entirely (and is strictly
// cheaper at runtime too — one module resolution instead of N).
let providersModulePromise = null;
function loadProvidersModule() {
    if (!providersModulePromise) {
        providersModulePromise = __turbopack_context__.A("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript, async loader)");
    }
    return providersModulePromise;
}
async function hasUsableCredentialsForModel(model) {
    const provider = typeof model === "string" ? model.split("/")[0]?.trim() : "";
    if (!provider) return null;
    try {
        const { getProviderConnections } = await loadProvidersModule();
        const connections = await getProviderConnections({
            provider,
            isActive: true
        });
        if (!Array.isArray(connections)) return null;
        // Empty active set is a definitive "no" only when the table is readable.
        if (connections.length === 0) return false;
        return connections.some((c)=>isProviderConnectionUsable(c));
    } catch  {
        return null;
    }
}
}),
"[project]/src/lib/guardrails/visionBridgeRouter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSelectionCache",
    ()=>clearSelectionCache,
    "getBestVisionModel",
    ()=>getBestVisionModel,
    "getFallbackModels",
    ()=>getFallbackModels,
    "getLatencyStats",
    ()=>getLatencyStats,
    "recordLatency",
    ()=>recordLatency
]);
/**
 * Vision Bridge Auto-Router
 * Automatically selects the fastest vision-capable model from available models.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/visionBridgeCredentials.ts [instrumentation] (ecmascript)");
;
;
;
const DEFAULT_ROUTER_CONFIG = {
    maxFallbackAttempts: 3,
    selectionCacheTtlMs: 60_000,
    minLatencySamples: 5,
    excludedModels: []
};
// In-memory latency tracker (would be Redis in production)
const latencyStore = new Map();
const selectionCache = new Map();
function recordLatency(modelId, latencyMs, success) {
    const records = latencyStore.get(modelId) || [];
    records.push({
        modelId,
        latencyMs,
        timestamp: Date.now(),
        success
    });
    // Keep only last 100 records per model
    if (records.length > 100) {
        records.splice(0, records.length - 100);
    }
    latencyStore.set(modelId, records);
}
/**
 * Calculate average latency for a model, considering only recent records.
 */ function calculateAverageLatency(modelId, windowMs = 300_000) {
    const records = latencyStore.get(modelId) || [];
    const cutoff = Date.now() - windowMs;
    const recentRecords = records.filter((r)=>r.timestamp > cutoff && r.success);
    if (recentRecords.length === 0) {
        return Infinity; // No data = assume slow
    }
    const sum = recentRecords.reduce((acc, r)=>acc + r.latencyMs, 0);
    return sum / recentRecords.length;
}
/**
 * Calculate success rate for a model.
 */ function calculateSuccessRate(modelId) {
    const records = latencyStore.get(modelId) || [];
    if (records.length === 0) return 1.0; // No data = assume good
    const recentRecords = records.slice(-50); // Last 50 attempts
    const successes = recentRecords.filter((r)=>r.success).length;
    return successes / recentRecords.length;
}
/**
 * Get all vision-capable models from the registry that also have a usable
 * active connection on this instance.
 *
 * Without this credential check, a model with no working connection (e.g. the
 * hardcoded default `openai/gpt-4o-mini` on an instance with no `openai`
 * provider connected) could win selection, fail the describe call, and leave
 * the guardrail's describe-failure fallback to forward the raw image to a
 * non-vision backend, which rejects it with an opaque upstream error.
 */ async function getVisionCapableModels(deps = {}) {
    const checkCreds = deps.hasUsableCredentials ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasUsableCredentialsForModel"];
    const candidates = [];
    const checks = [];
    for (const [providerAlias, models] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"])){
        if (!Array.isArray(models)) continue;
        for (const model of models){
            if (!model?.id) continue;
            const fullModelId = `${providerAlias}/${model.id}`;
            const caps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])(fullModelId);
            if (caps.supportsVision === true) {
                checks.push(checkCreds(fullModelId).then((usable)=>{
                    // Only a confirmed `false` excludes a candidate — `null` (indeterminate,
                    // e.g. unit tests / early boot) fails open so existing behavior is preserved
                    // when the credential store can't be checked.
                    if (usable === false) return;
                    // Determine priority based on provider type (lower = better).
                    // Do NOT prefer opencode-* first: those catalog entries often resolve to a
                    // noauth connection and 401 "Missing API key", hijacking working providers
                    // (e.g. zai/glm-5.2 combo targets) when Vision Bridge auto-reroutes.
                    let priority = 100;
                    if (providerAlias === "openai" || providerAlias === "anthropic") {
                        priority = 50; // Major providers with real API keys
                    } else if (providerAlias === "vertex" || providerAlias === "gemini") {
                        priority = 55;
                    } else if (providerAlias.startsWith("opencode-")) {
                        priority = 95; // Free/catalog — only if nothing credentialed is available
                    } else {
                        priority = 75; // Other providers
                    }
                    candidates.push({
                        modelId: model.id,
                        fullName: fullModelId,
                        priority,
                        averageLatencyMs: calculateAverageLatency(fullModelId),
                        lastUsedAt: 0,
                        successRate: calculateSuccessRate(fullModelId)
                    });
                }));
            }
        }
    }
    await Promise.all(checks);
    return candidates;
}
/**
 * Select the best vision model based on latency, priority, and success rate.
 */ function selectBestModel(candidates, config) {
    const filtered = candidates.filter((c)=>{
        // Exclude explicitly excluded models
        if (config.excludedModels.includes(c.fullName)) return false;
        if (config.excludedModels.includes(c.modelId)) return false;
        // Exclude models with poor success rate (< 50%)
        if (c.successRate < 0.5) return false;
        return true;
    });
    if (filtered.length === 0) return null;
    // Score each candidate: lower is better
    // Score = priority * 1000 + averageLatencyMs
    // This prioritizes local models, then fastest latency
    const scored = filtered.map((c)=>({
            ...c,
            score: c.priority * 1000 + (c.averageLatencyMs === Infinity ? 10000 : c.averageLatencyMs)
        }));
    scored.sort((a, b)=>a.score - b.score);
    return scored[0];
}
async function getBestVisionModel(config = {}, deps = {}) {
    const fullConfig = {
        ...DEFAULT_ROUTER_CONFIG,
        ...config
    };
    // If fixed model is configured, validate it has usable credentials first.
    // (#8430) An unreachable fixedModel (e.g. the default "openai/gpt-4o-mini"
    // on an instance with no OpenAI connection/key) must not short-circuit the
    // credential check — fall through to auto-selection instead.
    if (fullConfig.fixedModel) {
        const checkCreds = deps.hasUsableCredentials ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasUsableCredentialsForModel"];
        const usable = await checkCreds(fullConfig.fixedModel);
        // Only skip credential validation when the check is indeterminate (null).
        // A confirmed `false` means fall through to auto-selection.
        if (usable !== false) {
            return fullConfig.fixedModel;
        }
    }
    // Check selection cache — key includes excluded models to prevent cache pollution
    // across different configurations
    const cacheKey = fullConfig.excludedModels.length > 0 ? `excl:${[
        ...fullConfig.excludedModels
    ].sort().join(",")}` : "default";
    const cached = selectionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.modelId;
    }
    // Get all vision-capable candidates
    const candidates = await getVisionCapableModels(deps);
    // Select best model
    const best = selectBestModel(candidates, fullConfig);
    if (!best) {
        // No vision-capable candidate has usable credentials on this instance
        return null;
    }
    // Cache the selection
    selectionCache.set(cacheKey, {
        modelId: best.fullName,
        expiresAt: Date.now() + fullConfig.selectionCacheTtlMs
    });
    return best.fullName;
}
async function getFallbackModels(excludeModel, config = {}, deps = {}) {
    const fullConfig = {
        ...DEFAULT_ROUTER_CONFIG,
        ...config
    };
    const candidates = await getVisionCapableModels(deps);
    const filtered = candidates.filter((c)=>c.fullName !== excludeModel && !fullConfig.excludedModels.includes(c.fullName) && c.successRate >= 0.5);
    // Sort by score
    const scored = filtered.map((c)=>({
            ...c,
            score: c.priority * 1000 + (c.averageLatencyMs === Infinity ? 10000 : c.averageLatencyMs)
        }));
    scored.sort((a, b)=>a.score - b.score);
    return scored.slice(0, fullConfig.maxFallbackAttempts - 1).map((c)=>c.fullName);
}
function clearSelectionCache() {
    selectionCache.clear();
}
function getLatencyStats() {
    const stats = {};
    for (const [modelId, records] of latencyStore.entries()){
        const recentRecords = records.filter((r)=>r.timestamp > Date.now() - 300_000);
        if (recentRecords.length === 0) continue;
        const avg = recentRecords.reduce((acc, r)=>acc + r.latencyMs, 0) / recentRecords.length;
        const successRate = recentRecords.filter((r)=>r.success).length / recentRecords.length;
        stats[modelId] = {
            avg: Math.round(avg),
            samples: recentRecords.length,
            successRate: Math.round(successRate * 100) / 100
        };
    }
    return stats;
}
}),
"[project]/src/lib/guardrails/visionBridgeHelpers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "callVisionModel",
    ()=>callVisionModel,
    "extractImageParts",
    ()=>extractImageParts,
    "replaceImageParts",
    ()=>replaceImageParts,
    "resolveImageAsDataUri",
    ()=>resolveImageAsDataUri,
    "resolveProviderApiKey",
    ()=>resolveProviderApiKey,
    "resolveVisionBridgeBaseUrl",
    ()=>resolveVisionBridgeBaseUrl
]);
/**
 * Vision Bridge helper functions for image processing.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/remoteImageFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$runtime$2f$ports$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/runtime/ports.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$middleware$2f$chatBodyAdmission$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/middleware/chatBodyAdmission.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/visionBridgeRouter.ts [instrumentation] (ecmascript)");
;
;
;
;
/**
 * Provider to environment variable mapping for API key resolution.
 */ const PROVIDER_API_KEY_MAP = {
    anthropic: "ANTHROPIC_API_KEY",
    google: "GOOGLE_API_KEY",
    openai: "OPENAI_API_KEY"
};
function resolveProviderApiKey(model, explicitKey) {
    if (explicitKey) return explicitKey;
    const isAnthropic = model.startsWith("anthropic/");
    // VISION_BRIDGE_API_KEY only applies to the OpenAI-compatible branch — the
    // Anthropic branch keeps its dedicated key, since the wire format differs.
    if (!isAnthropic) {
        const bridgeKey = (process.env.VISION_BRIDGE_API_KEY || "").trim();
        if (bridgeKey) return bridgeKey;
    }
    const provider = model.includes("/") ? model.split("/")[0] : "";
    const envVar = PROVIDER_API_KEY_MAP[provider] || "OPENAI_API_KEY";
    return process.env[envVar] || "";
}
function resolveVisionBridgeBaseUrl(model) {
    const explicit = (process.env.VISION_BRIDGE_BASE_URL || "").trim();
    if (explicit) return explicit.replace(/\/+$/, "");
    const legacy = (process.env.OPENAI_API_URL || "").trim();
    if (legacy) return legacy.replace(/\/+$/, "");
    // When the model has a non-standard provider prefix (not openai/ or
    // anthropic/), it can only be resolved through OmniRoute's own router,
    // not through a direct OpenAI/Anthropic endpoint. Use the operator-configured
    // port via OMNIROUTE_PORT / PORT env vars, falling back to the default 20128.
    if (model && model.includes("/")) {
        const provider = model.split("/")[0].toLowerCase();
        if (provider !== "openai" && provider !== "anthropic") {
            const { port } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$runtime$2f$ports$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRuntimePorts"])();
            return `http://localhost:${port}/v1`;
        }
    }
    return "https://api.openai.com/v1";
}
function extractImageParts(messages) {
    const results = [];
    if (!Array.isArray(messages)) {
        return results;
    }
    for(let msgIdx = 0; msgIdx < messages.length; msgIdx++){
        const message = messages[msgIdx];
        if (!message || !Array.isArray(message.content)) {
            continue;
        }
        for(let partIdx = 0; partIdx < message.content.length; partIdx++){
            const part = message.content[partIdx];
            if (part?.type === "image_url" && part.image_url?.url) {
                results.push({
                    messageIndex: msgIdx,
                    partIndex: partIdx,
                    imageUrl: part.image_url.url,
                    imageType: "image_url"
                });
            } else if (part?.type === "image" && part.source?.type === "base64") {
                const { media_type, data } = part.source;
                const dataUri = `data:${media_type};base64,${data}`;
                results.push({
                    messageIndex: msgIdx,
                    partIndex: partIdx,
                    imageUrl: dataUri,
                    imageType: "image"
                });
            } else if (part?.type === "image" && part.source?.type === "url") {
                const url = part.source.url;
                if (url) {
                    results.push({
                        messageIndex: msgIdx,
                        partIndex: partIdx,
                        imageUrl: url,
                        imageType: "url"
                    });
                }
            }
        }
    }
    return results;
}
function resolveImageAsDataUri(imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string") {
        throw new Error("Invalid image URL: must be a non-empty string");
    }
    // Already a data URI
    if (imageUrl.startsWith("data:")) {
        return imageUrl;
    }
    // HTTP/HTTPS URL - vision API will fetch it
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
    }
    // Assume it's a base64 string without prefix
    // Add PNG as default media type
    return `data:image/png;base64,${imageUrl}`;
}
async function fetchRemoteImageAsDataUri(imageUrl, signal) {
    const remoteImage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchRemoteImage"])(imageUrl, {
        signal
    });
    const mediaType = remoteImage.contentType.split(";")[0]?.trim() || "image/png";
    return `data:${mediaType};base64,${remoteImage.buffer.toString("base64")}`;
}
async function normalizeVisionImageInput(imageInput, isAnthropic, signal) {
    const normalizedImage = resolveImageAsDataUri(imageInput);
    if (isAnthropic && (normalizedImage.startsWith("http://") || normalizedImage.startsWith("https://"))) {
        return fetchRemoteImageAsDataUri(normalizedImage, signal);
    }
    return normalizedImage;
}
async function callVisionModel(imageDataUri, config, apiKey, routerConfig) {
    // Auto-select the best vision model
    const modelToUse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getBestVisionModel"])({
        fixedModel: config.model,
        ...routerConfig
    });
    // (#8430) When no vision-capable provider has usable credentials on this
    // instance, surface a clear error instead of attempting a describe call that
    // would fail with an opaque auth/serde error upstream.
    if (!modelToUse) {
        throw new Error("No vision-capable provider connected, cannot process image request");
    }
    let lastError = null;
    // Try primary model + fallbacks
    const modelsToTry = [
        modelToUse,
        ...await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getFallbackModels"])(modelToUse, routerConfig)
    ];
    const maxAttempts = Math.min(modelsToTry.length, routerConfig?.maxFallbackAttempts ?? 3);
    for(let attempt = 0; attempt < maxAttempts; attempt++){
        const currentModel = modelsToTry[attempt];
        const attemptStart = Date.now();
        try {
            const result = await callVisionModelSingle(imageDataUri, {
                ...config,
                model: currentModel
            }, apiKey);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordLatency"])(currentModel, Date.now() - attemptStart, true);
            return result;
        } catch (error) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordLatency"])(currentModel, Date.now() - attemptStart, false);
            lastError = error instanceof Error ? error : new Error(String(error));
        // Continue to next model on failure
        }
    }
    // All models failed
    throw lastError || new Error("All vision models failed");
}
/**
 * Unwrap the detailed-log/diagnostics envelope that some OmniRoute paths attach
 * to provider responses (`{ _streamed, _format, summary: {...} }`). Returns the
 * inner `summary` object when present, otherwise the value unchanged.
 */ function unwrapVisionSummary(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const record = value;
        if (record.summary && typeof record.summary === "object") {
            return record.summary;
        }
    }
    return value;
}
/**
 * Parse a vision-bridge response body that may be:
 *   1. Plain JSON (`{ choices: [...] }` / `{ content: [...] }`)
 *   2. An SSE stream of `data: {...}` lines (forceStream providers, or
 *      OmniRoute's self-loop when the `stream` default kicks in)
 *   3. The `{ _streamed, _format, summary }` diagnostics envelope
 *
 * For SSE input, aggregates `delta.content` / `delta.reasoning_content`
 * (OpenAI-compatible) and `delta.text` (Anthropic-style `content_block_delta`)
 * across all chunks into a single chat.completion-shaped object. Returns `null`
 * when the body yields nothing usable.
 */ function parseSseVisionBody(rawBody) {
    const trimmed = String(rawBody || "").trim();
    if (!trimmed) return null;
    // Direct JSON (normal non-stream response).
    try {
        return unwrapVisionSummary(JSON.parse(trimmed));
    } catch  {
    // Fall through to SSE aggregation.
    }
    const contentParts = [];
    const reasoningParts = [];
    const anthropicTextParts = [];
    let sawChoices = false;
    for (const line of trimmed.split(/\r?\n/)){
        const lineTrimmed = line.trim();
        if (!lineTrimmed.startsWith("data:")) continue;
        const payload = lineTrimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        let chunk;
        try {
            chunk = JSON.parse(payload);
        } catch  {
            continue; // Ignore malformed lines and keep scanning.
        }
        if (!chunk || typeof chunk !== "object") continue;
        const unwrapped = unwrapVisionSummary(chunk);
        // Error-only SSE chunk (`data: {"error":{...}}` with no choices) — surface
        // the upstream message instead of a generic "empty or invalid response".
        if (unwrapped.error != null && !Array.isArray(unwrapped.choices)) {
            const err = unwrapped.error;
            let message = "";
            if (typeof err === "string") {
                message = err;
            } else if (typeof err === "object" && !Array.isArray(err)) {
                message = err.message ? String(err.message) : JSON.stringify(err);
            } else {
                message = String(err);
            }
            throw new Error(`Vision API error: ${message}`);
        }
        const choice = unwrapped.choices?.[0];
        if (choice) sawChoices = true;
        const delta = choice?.delta;
        if (typeof delta?.content === "string" && delta.content.length > 0) {
            contentParts.push(delta.content);
        }
        if (typeof delta?.reasoning_content === "string" && delta.reasoning_content.length > 0) {
            reasoningParts.push(delta.reasoning_content);
        }
        // Some providers put a full message (not a delta) in the final chunk.
        const message = choice?.message;
        if (typeof message?.content === "string" && message.content.length > 0) {
            contentParts.push(message.content);
        }
        if (typeof message?.reasoning_content === "string" && message.reasoning_content.length > 0) {
            reasoningParts.push(message.reasoning_content);
        }
        // Anthropic-style streaming: `content_block_delta` with `delta.text`.
        if (Array.isArray(unwrapped.content)) {
            for (const block of unwrapped.content){
                if (typeof block?.text === "string" && block.text.length > 0) {
                    anthropicTextParts.push(block.text);
                }
            }
        }
    }
    if (contentParts.length === 0 && reasoningParts.length === 0 && anthropicTextParts.length === 0 && !sawChoices) {
        return null;
    }
    const content = contentParts.join("").trim();
    const reasoning = reasoningParts.join("").trim();
    const anthropicText = anthropicTextParts.join("").trim();
    if (anthropicText && !content) {
        return {
            content: [
                {
                    type: "text",
                    text: anthropicText
                }
            ]
        };
    }
    const message = {
        role: "assistant",
        content
    };
    if (reasoning) message.reasoning_content = reasoning;
    return {
        choices: [
            {
                message
            }
        ]
    };
}
/**
 * Read a vision-model HTTP response body tolerantly: try `json()` first, then
 * fall back to text/SSE parsing. Some OpenAI-compatible backends (including
 * OmniRoute's own self-loop and forceStream providers) reply with a `data:`
 * SSE stream even for `stream: false`, which makes `response.json()` throw
 * `Unexpected token 'd'`.
 */ async function readVisionResponseBody(response) {
    try {
        // JSON path — also unwrap the { _streamed, summary } diagnostics envelope
        // that some OmniRoute capture paths attach to provider responses.
        return unwrapVisionSummary(await response.json());
    } catch  {
    // Not JSON — attempt SSE / envelope parsing from the raw text.
    }
    let rawText = "";
    try {
        if (typeof response.text === "function") {
            rawText = await response.text();
        }
    } catch  {
        rawText = "";
    }
    const parsed = parseSseVisionBody(rawText);
    if (parsed === null) {
        throw new Error("Vision API returned empty or invalid response");
    }
    return parsed;
}
/**
 * Extract the description text from an OpenAI-compatible vision response.
 * Falls back to `reasoning_content` when `content` is empty — reasoning models
 * (e.g. xiaomi/mimo-v2.5) can exhaust `max_tokens` on chain-of-thought and
 * return `content: null` with a complete analysis in `reasoning_content`.
 */ function extractOpenAICompatibleContent(data) {
    const record = data;
    if (!record || typeof record !== "object" || Array.isArray(record)) {
        throw new Error("Vision API returned invalid response");
    }
    if (record.error) {
        throw new Error(`Vision API error: ${record.error.message || JSON.stringify(record.error)}`);
    }
    const message = record.choices?.[0]?.message;
    const content = typeof message?.content === "string" ? message.content.trim() : "";
    if (content) return content;
    const reasoning = typeof message?.reasoning_content === "string" ? message.reasoning_content.trim() : "";
    if (reasoning) return reasoning;
    throw new Error("Vision API returned empty or invalid response");
}
/**
 * Internal function to call a single vision model.
 */ async function callVisionModelSingle(imageDataUri, config, apiKey) {
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), config.timeoutMs);
    // Resolve API key based on provider
    const resolvedApiKey = resolveProviderApiKey(config.model, apiKey);
    // Detect provider from model identifier
    const isAnthropic = config.model.startsWith("anthropic/");
    try {
        // Extract model name from provider/model format
        const modelName = config.model.includes("/") ? config.model.split("/")[1] : config.model;
        const normalizedImageInput = await normalizeVisionImageInput(imageDataUri, isAnthropic, controller.signal);
        let response;
        if (isAnthropic) {
            // Anthropic API path
            const anthropicBaseUrl = process.env.ANTHROPIC_API_URL || "https://api.anthropic.com";
            // Parse data URI to extract media type and base64 data
            const matches = normalizedImageInput.match(/^data:([^;]+);base64,(.+)$/);
            let mediaType = "image/png";
            let base64Data = normalizedImageInput;
            if (matches) {
                mediaType = matches[1];
                base64Data = matches[2];
            }
            response = await fetch(`${anthropicBaseUrl}/v1/messages`, {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "x-api-key": resolvedApiKey,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "image",
                                    source: {
                                        type: "base64",
                                        media_type: mediaType,
                                        data: base64Data
                                    }
                                },
                                {
                                    type: "text",
                                    text: config.prompt
                                }
                            ]
                        }
                    ],
                    max_tokens: 300
                })
            });
        } else {
            // OpenAI-compatible path (default) — issue #2232: honor
            // VISION_BRIDGE_BASE_URL so the vision-bridge call can be routed through
            // OmniRoute itself or any other OpenAI-compatible endpoint instead of
            // hardcoded api.openai.com.
            const baseUrl = resolveVisionBridgeBaseUrl(config.model);
            // When routing through the OmniRoute self-loop (non-standard provider),
            // keep the full provider-prefixed model ID so OmniRoute can resolve the
            // correct provider backend. Only strip the prefix for direct OpenAI calls.
            const useFullModelId = baseUrl.startsWith("http://localhost") && config.model.includes("/") && !config.model.startsWith("openai/");
            const requestModel = useFullModelId ? config.model : modelName;
            // Build headers with optional recursion guard for self-loop calls.
            // When routing through OmniRoute's own API, omit the vision-bridge
            // guardrail on the sub-request to prevent infinite recursion.
            // Use sk_omniroute as fallback for self-loop if no API key is resolved.
            const selfLoopApiKey = resolvedApiKey || "sk_omniroute";
            const headers = {
                "Content-Type": "application/json",
                // Explicit JSON opt-in: without `Accept: application/json` OmniRoute's
                // self-loop defaults to SSE (resolveStreamFlag's legacy default) and the
                // describe call would receive a `data:` stream that response.json() can't
                // parse (`Unexpected token 'd'`), failing the whole vision-bridge
                // describe path. Pair with `stream: false` below.
                Accept: "application/json",
                Authorization: `Bearer ${selfLoopApiKey}`
            };
            if (useFullModelId) {
                headers["x-omniroute-disabled-guardrails"] = "vision-bridge";
                // Internal self-loop sub-request: the parent request already holds the
                // single heavyweight admission lease (`CHAT_MAX_HEAVY_IN_FLIGHT=1`), so a
                // large base64-image describe body would be rejected with 503
                // `chat_admission_busy` before it is described. The route only honors
                // this header for trusted self-loop credentials (the local
                // `sk_omniroute` sentinel OR the operator-configured env key), so
                // external clients cannot use it to bypass admission.
                headers["x-omniroute-admission-bypass"] = "internal";
                // The admission bypass honors the env key when set (REQUIRE_API_KEY=true
                // deployments) and the `sk_omniroute` sentinel otherwise. Force the same
                // resolved credential so the bypass holds even when a real vision key is
                // configured for the vision model's provider.
                headers["Authorization"] = `Bearer ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$middleware$2f$chatBodyAdmission$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveSelfLoopBearer"])()}`;
            }
            response = await fetch(`${baseUrl}/chat/completions`, {
                method: "POST",
                signal: controller.signal,
                headers,
                body: JSON.stringify({
                    model: requestModel,
                    stream: false,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: normalizedImageInput,
                                        detail: "low"
                                    }
                                },
                                {
                                    type: "text",
                                    text: config.prompt
                                }
                            ]
                        }
                    ],
                    max_tokens: 300
                })
            });
        }
        clearTimeout(timeoutId);
        if (!response.ok) {
            const errorText = await response.text().catch(()=>"Unknown error");
            throw new Error(`Vision API error ${response.status}: ${errorText}`);
        }
        const data = await readVisionResponseBody(response);
        if (isAnthropic) {
            // Anthropic response format: { content: [{ type: "text", text: "..." }] }
            const anthropicData = data;
            if (anthropicData.error) {
                throw new Error(`Vision API error: ${anthropicData.error.message || JSON.stringify(anthropicData.error)}`);
            }
            const textContent = anthropicData.content?.find((c)=>c.type === "text");
            const content = textContent?.text;
            if (!content || typeof content !== "string") {
                throw new Error("Vision API returned empty or invalid response");
            }
            return content.trim();
        } else {
            // OpenAI-compatible response format. Falls back to reasoning_content when
            // content is null — reasoning models (e.g. xiaomi/mimo-v2.5) can exhaust
            // max_tokens on chain-of-thought and return content: null with the full
            // analysis in reasoning_content.
            return extractOpenAICompatibleContent(data);
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error("Vision model call timed out");
        }
        throw error;
    }
}
function replaceImageParts(body, // #4012: a `null` entry means the describe call failed for that image — keep
// the original image part instead of dropping it / stubbing "(unavailable)".
descriptions) {
    if (!descriptions || descriptions.length === 0) {
        return body;
    }
    const result = structuredClone(body);
    if (!Array.isArray(result.messages)) {
        return result;
    }
    let descriptionIndex = 0;
    for(let msgIdx = 0; msgIdx < result.messages.length; msgIdx++){
        const message = result.messages[msgIdx];
        if (!message || !Array.isArray(message.content)) {
            continue;
        }
        const newContent = [];
        for (const part of message.content){
            if (part?.type === "image_url" || part?.type === "image") {
                if (descriptionIndex < descriptions.length) {
                    const description = descriptions[descriptionIndex];
                    descriptionIndex++;
                    if (description == null) {
                        // #4012: describe failed for this image — preserve the original
                        // image so a vision-capable upstream can still process it.
                        newContent.push(part);
                    } else {
                        newContent.push({
                            type: "text",
                            text: description
                        });
                    }
                }
            } else {
                newContent.push(part);
            }
        }
        message.content = newContent;
    }
    return result;
}
}),
"[project]/src/lib/guardrails/visionBridge.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "VisionBridgeGuardrail",
    ()=>VisionBridgeGuardrail
]);
/**
 * Vision Bridge Guardrail.
 * Intercepts image-bearing requests to non-vision models.
 * For individual non-vision models: reroutes to the fastest available vision-capable model.
 * For combos with non-vision targets: extracts descriptions via vision model and replaces images with text.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/base.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/visionBridgeHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionBridgeDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/visionBridgeDefaults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/visionBridgeRouter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/visionBridgeCredentials.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
/// Check if a combo model should trigger vision bridge processing.
/// Resolves combo targets and returns:
/// - "process" if any target cannot be proven vision-capable
/// - "skip" if all model targets can handle images directly
/// - "not-combo" when the model is not a combo/mapping
async function getComboVisionBridgeDecision(model) {
    try {
        const { getComboByName } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
        const { resolveComboForModel } = await __turbopack_context__.A("[project]/src/lib/db/modelComboMappings.ts [instrumentation] (ecmascript, async loader)");
        // 1. Try to find combo by exact name match
        let combo = await getComboByName(model);
        // 2. If no exact match, try model-combo mapping
        if (!combo) {
            const mapping = await resolveComboForModel(model);
            if (!mapping) return "not-combo";
            const comboName = mapping.comboName ?? mapping.name ?? null;
            if (!comboName) return "not-combo";
            combo = await getComboByName(comboName);
        }
        if (!combo) return "not-combo";
        // 3. Get the combo's models (target steps)
        const rawModels = combo.models;
        if (!Array.isArray(rawModels)) return "process";
        // 4. Check each target for vision support
        // combo-ref → conservative (process images)
        // model step with no native vision → process images
        // all model steps with native vision → safe to skip
        let hasModelStep = false;
        for (const step of rawModels){
            const s = step;
            if (s.kind === "combo-ref") return "process";
            if (s.kind === "model") {
                hasModelStep = true;
                const targetModel = s.model;
                if (typeof targetModel === "string") {
                    const caps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])(targetModel);
                    if (caps.supportsVision !== true) {
                        return "process";
                    }
                } else {
                    return "process";
                }
            }
        }
        // All model steps support vision — safe to skip
        if (hasModelStep) return "skip";
        // No recognizable steps — don't force bridge
        return "not-combo";
    } catch  {
        // On error, try to process images (conservative)
        return "process";
    }
}
class VisionBridgeGuardrail extends __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseGuardrail"] {
    name = "vision-bridge";
    priority = 5;
    deps;
    constructor(options){
        super("vision-bridge", {
            priority: 5,
            enabled: options?.enabled
        });
        this.deps = options?.deps ?? {};
    }
    async preCall(payload, context) {
        // 1. Check if disabled at guardrail level
        if (!this.enabled) {
            return {
                block: false
            };
        }
        // 2. Check disabled via context (header, body, API key)
        if (context.disabledGuardrails?.includes("vision-bridge")) {
            return {
                block: false
            };
        }
        // 3. Get model from context or payload
        const model = context.model || payload?.model;
        if (!model) {
            return {
                block: false
            };
        }
        // 3b. Auto/ prefix — don't skip guardrail entirely. Images still need to be
        // described or rerouted to a vision-capable model. The auto-combo resolver
        // does NOT currently filter models by vision capability, so without the
        // guardrail an image-bearing request assigned to a text-only model will
        // fail upstream with "does not support images".
        const isAuto = model === "auto" || model.startsWith("auto/");
        // Declare before the conditional so they're available to the rest of preCall
        let forceVisionBridge = false;
        let comboVisionBridgeDecision;
        if (!isAuto) {
            forceVisionBridge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionBridgeDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isVisionBridgeForcedModel"])(model);
            // 4. Check if model supports vision
            const capabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])(model);
            comboVisionBridgeDecision = forceVisionBridge ? "process" : this.deps.checkModelHasComboMapping ? await this.deps.checkModelHasComboMapping(model) ? "process" : "skip" : await getComboVisionBridgeDecision(model);
            if (comboVisionBridgeDecision === "skip") {
                return {
                    block: false
                };
            }
            if (capabilities?.supportsVision === true && !forceVisionBridge) {
                // The request model supports vision natively, but check if a
                // model-combo mapping routes this model through a combo where
                // some targets may NOT support vision. In that case, the vision
                // bridge must process images so combo targets can describe them.
                if (comboVisionBridgeDecision !== "process") {
                    return {
                        block: false
                    };
                }
            // Combo mapping found — fall through to process images
            }
        }
        // For auto models (isAuto=true), force remains false and combo decision
        // remains undefined, which makes the reroute check on line ~189 treat it
        // like a non-combo model — exactly what we want: reroute to a vision model.
        // 5. Get body and check for messages
        const body = payload;
        const messages = body?.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                block: false
            };
        }
        // 6. Check for images using helper (extractImageParts returns empty if no images)
        const imageParts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractImageParts"])(messages);
        if (imageParts.length === 0) {
            return {
                block: false
            };
        }
        // 7. Get settings (injectable for testing)
        const getSettings = this.deps.getSettings ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"];
        let settings = {};
        try {
            settings = await getSettings();
        } catch  {
        // If getSettings fails, use defaults
        }
        // 8. Check if Vision Bridge is enabled in settings
        const enabled = settings.visionBridgeEnabled ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionBridgeDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["VISION_BRIDGE_DEFAULTS"].enabled;
        if (!enabled) {
            return {
                block: false
            };
        }
        // 9. Individual non-combo model with images → optionally REROUTE to best vision-capable model
        // instead of describing images through an intermediate vision call.
        //
        // CRITICAL (VibeProxy combo / explicit provider models):
        // When the original model already has usable credentials (e.g. combo target
        // zai/glm-5.2), NEVER whole-request-reroute to another provider. Auto-select
        // prefers opencode-* (priority 0) even when only a broken noauth connection
        // exists, which produced: HTTP log zai → Guardrail reroute → opencode-zen 401
        // "Missing API key" while the combo UI still showed body=zai. Fall through to
        // the image-describe path so the user's chosen model still answers.
        //
        // Reroute also fires for the auto/ prefix (isAuto): the auto-combo resolver
        // does not filter candidates for vision capability, so an image-bearing
        // request with model=auto would land on a text-only model (#7871). Keeping
        // "auto" is never the answer there, so the keep-credentialed-model skip
        // below does not apply to auto — only the reroute-target credential guard.
        if ((comboVisionBridgeDecision === "not-combo" || isAuto) && !forceVisionBridge) {
            const checkCreds = this.deps.hasUsableCredentials ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasUsableCredentialsForModel"];
            const originalUsable = await checkCreds(model);
            if (originalUsable === true && !isAuto) {
                // Keep the credentialed model; describe images below if needed.
                context.log?.debug?.("VISION_BRIDGE", `Skipping whole-request vision reroute; keeping credentialed model ${model}`);
            } else {
                // Honor an explicit operator override from the Vision Bridge settings tab
                // (settings.visionBridgeModel) as the fixed reroute target, for consistency
                // with the combo/describe path below (step 10) which always honors it via
                // getVisionBridgeConfig. When unset, auto-select the fastest available
                // vision-capable model from available providers.
                const configuredModel = typeof settings.visionBridgeModel === "string" && settings.visionBridgeModel.trim() ? settings.visionBridgeModel.trim() : undefined;
                // Propagate the same resolved credential check used by the adjacent
                // checkCreds() calls above/below (#8430) — without this, the router
                // falls back to the real DB-backed hasUsableCredentialsForModel and
                // ignores an injected `deps.hasUsableCredentials` test/DI override.
                const bestModel = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getBestVisionModel"])({
                    fixedModel: configuredModel
                }, {
                    hasUsableCredentials: checkCreds
                });
                if (bestModel && bestModel !== model) {
                    const bestUsable = await checkCreds(bestModel);
                    // Only block the reroute when we KNOW the target is unusable (false).
                    // `null` (no DB / tests) fails open so existing unit tests keep working.
                    if (bestUsable === false) {
                        context.log?.warn?.("VISION_BRIDGE", `Vision reroute target ${bestModel} has no usable credentials; describing images instead of hijacking ${model}`);
                    } else {
                        const modifiedBody = {
                            ...body,
                            model: bestModel
                        };
                        return {
                            block: false,
                            modifiedPayload: modifiedBody,
                            meta: {
                                rerouted: true,
                                fromModel: model,
                                toModel: bestModel,
                                imagesKept: imageParts.length
                            }
                        };
                    }
                }
            }
        // Fall through: describe images as text (or no-op if describe path can't run)
        }
        // 10. Get configuration
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionBridgeDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getVisionBridgeConfig"])({
            visionBridgeEnabled: settings.visionBridgeEnabled,
            visionBridgeModel: settings.visionBridgeModel,
            visionBridgePrompt: settings.visionBridgePrompt,
            visionBridgeTimeout: settings.visionBridgeTimeout,
            visionBridgeMaxImages: settings.visionBridgeMaxImages
        });
        // 11. Limit images
        const limitedParts = imageParts.slice(0, config.maxImages);
        // 12. Call vision model for each image in parallel (injectable for testing)
        const callVision = this.deps.callVisionModel ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["callVisionModel"];
        const logger = context.log;
        const startTime = Date.now();
        // Process all images in parallel using Promise.allSettled for fail-partial behavior
        const results = await Promise.allSettled(limitedParts.map(async (imagePart, i)=>{
            const description = await callVision(imagePart.imageUrl, config);
            return `[Image ${i + 1}]: ${description}`;
        }));
        // Collect descriptions maintaining original order. A failed describe yields
        // `null` so the original image is preserved downstream (#4012) — replacing it
        // with an "(unavailable)" stub silently destroyed images for vision-capable
        // upstreams whose capability OmniRoute couldn't prove from the registry.
        const descriptions = results.map((result, i)=>{
            if (result.status === "fulfilled") {
                return result.value;
            }
            const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
            logger?.warn?.("VISION-BRIDGE", `Failed to get description for image ${i + 1}: ${message}`);
            return null;
        });
        // 12b. (#8430) When every describe call failed (all null descriptions) in
        // the combo describe path, the upstream is a confirmed non-vision model that
        // cannot process raw images — replacing them with an "(unavailable)" stub
        // is safe here because the upstream can only handle text. The original #4012
        // preserve-raw behavior only applies to paths where the upstream might still
        // be vision-capable (reroute path / unknown capability).
        const allNull = descriptions.every((d)=>d === null);
        if (allNull && comboVisionBridgeDecision === "process") {
            for(let i = 0; i < descriptions.length; i++){
                descriptions[i] = `[Image ${i + 1}]: (unavailable — no vision-capable provider connected)`;
            }
        }
        // 13. Replace image parts with text descriptions (null → keep original image)
        const modifiedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridgeHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["replaceImageParts"])(body, descriptions);
        const processingTime = Date.now() - startTime;
        return {
            block: false,
            modifiedPayload: modifiedBody,
            meta: {
                imagesProcessed: descriptions.length,
                // Keep meta observability stable: report a human label for failures.
                descriptions: descriptions.map((d, i)=>d ?? `[Image ${i + 1}]: (unavailable)`),
                processingTimeMs: processingTime,
                visionModel: config.model
            }
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/guardrails/credentialMasker.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CREDENTIAL_PATTERNS",
    ()=>CREDENTIAL_PATTERNS,
    "CredentialMaskerGuardrail",
    ()=>CredentialMaskerGuardrail,
    "redactCredentials",
    ()=>redactCredentials
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/base.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const CREDENTIAL_PATTERNS = [
    // ── LLM provider keys ──────────────────────────────────────────────────
    {
        name: "openai_proj",
        regex: /sk-proj-[A-Za-z0-9_-]{20,}/g,
        replacement: "[REDACTED:openai]"
    },
    {
        name: "openai",
        regex: /\bsk-[A-Za-z0-9]{48}\b/g,
        replacement: "[REDACTED:openai]"
    },
    {
        name: "anthropic",
        regex: /sk-ant-api[0-9]?-[A-Za-z0-9_-]{20,}/g,
        replacement: "[REDACTED:anthropic]"
    },
    {
        name: "anthropic_alt",
        regex: /sk-ant-[A-Za-z0-9_-]{20,}/g,
        replacement: "[REDACTED:anthropic]"
    },
    {
        name: "google",
        regex: /AIza[0-9A-Za-z_-]{35}/g,
        replacement: "[REDACTED:google]"
    },
    {
        name: "huggingface",
        regex: /hf_[A-Za-z0-9]{34}/g,
        replacement: "[REDACTED:hf]"
    },
    {
        name: "replicate",
        regex: /r8_[A-Za-z0-9]{37}/g,
        replacement: "[REDACTED:replicate]"
    },
    // ── VCS / SaaS tokens ──────────────────────────────────────────────────
    {
        name: "github",
        regex: /gh[pousr]_[A-Za-z0-9]{36,}/g,
        replacement: "[REDACTED:github]"
    },
    {
        name: "slack",
        regex: /xox[bpoa]-[A-Za-z0-9-]{10,}/g,
        replacement: "[REDACTED:slack]"
    },
    {
        name: "linear",
        regex: /lin_api_[A-Za-z0-9]{40}/g,
        replacement: "[REDACTED:linear]"
    },
    {
        name: "notion",
        regex: /secret_[A-Za-z0-9]{43}/g,
        replacement: "[REDACTED:notion]"
    },
    {
        name: "npm",
        regex: /npm_[A-Za-z0-9]{36}/g,
        replacement: "[REDACTED:npm]"
    },
    {
        name: "postman",
        regex: /PMAK-[a-f0-9]{8}-[a-f0-9]{32}/g,
        replacement: "[REDACTED:postman]"
    },
    {
        name: "discord",
        regex: /\b[MN][A-Za-z0-9]{23}\.[A-Za-z0-9]{6}\.[A-Za-z0-9]{27}\b/g,
        replacement: "[REDACTED:discord]"
    },
    // ── Payments ───────────────────────────────────────────────────────────
    {
        name: "stripe",
        regex: /(?:sk|rk)_(?:live|test)_[0-9a-zA-Z]{24,}/g,
        replacement: "[REDACTED:stripe]"
    },
    {
        name: "square",
        regex: /sq0(?:atp-[0-9A-Za-z_-]{22}|csp-[0-9A-Za-z_-]{43})/g,
        replacement: "[REDACTED:square]"
    },
    // ── Cloud / infra ──────────────────────────────────────────────────────
    {
        name: "aws_access_key",
        regex: /AKIA[0-9A-Z]{16}/g,
        replacement: "[REDACTED:aws]"
    },
    {
        name: "twilio",
        regex: /\bSK[0-9a-fA-F]{32}\b/g,
        replacement: "[REDACTED:twilio]"
    },
    {
        name: "sendgrid",
        regex: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g,
        replacement: "[REDACTED:sendgrid]"
    },
    {
        name: "mailgun",
        regex: /key-[a-f0-9]{32}/g,
        replacement: "[REDACTED:mailgun]"
    },
    // ── Crypto / identity ──────────────────────────────────────────────────
    {
        name: "private_key",
        regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g,
        replacement: "[REDACTED:private_key]"
    },
    {
        name: "jwt",
        regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
        replacement: "[REDACTED:jwt]"
    },
    // ── Connection strings (creds embedded in URI) ─────────────────────────
    {
        name: "connection_string",
        regex: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis|amqp):\/\/[^:/@\s"']+:[^:/@\s"']+@/g,
        replacement: "[REDACTED:connection_string]"
    },
    // ── Header-style secrets ───────────────────────────────────────────────
    {
        name: "auth_header",
        regex: /((?:["\x27]?(?:Authorization|x-api-key|api-key|apikey)["\x27]?\s*[:=]\s*["\x27]?)(?:(?:Bearer|Basic|Token)\s+)?)[A-Za-z0-9._~+/=-]{10,}/gi,
        replacement: "$1[REDACTED:auth_header]"
    }
];
function redactCredentials(text) {
    if (typeof text !== "string" || !text) return {
        text,
        detections: [],
        modified: false
    };
    let result = text;
    const detections = [];
    for (const p of CREDENTIAL_PATTERNS){
        p.regex.lastIndex = 0;
        const matches = result.match(p.regex);
        if (matches && matches.length > 0) {
            result = result.replace(p.regex, p.replacement);
            detections.push({
                type: p.name,
                count: matches.length
            });
        }
    }
    return {
        text: result,
        detections,
        modified: result !== text
    };
}
function isSensitiveHeaderKey(key) {
    return [
        "authorization",
        "x-api-key",
        "api-key",
        "apikey"
    ].includes(key.toLowerCase());
}
function redactHeaderValue(value) {
    const schemePrefix = value.match(/^(\s*(?:(?:Bearer|Basic|Token)\s+)?)/i)?.[1] || "";
    return schemePrefix + "[REDACTED:auth_header]";
}
/** Redact values without cloning unchanged branches or non-plain objects. */ function walkValue(value, detections, seen = new WeakSet()) {
    if (typeof value === "string") {
        const r = redactCredentials(value);
        if (r.detections.length) detections.push(...r.detections);
        return {
            modified: r.modified,
            value: r.text
        };
    }
    if (Array.isArray(value)) {
        if (seen.has(value)) return {
            modified: false,
            value
        };
        seen.add(value);
        let next = null;
        for(let index = 0; index < value.length; index++){
            const r = walkValue(value[index], detections, seen);
            if (r.modified && !next) next = value.slice(0, index);
            if (next) next[index] = r.value;
        }
        seen.delete(value);
        return {
            modified: next !== null,
            value: next ?? value
        };
    }
    if (value && typeof value === "object") {
        if (seen.has(value)) return {
            modified: false,
            value
        };
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== null && prototype !== Object.prototype) return {
            modified: false,
            value
        };
        seen.add(value);
        const entries = Object.entries(value);
        let next = null;
        for(let index = 0; index < entries.length; index++){
            const [key, entryValue] = entries[index];
            const structuredHeader = isSensitiveHeaderKey(key) && typeof entryValue === "string";
            const redactedHeader = structuredHeader ? redactHeaderValue(entryValue) : null;
            const r = structuredHeader ? {
                modified: redactedHeader !== entryValue,
                value: redactedHeader
            } : walkValue(entryValue, detections, seen);
            if (structuredHeader && r.modified) detections.push({
                type: "auth_header",
                count: 1
            });
            if (r.modified && !next) {
                next = Object.create(prototype);
                for(let previous = 0; previous < index; previous++){
                    const [previousKey, previousValue] = entries[previous];
                    next[previousKey] = previousValue;
                }
            }
            if (next) next[key] = r.value;
        }
        seen.delete(value);
        return {
            modified: next !== null,
            value: next ?? value
        };
    }
    return {
        modified: false,
        value
    };
}
/** Walk request payloads without changing safe values. */ function redactPayload(payload, detections) {
    const r = walkValue(payload, detections);
    return {
        modified: r.modified,
        payload: r.value
    };
}
/** Walk provider responses and redact credentials. */ function redactResponse(response, detections) {
    const r = walkValue(response, detections);
    return {
        modified: r.modified,
        response: r.value
    };
}
class CredentialMaskerGuardrail extends __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseGuardrail"] {
    constructor(options = {}){
        super("credential-masker", {
            enabled: options.enabled,
            priority: options.priority ?? 95
        });
    }
    async preCall(payload, _context) {
        const _s = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        if (!(_s.credentialRedactionEnabled === true || process.env.CREDENTIAL_REDACTION_ENABLED === "true")) return {
            block: false
        };
        const detections = [];
        const { modified, payload: next } = redactPayload(payload, detections);
        if (!modified) return {
            block: false
        };
        return {
            block: false,
            modifiedPayload: next,
            meta: {
                credentialsRedacted: detections,
                count: detections.reduce((n, d)=>n + d.count, 0)
            }
        };
    }
    async postCall(response, _context) {
        const _s = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        if (!(_s.credentialRedactionEnabled === true || process.env.CREDENTIAL_REDACTION_ENABLED === "true")) return {
            block: false
        };
        const detections = [];
        const { modified, response: next } = redactResponse(response, detections);
        if (!modified) return {
            block: false
        };
        return {
            block: false,
            modifiedResponse: next,
            meta: {
                credentialsRedacted: detections,
                count: detections.reduce((n, d)=>n + d.count, 0)
            }
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/guardrails/registry.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GuardrailRegistry",
    ()=>GuardrailRegistry,
    "guardrailRegistry",
    ()=>guardrailRegistry,
    "registerDefaultGuardrails",
    ()=>registerDefaultGuardrails,
    "resetGuardrailsForTests",
    ()=>resetGuardrailsForTests,
    "resolveDisabledGuardrails",
    ()=>resolveDisabledGuardrails
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/base.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$piiMasker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/piiMasker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$promptInjection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/promptInjection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridge$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/guardrails/visionBridge.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$credentialMasker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/credentialMasker.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridge$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$credentialMasker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridge$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$credentialMasker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
/**
 * `preCall`/`postCall` may legitimately return nothing — that is the documented
 * "no change" signal, alongside `{}` and `{ block: false }`
 * (`docs/security/GUARDRAILS.md`), and `CredentialMaskerGuardrail` still declares
 * the `| void` arm.
 *
 * `void` is not a value the checker lets us inspect, so neither `result?.block`
 * nor a truthiness test compiles against `GuardrailResult | void`. Funnel the
 * return through `unknown` once, here, and hand the dispatch loops a plain
 * optional. Runtime behavior is unchanged: a guardrail that returns nothing
 * still yields `undefined` and is still treated as "passed".
 */ function asGuardrailResult(raw) {
    return raw && typeof raw === "object" ? raw : undefined;
}
function isHeaderStore(headers) {
    return Boolean(headers && typeof headers.get === "function");
}
function getHeaderValue(headers, name) {
    if (!headers) return null;
    if (isHeaderStore(headers)) return headers.get(name);
    const lowered = name.toLowerCase();
    for (const [key, value] of Object.entries(headers)){
        if (key.toLowerCase() !== lowered || typeof value !== "string") continue;
        return value;
    }
    return null;
}
function normalizeGuardrailName(name) {
    return name.trim().toLowerCase().replace(/[_\s]+/g, "-");
}
function coerceDisabledGuardrails(value) {
    if (typeof value === "string") {
        return value.split(",").map((entry)=>normalizeGuardrailName(entry)).filter(Boolean);
    }
    if (!Array.isArray(value)) return [];
    return value.filter((entry)=>typeof entry === "string").map((entry)=>normalizeGuardrailName(entry)).filter(Boolean);
}
function getGuardrailLogger(context) {
    return context.log || console;
}
function resolveDisabledGuardrails({ apiKeyInfo, body, headers }) {
    const bodyRecord = body && typeof body === "object" ? body : null;
    const metadata = bodyRecord?.metadata && typeof bodyRecord.metadata === "object" ? bodyRecord.metadata : null;
    const apiKeyDisabled = apiKeyInfo && typeof apiKeyInfo === "object" ? apiKeyInfo.disabledGuardrails : undefined;
    const headerDisabled = getHeaderValue(headers, "x-omniroute-disabled-guardrails") || getHeaderValue(headers, "x-disabled-guardrails");
    return [
        ...coerceDisabledGuardrails(apiKeyDisabled)
    ].concat(coerceDisabledGuardrails(bodyRecord?.disabledGuardrails)).concat(coerceDisabledGuardrails(metadata?.disabledGuardrails)).concat(coerceDisabledGuardrails(headerDisabled)).filter((value, index, list)=>list.indexOf(value) === index);
}
class GuardrailRegistry {
    guardrails = [];
    register(guardrail) {
        if (!(guardrail instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["BaseGuardrail"])) {
            throw new Error("Guardrail must extend BaseGuardrail");
        }
        this.guardrails = this.guardrails.filter((existing)=>normalizeGuardrailName(existing.name) !== normalizeGuardrailName(guardrail.name));
        this.guardrails.push(guardrail);
        this.guardrails.sort((left, right)=>left.priority - right.priority);
        return guardrail;
    }
    clear() {
        this.guardrails = [];
    }
    list() {
        return [
            ...this.guardrails
        ];
    }
    isDisabled(guardrail, context) {
        const disabled = new Set((context.disabledGuardrails || []).map((entry)=>normalizeGuardrailName(entry)));
        return disabled.has(normalizeGuardrailName(guardrail.name));
    }
    async runPreCallHooks(payload, context = {}) {
        const logger = getGuardrailLogger(context);
        const results = [];
        let currentPayload = payload;
        for (const guardrail of this.guardrails){
            if (!guardrail.enabled || this.isDisabled(guardrail, context)) {
                results.push({
                    blocked: false,
                    guardrail: guardrail.name,
                    modified: false,
                    skipped: true,
                    stage: "pre"
                });
                continue;
            }
            try {
                const result = asGuardrailResult(await guardrail.preCall(currentPayload, context));
                const modified = result?.modifiedPayload !== undefined;
                const meta = result?.meta || null;
                if (modified) {
                    currentPayload = result?.modifiedPayload;
                }
                const execution = {
                    blocked: result?.block === true,
                    guardrail: guardrail.name,
                    message: result?.message,
                    meta,
                    modified,
                    skipped: false,
                    stage: "pre"
                };
                results.push(execution);
                logger.debug?.("GUARDRAIL", `${guardrail.name} pre-call ${execution.blocked ? "blocked" : modified ? "modified" : "passed"}`, meta || undefined);
                if (execution.blocked) {
                    return {
                        blocked: true,
                        guardrail: guardrail.name,
                        message: result?.message,
                        payload: currentPayload,
                        results
                    };
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                results.push({
                    blocked: false,
                    error: message,
                    guardrail: guardrail.name,
                    modified: false,
                    skipped: false,
                    stage: "pre"
                });
                logger.warn?.("GUARDRAIL", `${guardrail.name} pre-call failed open`, {
                    error: message
                });
            }
        }
        return {
            blocked: false,
            payload: currentPayload,
            results
        };
    }
    async runPostCallHooks(response, context = {}) {
        const logger = getGuardrailLogger(context);
        const results = [];
        let currentResponse = response;
        for (const guardrail of this.guardrails){
            if (!guardrail.enabled || this.isDisabled(guardrail, context)) {
                results.push({
                    blocked: false,
                    guardrail: guardrail.name,
                    modified: false,
                    skipped: true,
                    stage: "post"
                });
                continue;
            }
            try {
                const result = asGuardrailResult(await guardrail.postCall(currentResponse, context));
                const modified = result?.modifiedResponse !== undefined;
                const meta = result?.meta || null;
                if (modified) {
                    currentResponse = result?.modifiedResponse;
                }
                const execution = {
                    blocked: result?.block === true,
                    guardrail: guardrail.name,
                    message: result?.message,
                    meta,
                    modified,
                    skipped: false,
                    stage: "post"
                };
                results.push(execution);
                logger.debug?.("GUARDRAIL", `${guardrail.name} post-call ${execution.blocked ? "blocked" : modified ? "modified" : "passed"}`, meta || undefined);
                if (execution.blocked) {
                    return {
                        blocked: true,
                        guardrail: guardrail.name,
                        message: result?.message,
                        response: currentResponse,
                        results
                    };
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                results.push({
                    blocked: false,
                    error: message,
                    guardrail: guardrail.name,
                    modified: false,
                    skipped: false,
                    stage: "post"
                });
                logger.warn?.("GUARDRAIL", `${guardrail.name} post-call failed open`, {
                    error: message
                });
            }
        }
        return {
            blocked: false,
            response: currentResponse,
            results
        };
    }
}
const guardrailRegistry = new GuardrailRegistry();
let defaultGuardrailsRegistered = false;
function registerDefaultGuardrails() {
    if (defaultGuardrailsRegistered) return guardrailRegistry;
    guardrailRegistry.register(new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$visionBridge$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["VisionBridgeGuardrail"]());
    guardrailRegistry.register(new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$piiMasker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PIIMaskerGuardrail"]());
    guardrailRegistry.register(new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$credentialMasker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialMaskerGuardrail"]());
    guardrailRegistry.register(new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$promptInjection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PromptInjectionGuardrail"]());
    defaultGuardrailsRegistered = true;
    return guardrailRegistry;
}
function resetGuardrailsForTests({ registerDefaults = true } = {}) {
    guardrailRegistry.clear();
    defaultGuardrailsRegistered = false;
    if (registerDefaults) {
        registerDefaultGuardrails();
    }
}
registerDefaultGuardrails();
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/guardrails/index.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$piiMasker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/piiMasker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$promptInjection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/promptInjection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$credentialMasker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/credentialMasker.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$credentialMasker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$credentialMasker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/runtime/ports.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/display/names.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getAccountDisplayName",
    ()=>getAccountDisplayName,
    "getProviderDisplayName",
    ()=>getProviderDisplayName
]);
/**
 * Centralized display name helpers for provider and account/connection labels.
 *
 * Prevents raw internal IDs (connection UUIDs, dynamic provider IDs) from
 * leaking into user-facing dashboards (Health, Analytics, Sessions, Rate-limits,
 * Quota, Compatible Provider pages, etc.).
 *
 * Priority order:
 *   — Account: name → displayName → email → short readble label
 *   — Provider: node.name → node.prefix → alias → readable ID
 *
 * @module lib/display/names
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/compatibleProviderId.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function getAccountDisplayName(conn) {
    if (!conn) return "Unknown Account";
    const name = typeof conn.name === "string" && conn.name.trim() || typeof conn.displayName === "string" && conn.displayName.trim() || typeof conn.email === "string" && conn.email.trim();
    if (name) return name;
    if (typeof conn.id === "string" && conn.id) {
        return `Account #${conn.id.slice(0, 6)}`;
    }
    return "Unknown Account";
}
function getProviderDisplayName(providerId, providerNode) {
    if (providerNode?.name?.trim()) return providerNode.name.trim();
    if (providerNode?.prefix?.trim()) return providerNode.prefix.trim();
    if (!providerId) return "Unknown Provider";
    // Simplify dynamic compatible provider IDs (all 4 generated shapes — #8326)
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isCompatibleProviderConnectionId"])(providerId)) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId)) return "CC Compatible";
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(providerId)) return "Compatible (openai)";
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAnthropicCompatibleProvider"])(providerId)) return "Compatible (anthropic)";
    }
    return providerId;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
/**
 * usageDb.js — Facade (T-15 decomposition)
 *
 * This file is now a thin re-export layer. All logic has been
 * extracted into focused modules under `./usage/`:
 *
 *   migrations.js     — Legacy file + JSON→SQLite migration
 *   usageHistory.js   — Usage tracking, request log, pending requests
 *   costCalculator.js — Cost calculation (pure function)
 *   usageStats.js     — Aggregated stats for dashboard
 *   callLogs.js       — Structured call log management
 *
 * Existing imports like `import { getUsageStats } from "@/lib/usageDb"`
 * continue to work unchanged.
 */ // Trigger migrations on module load (side-effect)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/migrations.ts [instrumentation] (ecmascript)");
// Re-export everything for backward compatibility
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/usageStats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/embeddings/familyGuard.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "findEmbeddingComboDimensionConflict",
    ()=>findEmbeddingComboDimensionConflict
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/combo.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboStructure.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/embeddingRegistry.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function findEmbeddingComboDimensionConflict(combo, allCombos) {
    const targets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveComboTargets"])(combo, allCombos);
    const modelStrs = targets.map((t)=>t.modelStr).filter(Boolean);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectEmbeddingDimensionConflict"])(modelStrs);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/embeddings/service.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createEmbeddingResponse",
    ()=>createEmbeddingResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/embeddings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/embeddingRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$upstreamError$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/upstreamError.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/combo.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$familyGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/embeddings/familyGuard.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuard.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/omnirouteResponseMeta.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/requestId.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$familyGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$familyGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
// #6925: a private/LAN host (RFC1918 10/8, 192.168/16, 172.16/12, CGNAT 100.64/10,
// loopback, .local/.internal, ULA/link-local IPv6) is treated as a trusted no-auth
// local embedding provider — mirrors the outbound-URL guard's private-host
// classification instead of the old hand-rolled localhost/127.0.0.1/172.16-31-only
// regex, which excluded common LAN ranges (10.x, 192.168.x) and forced them through
// the apikey/bearer fallback even when no credentials exist. Cloud-metadata hosts
// (169.254.169.254 etc.) are never treated as no-auth local providers.
function isNoAuthLocalEmbeddingHost(hostname) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isPrivateHost"])(hostname) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isCloudMetadataHost"])(hostname);
}
async function createEmbeddingResponse(body, options = {}) {
    const modelStr = body.model;
    const startTime = Date.now();
    if (!modelStr.includes("/")) {
        try {
            const combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboByName"])(modelStr);
            if (combo) {
                let allCombos = [];
                try {
                    allCombos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCombos"])();
                } catch  {}
                // Guard: an embedding combo whose targets span multiple vector
                // dimensions would corrupt any vector store on failover (vectors from
                // different models are not comparable). The generic combo engine has no
                // notion of embedding families, so reject loudly here before dispatch.
                // See _tasks/features-v3.8.12/01-embeddings-combo-family-guard.plan.md.
                const dimConflict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$familyGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["findEmbeddingComboDimensionConflict"])(combo, allCombos);
                if (dimConflict.conflict) {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `Embedding combo "${modelStr}" mixes models with incompatible vector ` + `dimensions (${dimConflict.distinct.join(", ")}). Failover between them ` + `would corrupt your vector store — use a single embedding dimension per combo.`);
                }
                let settings = {};
                try {
                    settings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDatabaseSettings"])();
                } catch  {}
                // Inject the combo's configured dimensions into the request body so that
                // every upstream embedding call within this combo receives the same
                // dimensions override. The client's own dimensions value takes precedence
                // if already set. Ported from decolua/9router#1530.
                const comboRecord = combo;
                const comboDimensions = comboRecord.dimensions !== undefined && comboRecord.dimensions !== null ? String(comboRecord.dimensions) : undefined;
                const bodyWithDimensions = comboDimensions !== undefined && body.dimensions === undefined ? {
                    ...body,
                    dimensions: comboDimensions
                } : body;
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["handleComboChat"])({
                    body: bodyWithDimensions,
                    combo: combo,
                    handleSingleModel: async (reqBody, targetModelStr, target)=>{
                        const newBody = {
                            ...reqBody,
                            model: targetModelStr
                        };
                        return createEmbeddingResponse(newBody, {
                            ...options,
                            connectionId: target?.connectionId || options.connectionId
                        });
                    },
                    isModelAvailable: undefined,
                    log: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
                    settings,
                    allCombos: allCombos,
                    relayOptions: undefined,
                    signal: undefined
                });
            }
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["error"]("EMBED", `Combo resolution failed for ${modelStr}: ${err}`);
        }
    }
    let dynamicProviders = [];
    try {
        const nodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])();
        dynamicProviders = (Array.isArray(nodes) ? nodes : []).filter((n)=>{
            const validTypes = [
                "chat",
                "responses",
                "embeddings"
            ];
            if (!validTypes.includes(n.apiType || "")) return false;
            try {
                const hostname = new URL(n.baseUrl).hostname;
                return isNoAuthLocalEmbeddingHost(hostname);
            } catch  {
                return false;
            }
        }).map((n)=>{
            try {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildDynamicEmbeddingProvider"])(n);
            } catch (err) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["error"]("EMBED", `Skipping invalid provider_node ${n.prefix}: ${err}`);
                return null;
            }
        }).filter((p)=>p !== null);
    } catch (err) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["error"]("EMBED", `Failed to load provider_nodes for embeddings: ${err}`);
    }
    const { provider, model: resolvedModel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseEmbeddingModel"])(body.model, dynamicProviders);
    if (!provider) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `Invalid embedding model: ${body.model}. Use format: provider/model`);
    }
    let providerConfig = dynamicProviders.find((dp)=>dp.id === provider) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEmbeddingProvider"])(provider) || null;
    let credentialsProviderId = provider;
    if (!providerConfig) {
        try {
            const allNodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])();
            const matchingNode = (Array.isArray(allNodes) ? allNodes : []).find((n)=>n.prefix === provider && (n.apiType === "chat" || n.apiType === "responses" || n.apiType === "embeddings") && n.baseUrl);
            if (matchingNode) {
                const baseUrl = String(matchingNode.baseUrl).replace(/\/+$/, "");
                // #6925: a private/LAN node reaching this fallback (e.g. a matching
                // prefix that skipped the dynamicProviders pass above) must never be
                // forced through bearer-auth — only a non-private host falls back to
                // apikey/bearer credential resolution.
                let nodeHostname = "";
                try {
                    nodeHostname = new URL(matchingNode.baseUrl).hostname;
                } catch  {
                    nodeHostname = "";
                }
                const isNoAuthLocal = nodeHostname !== "" && isNoAuthLocalEmbeddingHost(nodeHostname);
                providerConfig = {
                    id: matchingNode.prefix,
                    baseUrl: `${baseUrl}/embeddings`,
                    authType: isNoAuthLocal ? "none" : "apikey",
                    authHeader: isNoAuthLocal ? "none" : "bearer",
                    models: []
                };
                credentialsProviderId = matchingNode.id || provider;
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("EMBED", `Resolved custom embedding provider: ${provider} -> ${providerConfig.baseUrl}`);
            }
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["error"]("EMBED", `Failed to resolve custom embedding provider ${provider}: ${err}`);
        }
    }
    if (!providerConfig) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `Unknown embedding provider: ${provider}. No matching hardcoded or local provider found.`);
    }
    let credentials = null;
    if (providerConfig.authType !== "none") {
        credentials = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCredentials"])(credentialsProviderId);
        if (!credentials) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `No credentials for embedding provider: ${provider}`);
        }
        if ("allRateLimited" in credentials && credentials.allRateLimited) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unavailableResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED, `[${provider}] All accounts rate limited`, credentials.retryAfter, credentials.retryAfterHuman);
        }
    } else if (provider === "ollama-local") {
        // Ollama is keyless, but a configured connection can still provide a
        // custom local host. Hydrate that optional connection without imposing an
        // authentication requirement, then keep the static localhost default when
        // no connection exists.
        const localCredentials = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCredentials"])(credentialsProviderId);
        if (localCredentials && !("allRateLimited" in localCredentials) && !("allExpired" in localCredentials)) {
            credentials = localCredentials;
        }
    }
    // #474: when the request used a bare model name (no "/" — e.g. an alias that
    // resolved to "auto") and the selected connection declares a defaultModel,
    // resolve the bare name to that real model ID before the upstream call so the
    // provider receives a concrete model. A "/"-qualified name is left untouched.
    const connectionDefaultModel = credentials && typeof credentials.defaultModel === "string" ? credentials.defaultModel : null;
    const effectiveModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveBareModelToConnectionDefault"])(modelStr, resolvedModel, connectionDefaultModel);
    // Resolve the connection-level proxy so the upstream embedding request honors
    // the same per-connection pinning as chat, image generation, and count_tokens
    // (#1904-style behavior). Without this, embeddings silently fall back to the
    // global/env proxy and ignore a connection's pinned proxy. Ported from
    // upstream decolua/9router#1701.
    let proxyInfo = null;
    const connectionIdForProxy = credentials?.connectionId;
    if (connectionIdForProxy) {
        try {
            proxyInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(connectionIdForProxy);
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["error"]("EMBED", `Failed to resolve proxy for connection ${connectionIdForProxy}: ${err}`);
        }
    }
    const runEmbedding = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleEmbedding"])({
            body: effectiveModel !== resolvedModel ? {
                ...body,
                model: `${provider}/${effectiveModel}`
            } : body,
            // getProviderCredentials returns a richer connection object; handleEmbedding
            // reads auth plus the optional local baseUrl override. Bridge the wider
            // selection type to the handler's narrow credential shape.
            credentials: credentials,
            log: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
            resolvedProvider: providerConfig,
            resolvedModel: effectiveModel,
            clientRawRequest: options.clientRawRequest || null,
            apiKeyId: options.apiKeyId || null,
            apiKeyName: options.apiKeyName || null,
            connectionId: options.connectionId || null
        });
    const result = connectionIdForProxy ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyInfo?.proxy || null, runEmbedding) : await runEmbedding();
    const responseHeaders = new Headers(result.headers);
    if (result.success) {
        if (credentials) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["clearRecoveredProviderState"])(credentials);
        responseHeaders.set("Content-Type", "application/json");
        const usage = result.data?.usage ?? null;
        const costUsd = usage ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calculateCost"])(provider, effectiveModel ?? "", usage) : 0;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["attachOmniRouteMetaHeaders"])(responseHeaders, {
            provider,
            model: effectiveModel,
            usage,
            costUsd,
            latencyMs: Date.now() - startTime,
            requestId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateRequestId"])()
        });
        return new Response(JSON.stringify(result.data), {
            status: result.status,
            headers: responseHeaders
        });
    }
    responseHeaders.set("Content-Type", "application/json");
    const errorPayload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$upstreamError$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toJsonErrorPayload"])(result.error, "Embedding provider error");
    return new Response(JSON.stringify(errorPayload), {
        status: result.status,
        headers: responseHeaders
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/skills/types.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SkillMode",
    ()=>SkillMode,
    "SkillStatus",
    ()=>SkillStatus
]);
var SkillStatus = /*#__PURE__*/ function(SkillStatus) {
    SkillStatus["PENDING"] = "pending";
    SkillStatus["RUNNING"] = "running";
    SkillStatus["SUCCESS"] = "success";
    SkillStatus["ERROR"] = "error";
    SkillStatus["TIMEOUT"] = "timeout";
    return SkillStatus;
}({});
var SkillMode = /*#__PURE__*/ function(SkillMode) {
    SkillMode["AUTO"] = "auto";
    SkillMode["MANUAL"] = "manual";
    SkillMode["HYBRID"] = "hybrid";
    return SkillMode;
}({});
}),
"[project]/src/lib/skills/schemas.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "SkillConfigSchema",
    ()=>SkillConfigSchema,
    "SkillCreateInputSchema",
    ()=>SkillCreateInputSchema,
    "SkillSchema",
    ()=>SkillSchema,
    "SkillUpdateInputSchema",
    ()=>SkillUpdateInputSchema
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/types.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const SkillSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    input: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()),
    output: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown())
});
const SkillCreateInputSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).max(100),
    version: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().regex(/^\d+\.\d+\.\d+$/).default("1.0.0"),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(500).optional(),
    schema: SkillSchema,
    handler: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().default(true)
}).strict();
const SkillUpdateInputSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).max(100).optional(),
    version: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().regex(/^\d+\.\d+\.\d+$/).optional(),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(500).optional(),
    schema: SkillSchema.optional(),
    handler: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).optional(),
    enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional()
}).strict();
const SkillConfigSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    mode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].nativeEnum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SkillMode"]),
    allowedSkills: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
    timeout: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive().default(30000),
    maxRetries: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).default(3)
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/skills/registry.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "skillRegistry",
    ()=>skillRegistry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$schemas$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/schemas.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$schemas$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$schemas$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logger"])("SKILLS");
class SkillRegistry {
    static instance;
    registeredSkills = new Map();
    versionCache = new Map();
    lastLoaded = 0;
    loadedAll = false;
    loadedApiKeyIds = new Set();
    cacheTTL = 60_000;
    pendingLoad = null;
    constructor(){}
    static getInstance() {
        if (!SkillRegistry.instance) {
            SkillRegistry.instance = new SkillRegistry();
        }
        return SkillRegistry.instance;
    }
    isCacheStale() {
        return Date.now() - this.lastLoaded > this.cacheTTL;
    }
    invalidateCache() {
        this.lastLoaded = 0;
        this.loadedAll = false;
        this.loadedApiKeyIds.clear();
    }
    cacheKey(skill) {
        return `${skill.apiKeyId}:${skill.name}@${skill.version}`;
    }
    cacheSkill(skill) {
        this.registeredSkills.set(this.cacheKey(skill), skill);
        this.updateVersionCache(skill);
    }
    removeCachedSkills(predicate) {
        const affectedNames = new Set();
        for (const [key, skill] of this.registeredSkills.entries()){
            if (predicate(skill)) {
                affectedNames.add(skill.name);
                this.registeredSkills.delete(key);
            }
        }
        affectedNames.forEach((name)=>this.rebuildVersionCache(name));
    }
    async register(skillData) {
        const { apiKeyId: _apiKeyId, mode: _mode, sourceProvider: _sourceProvider, tags: _tags, installCount: _installCount, ...parseableData } = skillData;
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$schemas$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SkillCreateInputSchema"].parse(parseableData);
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
        const now = new Date();
        db.prepare(`INSERT INTO skills (id, api_key_id, name, version, description, schema, handler, enabled, mode, source_provider, tags, install_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, skillData.apiKeyId, parsed.name, parsed.version, parsed.description || null, JSON.stringify(parsed.schema), parsed.handler, parsed.enabled ? 1 : 0, skillData.mode || (parsed.enabled ? "on" : "off"), skillData.sourceProvider || null, JSON.stringify(skillData.tags || []), typeof skillData.installCount === "number" ? Math.max(0, skillData.installCount) : 0, now.toISOString(), now.toISOString());
        const skill = {
            id,
            apiKeyId: skillData.apiKeyId,
            name: parsed.name,
            version: parsed.version,
            description: parsed.description || "",
            schema: parsed.schema,
            handler: parsed.handler,
            enabled: parsed.enabled,
            mode: skillData.mode || (parsed.enabled ? "on" : "off"),
            sourceProvider: skillData.sourceProvider,
            tags: skillData.tags || [],
            installCount: typeof skillData.installCount === "number" ? Math.max(0, skillData.installCount) : 0,
            createdAt: now,
            updatedAt: now
        };
        this.cacheSkill(skill);
        this.invalidateCache();
        return skill;
    }
    async unregister(name, version, apiKeyId) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        if (version) {
            const skill = Array.from(this.registeredSkills.values()).find((candidate)=>candidate.name === name && candidate.version === version && (!apiKeyId || candidate.apiKeyId === apiKeyId));
            if (skill && (!apiKeyId || skill.apiKeyId === apiKeyId)) {
                db.prepare("DELETE FROM skills WHERE id = ?").run(skill.id);
                this.registeredSkills.delete(this.cacheKey(skill));
                this.rebuildVersionCache(name);
                this.invalidateCache();
                return true;
            }
        } else {
            const deleted = db.prepare("DELETE FROM skills WHERE name = ? AND (? IS NULL OR api_key_id = ?)").run(name, apiKeyId || null, apiKeyId || null);
            if (deleted.changes > 0) {
                this.removeCachedSkills((skill)=>skill.name === name && (!apiKeyId || skill.apiKeyId === apiKeyId));
                this.invalidateCache();
                return true;
            }
        }
        return false;
    }
    async unregisterById(id) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const deleted = db.prepare("DELETE FROM skills WHERE id = ?").run(id);
        if (deleted.changes > 0) {
            const affectedNames = new Set();
            const keysToDelete = Array.from(this.registeredSkills.entries()).filter(([, skill])=>skill.id === id).map(([key, skill])=>{
                affectedNames.add(skill.name);
                return key;
            });
            keysToDelete.forEach((k)=>this.registeredSkills.delete(k));
            affectedNames.forEach((name)=>this.rebuildVersionCache(name));
            this.invalidateCache();
            return true;
        }
        return false;
    }
    list(apiKeyId) {
        log.debug("skills.registry.list", {
            apiKeyId,
            cached: !this.isCacheStale()
        });
        if (apiKeyId) {
            return Array.from(this.registeredSkills.values()).filter((s)=>s.apiKeyId === apiKeyId);
        }
        return Array.from(this.registeredSkills.values());
    }
    getSkill(identifier, apiKeyId) {
        const matchesScope = (skill)=>!apiKeyId || skill.apiKeyId === apiKeyId;
        const skills = Array.from(this.registeredSkills.values()).filter(matchesScope);
        const byId = skills.find((skill)=>skill.id === identifier);
        if (byId) return byId;
        const [name, version] = identifier.includes("@") ? identifier.split("@", 2) : [
            identifier,
            undefined
        ];
        if (version) {
            return skills.find((skill)=>skill.name === name && skill.version === version);
        }
        return skills.filter((skill)=>skill.name === identifier).sort((a, b)=>this.compareVersions(b.version, a.version))[0];
    }
    getSkillVersions(name, apiKeyId) {
        return Array.from(this.registeredSkills.values()).filter((skill)=>skill.name === name && (!apiKeyId || skill.apiKeyId === apiKeyId)).sort((a, b)=>this.compareVersions(b.version, a.version));
    }
    resolveVersion(name, constraint, apiKeyId) {
        const versions = this.getSkillVersions(name, apiKeyId);
        if (versions.length === 0) return undefined;
        const operator = constraint.charAt(0);
        const version = constraint.slice(1);
        switch(operator){
            case "^":
                return versions.find((s)=>this.satisfies(s.version, version, "^"));
            case "~":
                return versions.find((s)=>this.satisfies(s.version, version, "~"));
            case ">":
            case ">=":
            case "<":
            case "<=":
            case "==":
                return versions.find((s)=>this.satisfies(s.version, version, operator));
            default:
                return versions.find((s)=>s.version === constraint);
        }
    }
    satisfies(version, base, operator) {
        const [baseMajor, baseMinor, basePatch] = base.split(".").map(Number);
        const [verMajor, verMinor, verPatch] = version.split(".").map(Number);
        switch(operator){
            case "^":
                return verMajor === baseMajor && (verMinor > baseMinor || verMinor === baseMinor && verPatch >= basePatch);
            case "~":
                return verMajor === baseMajor && verMinor === baseMinor && verPatch >= basePatch;
            case ">":
                return this.compareVersions(version, base) > 0;
            case ">=":
                return this.compareVersions(version, base) >= 0;
            case "<":
                return this.compareVersions(version, base) < 0;
            case "<=":
                return this.compareVersions(version, base) <= 0;
            case "==":
                return version === base;
            default:
                return version === base;
        }
    }
    compareVersions(a, b) {
        const [aMajor, aMinor, aPatch] = a.split(".").map(Number);
        const [bMajor, bMinor, bPatch] = b.split(".").map(Number);
        if (aMajor !== bMajor) return aMajor - bMajor;
        if (aMinor !== bMinor) return aMinor - bMinor;
        return aPatch - bPatch;
    }
    updateVersionCache(skill) {
        if (!this.versionCache.has(skill.name)) {
            this.versionCache.set(skill.name, new Map());
        }
        this.versionCache.get(skill.name).set(skill.version, skill);
    }
    clearVersionCache(name) {
        this.versionCache.delete(name);
    }
    rebuildVersionCache(name) {
        this.clearVersionCache(name);
        for (const skill of this.registeredSkills.values()){
            if (skill.name === name) {
                this.updateVersionCache(skill);
            }
        }
    }
    async loadFromDatabase(apiKeyId) {
        if (this.pendingLoad) {
            await this.pendingLoad;
            return;
        }
        const cacheHasScope = apiKeyId ? this.loadedAll || this.loadedApiKeyIds.has(apiKeyId) : this.loadedAll;
        if (cacheHasScope && !this.isCacheStale()) return;
        this.pendingLoad = (async ()=>{
            try {
                log.debug("skills.registry.loadFromDatabase", {
                    cached: false
                });
                const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
                const rows = apiKeyId ? db.prepare("SELECT * FROM skills WHERE api_key_id = ?").all(apiKeyId) : db.prepare("SELECT * FROM skills").all();
                if (apiKeyId) {
                    this.removeCachedSkills((skill)=>skill.apiKeyId === apiKeyId);
                } else {
                    this.registeredSkills.clear();
                    this.versionCache.clear();
                }
                for (const row of rows){
                    const tags = (()=>{
                        try {
                            if (typeof row.tags !== "string") return [];
                            const parsed = JSON.parse(row.tags);
                            return Array.isArray(parsed) ? parsed.filter((item)=>typeof item === "string") : [];
                        } catch  {
                            return [];
                        }
                    })();
                    const skill = {
                        id: row.id,
                        apiKeyId: row.api_key_id,
                        name: row.name,
                        version: row.version,
                        description: row.description || "",
                        schema: JSON.parse(row.schema),
                        handler: row.handler,
                        enabled: row.enabled === 1,
                        mode: row.mode === "off" || row.mode === "auto" ? row.mode : "on",
                        sourceProvider: row.source_provider === "skillsmp" || row.source_provider === "skillssh" ? row.source_provider : row.source_provider ? "local" : undefined,
                        tags,
                        installCount: typeof row.install_count === "number" ? row.install_count : 0,
                        createdAt: new Date(row.created_at),
                        updatedAt: new Date(row.updated_at)
                    };
                    this.cacheSkill(skill);
                }
                if (apiKeyId) {
                    this.loadedApiKeyIds.add(apiKeyId);
                } else {
                    this.loadedAll = true;
                    this.loadedApiKeyIds.clear();
                }
                this.lastLoaded = Date.now();
            } catch (err) {
                log.error("loadFromDatabase error:", err);
                throw err;
            } finally{
                this.pendingLoad = null;
            }
        })();
        try {
            await this.pendingLoad;
        } finally{
            this.pendingLoad = null;
        }
    }
    async setEnabledById(id, apiKeyId, enabled) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const now = new Date();
        const updated = db.prepare("UPDATE skills SET enabled = ?, mode = ?, updated_at = ? WHERE id = ? AND api_key_id = ?").run(enabled ? 1 : 0, enabled ? "on" : "off", now.toISOString(), id, apiKeyId);
        if (updated.changes === 0) return undefined;
        const skill = this.getSkill(id, apiKeyId);
        if (skill) {
            const mode = enabled ? "on" : "off";
            const updatedSkill = {
                ...skill,
                enabled,
                mode,
                updatedAt: now
            };
            this.cacheSkill(updatedSkill);
            return updatedSkill;
        }
        this.invalidateCache();
        await this.loadFromDatabase(apiKeyId);
        return this.getSkill(id, apiKeyId);
    }
}
const skillRegistry = SkillRegistry.getInstance();
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/skills/injection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "detectProvider",
    ()=>detectProvider,
    "injectSkillTools",
    ()=>injectSkillTools,
    "injectSkills",
    ()=>injectSkills
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logger"])("SKILLS_INJECTION");
function skillToOpenAI(skill) {
    return {
        type: "function",
        function: {
            name: `${skill.name}@${skill.version}`,
            description: skill.description,
            parameters: skill.schema.input
        }
    };
}
function skillToClaude(skill) {
    return {
        name: `${skill.name}@${skill.version}`,
        description: skill.description,
        input_schema: skill.schema.input
    };
}
function skillToGemini(skill) {
    return {
        name: `${skill.name}@${skill.version}`,
        description: skill.description,
        parameters: skill.schema.input
    };
}
const AUTO_MIN_SCORE = 3;
const AUTO_MAX_SKILLS = 5;
const TOKEN_MIN_LEN = 3;
function toLowerText(value) {
    if (typeof value === "string") return value.toLowerCase();
    return "";
}
function extractTokens(value) {
    const matches = value.toLowerCase().match(/[a-z0-9]+/g) || [];
    return new Set(matches.filter((t)=>t.length >= TOKEN_MIN_LEN));
}
function splitNameTokens(name) {
    const expandedCamel = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[._@\-/]+/g, " ").toLowerCase();
    return extractTokens(expandedCamel);
}
function extractMessageText(messages) {
    const chunks = [];
    for (const message of messages){
        if (!message || typeof message !== "object") continue;
        const record = message;
        const content = record.content;
        if (typeof content === "string") {
            chunks.push(content);
            continue;
        }
        if (Array.isArray(content)) {
            for (const item of content){
                if (typeof item === "string") {
                    chunks.push(item);
                    continue;
                }
                if (item && typeof item === "object") {
                    const itemRecord = item;
                    if (typeof itemRecord.text === "string") {
                        chunks.push(itemRecord.text);
                    }
                }
            }
        }
    }
    return chunks.join(" ").toLowerCase();
}
function buildContextText(options) {
    const parts = [
        JSON.stringify(options.existingTools || []).toLowerCase(),
        toLowerText(options.model),
        toLowerText(options.sourceFormat),
        toLowerText(options.targetFormat),
        toLowerText(options.backgroundReason)
    ];
    if (Array.isArray(options.messages) && options.messages.length > 0) {
        parts.push(extractMessageText(options.messages));
    }
    return parts.filter(Boolean).join(" ");
}
function scoreAutoSkill(skill, options, contextText, contextTokens, backgroundTokens) {
    const name = skill.name.toLowerCase();
    const tags = (Array.isArray(skill.tags) ? skill.tags : []).map((tag)=>String(tag).toLowerCase());
    const description = toLowerText(skill.description);
    const nameTokens = splitNameTokens(skill.name);
    const descriptionTokens = extractTokens(description);
    let score = 0;
    if (name && contextText.includes(name)) {
        score += 6;
    }
    for (const token of nameTokens){
        if (contextTokens.has(token)) score += 2;
    }
    for (const tag of tags){
        if (!tag) continue;
        if (contextText.includes(tag)) {
            score += 3;
        }
    }
    for (const token of descriptionTokens){
        if (contextTokens.has(token)) score += 1;
    }
    if (backgroundTokens.size > 0) {
        for (const token of backgroundTokens){
            if (nameTokens.has(token)) score += 2;
            if (tags.some((tag)=>tag.includes(token) || token.includes(tag))) score += 2;
        }
    }
    const providerAliases = {
        openai: [
            "openai",
            "gpt"
        ],
        anthropic: [
            "anthropic",
            "claude"
        ],
        google: [
            "google",
            "gemini"
        ],
        other: []
    };
    const knownProviderHints = new Set([
        "openai",
        "gpt",
        "anthropic",
        "claude",
        "google",
        "gemini"
    ]);
    const skillProviderHints = tags.filter((tag)=>knownProviderHints.has(tag));
    if (skillProviderHints.length > 0) {
        const aliases = providerAliases[options.provider];
        const hasProviderMatch = skillProviderHints.some((hint)=>aliases.includes(hint));
        if (hasProviderMatch) {
            score += 2;
        } else {
            score -= 2;
        }
    }
    return score;
}
function injectSkills(options) {
    const contextText = buildContextText(options);
    const contextTokens = extractTokens(contextText);
    const backgroundTokens = extractTokens(toLowerText(options.backgroundReason));
    const selectedSkills = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["skillRegistry"].list(options.apiKeyId).filter((s)=>{
        const mode = s.mode || (s.enabled ? "on" : "off");
        if (mode === "off") return false;
        return s.enabled;
    });
    const alwaysOnSkills = selectedSkills.filter((s)=>{
        const mode = s.mode || (s.enabled ? "on" : "off");
        return mode === "on";
    });
    const autoCandidates = selectedSkills.filter((s)=>{
        const mode = s.mode || (s.enabled ? "on" : "off");
        return mode === "auto";
    });
    const autoSkills = autoCandidates.map((skill)=>({
            skill,
            score: scoreAutoSkill(skill, options, contextText, contextTokens, backgroundTokens)
        })).filter((entry)=>entry.score >= AUTO_MIN_SCORE).sort((a, b)=>{
        if (b.score !== a.score) return b.score - a.score;
        const installA = typeof a.skill.installCount === "number" ? a.skill.installCount : 0;
        const installB = typeof b.skill.installCount === "number" ? b.skill.installCount : 0;
        if (installB !== installA) return installB - installA;
        return a.skill.name.localeCompare(b.skill.name);
    }).slice(0, AUTO_MAX_SKILLS).map((entry)=>entry.skill);
    const skills = [
        ...alwaysOnSkills,
        ...autoSkills
    ];
    if (skills.length === 0) {
        log.info("skills.injection.skipped", {
            apiKeyId: options.apiKeyId,
            reason: "no_enabled_skills"
        });
        return options.existingTools || [];
    }
    log.info("skills.injection.injected", {
        apiKeyId: options.apiKeyId,
        provider: options.provider,
        skillCount: skills.length
    });
    const injectedTools = skills.map((skill)=>{
        switch(options.provider){
            case "openai":
                return skillToOpenAI(skill);
            case "anthropic":
                return skillToClaude(skill);
            case "google":
                return skillToGemini(skill);
            default:
                return skillToOpenAI(skill);
        }
    });
    if (options.existingTools && options.existingTools.length > 0) {
        return [
            ...injectedTools,
            ...options.existingTools
        ];
    }
    return injectedTools;
}
function injectSkillTools(messages, provider, apiKeyId) {
    const tools = injectSkills({
        provider,
        apiKeyId
    });
    if (tools.length === 0) {
        return messages;
    }
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user" && !lastMessage.tools) {
        return [
            ...messages.slice(0, -1),
            {
                ...lastMessage,
                tools
            }
        ];
    }
    return messages;
}
function detectProvider(modelId) {
    const lower = modelId.toLowerCase();
    if (lower.includes("gpt") || lower.includes("openai")) {
        return "openai";
    }
    if (lower.includes("claude") || lower.includes("anthropic")) {
        return "anthropic";
    }
    if (lower.includes("gemini") || lower.includes("google")) {
        return "google";
    }
    return "other";
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/skills/executor.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "skillExecutor",
    ()=>skillExecutor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/types.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logger"])("SKILLS_EXECUTOR");
class SkillExecutor {
    static instance;
    handlers = new Map();
    timeout = 30000;
    maxRetries = 3;
    constructor(){}
    static getInstance() {
        if (!SkillExecutor.instance) {
            SkillExecutor.instance = new SkillExecutor();
        }
        return SkillExecutor.instance;
    }
    registerHandler(name, handler) {
        this.handlers.set(name, handler);
    }
    setTimeout(ms) {
        this.timeout = ms;
    }
    setMaxRetries(count) {
        this.maxRetries = count;
    }
    async execute(skillName, input, context) {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        if (settings.skillsEnabled === false) {
            throw new Error("Skills execution is disabled. Enable Skills in Settings > AI.");
        }
        const skill = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["skillRegistry"].getSkill(skillName, context.apiKeyId);
        if (!skill) {
            throw new Error(`Skill not found: ${skillName}`);
        }
        if (!skill.enabled) {
            throw new Error(`Skill is disabled: ${skillName}`);
        }
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const executionId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
        const startTime = Date.now();
        log.info("skills.executor.start", {
            skillId: skill.id,
            skillName,
            apiKeyId: context.apiKeyId
        });
        try {
            db.prepare(`INSERT INTO skill_executions (id, skill_id, api_key_id, session_id, input, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`).run(executionId, skill.id, context.apiKeyId, context.sessionId || null, JSON.stringify(input), __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SkillStatus"].RUNNING, new Date().toISOString());
            const handler = this.handlers.get(skill.handler);
            if (!handler) {
                throw new Error(`Handler not found: ${skill.handler}`);
            }
            let output = null;
            let errorMessage = null;
            let status = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SkillStatus"].SUCCESS;
            try {
                const result = await this.executeWithTimeout(handler(input, {
                    apiKeyId: context.apiKeyId,
                    sessionId: context.sessionId || ""
                }));
                output = result;
            } catch (err) {
                errorMessage = err instanceof Error ? err.message : String(err);
                status = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SkillStatus"].ERROR;
            }
            const durationMs = Date.now() - startTime;
            db.prepare(`UPDATE skill_executions SET output = ?, status = ?, error_message = ?, duration_ms = ? WHERE id = ?`).run(output ? JSON.stringify(output) : null, status, errorMessage, durationMs, executionId);
            log.info("skills.executor.complete", {
                skillId: skill.id,
                success: status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SkillStatus"].SUCCESS,
                durationMs
            });
            return {
                id: executionId,
                skillId: skill.id,
                apiKeyId: context.apiKeyId,
                sessionId: context.sessionId || "",
                input,
                output,
                status,
                errorMessage,
                durationMs,
                createdAt: new Date()
            };
        } catch (err) {
            const durationMs = Date.now() - startTime;
            const errorMessage = err instanceof Error ? err.message : String(err);
            db.prepare(`UPDATE skill_executions SET status = ?, error_message = ?, duration_ms = ? WHERE id = ?`).run(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SkillStatus"].ERROR, errorMessage, durationMs, executionId);
            throw err;
        }
    }
    async executeWithTimeout(promise) {
        return Promise.race([
            promise,
            new Promise((_, reject)=>setTimeout(()=>reject(new Error("Skill execution timed out")), this.timeout))
        ]);
    }
    getExecution(executionId) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const row = db.prepare("SELECT * FROM skill_executions WHERE id = ?").get(executionId);
        if (!row) return undefined;
        return {
            id: row.id,
            skillId: row.skill_id,
            apiKeyId: row.api_key_id,
            sessionId: row.session_id || "",
            input: JSON.parse(row.input),
            output: row.output ? JSON.parse(row.output) : null,
            status: row.status,
            errorMessage: row.error_message,
            durationMs: row.duration_ms,
            createdAt: new Date(row.created_at)
        };
    }
    listExecutions(apiKeyId, limit = 50, offset = 0) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const rows = apiKeyId ? db.prepare("SELECT * FROM skill_executions WHERE api_key_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?").all(apiKeyId, limit, offset) : db.prepare("SELECT * FROM skill_executions ORDER BY created_at DESC LIMIT ? OFFSET ?").all(limit, offset);
        return rows.map((row)=>({
                id: row.id,
                skillId: row.skill_id,
                apiKeyId: row.api_key_id,
                sessionId: row.session_id || "",
                input: JSON.parse(row.input),
                output: row.output ? JSON.parse(row.output) : null,
                status: row.status,
                errorMessage: row.error_message,
                durationMs: row.duration_ms,
                createdAt: new Date(row.created_at)
            }));
    }
    countExecutions(apiKeyId) {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const row = apiKeyId ? db.prepare("SELECT COUNT(*) as count FROM skill_executions WHERE api_key_id = ?").get(apiKeyId) : db.prepare("SELECT COUNT(*) as count FROM skill_executions").get();
        return row?.count ?? 0;
    }
}
const skillExecutor = SkillExecutor.getInstance();
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/skills/webFetchExecution.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "WebFetchExecutionError",
    ()=>WebFetchExecutionError,
    "executeWebFetch",
    ()=>executeWebFetch
]);
/**
 * webFetchExecution.ts — resolves credentials for a web-fetch provider and dispatches
 * to handleWebFetch(), mirroring src/lib/search/executeWebSearch.ts. Consumed by the
 * `web_fetch` builtin skill handler (src/lib/skills/builtins.ts) when the synthetic
 * `omniroute_web_fetch` tool call emitted by webFetchInterception.ts is executed
 * (#7339, Phase 4 of #3384).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$interceptionRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/interceptionRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$webFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/webFetch.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const WEB_FETCH_PROVIDERS = [
    "firecrawl",
    "jina-reader",
    "tavily-search",
    "tinyfish"
];
const FETCH_BACKEND_TO_PROVIDER = {
    firecrawl: "firecrawl",
    jina: "jina-reader",
    tavily: "tavily-search"
};
class WebFetchExecutionError extends Error {
    statusCode;
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}
function isKnownWebFetchProvider(value) {
    return typeof value === "string" && WEB_FETCH_PROVIDERS.includes(value);
}
function resolvePinnedBackend(input) {
    if (isKnownWebFetchProvider(input.provider)) return input.provider;
    if (!input.ruleProvider) return undefined;
    const rules = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$interceptionRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getInterceptionRules"])(input.ruleProvider);
    if (!rules) return undefined;
    const modelRule = input.ruleModel ? rules.models?.[input.ruleModel] : undefined;
    const backend = modelRule?.fetchBackend ?? rules.fetchBackend;
    return backend ? FETCH_BACKEND_TO_PROVIDER[backend] : undefined;
}
async function resolveCredentials(providerId) {
    try {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCredentialsWithQuotaPreflight"])(providerId) ?? null;
    } catch  {
        return null;
    }
}
async function autoSelectProvider() {
    for (const providerId of WEB_FETCH_PROVIDERS){
        const credentials = await resolveCredentials(providerId);
        if (credentials) return {
            provider: providerId,
            credentials
        };
    }
    return null;
}
async function resolveProviderAndCredentials(input) {
    const pinnedProvider = resolvePinnedBackend(input);
    const pinnedCredentials = pinnedProvider ? await resolveCredentials(pinnedProvider) : null;
    if (pinnedProvider && pinnedCredentials) {
        return {
            provider: pinnedProvider,
            credentials: pinnedCredentials
        };
    }
    const auto = await autoSelectProvider();
    if (!auto) {
        throw new WebFetchExecutionError(`No credentials configured for any web-fetch provider. Add an API key for one of: ${WEB_FETCH_PROVIDERS.join(", ")}.`, 400);
    }
    return auto;
}
async function executeWebFetch(input) {
    if (!input.url || typeof input.url !== "string") {
        throw new WebFetchExecutionError("Missing required field: url", 400);
    }
    const { provider, credentials } = await resolveProviderAndCredentials(input);
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$webFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleWebFetch"])({
        url: input.url,
        format: input.format,
        depth: input.depth,
        wait_for_selector: input.wait_for_selector,
        include_metadata: input.include_metadata
    }, credentials, provider);
    if (!result.success || !result.data) {
        throw new WebFetchExecutionError(result.error || "Web fetch failed", result.status || 502);
    }
    return result.data;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/skills/containerProvider.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALL_PROVIDERS",
    ()=>ALL_PROVIDERS,
    "PROVIDER_BY_ID",
    ()=>PROVIDER_BY_ID,
    "_resetProviderCacheForTests",
    ()=>_resetProviderCacheForTests,
    "buildKillCommand",
    ()=>buildKillCommand,
    "platformPriority",
    ()=>platformPriority,
    "resolveProvider",
    ()=>resolveProvider
]);
/**
 * Container runtime providers for the OmniRoute skill sandbox.
 *
 * The sandbox historically hardcoded the `docker` CLI. This module abstracts
 * the container runtime so OmniRoute can pick the most performant / native
 * runtime available on each host:
 *
 *   - macOS:  Apple Container (`container` CLI)  >  OrbStack (docker shim)  >  Podman  >  Docker
 *   - Windows: WSL Container (`wslc` CLI)       >  Docker Desktop          >  Podman
 *   - Linux:   Podman (rootless, daemonless)    >  Docker
 *
 * The user can override the auto-detected choice with `SKILLS_SANDBOX_RUNTIME`
 * (`auto | docker | apple | wsl | orbstack | podman`). Each provider maps the
 * sandbox's intent (resource caps, network isolation, capability drops,
 * read-only fs, tmpfs workspaces) onto the runtime's native flag set.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$module__$5b$external$5d$__$28$module$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/module [external] (module, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("src/lib/skills/containerProvider.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
const require = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$module__$5b$external$5d$__$28$module$2c$__cjs$29$__["createRequire"])(__TURBOPACK__import$2e$meta__.url);
const childProcess = __turbopack_context__.r("[externals]/child_process [external] (child_process, cjs)");
// ----------------------------------------------------------------
//  Helpers
// ----------------------------------------------------------------
const SANDBOX_NAME = (sandboxId)=>`omniroute-${sandboxId}`;
/**
 * Probe whether a CLI binary exists on PATH.
 * Uses `where` on Windows, `which` on *nix — both via spawnSync so existing
 * test mocks on `spawn` (but not `spawnSync`) are not disturbed.
 */ function probeCommand(binary) {
    const args = ("TURBOPACK compile-time truthy", 1) ? [
        "where",
        binary
    ] : "TURBOPACK unreachable";
    const r = childProcess.spawnSync(args[0], args.slice(1), {
        encoding: "utf8",
        stdio: "ignore"
    });
    return r.status === 0;
}
/**
 * Probe whether a binary responds to `--version` with exit 0 and
 * a plausible version string.
 */ function probeVersion(binary, expects = "v") {
    const r = childProcess.spawnSync(binary, [
        "--version"
    ], {
        encoding: "utf8",
        stdio: "pipe"
    });
    return r.status === 0 && !!r.stdout?.trim()?.includes(expects);
}
// ----------------------------------------------------------------
//  DockerProvider
// ----------------------------------------------------------------
class DockerProvider {
    id = "docker";
    displayName = "Docker";
    killCommand = "docker";
    detect() {
        return probeCommand("docker") && probeVersion("docker");
    }
    buildRun(image, command, sandboxId, config) {
        const args = [
            "run",
            "--rm",
            "--name",
            SANDBOX_NAME(sandboxId),
            "--cpus",
            `${config.cpuLimit / 100}`,
            "--memory",
            `${config.memoryLimit}m`,
            "--network",
            config.networkEnabled ? "bridge" : "none",
            "--cap-drop",
            "ALL",
            "--security-opt",
            "no-new-privileges",
            "--pids-limit",
            "100",
            "--tmpfs",
            "/tmp:rw,noexec,nosuid,size=64m",
            "--tmpfs",
            "/workspace:rw,noexec,nosuid,size=64m",
            "--workdir",
            "/workspace"
        ];
        if (config.readOnly) args.push("--read-only");
        args.push(image, ...command);
        return {
            command: "docker",
            args,
            killArgs: (name)=>[
                    "kill",
                    name
                ]
        };
    }
    buildKillArgs(name) {
        return [
            "kill",
            name
        ];
    }
}
// ----------------------------------------------------------------
//  AppleContainerProvider  (native Apple Container on macOS)
// ----------------------------------------------------------------
class AppleContainerProvider {
    id = "apple";
    displayName = "Apple Container";
    killCommand = "container";
    detect() {
        return probeCommand("container") && probeVersion("container", "c");
    }
    buildRun(image, command, sandboxId, config) {
        const args = [
            "run",
            "--rm",
            "--name",
            SANDBOX_NAME(sandboxId),
            "--cpus",
            `${config.cpuLimit}`,
            "--memory",
            `${config.memoryLimit}m`,
            "--network",
            config.networkEnabled ? "bridge" : "none",
            "--cap-drop",
            "ALL",
            "--security-opt",
            "no-new-privileges",
            "--tmpfs",
            "/tmp:rw,noexec,nosuid,size=64m",
            "--tmpfs",
            "/workspace:rw,noexec,nosuid,size=64m",
            "--workdir",
            "/workspace"
        ];
        if (config.readOnly) args.push("--read-only");
        args.push(image, ...command);
        return {
            command: "container",
            args,
            killArgs: (name)=>[
                    "kill",
                    name
                ]
        };
    }
    buildKillArgs(name) {
        return [
            "kill",
            name
        ];
    }
}
// ----------------------------------------------------------------
//  WslContainerProvider  (WSL 2 container CLI on Windows)
// ----------------------------------------------------------------
class WslContainerProvider {
    id = "wsl";
    displayName = "WSL Container";
    killCommand = "wslc";
    detect() {
        return probeCommand("wslc") && probeVersion("wslc");
    }
    buildRun(image, command, sandboxId, config) {
        const args = [
            "run",
            "--rm",
            "--name",
            SANDBOX_NAME(sandboxId),
            "--cpus",
            `${config.cpuLimit}`,
            "--memory",
            `${config.memoryLimit}m`,
            "--network",
            config.networkEnabled ? "bridge" : "none",
            "--tmpfs",
            "/tmp:rw,noexec,nosuid,size=64m",
            "--tmpfs",
            "/workspace:rw,noexec,nosuid,size=64m",
            "--workdir",
            "/workspace"
        ];
        if (config.readOnly) args.push("--read-only");
        args.push(image, ...command);
        return {
            command: "wslc",
            args,
            killArgs: (name)=>[
                    "kill",
                    name
                ]
        };
    }
    buildKillArgs(name) {
        return [
            "kill",
            name
        ];
    }
}
// ----------------------------------------------------------------
//  OrbStackProvider  (high-perf Linux VM on macOS)
// ----------------------------------------------------------------
class OrbStackProvider {
    id = "orbstack";
    displayName = "OrbStack";
    killCommand = "orbstack";
    detect() {
        return probeCommand("orbstack") && probeVersion("orbstack");
    }
    buildRun(image, command, sandboxId, config) {
        // OrbStack wraps Docker inside a Linux VM.  We invoke the `orbstack`
        // binary which shims `docker` transparently.
        const args = [
            "run",
            "--rm",
            "--name",
            SANDBOX_NAME(sandboxId),
            "--cpus",
            `${config.cpuLimit}`,
            "--memory",
            `${config.memoryLimit}m`,
            "--network",
            config.networkEnabled ? "bridge" : "none",
            "--tmpfs",
            "/tmp:rw,noexec,nosuid,size=64m",
            "--tmpfs",
            "/workspace:rw,noexec,nosuid,size=64m",
            "--workdir",
            "/workspace"
        ];
        if (config.readOnly) args.push("--read-only");
        args.push(image, ...command);
        return {
            command: "orbstack",
            args,
            killArgs: (name)=>[
                    "kill",
                    name
                ]
        };
    }
    buildKillArgs(name) {
        return [
            "kill",
            name
        ];
    }
}
// ----------------------------------------------------------------
//  PodmanProvider  (rootless Linux alternative)
// ----------------------------------------------------------------
class PodmanProvider {
    id = "podman";
    displayName = "Podman";
    killCommand = "podman";
    detect() {
        return probeCommand("podman") && probeVersion("podman");
    }
    buildRun(image, command, sandboxId, config) {
        const args = [
            "run",
            "--rm",
            "--name",
            SANDBOX_NAME(sandboxId),
            "--cpus",
            `${config.cpuLimit / 100}`,
            "--memory",
            `${config.memoryLimit}m`,
            "--network",
            config.networkEnabled ? "bridge" : "none",
            "--cap-drop",
            "ALL",
            "--security-opt",
            "no-new-privileges",
            "--tmpfs",
            "/tmp:rw,noexec,nosuid,size=64m",
            "--tmpfs",
            "/workspace:rw,noexec,nosuid,size=64m",
            "--workdir",
            "/workspace"
        ];
        if (config.readOnly) args.push("--read-only");
        args.push(image, ...command);
        return {
            command: "podman",
            args,
            killArgs: (name)=>[
                    "kill",
                    name
                ]
        };
    }
    buildKillArgs(name) {
        return [
            "kill",
            name
        ];
    }
}
const ALL_PROVIDERS = [
    new DockerProvider(),
    new AppleContainerProvider(),
    new WslContainerProvider(),
    new OrbStackProvider(),
    new PodmanProvider()
];
const PROVIDER_BY_ID = new Map(ALL_PROVIDERS.map((p)=>[
        p.id,
        p
    ]));
function platformPriority() {
    switch(__TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].platform()){
        case "darwin":
            // Apple Container is the native micro-VM runtime on Apple Silicon —
            // fastest startup, lowest overhead.  OrbStack provides a Docker shim
            // inside a tuned Linux VM; better than stock Docker Desktop.
            return [
                "apple",
                "orbstack",
                "podman",
                "docker"
            ];
        case "win32":
            // WSL Container CLI (wslc.exe) is Windows-native via WSL 2.
            return [
                "wsl",
                "docker",
                "podman"
            ];
        default:
            // Linux — podman is rootless + daemonless and therefore preferred.
            return [
                "podman",
                "docker"
            ];
    }
}
// Detect-once memoization
let detectionInFlight = null;
const detectionCache = new Map();
function clearDetectionCache() {
    detectionInFlight = null;
    detectionCache.clear();
}
async function runDetection() {
    // Run all probes in parallel for speed
    await Promise.all(ALL_PROVIDERS.map(async (provider)=>{
        const ok = await Promise.resolve(provider.detect());
        detectionCache.set(provider.id, ok);
    }));
}
function normaliseRuntimeOverride(raw) {
    if (!raw || raw === "auto") return null;
    const lowered = raw.toLowerCase().trim();
    if (PROVIDER_BY_ID.has(lowered)) return lowered;
    return null;
}
async function resolveProvider() {
    if (!detectionInFlight) {
        detectionInFlight = runDetection();
    }
    await detectionInFlight;
    const override = normaliseRuntimeOverride(process.env.SKILLS_SANDBOX_RUNTIME);
    if (override) {
        const provider = PROVIDER_BY_ID.get(override);
        if (detectionCache.get(provider.id)) return provider;
        // Honour the explicit override even if detection failed — the user may
        // be running inside an environment where the runtime is reachable but
        // our probe failed (e.g. very locked-down CI).
        return provider;
    }
    for (const id of platformPriority()){
        if (detectionCache.get(id)) return PROVIDER_BY_ID.get(id);
    }
    return PROVIDER_BY_ID.get("docker");
}
function _resetProviderCacheForTests() {
    clearDetectionCache();
}
function buildKillCommand(provider, sandboxId) {
    const name = SANDBOX_NAME(sandboxId);
    return {
        command: provider.killCommand,
        args: provider.buildKillArgs(name)
    };
}
}),
"[project]/src/lib/skills/sandbox.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sandboxRunner",
    ()=>sandboxRunner
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$module__$5b$external$5d$__$28$module$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/module [external] (module, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$containerProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/containerProvider.ts [instrumentation] (ecmascript)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("src/lib/skills/sandbox.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
;
const require = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$module__$5b$external$5d$__$28$module$2c$__cjs$29$__["createRequire"])(__TURBOPACK__import$2e$meta__.url);
const childProcess = __turbopack_context__.r("[externals]/child_process [external] (child_process, cjs)");
const DEFAULT_CONFIG = {
    cpuLimit: 100,
    memoryLimit: 256,
    timeout: 30000,
    networkEnabled: false,
    readOnly: true
};
class SandboxRunner {
    static instance;
    runningContainers = new Map();
    config;
    cachedProvider = null;
    constructor(config = {}){
        this.config = {
            ...DEFAULT_CONFIG,
            ...config
        };
    }
    static getInstance(config) {
        if (!SandboxRunner.instance) {
            SandboxRunner.instance = new SandboxRunner(config);
        }
        return SandboxRunner.instance;
    }
    setConfig(config) {
        this.config = {
            ...this.config,
            ...config
        };
    }
    /**
   * Returns the container provider that the next `run()` call will use.
   * Resolution is async (it shells out to probe installed runtimes) so the
   * caller must `await`. The result is cached on the runner for the
   * remainder of the process so subsequent `run()` calls stay sync-friendly.
   */ async getProvider() {
        if (!this.cachedProvider) {
            this.cachedProvider = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$containerProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveProvider"])();
        }
        return this.cachedProvider;
    }
    async run(image, command, env = {}, configOverride = {}) {
        const sandboxId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
        const startTime = Date.now();
        const config = {
            ...this.config,
            ...configOverride
        };
        const provider = await this.getProvider();
        const resolved = provider.buildRun(image, command, sandboxId, config);
        return new Promise((resolve)=>{
            const proc = childProcess.spawn(resolved.command, resolved.args, {
                env: {
                    ...process.env,
                    ...env
                },
                stdio: [
                    "ignore",
                    "pipe",
                    "pipe"
                ]
            });
            this.runningContainers.set(sandboxId, proc);
            let stdout = "";
            let stderr = "";
            proc.stdout?.on("data", (data)=>{
                stdout += data.toString();
            });
            proc.stderr?.on("data", (data)=>{
                stderr += data.toString();
            });
            const timeoutId = setTimeout(()=>{
                this.kill(sandboxId);
            }, config.timeout);
            proc.on("close", (code)=>{
                clearTimeout(timeoutId);
                this.runningContainers.delete(sandboxId);
                resolve({
                    id: sandboxId,
                    runtime: provider.id,
                    exitCode: code,
                    stdout,
                    stderr,
                    duration: Date.now() - startTime,
                    killed: code === null
                });
            });
            proc.on("error", (err)=>{
                clearTimeout(timeoutId);
                this.runningContainers.delete(sandboxId);
                resolve({
                    id: sandboxId,
                    runtime: provider.id,
                    exitCode: -1,
                    stdout,
                    stderr: err.message,
                    duration: Date.now() - startTime,
                    killed: false
                });
            });
        });
    }
    kill(sandboxId) {
        const proc = this.runningContainers.get(sandboxId);
        if (proc) {
            proc.kill("SIGTERM");
            this.runningContainers.delete(sandboxId);
            const provider = this.cachedProvider;
            if (provider) {
                const kill = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$containerProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildKillCommand"])(provider, sandboxId);
                childProcess.spawn(kill.command, kill.args, {
                    stdio: "ignore"
                });
            } else {
                childProcess.spawn("docker", [
                    "kill",
                    `omniroute-${sandboxId}`
                ], {
                    stdio: "ignore"
                });
            }
            return true;
        }
        return false;
    }
    killAll() {
        const provider = this.cachedProvider;
        for (const [id, proc] of this.runningContainers){
            proc.kill("SIGTERM");
            if (provider) {
                const kill = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$containerProvider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildKillCommand"])(provider, id);
                childProcess.spawn(kill.command, kill.args, {
                    stdio: "ignore"
                });
            } else {
                childProcess.spawn("docker", [
                    "kill",
                    `omniroute-${id}`
                ], {
                    stdio: "ignore"
                });
            }
        }
        this.runningContainers.clear();
    }
    isRunning(sandboxId) {
        return this.runningContainers.has(sandboxId);
    }
    getRunningCount() {
        return this.runningContainers.size;
    }
}
const sandboxRunner = SandboxRunner.getInstance();
}),
"[project]/src/lib/skills/builtins.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "builtinSkills",
    ()=>builtinSkills,
    "registerBuiltinSkills",
    ()=>registerBuiltinSkills
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$search$2f$executeWebSearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/search/executeWebSearch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$webFetchExecution$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/webFetchExecution.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$sandbox$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/sandbox.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$search$2f$executeWebSearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$webFetchExecution$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$search$2f$executeWebSearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$webFetchExecution$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
const MAX_FILE_BYTES = Number.parseInt(process.env.SKILLS_MAX_FILE_BYTES || "", 10) || 1_048_576;
const MAX_HTTP_RESPONSE_BYTES = Number.parseInt(process.env.SKILLS_MAX_HTTP_RESPONSE_BYTES || "", 10) || 256_000;
const MAX_SANDBOX_OUTPUT_CHARS = Number.parseInt(process.env.SKILLS_MAX_SANDBOX_OUTPUT_CHARS || "", 10) || 100_000;
const DEFAULT_SANDBOX_TIMEOUT_MS = Number.parseInt(process.env.SKILLS_SANDBOX_TIMEOUT_MS || "", 10) || 10_000;
const SANDBOX_NETWORK_ENABLED = process.env.SKILLS_SANDBOX_NETWORK_ENABLED === "1" || process.env.SKILLS_SANDBOX_NETWORK_ENABLED === "true";
const DEFAULT_COMMAND_IMAGE = "alpine:3.20";
const DEFAULT_JS_IMAGE = "node:22-alpine";
const DEFAULT_PYTHON_IMAGE = "python:3.12-alpine";
const ALLOWED_SANDBOX_IMAGES = new Set((process.env.SKILLS_ALLOWED_SANDBOX_IMAGES || "").split(",").map((value)=>value.trim()).filter(Boolean));
for (const image of [
    DEFAULT_COMMAND_IMAGE,
    DEFAULT_JS_IMAGE,
    DEFAULT_PYTHON_IMAGE
]){
    ALLOWED_SANDBOX_IMAGES.add(image);
}
const FORBIDDEN_PATH_SEGMENTS = new Set([
    ".env",
    ".git",
    ".ssh",
    ".omniroute",
    ".codex",
    "secrets"
]);
const ALLOWED_HTTP_METHODS = new Set([
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE"
]);
const BLOCKED_REQUEST_HEADERS = new Set([
    "host",
    "connection",
    "content-length",
    "cookie",
    "set-cookie",
    "authorization",
    "proxy-authorization"
]);
function getContextId(context) {
    // Not a password hash — SHA-256 is used here only to derive a short, stable
    // filesystem-safe key from the API key identifier for workspace isolation.
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256") // lgtm[js/insufficient-password-hash]
    .update(context.apiKeyId || "anonymous").digest("hex").slice(0, 24);
}
function getWorkspaceRoot(context) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])(), "skills", "workspaces", getContextId(context));
}
function resolveWorkspacePath(inputPath, context) {
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].isAbsolute(inputPath)) {
        throw new Error("Skill file paths must be relative to the skill workspace");
    }
    const segments = inputPath.split(/[\\/]+/).filter(Boolean);
    if (segments.some((segment)=>FORBIDDEN_PATH_SEGMENTS.has(segment.toLowerCase()))) {
        throw new Error("Skill file path contains a restricted segment");
    }
    const root = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(getWorkspaceRoot(context));
    const resolved = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(root, inputPath);
    const relative = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].relative(root, resolved);
    if (!relative || relative.startsWith("..") || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].isAbsolute(relative)) {
        throw new Error("Skill file path escapes the skill workspace");
    }
    return {
        root,
        resolved,
        relative
    };
}
function normalizePositiveInteger(value, fallback, max) {
    if (value === undefined || value === null) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
    return Math.min(parsed, max);
}
function sanitizeHeaders(headers) {
    if (!headers || typeof headers !== "object" || Array.isArray(headers)) return undefined;
    const sanitized = {};
    for (const [key, value] of Object.entries(headers)){
        const normalizedKey = key.trim();
        if (!normalizedKey || BLOCKED_REQUEST_HEADERS.has(normalizedKey.toLowerCase())) continue;
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            sanitized[normalizedKey] = String(value);
        }
    }
    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}
async function readResponseText(response, maxBytes) {
    const reader = response.body?.getReader();
    if (!reader) return {
        body: "",
        truncated: false
    };
    const decoder = new TextDecoder();
    const chunks = [];
    let bytesRead = 0;
    let truncated = false;
    while(true){
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;
        const remaining = maxBytes - bytesRead;
        if (remaining <= 0) {
            truncated = true;
            await reader.cancel();
            break;
        }
        const chunk = value.byteLength > remaining ? value.slice(0, remaining) : value;
        chunks.push(chunk);
        bytesRead += chunk.byteLength;
        if (value.byteLength > remaining) {
            truncated = true;
            await reader.cancel();
            break;
        }
    }
    return {
        body: chunks.map((chunk)=>decoder.decode(chunk, {
                stream: true
            })).join("") + decoder.decode(),
        truncated
    };
}
function normalizeBody(body, headers) {
    if (body === undefined || body === null) return undefined;
    if (typeof body === "string") return body;
    if (body instanceof Uint8Array) return new Uint8Array(body);
    if (typeof body === "object") {
        if (headers && !Object.keys(headers).some((key)=>key.toLowerCase() === "content-type")) {
            headers["Content-Type"] = "application/json";
        }
        return JSON.stringify(body);
    }
    return String(body);
}
function normalizeImage(image, fallback) {
    const selected = typeof image === "string" && image.trim() ? image.trim() : fallback;
    if (!ALLOWED_SANDBOX_IMAGES.has(selected)) {
        throw new Error(`Sandbox image is not allowed: ${selected}`);
    }
    return selected;
}
function sandboxConfig(input) {
    const requestedNetwork = input.networkEnabled === true;
    return {
        timeout: normalizePositiveInteger(input.timeoutMs, DEFAULT_SANDBOX_TIMEOUT_MS, 60_000),
        networkEnabled: requestedNetwork && SANDBOX_NETWORK_ENABLED,
        readOnly: true
    };
}
function truncateOutput(value) {
    if (value.length <= MAX_SANDBOX_OUTPUT_CHARS) return {
        value,
        truncated: false
    };
    return {
        value: value.slice(0, MAX_SANDBOX_OUTPUT_CHARS),
        truncated: true
    };
}
function normalizeArgs(args) {
    if (args === undefined) return [];
    if (!Array.isArray(args)) throw new Error("Field args must be an array");
    return args.map((arg)=>{
        if (typeof arg !== "string" && typeof arg !== "number" && typeof arg !== "boolean") {
            throw new Error("Command arguments must be strings, numbers, or booleans");
        }
        return String(arg);
    });
}
const builtinSkills = {
    file_read: async (input, context)=>{
        const { path: inputPath, encoding = "utf8" } = input;
        if (!inputPath || typeof inputPath !== "string") {
            throw new Error("Missing required field: path");
        }
        if (encoding !== "utf8" && encoding !== "base64") {
            throw new Error("Unsupported encoding. Use utf8 or base64.");
        }
        const { resolved, relative } = resolveWorkspacePath(inputPath, context);
        const stat = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].stat(resolved);
        if (!stat.isFile()) throw new Error("Skill file path must point to a file");
        if (stat.size > MAX_FILE_BYTES) {
            throw new Error(`Skill file exceeds the ${MAX_FILE_BYTES} byte read limit`);
        }
        return {
            success: true,
            path: relative,
            content: await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(resolved, encoding),
            bytesRead: stat.size,
            encoding,
            context: context.apiKeyId
        };
    },
    file_write: async (input, context)=>{
        const { path: inputPath, content, append = false, overwrite = true } = input;
        if (!inputPath || typeof inputPath !== "string" || typeof content !== "string") {
            throw new Error("Missing required fields: path, content");
        }
        const bytesWritten = Buffer.byteLength(content, "utf8");
        if (bytesWritten > MAX_FILE_BYTES) {
            throw new Error(`Skill file write exceeds the ${MAX_FILE_BYTES} byte limit`);
        }
        const { resolved, relative } = resolveWorkspacePath(inputPath, context);
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(resolved), {
            recursive: true
        });
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(resolved, content, {
            encoding: "utf8",
            flag: append ? "a" : overwrite ? "w" : "wx"
        });
        return {
            success: true,
            path: relative,
            bytesWritten,
            context: context.apiKeyId
        };
    },
    http_request: async (input, context)=>{
        const { url, method = "GET", headers: rawHeaders, body, timeoutMs, maxBytes } = input;
        if (!url || typeof url !== "string") {
            throw new Error("Missing required field: url");
        }
        const normalizedMethod = method.toUpperCase();
        if (!ALLOWED_HTTP_METHODS.has(normalizedMethod)) {
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
        const headers = sanitizeHeaders(rawHeaders);
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeOutboundFetch"])(url, {
            method: normalizedMethod,
            headers,
            body: normalizedMethod === "GET" || normalizedMethod === "HEAD" ? undefined : normalizeBody(body, headers),
            timeoutMs: normalizePositiveInteger(timeoutMs, 10_000, 60_000),
            allowRedirect: false,
            retry: false,
            guard: "public-only"
        });
        const limit = normalizePositiveInteger(maxBytes, MAX_HTTP_RESPONSE_BYTES, MAX_HTTP_RESPONSE_BYTES);
        const responseBody = normalizedMethod === "HEAD" ? {
            body: "",
            truncated: false
        } : await readResponseText(response, limit);
        return {
            success: response.ok,
            url,
            method: normalizedMethod,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseBody.body,
            truncated: responseBody.truncated,
            context: context.apiKeyId
        };
    },
    web_search: async (input, context)=>{
        const { query, limit, max_results, search_type, provider, country, language, time_range, offset, filters, content, provider_options, strict_filters } = input;
        if (!query) {
            throw new Error("Missing required field: query");
        }
        const search = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$search$2f$executeWebSearch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["executeWebSearch"])({
            query,
            provider,
            limit,
            max_results,
            search_type,
            country,
            language,
            time_range,
            offset,
            filters,
            content,
            provider_options,
            strict_filters,
            apiKeyId: context.apiKeyId || null
        });
        return {
            success: true,
            provider: search.data.provider,
            query: search.data.query,
            results: search.data.results,
            answer: search.data.answer,
            usage: search.cached ? {
                queries_used: 0,
                search_cost_usd: 0
            } : search.data.usage,
            metrics: search.data.metrics,
            cached: search.cached,
            context: context.apiKeyId
        };
    },
    web_fetch: async (input, context)=>{
        const { url, format, depth, wait_for_selector, include_metadata, provider } = input;
        if (!url || typeof url !== "string") {
            throw new Error("Missing required field: url");
        }
        const fetched = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$webFetchExecution$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["executeWebFetch"])({
            url,
            format,
            depth,
            wait_for_selector,
            include_metadata,
            provider,
            ruleProvider: context.provider ?? null,
            ruleModel: context.model ?? null
        });
        return {
            success: true,
            provider: fetched.provider,
            url: fetched.url,
            content: fetched.content,
            links: fetched.links,
            metadata: fetched.metadata,
            screenshot_url: fetched.screenshot_url,
            context: context.apiKeyId
        };
    },
    eval_code: async (input, context)=>{
        const { code, language = "javascript", image, timeoutMs, networkEnabled } = input;
        if (!code || typeof code !== "string") {
            throw new Error("Missing required field: code");
        }
        const normalizedLanguage = language.toLowerCase();
        let selectedImage;
        let command;
        if (normalizedLanguage === "javascript" || normalizedLanguage === "js") {
            selectedImage = normalizeImage(image, DEFAULT_JS_IMAGE);
            command = [
                "node",
                "--eval",
                code
            ];
        } else if (normalizedLanguage === "python" || normalizedLanguage === "py") {
            selectedImage = normalizeImage(image, DEFAULT_PYTHON_IMAGE);
            command = [
                "python",
                "-c",
                code
            ];
        } else {
            throw new Error(`Unsupported code language: ${language}`);
        }
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$sandbox$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sandboxRunner"].run(selectedImage, command, {}, sandboxConfig({
            timeoutMs,
            networkEnabled
        }));
        const stdout = truncateOutput(result.stdout);
        const stderr = truncateOutput(result.stderr);
        return {
            success: result.exitCode === 0,
            language: normalizedLanguage,
            image: selectedImage,
            exitCode: result.exitCode,
            stdout: stdout.value,
            stderr: stderr.value,
            output: stdout.value,
            truncated: stdout.truncated || stderr.truncated,
            durationMs: result.duration,
            killed: result.killed,
            context: context.apiKeyId
        };
    },
    execute_command: async (input, context)=>{
        const { command, args = [], image, timeoutMs, networkEnabled } = input;
        if (!command || typeof command !== "string") {
            throw new Error("Missing required field: command");
        }
        const normalizedArgs = normalizeArgs(args);
        const selectedImage = normalizeImage(image, DEFAULT_COMMAND_IMAGE);
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$sandbox$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sandboxRunner"].run(selectedImage, [
            command,
            ...normalizedArgs
        ], {}, sandboxConfig({
            timeoutMs,
            networkEnabled
        }));
        const stdout = truncateOutput(result.stdout);
        const stderr = truncateOutput(result.stderr);
        return {
            success: result.exitCode === 0,
            command,
            args: normalizedArgs,
            image: selectedImage,
            exitCode: result.exitCode,
            stdout: stdout.value,
            stderr: stderr.value,
            output: stdout.value,
            truncated: stdout.truncated || stderr.truncated,
            durationMs: result.duration,
            killed: result.killed,
            context: context.apiKeyId
        };
    }
};
function registerBuiltinSkills(executor) {
    for (const [name, handler] of Object.entries(builtinSkills)){
        executor.registerHandler(name, handler);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/skills/interception.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "extractToolCalls",
    ()=>extractToolCalls,
    "handleToolCallExecution",
    ()=>handleToolCallExecution,
    "interceptToolCalls",
    ()=>interceptToolCalls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/executor.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$builtins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/builtins.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/injection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webSearchFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/webSearchFallback.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webFetchInterception$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/webFetchInterception.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$builtins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$builtins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logger"])("SKILLS_INTERCEPTION");
const BUILTIN_TOOL_ALIASES = {
    [__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webSearchFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_WEB_SEARCH_FALLBACK_TOOL_NAME"]]: "web_search",
    [__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$webFetchInterception$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_WEB_FETCH_FALLBACK_TOOL_NAME"]]: "web_fetch"
};
function resolveBuiltinHandlerName(toolName, context) {
    const [rawName] = toolName.includes("@") ? toolName.split("@") : [
        toolName
    ];
    const canonicalName = BUILTIN_TOOL_ALIASES[rawName] || rawName;
    const allowed = new Set((context.builtinToolNames || []).map((name)=>BUILTIN_TOOL_ALIASES[name] || name));
    if (!allowed.has(canonicalName)) {
        return null;
    }
    return canonicalName in __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$builtins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["builtinSkills"] ? canonicalName : null;
}
function getResponsesOutputContainer(response) {
    if (!response || typeof response !== "object") return null;
    if (Array.isArray(response.output)) {
        return {
            root: response,
            responseRoot: response,
            output: response.output
        };
    }
    if (response.response && typeof response.response === "object" && !Array.isArray(response.response) && Array.isArray(response.response.output)) {
        return {
            root: response,
            responseRoot: response.response,
            output: response.response.output
        };
    }
    return null;
}
async function interceptToolCalls(toolCalls, context) {
    const results = await Promise.all(toolCalls.map(async (call)=>{
        try {
            const builtinHandlerName = resolveBuiltinHandlerName(call.name, context);
            if (builtinHandlerName) {
                log.info("skills.interception.builtin_tool_detected", {
                    toolName: call.name,
                    builtinHandler: builtinHandlerName,
                    callId: call.id
                });
                const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$builtins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["builtinSkills"][builtinHandlerName](call.arguments, {
                    apiKeyId: context.apiKeyId,
                    sessionId: context.sessionId,
                    provider: context.provider,
                    model: context.model
                });
                log.info("skills.interception.execution_complete", {
                    toolName: call.name,
                    callId: call.id
                });
                return {
                    id: call.id,
                    result
                };
            }
            const [name, version] = call.name.includes("@") ? call.name.split("@") : [
                call.name,
                "latest"
            ];
            const skillName = version === "latest" ? name : `${name}@${version}`;
            log.info("skills.interception.tool_call_detected", {
                toolName: call.name,
                callId: call.id
            });
            const execution = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$executor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["skillExecutor"].execute(skillName, call.arguments, {
                apiKeyId: context.apiKeyId,
                sessionId: context.sessionId
            });
            const result = execution.output ?? (execution.errorMessage ? {
                error: execution.errorMessage
            } : {
                error: "Skill execution returned no output"
            });
            log.info("skills.interception.execution_complete", {
                toolName: call.name,
                callId: call.id
            });
            return {
                id: call.id,
                result
            };
        } catch (err) {
            log.error("skills.interception.execution_failed", {
                toolName: call.name,
                callId: call.id,
                err: err instanceof Error ? err.message : String(err)
            });
            return {
                id: call.id,
                result: {
                    error: err instanceof Error ? err.message : String(err)
                }
            };
        }
    }));
    return results;
}
function extractToolCalls(response, modelId) {
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectProvider"])(modelId);
    switch(provider){
        case "openai":
            {
                const rootToolCalls = Array.isArray(response?.tool_calls) ? response.tool_calls : [];
                const choiceToolCalls = Array.isArray(response?.choices) ? response.choices.flatMap((choice)=>Array.isArray(choice?.message?.tool_calls) ? choice.message.tool_calls : []) : [];
                const responsesOutput = getResponsesOutputContainer(response);
                const responsesToolCalls = responsesOutput ? responsesOutput.output.map((item)=>item && typeof item === "object" ? item : null).filter((item)=>item?.type === "function_call") : [];
                const toolCalls = rootToolCalls.length > 0 ? rootToolCalls : choiceToolCalls.length > 0 ? choiceToolCalls : responsesToolCalls;
                return toolCalls.map((tc)=>({
                        id: tc.call_id || tc.id || `call_${Date.now()}`,
                        name: tc.function?.name || tc.name || "",
                        arguments: parseArguments(tc.function?.arguments || tc.arguments || "{}")
                    }));
            }
        case "anthropic":
            return (response.content || []).filter((c)=>c.type === "tool_use").map((tc)=>({
                    id: tc.id,
                    name: tc.name,
                    arguments: tc.input || {}
                }));
        case "google":
            return (response.functionCalls || []).map((fc)=>({
                    id: `call_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    name: fc.name,
                    arguments: fc.args || {}
                }));
        default:
            return [];
    }
}
function parseArguments(args) {
    if (typeof args === "object") {
        return args;
    }
    try {
        return JSON.parse(args);
    } catch  {
        return {};
    }
}
function isRegisteredCustomSkill(toolName, apiKeyId) {
    const [name, version] = toolName.includes("@") ? toolName.split("@", 2) : [
        toolName,
        undefined
    ];
    const identifier = version ? `${name}@${version}` : name;
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["skillRegistry"].getSkill(identifier, apiKeyId) != null;
}
async function handleToolCallExecution(response, modelId, context) {
    // Only intercept tool_use blocks that resolve to a builtin handler or a
    // registered custom skill. Unknown tool names are forwarded untouched so
    // client-native tools (Bash, Read, etc.) are not turned into Skill-not-found
    // tool_result blocks appended back into the assistant response. See #2815.
    // Ensure the registry cache is warm for this apiKeyId before filtering.
    // isRegisteredCustomSkill() reads registeredSkills synchronously, so on a
    // cold/fresh process a skill that exists only in the DB would be missed
    // (false negative → silently skipped). Mirror the pattern used in
    // open-sse/mcp-server/tools/skillTools.ts. loadFromDatabase() is a no-op
    // when the cache is already warm (TTL = 60 s), so repeated calls are cheap.
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["skillRegistry"].loadFromDatabase(context.apiKeyId);
    const toolCalls = extractToolCalls(response, modelId).filter((call)=>{
        if (typeof call?.name !== "string" || !call.name) return false;
        if (resolveBuiltinHandlerName(call.name, context)) return true;
        if (context.customSkillExecutionEnabled === false) return false;
        return isRegisteredCustomSkill(call.name, context.apiKeyId);
    });
    if (toolCalls.length === 0) {
        return response;
    }
    const results = await interceptToolCalls(toolCalls, context);
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectProvider"])(modelId);
    switch(provider){
        case "openai":
            {
                const responsesOutput = getResponsesOutputContainer(response);
                if (responsesOutput) {
                    const functionOutputs = results.map((result)=>({
                            type: "function_call_output",
                            call_id: result.id,
                            output: JSON.stringify(result.result)
                        }));
                    if (responsesOutput.root === responsesOutput.responseRoot) {
                        return {
                            ...response,
                            output: [
                                ...responsesOutput.output,
                                ...functionOutputs
                            ]
                        };
                    }
                    return {
                        ...response,
                        response: {
                            ...responsesOutput.responseRoot,
                            output: [
                                ...responsesOutput.output,
                                ...functionOutputs
                            ]
                        }
                    };
                }
                return {
                    ...response,
                    tool_results: results.map((r)=>({
                            tool_call_id: r.id,
                            output: JSON.stringify(r.result)
                        }))
                };
            }
        case "anthropic":
            {
                // Anthropic only permits tool_result blocks in user messages. This helper
                // returns a single assistant response, so there is no valid place to put a
                // server-side skill result as tool_result here. Keep client-native tool_use
                // blocks untouched, remove the OmniRoute-handled tool_use blocks, and expose
                // their results as plain assistant text instead of corrupting history with
                // assistant-side tool_result blocks. See #2815.
                //
                // When no client-native tool_use blocks remain (all were handled here), the
                // upstream stop_reason "tool_use" is stale and would make clients wait for
                // tool_use blocks that no longer exist — so it is normalized to "end_turn"
                // (with stop_sequence cleared). The mixed-tool branch keeps the original
                // stop_reason because real native tool_use blocks still need the client.
                const handledToolCallIds = new Set(results.map((r)=>r.id));
                const toolNamesById = new Map(toolCalls.map((call)=>[
                        call.id,
                        call.name
                    ]));
                const remainingContent = (Array.isArray(response.content) ? response.content : []).filter((block)=>!(block?.type === "tool_use" && handledToolCallIds.has(block.id)));
                const resultTextBlocks = results.map((r)=>({
                        type: "text",
                        text: `[Skill result: ${toolNamesById.get(r.id) || r.id}]\n${JSON.stringify(r.result)}`
                    }));
                const firstRemainingToolUseIndex = remainingContent.findIndex((block)=>block?.type === "tool_use");
                if (firstRemainingToolUseIndex === -1) {
                    return {
                        ...response,
                        content: [
                            ...remainingContent,
                            ...resultTextBlocks
                        ],
                        stop_reason: "end_turn",
                        stop_sequence: null
                    };
                }
                return {
                    ...response,
                    content: [
                        ...remainingContent.slice(0, firstRemainingToolUseIndex),
                        ...resultTextBlocks,
                        ...remainingContent.slice(firstRemainingToolUseIndex)
                    ]
                };
            }
        default:
            return response;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/idempotencyLayer.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "checkIdempotency",
    ()=>checkIdempotency,
    "clearIdempotency",
    ()=>clearIdempotency,
    "getIdempotencyKey",
    ()=>getIdempotencyKey,
    "getIdempotencyStats",
    ()=>getIdempotencyStats,
    "saveIdempotency",
    ()=>saveIdempotency
]);
/**
 * Idempotency Layer — Phase 9.2
 *
 * In-memory deduplication of requests with the same idempotency key.
 * If a request with the same key arrives within 5 seconds, returns
 * the cached response instead of making a new API call.
 *
 * Headers: X-Request-Id or Idempotency-Key
 *
 * @module lib/idempotencyLayer
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const DEFAULT_WINDOW_MS = 5000;
/** @type {Map<string, { response: object, status: number, expiresAt: number }>} */ const idempotencyStore = new Map();
// Periodic cleanup every 30s
let cleanupInterval;
function ensureCleanup() {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(()=>{
        const now = Date.now();
        for (const [key, entry] of idempotencyStore){
            if (now >= entry.expiresAt) {
                idempotencyStore.delete(key);
            }
        }
    }, 30000);
    // Don't prevent process exit
    if (cleanupInterval.unref) cleanupInterval.unref();
}
function getIdempotencyKey(headers) {
    if (!headers) return null;
    const get = typeof headers.get === "function" ? (k)=>headers.get(k) : (k)=>headers[k];
    return get("idempotency-key") || get("x-request-id") || null;
}
function checkIdempotency(key) {
    if (!key) return null;
    const entry = idempotencyStore.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAt) {
        idempotencyStore.delete(key);
        return null;
    }
    return {
        response: entry.response,
        status: entry.status
    };
}
function saveIdempotency(key, response, status, windowMs = DEFAULT_WINDOW_MS) {
    if (!key) return;
    ensureCleanup();
    idempotencyStore.set(key, {
        response,
        status,
        expiresAt: Date.now() + windowMs
    });
}
async function getIdempotencyStats() {
    let windowMs = DEFAULT_WINDOW_MS;
    try {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        if (typeof settings.idempotencyWindowMs === "number" && settings.idempotencyWindowMs > 0) {
            windowMs = settings.idempotencyWindowMs;
        }
    } catch  {
    // Fallback to default if settings unavailable
    }
    return {
        activeKeys: idempotencyStore.size,
        windowMs
    };
}
function clearIdempotency() {
    idempotencyStore.clear();
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/cacheLayer.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LRUCache",
    ()=>LRUCache,
    "getPromptCache",
    ()=>getPromptCache
]);
/**
 * LRU Cache Layer — FASE-08 LLM Proxy Advanced
 *
 * In-memory LRU cache for LLM prompt/response pairs.
 * Uses content hashing for cache keys to handle semantic deduplication.
 * Memory-optimized with byte-based limits.
 *
 * @module lib/cacheLayer
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
/**
 * @typedef {Object} CacheEntry
 * @property {string} key - Cache key (hash)
 * @property {*} value - Cached value
 * @property {number} createdAt - Timestamp
 * @property {number} ttl - TTL in ms
 * @property {number} size - Approximate size in bytes
 * @property {number} hits - Number of times this entry was accessed
 */ const DEFAULT_MAX_ENTRIES = 50;
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const DEFAULT_TTL = 300000;
class LRUCache {
    /** @type {Map<string, CacheEntry>} */ #cache = new Map();
    #maxSize;
    #maxBytes;
    #defaultTTL;
    #currentSize = 0;
    #currentBytes = 0;
    #stats = {
        hits: 0,
        misses: 0,
        evictions: 0
    };
    /**
   * @param {Object} options
   * @param {number} [options.maxSize=50] - Max number of entries (reduced for memory)
   * @param {number} [options.maxBytes=2097152] - Max bytes (default: 2MB)
   * @param {number} [options.defaultTTL=300000] - Default TTL in ms (5 min)
   */ constructor(options = {}){
        this.#maxSize = options.maxSize ?? DEFAULT_MAX_ENTRIES;
        this.#maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
        this.#defaultTTL = options.defaultTTL ?? DEFAULT_TTL;
    }
    /**
   * Generate a cache key from input.
   * @param {Object} params - Parameters to hash
   * @returns {string} Cache key
   */ static generateKey(params) {
        const normalized = JSON.stringify(params, Object.keys(params).sort());
        return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(normalized).digest("hex").slice(0, 16);
    }
    /**
   * Get a value from the cache.
   * @param {string} key
   * @returns {*|undefined}
   */ get(key) {
        const entry = this.#cache.get(key);
        if (!entry) {
            this.#stats.misses++;
            return undefined;
        }
        if (Date.now() - entry.createdAt > entry.ttl) {
            this.#deleteEntry(key, entry);
            this.#stats.misses++;
            return undefined;
        }
        this.#cache.delete(key);
        entry.hits++;
        this.#cache.set(key, entry);
        this.#stats.hits++;
        return entry.value;
    }
    /**
   * Set a value in the cache.
   * @param {string} key
   * @param {*} value
   * @param {number} [ttl] - Override default TTL
   */ set(key, value, ttl) {
        const entrySize = this.#estimateSize(value);
        if (this.#cache.has(key)) {
            const oldEntry = this.#cache.get(key);
            this.#currentBytes -= oldEntry.size || 0;
            this.#currentSize--;
            this.#cache.delete(key);
        }
        while((this.#currentSize >= this.#maxSize || this.#currentBytes + entrySize > this.#maxBytes) && this.#cache.size > 0){
            const oldestKey = this.#cache.keys().next().value;
            const oldestEntry = this.#cache.get(oldestKey);
            if (oldestEntry) {
                this.#deleteEntry(oldestKey, oldestEntry);
            }
            this.#stats.evictions++;
        }
        const entry = {
            key,
            value,
            createdAt: Date.now(),
            ttl: ttl ?? this.#defaultTTL,
            size: entrySize,
            hits: 0
        };
        this.#cache.set(key, entry);
        this.#currentSize++;
        this.#currentBytes += entrySize;
    }
    /**
   * Estimate size of a value in bytes.
   */ #estimateSize(value) {
        try {
            return JSON.stringify(value).length * 2;
        } catch  {
            return 1024;
        }
    }
    /**
   * Delete an entry and update counters.
   */ #deleteEntry(key, entry) {
        this.#cache.delete(key);
        this.#currentSize--;
        this.#currentBytes -= entry.size || 0;
        if (this.#currentBytes < 0) this.#currentBytes = 0;
    }
    /**
   * Check if a key exists (without promoting it).
   * @param {string} key
   * @returns {boolean}
   */ has(key) {
        const entry = this.#cache.get(key);
        if (!entry) return false;
        if (Date.now() - entry.createdAt > entry.ttl) {
            this.#deleteEntry(key, entry);
            return false;
        }
        return true;
    }
    /**
   * Delete a specific key.
   * @param {string} key
   * @returns {boolean}
   */ delete(key) {
        const entry = this.#cache.get(key);
        if (entry) {
            this.#deleteEntry(key, entry);
            return true;
        }
        return false;
    }
    /** Clear the entire cache. */ clear() {
        this.#cache.clear();
        this.#currentSize = 0;
        this.#currentBytes = 0;
    }
    /** @returns {{ size: number, maxSize: number, bytes: number, maxBytes: number, hits: number, misses: number, evictions: number, hitRate: number }} */ getStats() {
        const total = this.#stats.hits + this.#stats.misses;
        return {
            size: this.#currentSize,
            maxSize: this.#maxSize,
            bytes: this.#currentBytes,
            maxBytes: this.#maxBytes,
            ...this.#stats,
            hitRate: total > 0 ? this.#stats.hits / total * 100 : 0
        };
    }
}
// ─── Prompt Cache Singleton ─────────────────
let promptCache = null;
function getPromptCache(options) {
    if (!promptCache) {
        promptCache = new LRUCache({
            maxSize: parseInt(process.env.PROMPT_CACHE_MAX_SIZE || "50", 10),
            maxBytes: parseInt(process.env.PROMPT_CACHE_MAX_BYTES || String(2 * 1024 * 1024), 10),
            defaultTTL: parseInt(process.env.PROMPT_CACHE_TTL_MS || "300000", 10),
            ...options
        });
    }
    return promptCache;
}
}),
"[project]/src/lib/semanticCache.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCache",
    ()=>clearCache,
    "generateSignature",
    ()=>generateSignature,
    "getCacheStats",
    ()=>getCacheStats,
    "getCachedResponse",
    ()=>getCachedResponse,
    "invalidateByModel",
    ()=>invalidateByModel,
    "invalidateBySignature",
    ()=>invalidateBySignature,
    "invalidateStale",
    ()=>invalidateStale,
    "isCacheableForRead",
    ()=>isCacheableForRead,
    "isCacheableForWrite",
    ()=>isCacheableForWrite,
    "setCachedResponse",
    ()=>setCachedResponse
]);
/**
 * Semantic Cache — Phase 9.1
 *
 * Caches LLM responses (temperature=0) to reduce cost and latency.
 * Supports both streaming and non-streaming requests: streaming responses
 * are cached after assembly; cache hits always return JSON.
 * Two-tier: in-memory LRU (fast) + SQLite (persistent across restarts).
 *
 * Cache key = SHA-256(model + normalized messages + temperature + top_p)
 * Bypass: X-OmniRoute-No-Cache: true
 *
 * @module lib/semanticCache
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cacheLayer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cacheLayer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
;
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function ensureCacheMetricsTable() {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        db.prepare(`CREATE TABLE IF NOT EXISTS cache_metrics (
        key TEXT PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`).run();
        db.prepare(`INSERT OR IGNORE INTO cache_metrics (key, value) VALUES ('hits', 0), ('misses', 0), ('tokens_saved', 0)`).run();
    } catch  {
    // DB not available
    }
}
function incrementMetric(metric, amount = 1) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        db.prepare(`UPDATE cache_metrics SET value = value + ?, updated_at = datetime('now') WHERE key = ?`).run(amount, metric);
    } catch  {
    // DB not available — fall back to in-memory
    }
}
function getMetricValue(metric) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const row = db.prepare(`SELECT value FROM cache_metrics WHERE key = ?`).get(metric);
        return row ? toNumber(asRecord(row).value, 0) : 0;
    } catch  {
        return 0;
    }
}
function getHeaderValue(headers, name) {
    if (!headers) return null;
    if (typeof headers.get === "function") {
        return headers.get(name);
    }
    const needle = name.toLowerCase();
    for (const [key, value] of Object.entries(headers)){
        if (key.toLowerCase() !== needle) continue;
        return typeof value === "string" ? value : null;
    }
    return null;
}
// ─── Singleton ─────────────────
let memoryCache = null;
function getMemoryCache() {
    if (!memoryCache) {
        memoryCache = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cacheLayer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["LRUCache"]({
            maxSize: parseInt(process.env.SEMANTIC_CACHE_MAX_SIZE || "50", 10),
            maxBytes: parseInt(process.env.SEMANTIC_CACHE_MAX_BYTES || String(2 * 1024 * 1024), 10),
            defaultTTL: parseInt(process.env.SEMANTIC_CACHE_TTL_MS || "1800000", 10)
        });
        ensureCacheMetricsTable();
    }
    return memoryCache;
}
function generateSignature(model, conversation, temperature = 0, topP = 1, apiKeyId) {
    const payload = JSON.stringify({
        model,
        messages: normalizeConversation(conversation),
        temperature,
        top_p: topP
    });
    const digest = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(payload).digest("hex");
    // Per-key cache isolation (#3740) namespaces the signature with the apiKeyId as a
    // PLAINTEXT prefix instead of folding it into the digest. The apiKeyId is an internal
    // identifier used purely to namespace a deterministic cache key — not a stored
    // credential — so it must never flow into a hash (a salted/slow password hash would
    // also break the determinism the cache relies on). Keeping it out of the digest
    // preserves isolation + determinism and avoids the false-positive
    // CodeQL js/insufficient-password-hash on a cache signature.
    return apiKeyId ? `${apiKeyId}.${digest}` : digest;
}
function stringifyForSignature(value) {
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value);
    } catch  {
        return String(value);
    }
}
/**
 * Normalize conversation items for consistent hashing.
 * Supports both Chat Completions `messages[]` and Responses API `input[]`.
 */ function normalizeConversation(conversation) {
    if (typeof conversation === "string") {
        return [
            {
                role: "user",
                content: conversation
            }
        ];
    }
    if (!Array.isArray(conversation)) return [];
    return conversation.map((item)=>({
            role: typeof item?.role === "string" && item.role.trim().length > 0 ? item.role : "user",
            content: stringifyForSignature(item?.content)
        }));
}
function getCachedResponse(signature) {
    // 1. Check memory cache
    const memResult = getMemoryCache().get(signature);
    if (memResult) {
        incrementMetric("hits");
        incrementMetric("tokens_saved", memResult.tokensSaved || 0);
        return memResult.response;
    }
    // 2. Check SQLite
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const row = db.prepare("SELECT response, tokens_saved FROM semantic_cache WHERE signature = ? AND expires_at > datetime('now')").get(signature);
        if (row) {
            const record = asRecord(row);
            const responsePayload = typeof record.response === "string" ? record.response : null;
            if (!responsePayload) {
                incrementMetric("misses");
                return null;
            }
            const parsed = JSON.parse(responsePayload);
            const tokensSaved = toNumber(record.tokens_saved, 0);
            // Promote to memory cache
            getMemoryCache().set(signature, {
                response: parsed,
                tokensSaved
            });
            // Update hit count in DB
            db.prepare("UPDATE semantic_cache SET hit_count = hit_count + 1 WHERE signature = ?").run(signature);
            incrementMetric("hits");
            incrementMetric("tokens_saved", tokensSaved);
            return parsed;
        }
    } catch  {
    // DB not available — fail open
    }
    incrementMetric("misses");
    return null;
}
function setCachedResponse(signature, model, response, tokensSaved = 0, ttlMs = 3600000) {
    const ttl = parseInt(process.env.SEMANTIC_CACHE_TTL_MS || String(ttlMs), 10);
    // 1. Memory cache
    getMemoryCache().set(signature, {
        response,
        tokensSaved
    }, ttl);
    // 2. SQLite
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const id = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID();
        const promptHash = signature.slice(0, 16);
        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + ttl).toISOString();
        db.prepare(`INSERT OR REPLACE INTO semantic_cache (id, signature, model, prompt_hash, response, tokens_saved, hit_count, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`).run(id, signature, model, promptHash, JSON.stringify(response), tokensSaved, now, expiresAt);
    } catch  {
    // DB write failed — cache still in memory
    }
}
function invalidateByModel(model) {
    getMemoryCache().clear(); // Memory cache doesn't track model; full clear
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const result = db.prepare("DELETE FROM semantic_cache WHERE model = ?").run(model);
        return result.changes || 0;
    } catch  {
        return 0;
    }
}
function invalidateBySignature(signature) {
    getMemoryCache().delete(signature);
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const result = db.prepare("DELETE FROM semantic_cache WHERE signature = ?").run(signature);
        return (result.changes || 0) > 0;
    } catch  {
        return false;
    }
}
function invalidateStale(maxAgeMs) {
    getMemoryCache().clear();
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const cutoff = new Date(Date.now() - maxAgeMs).toISOString();
        const result = db.prepare("DELETE FROM semantic_cache WHERE created_at < ?").run(cutoff);
        return result.changes || 0;
    } catch  {
        return 0;
    }
}
function clearCache() {
    getMemoryCache().clear();
    let removed = 0;
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const result = db.prepare("DELETE FROM semantic_cache").run();
        removed = result.changes || 0;
        db.prepare("UPDATE cache_metrics SET value = 0").run();
    } catch  {
    // DB not available
    }
    return removed;
}
function getCacheStats() {
    const memStats = getMemoryCache().getStats();
    let dbSize = 0;
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const row = db.prepare("SELECT COUNT(*) as count FROM semantic_cache WHERE expires_at > datetime('now')").get();
        dbSize = toNumber(asRecord(row).count, 0);
    } catch  {
    // DB not available
    }
    const hits = getMetricValue("hits");
    const misses = getMetricValue("misses");
    const tokensSaved = getMetricValue("tokens_saved");
    const total = hits + misses;
    return {
        memoryEntries: memStats.size,
        dbEntries: dbSize,
        hits,
        misses,
        hitRate: total > 0 ? (hits / total * 100).toFixed(1) : "0.0",
        tokensSaved
    };
}
function isCacheableForRead(body, headers) {
    if ((getHeaderValue(headers, "x-omniroute-no-cache") || "").toLowerCase() === "true") {
        return false;
    }
    if (typeof body.temperature !== "number" || body.temperature !== 0) return false;
    return true;
}
function isCacheableForWrite(body, headers) {
    if ((getHeaderValue(headers, "x-omniroute-no-cache") || "").toLowerCase() === "true") {
        return false;
    }
    if (body.temperature !== 0) return false;
    return true;
}
}),
"[project]/src/lib/reasoningRouting/policy.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyReasoningRuleDirective",
    ()=>applyReasoningRuleDirective,
    "attachReasoningRuleDirective",
    ()=>attachReasoningRuleDirective,
    "extractReasoningIntent",
    ()=>extractReasoningIntent,
    "filterComboForReasoningDecision",
    ()=>filterComboForReasoningDecision,
    "globMatches",
    ()=>globMatches,
    "isCodexTarget",
    ()=>isCodexTarget,
    "resolveReasoningRoutingRule",
    ()=>resolveReasoningRoutingRule,
    "resolveReasoningSourceModels",
    ()=>resolveReasoningSourceModels,
    "validateCodexWsDecision",
    ()=>validateCodexWsDecision
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningRoutingRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tagRouter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
;
;
;
;
;
const EFFORTS = new Set([
    "none",
    "low",
    "medium",
    "high",
    "xhigh",
    "max",
    "ultra"
]);
const SCOPE_RANK = {
    apiKey: 4,
    combo: 3,
    model: 2,
    global: 1,
    connection: 0
};
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function effort(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    return EFFORTS.has(normalized) ? normalized : null;
}
function thinkingLevelEffort(value) {
    if (value === false) return "none";
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    if ([
        "disabled",
        "off",
        "false"
    ].includes(normalized)) return "none";
    return effort(normalized);
}
function splitGenericEffortSuffix(model) {
    const claude = model.toLowerCase().includes("claude") ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["splitClaudeEffortSuffix"])(model) : null;
    if (claude?.effort) return {
        model: claude.baseModel,
        effort: claude.effort
    };
    return splitCodexEffortSuffix(model) ?? {
        model,
        effort: null
    };
}
function supportsCodexSuffix(candidate, normalizedBase) {
    if (candidate === "max") return /^gpt-5\.6-(?:sol|terra|luna)$/.test(normalizedBase);
    if (candidate === "ultra") return /^gpt-5\.6-(?:sol|terra)$/.test(normalizedBase);
    return true;
}
function splitCodexEffortSuffix(model) {
    const lower = model.toLowerCase();
    for (const candidate of [
        "ultra",
        "xhigh",
        "medium",
        "high",
        "none",
        "low",
        "max"
    ]){
        if (!lower.endsWith(`-${candidate}`)) continue;
        const baseModel = model.slice(0, -(candidate.length + 1));
        const normalizedBase = baseModel.toLowerCase().replace(/^(?:codex|cx)\//, "");
        if (/^gpt-[\w.-]+$/.test(normalizedBase) && supportsCodexSuffix(candidate, normalizedBase)) {
            return {
                model: baseModel,
                effort: candidate
            };
        }
    }
    return null;
}
function firstDefinedEffort(body, reasoning, thinking, thinkingConfig, suffixEffort) {
    const output = asRecord(body.output_config);
    const values = [
        effort(reasoning.effort),
        effort(body.reasoning_effort),
        effort(body.reasoningEffort),
        effort(body.effort),
        effort(output.effort),
        thinkingLevelEffort(body.thinkingLevel),
        thinkingLevelEffort(body.thinking_level),
        thinkingLevelEffort(thinkingConfig.thinkingLevel ?? thinkingConfig.thinking_level),
        body.thinking === false || thinking.type === "disabled" ? "none" : null,
        suffixEffort
    ];
    return values.find((value)=>value !== null) ?? null;
}
function hasNumericField(record, key) {
    return typeof record[key] === "number";
}
function detectThinkingBudget(body, reasoning, thinking, thinkingConfig) {
    const budgetFields = [
        [
            thinking,
            "budget_tokens"
        ],
        [
            thinking,
            "budgetTokens"
        ],
        [
            reasoning,
            "budget_tokens"
        ],
        [
            reasoning,
            "budgetTokens"
        ],
        [
            reasoning,
            "max_tokens"
        ],
        [
            body,
            "thinking_budget"
        ],
        [
            body,
            "thinkingBudget"
        ],
        [
            thinkingConfig,
            "thinkingBudget"
        ],
        [
            thinkingConfig,
            "thinking_budget"
        ]
    ];
    return budgetFields.some(([record, key])=>hasNumericField(record, key));
}
function hasReasoningSignal(body, reasoning, thinkingConfig, explicitEffort, hasBudget) {
    return explicitEffort !== null || [
        body.thinking,
        body.thinkingLevel,
        body.thinking_level,
        reasoning.effort,
        body.reasoning_effort,
        body.reasoningEffort,
        body.effort,
        asRecord(body.output_config).effort,
        thinkingConfig.thinkingLevel,
        thinkingConfig.thinking_level
    ].some((value)=>value !== undefined) || hasBudget;
}
function extractReasoningIntent(modelInput, bodyInput) {
    const body = asRecord(bodyInput);
    const rawModel = typeof modelInput === "string" ? modelInput.trim() : "";
    const suffixed = splitGenericEffortSuffix(rawModel);
    const reasoning = asRecord(body.reasoning);
    const thinking = asRecord(body.thinking);
    const generationConfig = asRecord(body.generationConfig);
    const thinkingConfig = asRecord(generationConfig.thinkingConfig ?? generationConfig.thinking_config);
    const explicitEffort = firstDefinedEffort(body, reasoning, thinking, thinkingConfig, suffixed.effort);
    const hasThinkingBudget = detectThinkingBudget(body, reasoning, thinking, thinkingConfig);
    const hasReasoningSignalValue = hasReasoningSignal(body, reasoning, thinkingConfig, explicitEffort, hasThinkingBudget);
    return {
        model: suffixed.model,
        effort: explicitEffort,
        sourceEffort: explicitEffort ?? (hasReasoningSignalValue ? "signal" : "missing"),
        hasReasoningSignal: hasReasoningSignalValue,
        hasThinkingBudget
    };
}
function globMatches(pattern, value) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
    return new RegExp(`^${escaped}$`, "i").test(value);
}
async function resolveReasoningSourceModels(model, resolve) {
    try {
        const resolved = await resolve(model);
        const resolvedModel = typeof resolved?.model === "string" && resolved.model.trim() ? resolved.model.trim() : null;
        const provider = typeof resolved?.provider === "string" && resolved.provider.trim() ? resolved.provider.trim() : null;
        const normalized = provider && resolvedModel ? `${provider}/${resolvedModel}` : resolvedModel || model;
        return {
            normalized,
            aliases: normalized.toLowerCase() === model.toLowerCase() ? [] : [
                model
            ]
        };
    } catch  {
        return {
            normalized: model,
            aliases: []
        };
    }
}
function tagsMatch(rule, requestTags) {
    if (rule.requestTags.length === 0) return true;
    const available = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeRoutingTags"])(requestTags));
    return rule.tagMatchMode === "all" ? rule.requestTags.every((tag)=>available.has(tag)) : rule.requestTags.some((tag)=>available.has(tag));
}
function modelMatches(rule, model) {
    if (!rule.modelPattern) return true;
    return globMatches(rule.modelPattern, model);
}
function isExactModelMatch(rule, model) {
    return !!rule.modelPattern && !/[?*]/.test(rule.modelPattern) && rule.modelPattern.toLowerCase() === model.toLowerCase();
}
function capabilityFor(model, targetEffort, requiresReasoning = Boolean(targetEffort && targetEffort !== "none")) {
    if (!requiresReasoning || targetEffort === "none") return "supported";
    const capabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])(model);
    if (capabilities.supportsThinking === false) return "unsupported";
    if (targetEffort === "max" || targetEffort === "ultra") {
        const normalized = model.toLowerCase().replace(/^(?:codex|cx)\//, "");
        const supported = targetEffort === "ultra" ? /^gpt-5\.6-(?:sol|terra)(?:-|$)/.test(normalized) : /^gpt-5\.6-(?:sol|terra|luna)(?:-|$)/.test(normalized);
        if (supported) return "supported";
        if (capabilities.supportsThinking === null) return "unknown";
        return "unsupported";
    }
    return capabilities.supportsThinking === null ? "unknown" : "supported";
}
function inputModels(input) {
    return [
        input.sourceModel,
        ...input.sourceModelAliases ?? []
    ];
}
function scopeMatches(rule, input) {
    if (input.connectionOnly ? rule.scope !== "connection" : rule.scope === "connection") {
        return false;
    }
    if (rule.scope === "apiKey" && rule.apiKeyId !== input.apiKeyId) return false;
    if (rule.scope === "combo" && rule.comboId !== input.comboId) return false;
    if (rule.scope === "connection" && rule.connectionId !== input.connectionId) return false;
    return rule.sourceEffort === "any" || rule.sourceEffort === input.sourceEffort;
}
function ruleMatches(rule, input) {
    return scopeMatches(rule, input) && inputModels(input).some((model)=>modelMatches(rule, model)) && tagsMatch(rule, input.requestTags ?? []);
}
function exactMatchScore(rule, input) {
    return Number(inputModels(input).some((model)=>isExactModelMatch(rule, model)));
}
function compareRules(input) {
    return (a, b)=>SCOPE_RANK[b.scope] - SCOPE_RANK[a.scope] || b.priority - a.priority || exactMatchScore(b, input) - exactMatchScore(a, input) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
}
function resolveTargetModel(rule, sourceModel, combo) {
    if (combo) return typeof combo.name === "string" ? combo.name : rule.targetComboId;
    return rule.targetKind === "model" && rule.targetModel ? rule.targetModel : sourceModel;
}
async function resolveTarget(rule, sourceModel) {
    if (rule.targetKind !== "combo" || !rule.targetComboId) {
        return {
            targetCombo: null,
            targetModel: resolveTargetModel(rule, sourceModel, null)
        };
    }
    const targetCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboById"])(rule.targetComboId);
    if (!targetCombo) throw new Error("Reasoning routing target combo does not exist");
    return {
        targetCombo,
        targetModel: resolveTargetModel(rule, sourceModel, targetCombo)
    };
}
function resolveTargetEffort(rule, input) {
    const inherits = rule.effortMode === "inherit" || rule.effortMode === "default" && input.hasReasoningSignal;
    if (!inherits) return rule.targetEffort;
    return input.sourceEffort === "missing" || input.sourceEffort === "signal" ? null : input.sourceEffort;
}
function resolveCapability(targetCombo, targetModel, targetEffort, requiresReasoning) {
    if (!targetCombo) {
        return {
            capability: capabilityFor(targetModel, targetEffort, requiresReasoning),
            warnings: []
        };
    }
    const models = Array.isArray(targetCombo.models) ? targetCombo.models : [];
    const statuses = models.map((entry)=>{
        const record = asRecord(entry);
        const model = typeof entry === "string" ? entry : typeof record.model === "string" ? String(record.model) : null;
        return model ? capabilityFor(model, targetEffort, requiresReasoning) : "unknown";
    });
    const capability = statuses.length > 0 && statuses.every((status)=>status === "unsupported") ? "unsupported" : statuses.some((status)=>status === "unknown") ? "unknown" : "supported";
    const unsupportedCount = statuses.filter((status)=>status === "unsupported").length;
    const warnings = unsupportedCount > 0 && capability !== "unsupported" ? [
        `${unsupportedCount} incompatible combo target(s) will be skipped`
    ] : [];
    return {
        capability,
        warnings
    };
}
async function resolveReasoningRoutingRule(input) {
    const rules = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReasoningRoutingRules"])({
        enabledOnly: true
    });
    const candidates = rules.filter((rule)=>ruleMatches(rule, input)).sort(compareRules(input));
    const rule = candidates[0];
    if (!rule) return null;
    const { targetCombo, targetModel } = await resolveTarget(rule, input.sourceModel);
    const targetEffort = resolveTargetEffort(rule, input);
    const budgetAction = targetEffort === "none" ? "remove" : rule.budgetAction;
    const requiresReasoning = targetEffort !== "none" && (Boolean(targetEffort) || budgetAction === "set" || budgetAction === "preserve" && input.hasThinkingBudget === true);
    const capabilityResult = resolveCapability(targetCombo, input.capabilityModel || targetModel, targetEffort, requiresReasoning);
    const capability = capabilityResult.capability;
    const warnings = capabilityResult.warnings;
    if (capability === "unknown") warnings.push("Reasoning capability could not be verified");
    return {
        rule,
        sourceModel: input.sourceModel,
        sourceEffort: input.sourceEffort,
        targetModel,
        targetCombo,
        targetEffort,
        capability,
        requiresReasoning,
        warnings
    };
}
function clearReasoning(body) {
    delete body.reasoning_effort;
    delete body.reasoningEffort;
    delete body.reasoning;
    delete body.effort;
    delete body.thinking;
    delete body.thinkingLevel;
    delete body.thinking_level;
    delete body.thinking_budget;
    delete body.thinkingBudget;
    if (body.output_config && typeof body.output_config === "object") {
        const output = {
            ...asRecord(body.output_config)
        };
        delete output.effort;
        body.output_config = output;
    }
}
function clearDiscreteReasoning(body) {
    delete body.reasoning_effort;
    delete body.reasoningEffort;
    delete body.effort;
    delete body.thinkingLevel;
    delete body.thinking_level;
    if (body.reasoning && typeof body.reasoning === "object") {
        const reasoning = {
            ...asRecord(body.reasoning)
        };
        delete reasoning.effort;
        if (Object.keys(reasoning).length > 0) body.reasoning = reasoning;
        else delete body.reasoning;
    }
    if (body.output_config && typeof body.output_config === "object") {
        const output = {
            ...asRecord(body.output_config)
        };
        delete output.effort;
        if (Object.keys(output).length > 0) body.output_config = output;
        else delete body.output_config;
    }
    const thinking = asRecord(body.thinking);
    if (body.thinking !== undefined && typeof thinking.budget_tokens !== "number") {
        delete body.thinking;
    }
}
function removeBudgets(body) {
    delete body.thinking_budget;
    delete body.thinkingBudget;
    const thinking = {
        ...asRecord(body.thinking)
    };
    delete thinking.budget_tokens;
    delete thinking.budgetTokens;
    if (Object.keys(thinking).length > 0 && body.thinking !== undefined) body.thinking = thinking;
    else delete body.thinking;
    const reasoning = {
        ...asRecord(body.reasoning)
    };
    delete reasoning.budget_tokens;
    delete reasoning.budgetTokens;
    delete reasoning.max_tokens;
    if (Object.keys(reasoning).length > 0 && body.reasoning !== undefined) body.reasoning = reasoning;
    else if (body.reasoning !== undefined) delete body.reasoning;
    const generationConfig = {
        ...asRecord(body.generationConfig)
    };
    delete generationConfig.thinkingConfig;
    delete generationConfig.thinking_config;
    if (Object.keys(generationConfig).length > 0) body.generationConfig = generationConfig;
    else delete body.generationConfig;
}
function applyBudget(body, action, budget) {
    if (action === "preserve") return;
    removeBudgets(body);
    if (action === "remove") return;
    body.thinking = {
        type: "enabled",
        budget_tokens: budget
    };
}
function attachReasoningRuleDirective(bodyInput, decision) {
    const source = asRecord(bodyInput);
    const body = {
        ...source,
        model: decision.rule.scope === "connection" ? source.model : decision.targetModel
    };
    body._omnirouteReasoningRule = {
        id: decision.rule.id,
        effortMode: decision.rule.effortMode,
        targetEffort: decision.targetEffort,
        budgetAction: decision.targetEffort === "none" ? "remove" : decision.rule.budgetAction,
        budgetTokens: decision.rule.budgetTokens
    };
    body._omnirouteReasoningRouteTrace = {
        ruleId: decision.rule.id,
        ruleName: decision.rule.name,
        scope: decision.rule.scope,
        sourceModel: decision.sourceModel,
        targetModel: decision.targetModel,
        sourceEffort: decision.sourceEffort,
        targetEffort: decision.targetEffort,
        effortMode: decision.rule.effortMode,
        budgetAction: decision.targetEffort === "none" ? "remove" : decision.rule.budgetAction,
        capability: decision.capability,
        warnings: decision.warnings
    };
    return body;
}
function applyReasoningRuleDirective(bodyInput) {
    const source = asRecord(bodyInput);
    const directive = asRecord(source._omnirouteReasoningRule);
    if (!directive.id) return bodyInput;
    const body = {
        ...source
    };
    delete body._omnirouteReasoningRule;
    const effortMode = directive.effortMode;
    const targetEffort = effort(directive.targetEffort);
    if (effortMode === "force" && targetEffort === "none") clearReasoning(body);
    else if ((effortMode === "force" || effortMode === "default") && targetEffort) {
        if (effortMode === "force") clearDiscreteReasoning(body);
        body.reasoning_effort = targetEffort;
        body.reasoning = {
            ...asRecord(body.reasoning),
            effort: targetEffort
        };
        body.output_config = {
            ...asRecord(body.output_config),
            effort: targetEffort
        };
    }
    applyBudget(body, directive.budgetAction, typeof directive.budgetTokens === "number" ? directive.budgetTokens : null);
    return body;
}
function filterComboForReasoningDecision(comboInput, decision) {
    const combo = {
        ...asRecord(comboInput)
    };
    if (!Array.isArray(combo.models) || !decision.requiresReasoning) return {
        combo,
        removed: []
    };
    const removed = [];
    combo.models = combo.models.filter((entry)=>{
        const model = typeof entry === "string" ? entry : typeof asRecord(entry).model === "string" ? String(asRecord(entry).model) : null;
        if (!model) return true;
        if (capabilityFor(model, decision.targetEffort, true) !== "unsupported") return true;
        removed.push(model);
        return false;
    });
    return {
        combo: combo.models.length > 0 ? combo : null,
        removed
    };
}
function isCodexTarget(model) {
    return !model.includes("/") || /^(?:codex|cx)\//i.test(model);
}
function validateCodexWsDecision(decision) {
    if (decision.targetCombo) {
        const models = Array.isArray(decision.targetCombo.models) ? decision.targetCombo.models : [];
        const allCodex = models.length > 0 && models.every((entry)=>{
            const model = typeof entry === "string" ? entry : typeof asRecord(entry).model === "string" ? String(asRecord(entry).model) : "";
            return !!model && isCodexTarget(model);
        });
        if (!allCodex) return "Codex WebSocket reasoning rules require a Codex-only target";
        return "Codex WebSocket transport cannot execute combo targets";
    }
    return isCodexTarget(decision.targetModel) ? null : "Codex WebSocket reasoning rules require a Codex target model";
}
}),
"[project]/src/lib/sseTextTransform.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkIfSnapshot",
    ()=>checkIfSnapshot,
    "checkIfStopSignal",
    ()=>checkIfStopSignal,
    "createSseTextTransform",
    ()=>createSseTextTransform,
    "getFieldCategory",
    ()=>getFieldCategory
]);
const CATEGORY_MAP = {
    reasoning: "reasoning",
    thinking: "reasoning",
    reasoning_content: "reasoning",
    arguments: "toolArgs",
    partial_json: "partialJson"
};
function getFieldCategory(key) {
    return CATEGORY_MAP[key] || "content";
}
const STOP_EVENT_TYPES = new Set([
    "response.done",
    "response.completed",
    "response.cancelled",
    "response.failed"
]);
function checkIfStopSignal(json) {
    if (!json || typeof json !== "object") return false;
    if (json.choices && Array.isArray(json.choices) && json.choices.some((c)=>c.finish_reason)) return true;
    if (json.candidates && Array.isArray(json.candidates) && json.candidates.some((c)=>c.finishReason)) return true;
    if (json.type === "content_block_stop") return true;
    if (json.type === "message_stop") return true;
    if (json.type === "message_delta" && json.delta?.stop_reason) return true;
    if (STOP_EVENT_TYPES.has(json.type)) return true;
    return false;
}
function checkIfSnapshot(json) {
    if (!json || typeof json !== "object") return false;
    if (typeof json.type === "string") {
        const t = json.type;
        if (t.endsWith(".done") || t.endsWith(".completed") || STOP_EVENT_TYPES.has(t)) return true;
    }
    return false;
}
const fallbackDecoder = new TextDecoder();
function createSseTextTransform(processor, onFlush, onCancel) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8");
    let lineBuffer = "";
    let lastPrefix = "data: ";
    let lastJson = null;
    let lastContentJson = null;
    let isJsonStream = false;
    let flushed = false;
    let errored = false;
    let currentEventLine = "";
    let lastEventLine = "";
    let pendingEventLine = "";
    const handleLine = (line, controller)=>{
        const trimmed = line.trim();
        if (trimmed === "" || line.startsWith(":")) {
            // Pass comments and empty lines through unchanged
            if (trimmed === "") {
                currentEventLine = "";
            }
            if (pendingEventLine) {
                controller.enqueue(encoder.encode(pendingEventLine + "\n"));
                pendingEventLine = "";
            }
            controller.enqueue(encoder.encode(line + "\n"));
            return;
        }
        if (line.startsWith("data:")) {
            const prefix = line.startsWith("data: ") ? "data: " : "data:";
            lastPrefix = prefix;
            const segment = line.startsWith("data: ") ? line.slice(6) : line.slice(5);
            if (segment === "[DONE]") {
                if (onFlush && !flushed) {
                    const flushedValue = onFlush(lastJson, isJsonStream, lastContentJson);
                    if (flushedValue) {
                        const prefix = lastPrefix || "data: ";
                        const payload = typeof flushedValue === "string" ? flushedValue : JSON.stringify(flushedValue);
                        if (lastEventLine) {
                            controller.enqueue(encoder.encode(lastEventLine + "\n"));
                        }
                        controller.enqueue(encoder.encode(prefix + payload + "\n\n"));
                    }
                    flushed = true;
                }
                if (pendingEventLine) {
                    controller.enqueue(encoder.encode(pendingEventLine + "\n"));
                    pendingEventLine = "";
                }
                controller.enqueue(encoder.encode(line + "\n"));
                return;
            }
            const trimmedSegment = segment.trim();
            if (trimmedSegment.startsWith("{") || trimmedSegment.startsWith("[")) {
                try {
                    const json = JSON.parse(trimmedSegment);
                    isJsonStream = true;
                    let matched = false;
                    const isStopSignal = checkIfStopSignal(json);
                    const isSnapshot = checkIfSnapshot(json);
                    const METADATA_KEYS = [
                        "id",
                        "model",
                        "object",
                        "created",
                        "finish_reason",
                        "finishReason",
                        "role",
                        "type",
                        "index",
                        "stop_reason",
                        "stop_sequence",
                        "system_fingerprint",
                        "service_tier",
                        "usage",
                        "prompt_tokens",
                        "completion_tokens",
                        "total_tokens",
                        "input_tokens",
                        "output_tokens",
                        "logprobs",
                        "refusal",
                        "name",
                        "event"
                    ];
                    // Recursively sanitize all string properties (except system metadata)
                    const sanitizeObject = (obj, currentChoiceIdx = 0, currentToolIdx = 0)=>{
                        if (!obj || typeof obj !== "object") return;
                        let choiceIdx = currentChoiceIdx;
                        let toolIdx = currentToolIdx;
                        if (typeof obj.index === "number") {
                            if (obj.delta || obj.message || obj.finish_reason) {
                                choiceIdx = obj.index;
                            } else if (obj.function || obj.id || obj.type === "function") {
                                toolIdx = obj.index;
                            } else {
                                choiceIdx = obj.index;
                            }
                        }
                        const compositeKey = `${choiceIdx}_${toolIdx}`;
                        for (const key of Object.keys(obj)){
                            if (METADATA_KEYS.includes(key)) {
                                continue;
                            }
                            if (typeof obj[key] === "string") {
                                const val = obj[key];
                                const field = getFieldCategory(key);
                                if (field === "toolArgs" || field === "partialJson") {
                                    obj[key] = val;
                                    matched = true;
                                    continue;
                                }
                                obj[key] = processor(val, field, isStopSignal, compositeKey, isSnapshot);
                                matched = true;
                            } else if (typeof obj[key] === "object") {
                                sanitizeObject(obj[key], choiceIdx, toolIdx);
                            }
                        }
                    };
                    sanitizeObject(json, 0, 0);
                    if (!matched) {
                        console.warn("[SSE-TRANSFORM] No string fields sanitized in SSE JSON chunk. Keys:", Object.keys(json).slice(0, 5).join(", "));
                    } else {
                        lastContentJson = json;
                    }
                    if (isStopSignal && onFlush && !flushed) {
                        const flushedValue = onFlush(lastJson || json, isJsonStream, lastContentJson || lastJson || json); // Use json as fallback just in case
                        if (flushedValue) {
                            const prefix = lastPrefix || "data: ";
                            const payload = typeof flushedValue === "string" ? flushedValue : JSON.stringify(flushedValue);
                            // Only enqueue if the flushed value actually has content (onFlush usually returns null if buffer is empty now)
                            if (lastEventLine) {
                                controller.enqueue(encoder.encode(lastEventLine + "\n"));
                            }
                            controller.enqueue(encoder.encode(prefix + payload + "\n\n"));
                        }
                        flushed = true;
                    }
                    if (!isStopSignal && !isSnapshot) {
                        lastEventLine = currentEventLine;
                    }
                    lastJson = json;
                    if (pendingEventLine) {
                        controller.enqueue(encoder.encode(pendingEventLine + "\n"));
                        pendingEventLine = "";
                    }
                    controller.enqueue(encoder.encode(prefix + JSON.stringify(json) + "\n"));
                } catch (err) {
                    if (err?.message?.startsWith("[PII]")) {
                        throw err;
                    }
                    if (err instanceof SyntaxError) {
                        // JSON parsing failed. Check if it looks like JSON that failed to parse.
                        if (trimmedSegment.startsWith("{") || trimmedSegment.startsWith("[")) {
                            console.warn("[SSE-TRANSFORM] Dropping malformed JSON chunk to prevent syntax injection:", trimmedSegment.slice(0, 100));
                            pendingEventLine = "";
                        } else {
                            if (pendingEventLine) {
                                controller.enqueue(encoder.encode(pendingEventLine + "\n"));
                                pendingEventLine = "";
                            }
                            // Treat segment as raw text delta (fail-open)
                            const processed = processor(segment, "content");
                            controller.enqueue(encoder.encode(prefix + processed + "\n"));
                        }
                    } else {
                        throw err;
                    }
                }
            } else {
                // Starts with data: but not JSON, process as raw text
                lastEventLine = currentEventLine;
                const processed = processor(segment, "content");
                if (pendingEventLine) {
                    controller.enqueue(encoder.encode(pendingEventLine + "\n"));
                    pendingEventLine = "";
                }
                controller.enqueue(encoder.encode(prefix + processed + "\n"));
            }
        } else {
            // Non-data line, pass through (e.g. event: content_block_delta)
            if (line.startsWith("event:")) {
                if (pendingEventLine) {
                    controller.enqueue(encoder.encode(pendingEventLine + "\n"));
                }
                currentEventLine = line;
                pendingEventLine = line;
            } else {
                if (pendingEventLine) {
                    controller.enqueue(encoder.encode(pendingEventLine + "\n"));
                    pendingEventLine = "";
                }
                controller.enqueue(encoder.encode(line + "\n"));
            }
        }
    };
    return new TransformStream({
        transform (chunk, controller) {
            try {
                const chunkStr = decoder.decode(chunk, {
                    stream: true
                });
                lineBuffer += chunkStr;
                const lines = lineBuffer.split(/\r?\n/);
                lineBuffer = lines.pop() || "";
                for (const line of lines){
                    handleLine(line, controller);
                }
            } catch (err) {
                let context = "[REDACTED_DUE_TO_PII]";
                if (!err?.message?.startsWith("[PII]")) {
                    if (typeof chunk === "string") {
                        context = chunk.slice(0, 200);
                    } else if (chunk instanceof Uint8Array) {
                        context = fallbackDecoder.decode(chunk.slice(0, 200));
                    } else {
                        context = String(chunk).slice(0, 200);
                    }
                }
                console.error("[SSE-TRANSFORM] Error in transform:", err, "chunk:", context);
                lineBuffer = "";
                errored = true;
                controller.error(err);
            }
        },
        flush (controller) {
            if (errored) return;
            try {
                const remaining = decoder.decode() + lineBuffer;
                if (remaining) {
                    handleLine(remaining, controller);
                }
                if (pendingEventLine) {
                    controller.enqueue(encoder.encode(pendingEventLine + "\n"));
                    pendingEventLine = "";
                }
                if (onFlush && !flushed) {
                    const flushedValue = onFlush(lastJson, isJsonStream, lastContentJson);
                    if (flushedValue) {
                        const prefix = lastPrefix || "data: ";
                        const payload = typeof flushedValue === "string" ? flushedValue : JSON.stringify(flushedValue);
                        if (lastEventLine) {
                            controller.enqueue(encoder.encode(lastEventLine + "\n"));
                        }
                        controller.enqueue(encoder.encode(prefix + payload + "\n\n"));
                    }
                }
            } catch (err) {
                console.error("[SSE-TRANSFORM] Error in flush:", err);
                controller.error(err);
            }
        },
        cancel (reason) {
            if (onCancel) {
                onCancel();
            }
        }
    });
}
}),
"[project]/src/lib/streamingPiiTransform.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createPiiSseTransform",
    ()=>createPiiSseTransform
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sseTextTransform$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sseTextTransform.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/piiSanitizer.ts [instrumentation] (ecmascript)");
;
;
function createPiiSseTransform(options) {
    const choiceBuffers = new Map();
    const getBuffers = (index)=>{
        const key = String(index);
        let buf = choiceBuffers.get(key);
        if (!buf) {
            buf = {
                content: "",
                reasoning: "",
                toolArgs: "",
                partialJson: ""
            };
            choiceBuffers.set(index, buf);
        }
        return buf;
    };
    let windowSize = Math.max(200, options?.windowSize ?? (parseInt(process.env.PII_WINDOW_SIZE || "", 10) || 200));
    if (options?.windowSize !== undefined && process.env.PII_TEST_BYPASS_MIN_WINDOW === "true") {
        windowSize = options.windowSize;
    }
    const W = windowSize;
    const processor = (text, field, isStopSignal = false, index = "0_0", isSnapshot = false)=>{
        if (field === "toolArgs" || field === "partialJson") {
            return text;
        }
        if (isSnapshot) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(text).text;
        }
        const buffers = getBuffers(index);
        buffers[field] += text;
        const { text: sanitized, endMatchIndex } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(buffers[field], !isStopSignal);
        let emitLength = isStopSignal ? sanitized.length : Math.max(0, sanitized.length - W);
        // Cap emitLength at the start of any PII that touched the end of the buffer
        if (!isStopSignal && endMatchIndex !== undefined && emitLength > endMatchIndex) {
            emitLength = endMatchIndex;
        }
        // Prevent slicing in the middle of a UTF-16 surrogate pair (e.g. emojis)
        if (emitLength > 0 && emitLength < sanitized.length) {
            const charCode = sanitized.charCodeAt(emitLength - 1);
            // High surrogate range is 0xD800 - 0xDBFF
            if (charCode >= 0xd800 && charCode <= 0xdbff) {
                emitLength -= 1;
            }
        }
        const toEmit = sanitized.slice(0, emitLength);
        buffers[field] = sanitized.slice(emitLength);
        return toEmit;
    };
    const onFlush = (lastJson, isJsonStream = false, lastContentJson = null)=>{
        // Force final redaction on all buffers
        for (const [index, buffers] of choiceBuffers.entries()){
            for (const key of Object.keys(buffers)){
                const field = key;
                if (buffers[field]) {
                    buffers[field] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(buffers[field]).text;
                }
            }
        }
        let hasRemaining = false;
        for (const buffers of choiceBuffers.values()){
            for (const key of Object.keys(buffers)){
                if (buffers[key].length > 0) {
                    hasRemaining = true;
                }
            }
        }
        if (!hasRemaining) {
            return null;
        }
        if (!lastJson) {
            const buffers = getBuffers("0_0");
            if (buffers.content) {
                const remaining = buffers.content;
                buffers.content = "";
                if (isJsonStream) {
                    // Wrap in a safe default OpenAI format to prevent client-side SDK crashes
                    return {
                        choices: [
                            {
                                delta: {
                                    content: remaining
                                }
                            }
                        ]
                    };
                } else {
                    return remaining;
                }
            }
            return null;
        }
        // Explicitly target formats to prevent metadata corruption and leakage
        const METADATA_KEYS = [
            "id",
            "model",
            "object",
            "created",
            "finish_reason",
            "finishReason",
            "role",
            "type",
            "index",
            "stop_reason",
            "stop_sequence",
            "system_fingerprint",
            "service_tier",
            "usage",
            "prompt_tokens",
            "completion_tokens",
            "total_tokens",
            "input_tokens",
            "output_tokens",
            "logprobs",
            "refusal",
            "name",
            "event"
        ];
        // 1. Claude format
        if (typeof lastJson.type === "string" && (lastJson.type.startsWith("message") || lastJson.type.startsWith("content_block"))) {
            const buffers = getBuffers("0_0");
            const delta = {
                type: "text_delta"
            };
            let hasDelta = false;
            if (buffers.content) {
                delta.text = buffers.content;
                buffers.content = "";
                hasDelta = true;
            }
            if (buffers.reasoning) {
                delta.thinking = buffers.reasoning;
                buffers.reasoning = "";
                hasDelta = true;
            }
            if (buffers.partialJson) {
                delta.partial_json = buffers.partialJson;
                buffers.partialJson = "";
                hasDelta = true;
            }
            if (hasDelta) {
                return {
                    type: "content_block_delta",
                    index: typeof lastJson.index === "number" ? lastJson.index : 0,
                    delta
                };
            }
            return null;
        }
        // 2. OpenAI Chat Completions
        if (lastJson.choices && Array.isArray(lastJson.choices)) {
            const finalJson = JSON.parse(JSON.stringify(lastJson));
            const presentIndexes = new Set(finalJson.choices.map((c)=>c.index).filter((idx)=>typeof idx === "number"));
            for (const [compositeKey, choiceBuf] of choiceBuffers.entries()){
                const choiceIdx = parseInt(compositeKey.split("_")[0] || "0", 10);
                if (!presentIndexes.has(choiceIdx) && (choiceBuf.content || choiceBuf.reasoning || choiceBuf.toolArgs)) {
                    finalJson.choices.push({
                        index: choiceIdx,
                        delta: {}
                    });
                    presentIndexes.add(choiceIdx);
                }
            }
            for (const choice of finalJson.choices){
                const choiceIdx = typeof choice.index === "number" ? choice.index : 0;
                // Find if we have tool buffers for this choice
                const toolEntries = Array.from(choiceBuffers.entries()).filter(([key])=>key.startsWith(`${choiceIdx}_`) && key !== `${choiceIdx}_0`);
                const choiceBuf = getBuffers(`${choiceIdx}_0`);
                if (!choice.delta) choice.delta = {};
                const delta = choice.delta;
                if (choiceBuf.content) {
                    delta.content = choiceBuf.content;
                    choiceBuf.content = "";
                } else {
                    delete delta.content;
                }
                if (choiceBuf.reasoning) {
                    delta.reasoning_content = choiceBuf.reasoning;
                    choiceBuf.reasoning = "";
                } else {
                    delete delta.reasoning_content;
                }
                if (choiceBuf.toolArgs || toolEntries.length > 0) {
                    if (!choice.delta.tool_calls) choice.delta.tool_calls = [];
                    if (choiceBuf.toolArgs) {
                        choice.delta.tool_calls.push({
                            index: 0,
                            function: {
                                arguments: choiceBuf.toolArgs
                            }
                        });
                        choiceBuf.toolArgs = "";
                    }
                    for (const [key, buf] of toolEntries){
                        if (buf.toolArgs) {
                            const toolIdx = parseInt(key.split("_")[1] || "0", 10);
                            choice.delta.tool_calls.push({
                                index: toolIdx,
                                function: {
                                    arguments: buf.toolArgs
                                }
                            });
                            buf.toolArgs = "";
                        }
                    }
                } else {
                    delete choice.delta.tool_calls;
                }
            }
            return finalJson;
        }
        // 3. Responses API
        if (typeof lastJson.type === "string" && lastJson.type.startsWith("response.")) {
            const finalJson = JSON.parse(JSON.stringify(lastJson));
            const idx = typeof finalJson.output_index === "number" ? finalJson.output_index : 0;
            const buffers = getBuffers(`${idx}_0`);
            if (buffers.content) {
                finalJson.delta = buffers.content;
                buffers.content = "";
            }
            if (buffers.toolArgs) {
                finalJson.item = {
                    arguments: buffers.toolArgs
                };
                buffers.toolArgs = "";
            }
            return finalJson;
        }
        // 4. Gemini format
        if (Array.isArray(lastJson.candidates)) {
            const finalJson = JSON.parse(JSON.stringify(lastJson));
            for (const cand of finalJson.candidates){
                const idx = typeof cand.index === "number" ? cand.index : 0;
                const buffers = getBuffers(`${idx}_0`);
                if (!cand.content) cand.content = {};
                cand.content.parts = [];
                if (buffers.content) {
                    cand.content.parts.push({
                        text: buffers.content
                    });
                    buffers.content = "";
                }
            }
            return finalJson;
        }
        // 5. Generic fallback
        const templateJson = lastContentJson || lastJson;
        const finalJson = JSON.parse(JSON.stringify(templateJson));
        const clearDeltas = (obj)=>{
            if (!obj || typeof obj !== "object") return;
            for (const key of Object.keys(obj)){
                if (METADATA_KEYS.includes(key)) {
                    continue;
                }
                if (typeof obj[key] === "string") {
                    obj[key] = "";
                } else if (typeof obj[key] === "object") {
                    clearDeltas(obj[key]);
                }
            }
        };
        clearDeltas(finalJson);
        const populateRemaining = (obj, currentChoiceIdx = 0, currentToolIdx = 0)=>{
            if (!obj || typeof obj !== "object") return;
            let choiceIdx = currentChoiceIdx;
            let toolIdx = currentToolIdx;
            if (typeof obj.index === "number") {
                if (obj.delta || obj.message || obj.finish_reason) {
                    choiceIdx = obj.index;
                } else if (obj.function || obj.id || obj.type === "function") {
                    toolIdx = obj.index;
                } else {
                    choiceIdx = obj.index;
                }
            }
            const compositeKey = `${choiceIdx}_${toolIdx}`;
            for (const key of Object.keys(obj)){
                if (METADATA_KEYS.includes(key)) {
                    continue;
                }
                if (typeof obj[key] === "string") {
                    const field = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sseTextTransform$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getFieldCategory"])(key);
                    const choiceBuf = getBuffers(compositeKey);
                    if (choiceBuf[field]) {
                        obj[key] = (obj[key] || "") + choiceBuf[field];
                        choiceBuf[field] = "";
                    }
                } else if (typeof obj[key] === "object") {
                    populateRemaining(obj[key], choiceIdx, toolIdx);
                }
            }
        };
        populateRemaining(finalJson, 0, 0);
        // Clear all buffers
        for (const buffers of choiceBuffers.values()){
            buffers.content = "";
            buffers.reasoning = "";
            buffers.toolArgs = "";
            buffers.partialJson = "";
        }
        return finalJson;
    };
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sseTextTransform$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createSseTextTransform"])(processor, onFlush);
}
}),
"[project]/src/lib/sync/bundle.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildConfigSyncBundle",
    ()=>buildConfigSyncBundle,
    "buildConfigSyncEnvelope",
    ()=>buildConfigSyncEnvelope,
    "computeConfigSyncVersion",
    ()=>computeConfigSyncVersion,
    "reconcileReasoningRulesForSync",
    ()=>reconcileReasoningRulesForSync,
    "serializeStableJson",
    ()=>serializeStableJson,
    "toLegacyCloudSyncPayload",
    ()=>toLegacyCloudSyncPayload
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$aliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/aliases.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningRoutingRules.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function sanitizeSettingsForSync(settings) {
    const record = asRecord(settings);
    const { password: _password, requireLogin: _requireLogin, cloudEnabled: _cloudEnabled, ...safeSettings } = record;
    return safeSettings;
}
function sortByStringKeys(items, keys) {
    return [
        ...items
    ].sort((a, b)=>{
        for (const key of keys){
            const leftRaw = a[key];
            const rightRaw = b[key];
            if (typeof leftRaw === "number" || typeof rightRaw === "number") {
                const left = typeof leftRaw === "number" ? leftRaw : Number.MAX_SAFE_INTEGER;
                const right = typeof rightRaw === "number" ? rightRaw : Number.MAX_SAFE_INTEGER;
                if (left !== right) return left - right;
                continue;
            }
            const left = typeof leftRaw === "string" ? String(leftRaw) : "";
            const right = typeof rightRaw === "string" ? String(rightRaw) : "";
            const comparison = left.localeCompare(right, undefined, {
                numeric: true
            });
            if (comparison !== 0) return comparison;
        }
        return 0;
    });
}
function pickDefined(record, keys) {
    return Object.fromEntries(keys.filter((key)=>record[key] !== undefined).map((key)=>[
            key,
            record[key]
        ]));
}
function sanitizeProviderConnectionForSync(connection) {
    const record = asRecord(connection);
    return pickDefined(record, [
        "id",
        "provider",
        "authType",
        "name",
        "displayName",
        "email",
        "priority",
        "globalPriority",
        "defaultModel",
        "isActive",
        "accessToken",
        "refreshToken",
        "expiresAt",
        "expiresIn",
        "tokenType",
        "scope",
        "idToken",
        "projectId",
        "apiKey",
        "providerSpecificData",
        "group"
    ]);
}
function sanitizeProviderNodeForSync(node) {
    const record = asRecord(node);
    return pickDefined(record, [
        "id",
        "type",
        "name",
        "prefix",
        "apiType",
        "baseUrl",
        "chatPath",
        "modelsPath"
    ]);
}
function sanitizeComboForSync(combo) {
    const record = asRecord(combo);
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = record;
    return rest;
}
function sanitizeApiKeyForSync(apiKey) {
    const record = asRecord(apiKey);
    return pickDefined(record, [
        "id",
        "name",
        "key",
        "machineId",
        "allowedModels",
        "allowedCombos",
        "allowedConnections",
        "noLog",
        "autoResolve",
        "isActive",
        "accessSchedule",
        "maxRequestsPerDay",
        "maxRequestsPerMinute",
        "throttleDelayMs",
        "maxSessions"
    ]);
}
function sanitizeReasoningRuleForSync(rule) {
    const record = asRecord(rule);
    return pickDefined(record, [
        "id",
        "name",
        "description",
        "scope",
        "apiKeyId",
        "comboId",
        "connectionId",
        "modelPattern",
        "sourceEffort",
        "requestTags",
        "tagMatchMode",
        "effortMode",
        "targetEffort",
        "targetKind",
        "targetModel",
        "targetComboId",
        "budgetAction",
        "budgetTokens",
        "priority",
        "enabled",
        "createdAt",
        "updatedAt"
    ]);
}
function canonicalizeJson(value) {
    if (Array.isArray(value)) {
        return value.map((entry)=>canonicalizeJson(entry));
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.keys(value).sort((a, b)=>a.localeCompare(b)).map((key)=>[
                key,
                canonicalizeJson(value[key])
            ]));
    }
    return value;
}
function serializeStableJson(value) {
    return JSON.stringify(canonicalizeJson(value));
}
function computeConfigSyncVersion(bundle) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(serializeStableJson(bundle)).digest("hex");
}
async function buildConfigSyncBundle() {
    const [settings, providerConnections, providerNodes, modelAliases, combos, apiKeys, reasoningRoutingRules] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$aliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelAliases"])(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCombos"])(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getApiKeys"])(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReasoningRoutingRules"])()
    ]);
    return {
        settings: sanitizeSettingsForSync(settings),
        providerConnections: sortByStringKeys(providerConnections.map((connection)=>sanitizeProviderConnectionForSync(connection)), [
            "provider",
            "name",
            "id"
        ]),
        providerNodes: sortByStringKeys(providerNodes.map((node)=>sanitizeProviderNodeForSync(node)), [
            "type",
            "name",
            "id"
        ]),
        modelAliases: asRecord(modelAliases),
        combos: sortByStringKeys(combos.map((combo)=>sanitizeComboForSync(combo)), [
            "sortOrder",
            "name",
            "id"
        ]),
        apiKeys: sortByStringKeys(apiKeys.map((apiKey)=>sanitizeApiKeyForSync(apiKey)), [
            "name",
            "id"
        ]),
        reasoningRoutingRules: sortByStringKeys(reasoningRoutingRules.map((rule)=>sanitizeReasoningRuleForSync(rule)), [
            "scope",
            "priority",
            "createdAt",
            "id"
        ])
    };
}
async function buildConfigSyncEnvelope() {
    const bundle = await buildConfigSyncBundle();
    const version = computeConfigSyncVersion(bundle);
    return {
        version,
        bundle
    };
}
function toLegacyCloudSyncPayload(bundle) {
    return {
        providers: bundle.providerConnections,
        providerNodes: bundle.providerNodes,
        modelAliases: bundle.modelAliases,
        combos: bundle.combos,
        apiKeys: bundle.apiKeys,
        settings: bundle.settings,
        reasoningRoutingRules: bundle.reasoningRoutingRules
    };
}
function reconcileReasoningRulesForSync(rules, references) {
    const apiKeyIds = new Set(references.apiKeyIds);
    const comboIds = new Set(references.comboIds);
    const connectionIds = new Set(references.connectionIds);
    const conflicts = [];
    const reconciled = rules.map((rule)=>{
        const missing = [];
        if (rule.scope === "apiKey" && !apiKeyIds.has(String(rule.apiKeyId || ""))) {
            missing.push("apiKeyId");
        }
        if (rule.scope === "combo" && !comboIds.has(String(rule.comboId || ""))) {
            missing.push("comboId");
        }
        if (rule.scope === "connection" && !connectionIds.has(String(rule.connectionId || ""))) {
            missing.push("connectionId");
        }
        if (rule.targetKind === "combo" && !comboIds.has(String(rule.targetComboId || ""))) {
            missing.push("targetComboId");
        }
        if (missing.length === 0) return {
            ...rule
        };
        const ruleId = String(rule.id || "unknown");
        conflicts.push({
            ruleId,
            missing
        });
        return {
            ...rule,
            enabled: false
        };
    });
    return {
        rules: reconciled,
        conflicts
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/cloudSync.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CLOUD_SYNC_SECRETS_ENABLED",
    ()=>CLOUD_SYNC_SECRETS_ENABLED,
    "CLOUD_SYNC_TIMEOUT_MS",
    ()=>CLOUD_SYNC_TIMEOUT_MS,
    "CLOUD_URL",
    ()=>CLOUD_URL,
    "fetchWithTimeout",
    ()=>fetchWithTimeout,
    "syncToCloud",
    ()=>syncToCloud,
    "verifyCloudSignature",
    ()=>verifyCloudSignature
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$bundle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sync/bundle.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$bundle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$bundle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const CLOUD_URL = process.env.CLOUD_URL || ("TURBOPACK compile-time value", "");
const CLOUD_SYNC_TIMEOUT_MS = Number(process.env.CLOUD_SYNC_TIMEOUT_MS || 12000);
const CLOUD_SYNC_SECRET = process.env.OMNIROUTE_CLOUD_SYNC_SECRET || "";
// Opt-in: only when explicitly set to "true" will updateLocalTokens overwrite
// accessToken/refreshToken/providerSpecificData from the Cloud response. Default
// behaviour from v3.8.6 onward syncs only non-credential metadata (expiresAt,
// status, lastError*, rateLimitedUntil, updatedAt) so a misconfigured or
// hostile CLOUD_URL cannot silently swap user OAuth tokens.
const CLOUD_SYNC_SECRETS_ENABLED = process.env.OMNIROUTE_CLOUD_SYNC_SECRETS === "true";
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrNull(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function toDateMs(value) {
    if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
        const parsed = new Date(value).getTime();
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
function verifyCloudSignature(rawBody, sigHeader) {
    if (!CLOUD_SYNC_SECRET) {
        if (sigHeader) {
            // We can't verify, but the server is at least trying. Pass through.
            return true;
        }
        console.warn("[cloudSync] OMNIROUTE_CLOUD_SYNC_SECRET is not set and the Cloud response carries no X-Cloud-Sig. " + "Token sync runs in legacy unverified mode — set the secret to enforce HMAC verification.");
        return true;
    }
    if (!sigHeader) {
        console.warn("[cloudSync] Cloud response missing X-Cloud-Sig — rejecting payload.");
        return false;
    }
    const expected = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac("sha256", CLOUD_SYNC_SECRET).update(rawBody).digest("hex");
    try {
        const expectedBuf = Buffer.from(expected, "hex");
        const actualBuf = Buffer.from(sigHeader, "hex");
        if (expectedBuf.length !== actualBuf.length) return false;
        return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].timingSafeEqual(expectedBuf, actualBuf);
    } catch  {
        return false;
    }
}
async function fetchWithTimeout(url, options = {}, timeoutMs = CLOUD_SYNC_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), timeoutMs);
    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal
        });
    } finally{
        clearTimeout(timeoutId);
    }
}
async function syncToCloud(machineId, createdKey = null) {
    if (!CLOUD_URL) {
        return {
            error: "NEXT_PUBLIC_CLOUD_URL is not configured"
        };
    }
    // Keep legacy field names for upstream compatibility, but derive them
    // from a canonical sync bundle with deterministic version hashing.
    const { version, bundle } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$bundle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildConfigSyncEnvelope"])();
    const legacyPayload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$bundle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toLegacyCloudSyncPayload"])(bundle);
    let response;
    try {
        // Send to Cloud
        response = await fetchWithTimeout(`${CLOUD_URL}/sync/${machineId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...legacyPayload,
                version
            })
        });
    } catch (error) {
        const isTimeout = error?.name === "AbortError";
        return {
            error: isTimeout ? "Cloud sync timeout" : "Cloud sync request failed"
        };
    }
    if (!response.ok) {
        const errorText = await response.text();
        const truncated = errorText.length > 200 ? errorText.slice(0, 200) + "…" : errorText;
        console.log("Cloud sync failed", {
            status: response.status,
            body: truncated
        });
        return {
            error: "Cloud sync failed"
        };
    }
    // Read the raw body so we can verify the signature before trusting any
    // JSON-parsed field. Order matters: parse only after verification passes.
    const rawBody = await response.text();
    const sigHeader = response.headers.get("X-Cloud-Sig");
    if (!verifyCloudSignature(rawBody, sigHeader)) {
        return {
            error: "Cloud sync signature verification failed"
        };
    }
    let result;
    try {
        result = JSON.parse(rawBody);
    } catch  {
        return {
            error: "Cloud sync response is not valid JSON"
        };
    }
    // Update local db with tokens from Cloud (providers stored by ID)
    if (result?.data?.providers) {
        await updateLocalTokens(result.data.providers);
    }
    const responseData = {
        success: true,
        message: "Synced successfully",
        changes: result.changes,
        version
    };
    if (createdKey) {
        responseData.createdKey = createdKey;
    }
    return responseData;
}
/**
 * Update local db with data from Cloud
 * Simple logic: if Cloud is newer, sync entire provider
 * cloudProviders is object keyed by provider ID
 *
 * SECURITY-AUDITOR-NOTE: This function appears in Socket.dev finding for
 * `app/.next/server/app/api/keys/[id]/route.js`. From v3.8.6 onward,
 * `accessToken` / `refreshToken` / `providerSpecificData` are only synced when
 * `OMNIROUTE_CLOUD_SYNC_SECRETS=true`. The default mode syncs non-credential
 * metadata only. Combined with `verifyCloudSignature()` above, this closes the
 * silent-credential-overwrite path. See docs/security/SOCKET_DEV_FINDINGS.md §5.
 */ async function updateLocalTokens(cloudProviders) {
    const cloudProvidersMap = asRecord(cloudProviders);
    const localProviders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])();
    for (const localProviderRaw of localProviders){
        const localProvider = asRecord(localProviderRaw);
        const localProviderId = toStringOrNull(localProvider.id);
        if (!localProviderId) continue;
        const cloudProvider = asRecord(cloudProvidersMap[localProviderId]);
        if (Object.keys(cloudProvider).length === 0) continue;
        const cloudUpdatedAt = toDateMs(cloudProvider.updatedAt);
        const localUpdatedAt = toDateMs(localProvider.updatedAt);
        if (cloudUpdatedAt > localUpdatedAt) {
            const updates = {
                // Non-credential metadata — always synced.
                expiresAt: cloudProvider.expiresAt,
                expiresIn: cloudProvider.expiresIn,
                testStatus: cloudProvider.status || "active",
                lastError: cloudProvider.lastError,
                lastErrorAt: cloudProvider.lastErrorAt,
                errorCode: cloudProvider.errorCode,
                rateLimitedUntil: cloudProvider.rateLimitedUntil,
                updatedAt: cloudProvider.updatedAt
            };
            // Credentials and providerSpecificData are only overwritten when the
            // operator has explicitly opted in to remote credential sync. Default
            // OFF closes the silent-swap surface.
            if (CLOUD_SYNC_SECRETS_ENABLED) {
                updates.accessToken = cloudProvider.accessToken;
                updates.refreshToken = cloudProvider.refreshToken;
                updates.providerSpecificData = cloudProvider.providerSpecificData || localProvider.providerSpecificData;
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(localProviderId, updates);
        }
    }
}
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/services/registry.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Singleton registry of ServiceSupervisor instances. */ __turbopack_context__.s([
    "getSupervisor",
    ()=>getSupervisor,
    "registerSupervisor",
    ()=>registerSupervisor,
    "unregisterSupervisor",
    ()=>unregisterSupervisor
]);
const supervisors = new Map();
function registerSupervisor(supervisor) {
    supervisors.set(supervisor.getStatus().tool, supervisor);
}
function getSupervisor(tool) {
    return supervisors.get(tool) ?? null;
}
function unregisterSupervisor(tool) {
    supervisors.delete(tool);
}
async function stopAll() {
    // Drive every supervisor stop to completion before the process exits so the
    // DB status writes inside ServiceSupervisor.stop() flush. Otherwise the
    // event loop drains immediately on SIGTERM and rows are stuck in "running"
    // or "starting" until the next boot.
    await Promise.allSettled(Array.from(supervisors.values()).map((supervisor)=>supervisor.stop()));
}
function handleShutdownSignal(signal) {
    stopAll().catch(()=>{
    /* never throw out of a signal handler */ }).finally(()=>{
        // Re-raise the signal with the default disposition so the process exit
        // status reflects the original signal (128 + signal number) rather than
        // a synthetic process.exit() code.
        process.kill(process.pid, signal);
    });
}
process.once("SIGINT", ()=>handleShutdownSignal("SIGINT"));
process.once("SIGTERM", ()=>handleShutdownSignal("SIGTERM"));
}),
"[project]/src/lib/services/apiKey.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceApiKeyDecryptError",
    ()=>ServiceApiKeyDecryptError,
    "generateServiceApiKey",
    ()=>generateServiceApiKey,
    "getOrCreateApiKey",
    ()=>getOrCreateApiKey,
    "maskApiKey",
    ()=>maskApiKey
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$versionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/versionManager.ts [instrumentation] (ecmascript)");
;
;
;
function generateServiceApiKey(prefix = "nr") {
    return `${prefix}_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(32).toString("base64url")}`;
}
class ServiceApiKeyDecryptError extends Error {
    constructor(tool){
        super(`Stored API key for service '${tool}' could not be decrypted. ` + `STORAGE_ENCRYPTION_KEY may have changed, the row may be corrupted, ` + `or it was written on a different machine. Reinstall the service ` + `or rotate the key via POST /api/services/${tool}/rotate-key.`);
        this.name = "ServiceApiKeyDecryptError";
    }
}
async function getOrCreateApiKey(tool) {
    const row = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$versionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getServiceRow"])(tool);
    if (row?.apiKey) {
        const decrypted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(row.apiKey);
        if (decrypted) return decrypted;
        // Fail loud: silently regenerating would mint a new key the embedded
        // service has never been told, causing every request to 401 with no
        // operator-facing signal.
        throw new ServiceApiKeyDecryptError(tool);
    }
    // Dario reuses this mechanism to generate+persist its DARIO_ADMIN_TOKEN
    // (any long random string works — it gates the /admin/* control plane).
    const prefix = tool === "9router" ? "nr" : tool === "mux" ? "mx" : tool === "dario" ? "da" : "cp";
    const key = generateServiceApiKey(prefix);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$versionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updateServiceField"])(tool, "apiKey", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encrypt"])(key) ?? key);
    return key;
}
function maskApiKey(plainKey) {
    const last4 = plainKey.slice(-4);
    return `nr_••••••••${last4}`;
}
}),
"[project]/src/lib/ipUtils.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "classifyIpScope",
    ()=>classifyIpScope,
    "extractClientIp",
    ()=>extractClientIp,
    "getClientIpFromRequest",
    ()=>getClientIpFromRequest
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:net [external] (node:net, cjs)");
;
function extractClientIp(xForwardedFor, remoteAddress) {
    if (xForwardedFor) {
        const entries = xForwardedFor.split(",");
        for (const entry of entries){
            const trimmed = entry.trim();
            if (trimmed && (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(trimmed) !== 0) {
                return trimmed; // First valid IP wins
            }
        }
    }
    return remoteAddress?.trim() ?? "unknown";
}
/**
 * Strip an IPv4-mapped IPv6 prefix ("::ffff:127.0.0.1" -> "127.0.0.1") so the
 * loopback check below catches both representations Node may report.
 */ function normalizePeer(addr) {
    const trimmed = (addr ?? "").trim();
    if (!trimmed) return "";
    return trimmed.startsWith("::ffff:") ? trimmed.slice("::ffff:".length) : trimmed;
}
/**
 * Whether the TCP peer is a loopback address (i.e. the request reached us via
 * a local reverse proxy such as nginx). Only then is it safe to trust the
 * forwarding headers — from a direct public socket those headers are
 * attacker-controlled and must be ignored, otherwise per-IP brute-force
 * buckets (login lockout, etc.) become spoofable / shareable.
 *
 * Ported from decolua/9router#1893.
 */ function isLoopbackPeer(addr) {
    const ip = normalizePeer(addr);
    if (!ip) return false;
    if (ip === "::1") return true;
    return ip.startsWith("127.");
}
/**
 * Whether an IPv4/IPv6 address falls inside a private (RFC 1918 / RFC 4193) or
 * link-local range. Uses bounded string-prefix checks (no variable-length regex)
 * to stay ReDoS-safe. Callers must pass an already-normalized, validated IP.
 */ function isPrivateIp(ip) {
    // IPv4 private / link-local ranges.
    if (ip.startsWith("10.")) return true;
    if (ip.startsWith("192.168.")) return true;
    if (ip.startsWith("169.254.")) return true; // link-local (APIPA)
    if (ip.startsWith("172.")) {
        // 172.16.0.0 – 172.31.255.255 (the /12 block).
        const secondOctet = Number.parseInt(ip.split(".")[1] ?? "", 10);
        if (secondOctet >= 16 && secondOctet <= 31) return true;
    }
    // IPv6 unique-local (fc00::/7 → fc/fd) and link-local (fe80::/10).
    const lower = ip.toLowerCase();
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) {
        return true;
    }
    return false;
}
function classifyIpScope(addr) {
    const ip = normalizePeer(addr ?? undefined);
    if (!ip) return "unknown";
    if (isLoopbackPeer(ip)) return "loopback";
    // isIP returns 0 for non-IP strings ("unknown", hostnames); only classify
    // real addresses beyond loopback so hostnames never resolve to private.
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(ip) === 0) return "unknown";
    if (isPrivateIp(ip)) return "private";
    return "public";
}
function getClientIpFromRequest(req) {
    // Helper to get header value from either Headers object or plain object
    const getHeader = (name)=>{
        if (!req.headers) return null;
        if (typeof req.headers.get === "function") {
            return req.headers.get(name);
        }
        return null;
    };
    const remoteAddress = req.ip ?? req.socket?.remoteAddress;
    const hasPeer = Boolean(normalizePeer(remoteAddress));
    const trustForwardingHeaders = !hasPeer || isLoopbackPeer(remoteAddress);
    if (trustForwardingHeaders) {
        const cfIp = getHeader("cf-connecting-ip");
        if (cfIp && (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(cfIp.trim()) !== 0) return cfIp.trim();
        const xff = getHeader("x-forwarded-for");
        const realIp = getHeader("x-real-ip");
        return extractClientIp(xff ?? realIp, remoteAddress);
    }
    // Direct public peer — forwarding headers are attacker-controlled, ignore.
    return normalizePeer(remoteAddress);
}
}),
"[project]/src/lib/audit/highLevelActions.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * HIGH_LEVEL_ACTIONS — allowlist of audit events that appear in the Activity feed.
 *
 * IMPORTANT: This list is intentionally aligned with the REAL action strings emitted
 * by `logAuditEvent()` calls throughout the repository. Do NOT use "clean" or invented
 * names — always grep for `logAuditEvent` in the codebase before adding or renaming
 * an entry here. If the upstream emitter name changes, update both the emitter and
 * this list atomically.
 *
 * Last synced: 2026-05 (B/G3 gap-closure). Source of truth: grep logAuditEvent repo.
 */ __turbopack_context__.s([
    "HIGH_LEVEL_ACTIONS",
    ()=>HIGH_LEVEL_ACTIONS,
    "isHighLevelAction",
    ()=>isHighLevelAction
]);
const HIGH_LEVEL_ACTIONS = [
    // providers / connections — ALINHADO COM `logAuditEvent` real
    "provider.credentials.created",
    "provider.credentials.applied",
    "provider.credentials.updated",
    "provider.credentials.revoked",
    "provider.credentials.batch_revoked",
    "provider.credentials.batch_updated",
    "provider.credentials.bulk_created",
    "provider.credentials.bulk_imported",
    "provider.credentials.imported",
    "provider.validation.ssrf_blocked",
    // auth
    "auth.login.success",
    "auth.login.error",
    "auth.login.failed",
    "auth.login.locked",
    "auth.login.misconfigured",
    "auth.login.setup_required",
    "auth.logout.success",
    // sync tokens
    "sync.token.created",
    "sync.token.revoked",
    // settings — alinhado (plural)
    "settings.update",
    "settings.update_failed",
    // service operations
    "service.reveal_api_key",
    // quota sharing (B26 — adicionados por F8)
    "quota.pool.created",
    "quota.pool.updated",
    "quota.pool.deleted",
    "quota.plan.updated",
    "quota.store.driver_changed"
];
const SET = new Set(HIGH_LEVEL_ACTIONS);
function isHighLevelAction(action) {
    return SET.has(action);
}
}),
"[project]/src/lib/cacheControlSettings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getCacheControlSettings",
    ()=>getCacheControlSettings,
    "invalidateCacheControlSettingsCache",
    ()=>invalidateCacheControlSettingsCache
]);
/**
 * Cache Control Settings
 *
 * Provides cached access to cache control settings for performance.
 * Settings are fetched once and cached to avoid repeated DB hits.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
let cachedSettings = null;
async function getCacheControlSettings() {
    if (cachedSettings !== null) {
        return cachedSettings;
    }
    const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
    cachedSettings = settings.alwaysPreserveClientCache || "auto";
    return cachedSettings;
}
function invalidateCacheControlSettingsCache() {
    cachedSettings = null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/search/executeWebSearch.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "WebSearchExecutionError",
    ()=>WebSearchExecutionError,
    "executeWebSearch",
    ()=>executeWebSearch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$costRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/costRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/searchRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/search.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$searchCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/searchCache.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
class WebSearchExecutionError extends Error {
    statusCode;
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}
async function resolveSearchCredentials(providerId) {
    const creds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCredentials"])(providerId).catch(()=>null);
    if (creds) return creds;
    const fallbackId = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SEARCH_CREDENTIAL_FALLBACKS"][providerId];
    if (fallbackId) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCredentials"])(fallbackId).catch(()=>null);
    return null;
}
function buildDomainFilter(filters) {
    if (!filters) return undefined;
    const parts = [];
    if (filters.include_domains?.length) parts.push(...filters.include_domains);
    if (filters.exclude_domains?.length) parts.push(...filters.exclude_domains.map((d)=>`-${d}`));
    return parts.length > 0 ? parts : undefined;
}
function normalizeMaxResults(input, providerConfig) {
    const fromMaxResults = typeof input.max_results === "number" ? input.max_results : typeof input.max_results === "string" ? Number(input.max_results) : Number.NaN;
    const fromLimit = typeof input.limit === "number" ? input.limit : typeof input.limit === "string" ? Number(input.limit) : Number.NaN;
    const requested = Number.isFinite(fromMaxResults) ? fromMaxResults : Number.isFinite(fromLimit) ? fromLimit : providerConfig.defaultMaxResults;
    return Math.min(Math.max(1, requested), providerConfig.maxMaxResults);
}
function assertValidSearchInput(input) {
    if (typeof input.query !== "string" || input.query.trim().length === 0) {
        throw new WebSearchExecutionError("Missing required field: query", 400);
    }
    if (input.query.trim().length > 500) {
        throw new WebSearchExecutionError("Query must be 500 characters or fewer", 400);
    }
    if (input.search_type && input.search_type !== "web" && input.search_type !== "news") {
        throw new WebSearchExecutionError(`Unsupported search_type: ${String(input.search_type)}`, 400);
    }
}
async function executeWebSearch(input) {
    assertValidSearchInput(input);
    const log = input.log || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__;
    const searchType = input.search_type || "web";
    if (input.provider) {
        const explicitProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSearchProvider"])(input.provider);
        if (!explicitProvider) {
            throw new WebSearchExecutionError(`Unknown search provider: ${input.provider}`, 400);
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsSearchType"])(explicitProvider, searchType)) {
            throw new WebSearchExecutionError(`Search provider ${input.provider} does not support search_type: ${searchType}`, 400);
        }
    }
    let providerConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectProvider"])(input.provider, searchType);
    if (!providerConfig) {
        throw new WebSearchExecutionError(input.provider ? `Unknown search provider: ${input.provider}` : `No search providers available. Add an API key for a search provider (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAllSearchProviders"])().map((provider)=>provider.id).join(", ")}) in the dashboard.`, 400);
    }
    let credentials = null;
    let alternateProviderId;
    let alternateCredentials = null;
    if (input.provider) {
        credentials = await resolveSearchCredentials(providerConfig.id);
        if (!credentials && providerConfig.authType === "none" && typeof input.provider_options?.baseUrl === "string" && input.provider_options.baseUrl.trim().length > 0) {
            credentials = {
                providerSpecificData: {
                    baseUrl: input.provider_options.baseUrl.trim()
                }
            };
        }
        if (!credentials) {
            throw new WebSearchExecutionError(providerConfig.authType === "none" ? `Search provider ${providerConfig.id} is not configured. Set its base URL in the dashboard or pass provider_options.baseUrl.` : `No credentials configured for search provider: ${providerConfig.id}. Add an API key for "${providerConfig.id}" in the dashboard.`, 400);
        }
    } else {
        credentials = await resolveSearchCredentials(providerConfig.id);
        if (!credentials) {
            const sortedIds = Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SEARCH_PROVIDERS"]).filter((provider)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsSearchType"])(provider, searchType)).sort((a, b)=>a.costPerQuery - b.costPerQuery).map((provider)=>provider.id);
            for (const providerId of sortedIds){
                if (providerId === providerConfig.id) continue;
                const altConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSearchProvider"])(providerId);
                const altCreds = await resolveSearchCredentials(providerId);
                if (altConfig && altCreds) {
                    providerConfig = altConfig;
                    credentials = altCreds;
                    break;
                }
            }
        }
        if (!credentials) {
            throw new WebSearchExecutionError(`No credentials configured for any search provider. Add an API key for a search provider (${Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SEARCH_PROVIDERS"]).join(", ")}) in the dashboard.`, 400);
        }
        const otherIds = Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SEARCH_PROVIDERS"]).filter((provider)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$searchRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsSearchType"])(provider, searchType)).sort((a, b)=>a.costPerQuery - b.costPerQuery).map((provider)=>provider.id).filter((providerId)=>providerId !== providerConfig.id);
        for (const providerId of otherIds){
            const creds = await resolveSearchCredentials(providerId);
            if (creds) {
                alternateProviderId = providerId;
                alternateCredentials = creds;
                break;
            }
        }
    }
    const clampedMaxResults = normalizeMaxResults(input, providerConfig);
    const cacheKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$searchCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["computeCacheKey"])(input.query.trim(), providerConfig.id, searchType, clampedMaxResults, input.country, input.language, {
        filters: input.filters,
        offset: input.offset,
        time_range: input.time_range
    });
    const ttl = providerConfig.cacheTTLMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$searchCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SEARCH_CACHE_DEFAULT_TTL_MS"];
    const { data, cached } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$searchCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getOrCoalesce"])(cacheKey, ttl, async ()=>{
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$search$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleSearch"])({
            query: input.query.trim(),
            provider: providerConfig.id,
            maxResults: clampedMaxResults,
            searchType,
            country: input.country,
            language: input.language,
            timeRange: input.time_range,
            offset: input.offset,
            domainFilter: buildDomainFilter(input.filters),
            contentOptions: input.content,
            strictFilters: input.strict_filters,
            providerOptions: input.provider_options,
            credentials,
            alternateProvider: alternateProviderId,
            alternateCredentials,
            log
        });
        if (!result.success || !result.data) {
            throw new WebSearchExecutionError(result.error || "Search failed", result.status || 502);
        }
        return result.data;
    });
    if (!cached && input.apiKeyId && input.apiKeyId !== "local" && data.usage?.search_cost_usd > 0) {
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$costRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordCost"])(input.apiKeyId, data.usage.search_cost_usd);
        } catch (error) {
            log.warn("SEARCH", `Cost recording failed: ${error?.message || String(error)}`);
        }
    }
    return {
        data,
        cached
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/proxyLogger.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearProxyLogs",
    ()=>clearProxyLogs,
    "getProxyLogs",
    ()=>getProxyLogs,
    "logProxyEvent",
    ()=>logProxyEvent
]);
/**
 * Proxy Logger — Hybrid in-memory + SQLite persistence
 *
 * Keeps a fast in-memory ring buffer for real-time dashboard AND
 * persists to SQLite so logs survive server restarts.
 *
 * Pattern follows callLogs.js (T-15 decomposition).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [instrumentation] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/schemaColumns.ts [instrumentation] (ecmascript)");
;
;
;
const shouldPersistToDisk = !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isBuildPhase"];
const MAX_IN_MEMORY_ENTRIES = 200;
const proxyLogs = [];
// `public_ip` is the historical SQLite column name; API/UI expose the value as clientIp.
// ──────────────── Startup: hydrate from DB ────────────────
function loadFromDb() {
    if (!shouldPersistToDisk) return;
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        // Self-heal the proxy_logs schema before reading/writing (migration 134
        // guarantees egress_ip on every migrated DB; this covers restored/odd states).
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$schemaColumns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureProxyLogsColumns"])(db);
        const rows = db.prepare("SELECT * FROM proxy_logs ORDER BY timestamp DESC LIMIT ?").all(MAX_IN_MEMORY_ENTRIES);
        for (const row of rows){
            proxyLogs.push({
                id: row.id,
                timestamp: row.timestamp,
                status: row.status || "success",
                proxy: row.proxy_host ? {
                    type: row.proxy_type,
                    host: row.proxy_host,
                    port: row.proxy_port
                } : null,
                level: row.level || "direct",
                levelId: row.level_id || null,
                provider: row.provider || null,
                targetUrl: row.target_url || null,
                clientIp: row.public_ip || null,
                egressIp: row.egress_ip || null,
                latencyMs: row.latency_ms || 0,
                error: row.error || null,
                connectionId: row.connection_id || null,
                comboId: row.combo_id || null,
                account: row.account || null,
                tlsFingerprint: row.tls_fingerprint === 1
            });
        }
        if (proxyLogs.length > 0) {
            console.log(`[proxyLogger] Loaded ${proxyLogs.length} proxy logs from SQLite`);
        }
    } catch (err) {
        console.warn("[proxyLogger] Failed to load from DB:", err.message);
    }
}
loadFromDb();
function logProxyEvent(entry) {
    const log = {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        timestamp: new Date().toISOString(),
        status: entry.status || "success",
        proxy: entry.proxy || null,
        level: entry.level || "direct",
        levelId: entry.levelId || null,
        provider: entry.provider || null,
        targetUrl: entry.targetUrl || null,
        clientIp: entry.clientIp ?? entry.publicIp ?? null,
        egressIp: entry.egressIp ?? null,
        latencyMs: entry.latencyMs || 0,
        error: entry.error || null,
        connectionId: entry.connectionId || null,
        comboId: entry.comboId || null,
        account: entry.account || null,
        tlsFingerprint: entry.tlsFingerprint || false
    };
    // Structured egress line so the operator can confirm, in the proxy logs, which
    // IP each account is entering (clientIp) and leaving (egressIp) by.
    if (log.proxy || log.egressIp) {
        console.log(`[ProxyEgress] ${log.provider || "-"}/${log.account || "-"} ` + `in=${log.clientIp || "?"} out=${log.egressIp || "?"} ` + `proxy=${log.level}${log.proxy ? `:${log.proxy.host}` : ""} status=${log.status}`);
    }
    // 1. In-memory ring buffer (newest first)
    proxyLogs.unshift(log);
    if (proxyLogs.length > MAX_IN_MEMORY_ENTRIES) {
        proxyLogs.length = MAX_IN_MEMORY_ENTRIES;
    }
    // 2. Persist to SQLite
    if (shouldPersistToDisk) {
        try {
            const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
            db.prepare(`INSERT INTO proxy_logs (id, timestamp, status, proxy_type, proxy_host, proxy_port,
          level, level_id, provider, target_url, public_ip, egress_ip, latency_ms, error,
          connection_id, combo_id, account, tls_fingerprint)
        VALUES (@id, @timestamp, @status, @proxyType, @proxyHost, @proxyPort,
          @level, @levelId, @provider, @targetUrl, @clientIp, @egressIp, @latencyMs, @error,
          @connectionId, @comboId, @account, @tlsFingerprint)`).run({
                id: log.id,
                timestamp: log.timestamp,
                status: log.status,
                proxyType: log.proxy?.type || null,
                proxyHost: log.proxy?.host || null,
                proxyPort: log.proxy?.port ? Number(log.proxy.port) : null,
                level: log.level,
                levelId: log.levelId,
                provider: log.provider,
                targetUrl: log.targetUrl,
                clientIp: log.clientIp,
                egressIp: log.egressIp,
                latencyMs: log.latencyMs,
                error: log.error,
                connectionId: log.connectionId,
                comboId: log.comboId,
                account: log.account,
                tlsFingerprint: log.tlsFingerprint ? 1 : 0
            });
        } catch (err) {
            console.warn("[proxyLogger] Failed to persist:", err.message);
        }
    }
    return log;
}
function getProxyLogs(filters = {}) {
    let logs = [
        ...proxyLogs
    ];
    if (filters.status) {
        if (filters.status === "ok") {
            logs = logs.filter((l)=>l.status === "success");
        } else {
            logs = logs.filter((l)=>l.status === filters.status);
        }
    }
    if (filters.type) {
        logs = logs.filter((l)=>l.proxy?.type === filters.type);
    }
    if (filters.provider) {
        logs = logs.filter((l)=>l.provider === filters.provider);
    }
    if (filters.level) {
        logs = logs.filter((l)=>l.level === filters.level);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        logs = logs.filter((l)=>(l.proxy?.host || "").toLowerCase().includes(q) || (l.provider || "").toLowerCase().includes(q) || (l.targetUrl || "").toLowerCase().includes(q) || (l.clientIp || "").toLowerCase().includes(q) || (l.egressIp || "").toLowerCase().includes(q) || (l.level || "").toLowerCase().includes(q) || (l.error || "").toLowerCase().includes(q) || (l.account || "").toLowerCase().includes(q));
    }
    const limit = filters.limit || 300;
    return logs.slice(0, limit);
}
function clearProxyLogs() {
    proxyLogs.length = 0;
    if (shouldPersistToDisk) {
        try {
            const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
            db.prepare("DELETE FROM proxy_logs").run();
        } catch (err) {
            console.warn("[proxyLogger] Failed to clear DB:", err.message);
        }
    }
}
}),
"[project]/src/lib/translatorEvents.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAX_TRANSLATION_EVENTS",
    ()=>MAX_TRANSLATION_EVENTS,
    "getTranslationEvents",
    ()=>getTranslationEvents,
    "logTranslationEvent",
    ()=>logTranslationEvent
]);
const MAX_TRANSLATION_EVENTS = 200;
const DEFAULT_TRANSLATION_EVENT_LIMIT = 50;
function ensureEventsBuffer() {
    if (!globalThis.__translatorEvents) {
        globalThis.__translatorEvents = [];
    }
    return globalThis.__translatorEvents;
}
function logTranslationEvent(event) {
    if (!event || typeof event !== "object") return;
    const events = ensureEventsBuffer();
    events.unshift({
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        ...event
    });
    if (events.length > MAX_TRANSLATION_EVENTS) {
        events.length = MAX_TRANSLATION_EVENTS;
    }
}
function getTranslationEvents(limit = DEFAULT_TRANSLATION_EVENT_LIMIT) {
    const numericLimit = Number(limit);
    const boundedLimit = Number.isFinite(numericLimit) && numericLimit > 0 ? Math.min(Math.floor(numericLimit), MAX_TRANSLATION_EVENTS) : DEFAULT_TRANSLATION_EVENT_LIMIT;
    const events = ensureEventsBuffer();
    return {
        events: events.slice(0, boundedLimit),
        total: events.length
    };
}
;
}),
];

//# sourceMappingURL=src_lib_20bfjnh._.js.map