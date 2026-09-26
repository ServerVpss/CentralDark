module.exports = [
"[project]/src/lib/dataPaths.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/combos/steps.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/combos/invariants.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/piiSanitizer.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [app-route] (ecmascript)");
;
const isEnabled = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("PII_RESPONSE_SANITIZATION");
const VALID_MODES = [
    "redact",
    "warn",
    "block",
    "off"
];
const getMode = ()=>{
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveFeatureFlag"])("PII_RESPONSE_SANITIZATION_MODE");
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
"[project]/src/lib/logPayloads.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/piiSanitizer.ts [app-route] (ecmascript)");
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
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizePII"])(payload).text;
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
"[project]/src/lib/logEnv.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [app-route] (ecmascript)");
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
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveDataDir"])(), "logs", "application", "app.log");
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
"[project]/src/lib/oauth/gitlab.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/oauth/utils/codexConnectionSelection.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/oauth/constants/oauth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityUpstream.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/grokBuild.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/gitlab.ts [app-route] (ecmascript)");
;
;
;
;
;
const CLAUDE_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("claude_id", "CLAUDE_OAUTH_CLIENT_ID"),
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
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("codex_id", "CODEX_OAUTH_CLIENT_ID"),
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
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    issuer: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_OAUTH_ISSUER"],
    deviceCodeUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_DEVICE_CODE_URL"],
    tokenUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_TOKEN_URL"],
    scope: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_OAUTH_SCOPES"].join(" ")
};
const GROK_BUILD_OAUTH_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://auth.x.ai/oauth2/authorize",
    tokenUrl: "https://auth.x.ai/oauth2/token",
    scope: "openid profile email offline_access grok-cli:access",
    codeChallengeMethod: "S256",
    loopbackPort: 56122,
    callbackPath: "/callback",
    callbackHost: "127.0.0.1"
};
const XAI_OAUTH_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://auth.x.ai/oauth2/authorize",
    tokenUrl: "https://auth.x.ai/oauth2/token",
    scope: "openid profile email offline_access grok-cli:access api:access",
    codeChallengeMethod: "S256",
    loopbackPort: 56121,
    callbackPath: "/callback",
    callbackHost: "127.0.0.1"
};
const KIMI_CODING_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("kimi_id", "KIMI_CODING_OAUTH_CLIENT_ID"),
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
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_id", "ANTIGRAVITY_OAUTH_CLIENT_ID"),
    clientSecret: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_alt", "ANTIGRAVITY_OAUTH_CLIENT_SECRET"),
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
    apiEndpoint: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_RUNTIME_BASE_URLS"][0],
    apiVersion: "v1internal",
    loadCodeAssistEndpoints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"].map((baseUrl)=>`${baseUrl}/v1internal:loadCodeAssist`),
    onboardUserEndpoints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"].map((baseUrl)=>`${baseUrl}/v1internal:onboardUser`),
    fetchAvailableModelsEndpoints: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityFetchAvailableModelsUrls"])(),
    loadCodeAssistEndpoint: `${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"][0]}/v1internal:loadCodeAssist`,
    onboardUserEndpoint: `${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"][0]}/v1internal:onboardUser`,
    fetchAvailableModelsEndpoint: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityFetchAvailableModelsUrls"])()[0]
};
const AGY_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_id", "ANTIGRAVITY_OAUTH_CLIENT_ID"),
    clientSecret: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_alt", "ANTIGRAVITY_OAUTH_CLIENT_SECRET"),
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
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("github_copilot_id", "GITHUB_OAUTH_CLIENT_ID"),
    deviceCodeUrl: "https://github.com/login/device/code",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scopes: "read:user",
    apiVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_API_VERSION"],
    copilotTokenUrl: "https://api.github.com/copilot_internal/v2/token",
    userAgent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_USER_AGENT"],
    editorVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_EDITOR_VERSION"],
    editorPluginVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_PLUGIN_VERSION"]
};
const GHE_COPILOT_CONFIG = {
    clientId: process.env.GHE_COPILOT_OAUTH_CLIENT_ID || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("github_copilot_id", "GITHUB_OAUTH_CLIENT_ID"),
    deviceCodeUrl: "",
    tokenUrl: "",
    userInfoUrl: "",
    scopes: "read:user",
    apiVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_API_VERSION"],
    copilotTokenUrl: "",
    userAgent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_USER_AGENT"],
    editorVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_EDITOR_VERSION"],
    editorPluginVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_PLUGIN_VERSION"]
};
const GITLAB_DUO_ENDPOINTS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildGitLabOAuthEndpoints"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITLAB_DUO_DEFAULT_BASE_URL"]);
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
    firebaseApiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("windsurf_fb", "WINDSURF_FIREBASE_API_KEY"),
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
"[project]/src/lib/providers/requestDefaults.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tagRouter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/openRouterPreset.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [app-route] (ecmascript)");
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
        const preset = provider === "openrouter" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeOpenRouterPreset"])(normalized.preset) : null;
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
        const tags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeRoutingTags"])(normalized.tags);
        if (tags.length > 0) {
            normalized.tags = tags;
        } else {
            delete normalized.tags;
        }
    }
    if ("excludedModels" in normalized || "excluded_models" in normalized) {
        const excludedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeExcludedModelPatterns"])(normalized.excludedModels ?? normalized.excluded_models);
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
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isForbiddenCustomHeaderName"])(trimmedKey)) continue;
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
"[project]/src/lib/compliance/noLog.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isNoLog",
    ()=>isNoLog,
    "setNoLog",
    ()=>setNoLog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
;
// #2650: extracted from compliance/index.ts to break the
// callLogs.ts → compliance/index.ts → callLogs.ts cycle that deadlocks
// the bundled MCP server under Node.js 24's stricter ESM evaluation.
function getDb() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
"[project]/src/lib/pricingSync.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-route] (ecmascript)");
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const del = db.prepare("DELETE FROM key_value WHERE namespace = 'pricing_synced'");
    const insert = db.prepare("INSERT INTO key_value (namespace, key, value) VALUES ('pricing_synced', ?, ?)");
    const tx = db.transaction(()=>{
        del.run();
        for (const [provider, models] of Object.entries(data)){
            insert.run(provider, JSON.stringify(models));
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function clearSyncedPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'pricing_synced'").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
"[project]/src/lib/gamification/xp.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/spend/batchWriter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/domainState.ts [app-route] (ecmascript)");
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
        this.persistEntries = options.persistEntries || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["batchSaveCostEntries"];
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
"[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
/**
 * localDb.js — Re-export layer for backward compatibility.
 *
 * All 27+ consumer files import from "@/lib/localDb".
 * This thin layer re-exports everything from the domain-specific DB modules,
 * so zero consumer changes are needed.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccrBlocks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccrBlocks.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCacheStats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionCacheStats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCombos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionCombos.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionContextBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionContextBudget.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionRunTelemetry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionRunTelemetry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelContextOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$evals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/evals.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricingSync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pricingSync.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$skills$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/skills.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$registeredKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/registeredKeys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelComboMappings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelComboMappings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$files$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/files.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$batches$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/batches.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningRoutingRules.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$autoCandidateOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/autoCandidateOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webhooks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webhooks.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webhookDeliveries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webhookDeliveries.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$discoveryResults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/discoveryResults.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaSnapshots.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/sessionAccountAffinity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaResetEvents$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaResetEvents.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$versionManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/versionManager.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$syncTokens$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/syncTokens.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$upstreamProxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/upstreamProxy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerLimits.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$creditBalance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/creditBalance.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionAnalytics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$oneproxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/oneproxy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$gamification$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/gamification.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/featureFlags.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/contextHandoffs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyGroups$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeyGroups.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$relayProxies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/relayProxies.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$freeProxies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/freeProxies.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$playgroundPresets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/playgroundPresets.ts [app-route] (ecmascript)");
// Plan 21 — Memory Engine Redesign
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/memoryVec.ts [app-route] (ecmascript)");
// T-A-F2: AgentBridge state/mappings/bypass + Inspector custom hosts/sessions
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeState.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeMappings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeMappings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeBypass$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeBypass.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorCustomHosts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/inspectorCustomHosts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/inspectorSessions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$omp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/omp.ts [app-route] (ecmascript)");
// Quota Sharing — Group B (planos 16+22)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [app-route] (ecmascript)");
// Quota per-(key, model) caps — Group B Fase 3 #7
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaModelCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaModelCaps.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaGroups.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaConsumption.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerPlans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerPlans.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$tokenLimits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/tokenLimits.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/plugins.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyContextSources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeyContextSources.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$localCorpus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/localCorpus.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageSummary$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/usageSummary.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelIntelligence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelIntelligence.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$callLogStats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/callLogStats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/usageAnalytics.ts [app-route] (ecmascript) <locals>");
// ---------------------------------------------------------------------------
// usage_logs — auto-routing analytics (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageLogs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/usageLogs.ts [app-route] (ecmascript)");
// ---------------------------------------------------------------------------
// semantic_cache — cache entries CRUD (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$semanticCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/semanticCache.ts [app-route] (ecmascript)");
// ---------------------------------------------------------------------------
// proxy_logs — export query (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxyLogs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxyLogs.ts [app-route] (ecmascript)");
// Provider param filters — denylist/allowlist config per provider/model (#6625)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/paramFilters.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$interceptionRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/interceptionRules.ts [app-route] (ecmascript)"); // Per-model web-search/web-fetch interception rules (#3384)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryAliases.ts [app-route] (ecmascript)"); // Claude Code discovery-alias gate (flag + per-provider/model overrides)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryMetrics.ts [app-route] (ecmascript)"); // Claude Code discovery-alias usage counters (alias requests + discovery hits)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$functionalGatewayMirrors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/functionalGatewayMirrors.ts [app-route] (ecmascript)"); // Functional-gateway mirror gate (flag + per-provider/model overrides)
// Radar client — local feed cache + settings (opt-in, encrypted supporter key)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$radar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/radar.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
"[project]/src/lib/modelsDevSync/transform.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/modelsDevSync.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync/transform.ts [app-route] (ecmascript)");
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
    const currentVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogCacheVersion"])();
    if (pricingMemo !== null && pricingMemoVersion === currentVersion) {
        return pricingMemo;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const del = db.prepare("DELETE FROM key_value WHERE namespace = 'models_dev_pricing'");
    const insert = db.prepare("INSERT INTO key_value (namespace, key, value) VALUES ('models_dev_pricing', ?, ?)");
    const tx = db.transaction(()=>{
        del.run();
        for (const [provider, models] of Object.entries(data)){
            insert.run(provider, JSON.stringify(models));
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function clearModelsDevPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'models_dev_pricing'").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function ensureCapabilitiesTable() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    cachedCapabilities = data;
    cachedCapabilitiesLoadedAll = true;
}
function clearModelsDevCapabilities() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    ensureCapabilitiesTable();
    db.prepare("DELETE FROM model_capabilities").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
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
            const pricing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformModelsDevToPricing"])(raw);
            const capabilities = syncCapabilities ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformModelsDevToCapabilities"])(raw) : {};
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
    const { getSettings } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
    const settings = await getSettings();
    if (settings.modelsDevSyncEnabled !== true) {
        console.log("[MODELS_DEV] Disabled (enable via Settings > AI)");
        return;
    }
    const interval = settings.modelsDevSyncInterval;
    startPeriodicSync(interval);
}
}),
"[project]/src/lib/modelCapabilities.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync/transform.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelContextOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelCapabilityOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/visionModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/learnedThinkingCaps.ts [app-route] (ecmascript)");
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
    const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][providerIdOrAlias] || providerIdOrAlias;
    const models = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][providerAlias];
    if (!Array.isArray(models)) return null;
    return models.find((model)=>model?.id === modelId) || null;
}
function resolveCapabilityInput(input) {
    if (typeof input === "string") {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(input);
        const rawModel = toNonEmptyString(parsed.model);
        if (parsed.provider) {
            const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCanonicalProviderModel"])(parsed.provider, rawModel);
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
        const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCanonicalProviderModel"])(rawProvider, rawModel);
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
        const byCanonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelSpec"])(modelId);
        if (byCanonical) return byCanonical;
    }
    if (rawModel && rawModel !== modelId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelSpec"])(rawModel);
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
        const byLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelSpec"])(leaf);
        if (byLeaf) return byLeaf;
    }
    return undefined;
}
function getAuthoritativeStaticContextWindow(provider, modelId, rawModel) {
    for (const candidate of [
        modelId,
        rawModel
    ]){
        const providerContextWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthoritativeProviderContextWindow"])(provider, candidate);
        if (typeof providerContextWindow === "number") return providerContextWindow;
    }
    for (const candidate of [
        modelId,
        rawModel
    ]){
        const contextWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthoritativeContextWindow"])(candidate);
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
        const hit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findModelSpecIdByExactOrAlias"])(candidate);
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
    const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][provider] || provider;
    for (const [modelsDevId, omniIds] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODELS_DEV_PROVIDER_MAP"])){
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
            const found = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedCapability"])(prov, mid);
            if (found) return found;
        }
    }
    return null;
}
function modelIdLikelyVision(modelId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isVisionModelId"])(modelId);
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
    const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCapabilityOverride"])(resolved.provider, resolved.model, key);
    if (canonical !== null) return canonical;
    return resolved.rawModel && resolved.rawModel !== resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCapabilityOverride"])(resolved.provider, resolved.rawModel, key) : null;
}
function getContextOverride(resolved) {
    const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelContextOverride"])(resolved.provider, resolved.model);
    if (canonical !== null) return canonical;
    return resolved.rawModel && resolved.rawModel !== resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelContextOverride"])(resolved.provider, resolved.rawModel) : null;
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
    const providerDeniesTools = resolved.provider && resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUnsupportedParams"])(resolved.provider, resolved.model).includes("tools") : false;
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
    const learned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLearnedThinkingCap"])(providerForLearned, modelId);
    if (learned !== null) {
        cap = cap === null ? learned : Math.min(cap, learned);
    }
    if (cap === null && modelLower.includes("gemini")) {
        cap = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GEMINI_FALLBACK_THINKING_CAP"];
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
"[project]/src/lib/proxyHealth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFamily.ts [app-route] (ecmascript)");
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
    const host = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripIpv6Brackets"])(url.hostname);
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
"[project]/src/lib/resilience/settings/normalize.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [app-route] (ecmascript)");
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
        return parseFeatureFlagBoolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveFeatureFlag"])(key), fallback);
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
"[project]/src/lib/resilience/settings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings/normalize.ts [app-route] (ecmascript)");
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
        requestsPerMinute: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].requestsPerMinute,
        minTimeBetweenRequestsMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].minTimeBetweenRequests,
        concurrentRequests: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].concurrentRequests,
        maxWaitMs: DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS,
        maxQueueDepth: DEFAULT_REQUEST_QUEUE_MAX_DEPTH
    },
    connectionCooldown: {
        oauth: {
            baseCooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.transientCooldown,
            useUpstreamRetryHints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.rateLimitCooldown === 0,
            maxBackoffSteps: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.maxBackoffLevel
        },
        apikey: {
            baseCooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.transientCooldown,
            useUpstreamRetryHints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.rateLimitCooldown === 0,
            maxBackoffSteps: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.maxBackoffLevel
        }
    },
    providerBreaker: {
        oauth: {
            failureThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.circuitBreakerThreshold,
            degradationThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.degradationThreshold,
            resetTimeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.circuitBreakerReset
        },
        apikey: {
            failureThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.circuitBreakerThreshold,
            degradationThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.degradationThreshold,
            resetTimeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.circuitBreakerReset
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
    const profiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings.providerProfiles);
    const defaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings.rateLimitDefaults);
    const streamRecoveryDefaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveStreamRecoveryDefaults"])();
    const oauthLegacy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(profiles.oauth);
    const apikeyLegacy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(profiles.apikey);
    const waitMaxRetrySec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(settings.maxRetryIntervalSec, DEFAULT_RESILIENCE_SETTINGS.waitForCooldown.maxRetryWaitSec, {
        min: 0,
        max: 300
    });
    const waitMaxRetries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(settings.requestRetry, DEFAULT_RESILIENCE_SETTINGS.waitForCooldown.maxRetries, {
        min: 0,
        max: 10
    });
    return {
        requestQueue: {
            autoEnableApiKeyProviders: DEFAULT_RESILIENCE_SETTINGS.requestQueue.autoEnableApiKeyProviders,
            requestsPerMinute: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(defaults.requestsPerMinute, DEFAULT_RESILIENCE_SETTINGS.requestQueue.requestsPerMinute, {
                min: 1,
                max: 1_000_000
            }),
            minTimeBetweenRequestsMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(defaults.minTimeBetweenRequests, DEFAULT_RESILIENCE_SETTINGS.requestQueue.minTimeBetweenRequestsMs, {
                min: 0,
                max: 60 * 60 * 1000
            }),
            concurrentRequests: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(defaults.concurrentRequests, DEFAULT_RESILIENCE_SETTINGS.requestQueue.concurrentRequests, {
                min: 1,
                max: 10_000
            }),
            maxWaitMs: DEFAULT_RESILIENCE_SETTINGS.requestQueue.maxWaitMs,
            maxQueueDepth: DEFAULT_RESILIENCE_SETTINGS.requestQueue.maxQueueDepth
        },
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLegacyConnectionCooldownProfile"])(oauthLegacy, DEFAULT_RESILIENCE_SETTINGS.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLegacyConnectionCooldownProfile"])(apikeyLegacy, DEFAULT_RESILIENCE_SETTINGS.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: {
                failureThreshold: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(oauthLegacy.circuitBreakerThreshold, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.failureThreshold, {
                    min: 1,
                    max: 1000
                }),
                degradationThreshold: DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.degradationThreshold,
                resetTimeoutMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(oauthLegacy.circuitBreakerReset, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.resetTimeoutMs, {
                    min: 1000,
                    max: 24 * 60 * 60 * 1000
                })
            },
            apikey: {
                failureThreshold: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(apikeyLegacy.circuitBreakerThreshold, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.failureThreshold, {
                    min: 1,
                    max: 1000
                }),
                degradationThreshold: DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.degradationThreshold,
                resetTimeoutMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(apikeyLegacy.circuitBreakerReset, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.resetTimeoutMs, {
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
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings);
    const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(record.resilienceSettings);
    const streamRecoveryRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.streamRecovery);
    if (typeof streamRecoveryRecord.enabled === "boolean") {
        return true;
    }
    return (process.env.STREAM_RECOVERY_ENABLED || "").trim().length > 0;
}
function resolveResilienceSettings(settings) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings);
    const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(record.resilienceSettings);
    const fallback = buildLegacyFallback(record);
    return {
        requestQueue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeRequestQueueSettings"])(current.requestQueue, fallback.requestQueue),
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.connectionCooldown).oauth, fallback.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.connectionCooldown).apikey, fallback.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.providerBreaker).oauth, fallback.providerBreaker.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.providerBreaker).apikey, fallback.providerBreaker.apikey)
        },
        waitForCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeWaitForCooldownSettings"])(current.waitForCooldown, fallback.waitForCooldown),
        comboCooldownWait: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeComboCooldownWaitSettings"])(current.comboCooldownWait, fallback.comboCooldownWait),
        quotaShareConcurrencyLimit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaShareConcurrencyLimitSettings"])(current.quotaShareConcurrencyLimit, fallback.quotaShareConcurrencyLimit),
        providerCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderCooldownSettings"])(current.providerCooldown, fallback.providerCooldown),
        quotaPreflight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaPreflightSettings"])(current.quotaPreflight, fallback.quotaPreflight),
        streamRecovery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeStreamRecoverySettings"])(current.streamRecovery, fallback.streamRecovery),
        providerQuotaOverrides: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderQuotaOverrides"])(current.providerQuotaOverrides, fallback.providerQuotaOverrides)
    };
}
function mergeResilienceSettings(current, updates) {
    return {
        requestQueue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeRequestQueueSettings"])(updates.requestQueue, current.requestQueue),
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])(updates.connectionCooldown?.oauth, current.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])(updates.connectionCooldown?.apikey, current.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])(updates.providerBreaker?.oauth, current.providerBreaker.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])(updates.providerBreaker?.apikey, current.providerBreaker.apikey)
        },
        waitForCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeWaitForCooldownSettings"])(updates.waitForCooldown, current.waitForCooldown),
        comboCooldownWait: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeComboCooldownWaitSettings"])(updates.comboCooldownWait, current.comboCooldownWait),
        quotaShareConcurrencyLimit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaShareConcurrencyLimitSettings"])(updates.quotaShareConcurrencyLimit, current.quotaShareConcurrencyLimit),
        providerCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderCooldownSettings"])(updates.providerCooldown, current.providerCooldown),
        quotaPreflight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaPreflightSettings"])(updates.quotaPreflight, current.quotaPreflight),
        streamRecovery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeStreamRecoverySettings"])(updates.streamRecovery, current.streamRecovery),
        providerQuotaOverrides: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderQuotaOverrides"])(updates.providerQuotaOverrides, current.providerQuotaOverrides)
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
"[project]/src/lib/resilience/modelLockoutSettings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MODEL_LOCKOUT_SETTINGS",
    ()=>DEFAULT_MODEL_LOCKOUT_SETTINGS,
    "resolveModelLockoutSettings",
    ()=>resolveModelLockoutSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)");
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
    const isTest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
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
"[project]/src/lib/cli-helper/config-generator/hermesHome.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/logRotation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [app-route] (ecmascript)");
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
    const logToFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppLogToFile"])();
    const logFilePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppLogFilePath"])() || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), "logs/application/app.log");
    const maxFileSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppLogMaxFileSize"])();
    const retentionDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppLogRetentionDays"])();
    const maxFiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppLogMaxFiles"])();
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
"[project]/src/lib/display/names.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/compatibleProviderId.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCompatibleProviderConnectionId"])(providerId)) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId)) return "CC Compatible";
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(providerId)) return "Compatible (openai)";
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAnthropicCompatibleProvider"])(providerId)) return "Compatible (anthropic)";
    }
    return providerId;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usageDb.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/migrations.ts [app-route] (ecmascript)");
// Re-export everything for backward compatibility
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageStats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/usageStats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageStats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageStats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/credentialHealth/cache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/events/eventBus.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/webhookDispatcher.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuardPolicy.ts [app-route] (ecmascript)");
;
;
;
function signPayload(payload, secret) {
    return `sha256=${__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac("sha256", secret).update(payload).digest("hex")}`;
}
function encryptMetadata(meta) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encrypt"])(JSON.stringify(meta)) ?? JSON.stringify(meta);
}
function decryptMetadata(encrypted) {
    if (!encrypted) return null;
    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decrypt"])(encrypted);
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAndValidateWebhookUrl"])(url);
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAndValidateWebhookUrl"])(url);
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
    const { getEnabledWebhooks, recordWebhookDelivery, disableWebhooksWithHighFailures } = await __turbopack_context__.A("[project]/src/lib/db/webhooks.ts [app-route] (ecmascript, async loader)");
    const { insertDelivery } = await __turbopack_context__.A("[project]/src/lib/db/webhookDeliveries.ts [app-route] (ecmascript, async loader)");
    const { buildSlackPayload } = await __turbopack_context__.A("[project]/src/lib/webhooks/integrations/slack.ts [app-route] (ecmascript, async loader)");
    const { buildTelegramUrl, buildTelegramPayload } = await __turbopack_context__.A("[project]/src/lib/webhooks/integrations/telegram.ts [app-route] (ecmascript, async loader)");
    const { buildDiscordPayload } = await __turbopack_context__.A("[project]/src/lib/webhooks/integrations/discord.ts [app-route] (ecmascript, async loader)");
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
"[project]/src/lib/promptCache/prefixAnalyzer.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/quota/accountBuckets.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/embeddings/familyGuard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "findEmbeddingComboDimensionConflict",
    ()=>findEmbeddingComboDimensionConflict
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/combo.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboStructure.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/embeddingRegistry.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function findEmbeddingComboDimensionConflict(combo, allCombos) {
    const targets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveComboTargets"])(combo, allCombos);
    const modelStrs = targets.map((t)=>t.modelStr).filter(Boolean);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectEmbeddingDimensionConflict"])(modelStrs);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/embeddings/service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createEmbeddingResponse",
    ()=>createEmbeddingResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/embeddings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/embeddingRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$upstreamError$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/upstreamError.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/combo.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$familyGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/embeddings/familyGuard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/omnirouteResponseMeta.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/requestId.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$familyGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$familyGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isPrivateHost"])(hostname) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCloudMetadataHost"])(hostname);
}
async function createEmbeddingResponse(body, options = {}) {
    const modelStr = body.model;
    const startTime = Date.now();
    if (!modelStr.includes("/")) {
        try {
            const combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboByName"])(modelStr);
            if (combo) {
                let allCombos = [];
                try {
                    allCombos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCombos"])();
                } catch  {}
                // Guard: an embedding combo whose targets span multiple vector
                // dimensions would corrupt any vector store on failover (vectors from
                // different models are not comparable). The generic combo engine has no
                // notion of embedding families, so reject loudly here before dispatch.
                // See _tasks/features-v3.8.12/01-embeddings-combo-family-guard.plan.md.
                const dimConflict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$embeddings$2f$familyGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findEmbeddingComboDimensionConflict"])(combo, allCombos);
                if (dimConflict.conflict) {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `Embedding combo "${modelStr}" mixes models with incompatible vector ` + `dimensions (${dimConflict.distinct.join(", ")}). Failover between them ` + `would corrupt your vector store — use a single embedding dimension per combo.`);
                }
                let settings = {};
                try {
                    settings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabaseSettings"])();
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
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["handleComboChat"])({
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
                    log: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
                    settings,
                    allCombos: allCombos,
                    relayOptions: undefined,
                    signal: undefined
                });
            }
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["error"]("EMBED", `Combo resolution failed for ${modelStr}: ${err}`);
        }
    }
    let dynamicProviders = [];
    try {
        const nodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])();
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
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildDynamicEmbeddingProvider"])(n);
            } catch (err) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["error"]("EMBED", `Skipping invalid provider_node ${n.prefix}: ${err}`);
                return null;
            }
        }).filter((p)=>p !== null);
    } catch (err) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["error"]("EMBED", `Failed to load provider_nodes for embeddings: ${err}`);
    }
    const { provider, model: resolvedModel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseEmbeddingModel"])(body.model, dynamicProviders);
    if (!provider) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `Invalid embedding model: ${body.model}. Use format: provider/model`);
    }
    let providerConfig = dynamicProviders.find((dp)=>dp.id === provider) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEmbeddingProvider"])(provider) || null;
    let credentialsProviderId = provider;
    if (!providerConfig) {
        try {
            const allNodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])();
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
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["info"]("EMBED", `Resolved custom embedding provider: ${provider} -> ${providerConfig.baseUrl}`);
            }
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["error"]("EMBED", `Failed to resolve custom embedding provider ${provider}: ${err}`);
        }
    }
    if (!providerConfig) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `Unknown embedding provider: ${provider}. No matching hardcoded or local provider found.`);
    }
    let credentials = null;
    if (providerConfig.authType !== "none") {
        credentials = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCredentials"])(credentialsProviderId);
        if (!credentials) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST, `No credentials for embedding provider: ${provider}`);
        }
        if ("allRateLimited" in credentials && credentials.allRateLimited) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unavailableResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED, `[${provider}] All accounts rate limited`, credentials.retryAfter, credentials.retryAfterHuman);
        }
    } else if (provider === "ollama-local") {
        // Ollama is keyless, but a configured connection can still provide a
        // custom local host. Hydrate that optional connection without imposing an
        // authentication requirement, then keep the static localhost default when
        // no connection exists.
        const localCredentials = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCredentials"])(credentialsProviderId);
        if (localCredentials && !("allRateLimited" in localCredentials) && !("allExpired" in localCredentials)) {
            credentials = localCredentials;
        }
    }
    // #474: when the request used a bare model name (no "/" — e.g. an alias that
    // resolved to "auto") and the selected connection declares a defaultModel,
    // resolve the bare name to that real model ID before the upstream call so the
    // provider receives a concrete model. A "/"-qualified name is left untouched.
    const connectionDefaultModel = credentials && typeof credentials.defaultModel === "string" ? credentials.defaultModel : null;
    const effectiveModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveBareModelToConnectionDefault"])(modelStr, resolvedModel, connectionDefaultModel);
    // Resolve the connection-level proxy so the upstream embedding request honors
    // the same per-connection pinning as chat, image generation, and count_tokens
    // (#1904-style behavior). Without this, embeddings silently fall back to the
    // global/env proxy and ignore a connection's pinned proxy. Ported from
    // upstream decolua/9router#1701.
    let proxyInfo = null;
    const connectionIdForProxy = credentials?.connectionId;
    if (connectionIdForProxy) {
        try {
            proxyInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(connectionIdForProxy);
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["error"]("EMBED", `Failed to resolve proxy for connection ${connectionIdForProxy}: ${err}`);
        }
    }
    const runEmbedding = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$embeddings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleEmbedding"])({
            body: effectiveModel !== resolvedModel ? {
                ...body,
                model: `${provider}/${effectiveModel}`
            } : body,
            // getProviderCredentials returns a richer connection object; handleEmbedding
            // reads auth plus the optional local baseUrl override. Bridge the wider
            // selection type to the handler's narrow credential shape.
            credentials: credentials,
            log: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
            resolvedProvider: providerConfig,
            resolvedModel: effectiveModel,
            clientRawRequest: options.clientRawRequest || null,
            apiKeyId: options.apiKeyId || null,
            apiKeyName: options.apiKeyName || null,
            connectionId: options.connectionId || null
        });
    const result = connectionIdForProxy ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyInfo?.proxy || null, runEmbedding) : await runEmbedding();
    const responseHeaders = new Headers(result.headers);
    if (result.success) {
        if (credentials) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["clearRecoveredProviderState"])(credentials);
        responseHeaders.set("Content-Type", "application/json");
        const usage = result.data?.usage ?? null;
        const costUsd = usage ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateCost"])(provider, effectiveModel ?? "", usage) : 0;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$omnirouteResponseMeta$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["attachOmniRouteMetaHeaders"])(responseHeaders, {
            provider,
            model: effectiveModel,
            usage,
            costUsd,
            latencyMs: Date.now() - startTime,
            requestId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$requestId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateRequestId"])()
        });
        return new Response(JSON.stringify(result.data), {
            status: result.status,
            headers: responseHeaders
        });
    }
    responseHeaders.set("Content-Type", "application/json");
    const errorPayload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$upstreamError$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toJsonErrorPayload"])(result.error, "Embedding provider error");
    return new Response(JSON.stringify(errorPayload), {
        status: result.status,
        headers: responseHeaders
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/skills/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/skills/schemas.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/types.ts [app-route] (ecmascript)");
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
    mode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].nativeEnum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SkillMode"]),
    allowedSkills: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
    timeout: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive().default(30000),
    maxRetries: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).default(3)
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/skills/registry.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "skillRegistry",
    ()=>skillRegistry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/schemas.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"])("SKILLS");
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
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SkillCreateInputSchema"].parse(parseableData);
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
                const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
"[project]/src/lib/skills/executor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "skillExecutor",
    ()=>skillExecutor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/registry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/skills/types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"])("SKILLS_EXECUTOR");
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
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        if (settings.skillsEnabled === false) {
            throw new Error("Skills execution is disabled. Enable Skills in Settings > AI.");
        }
        const skill = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$registry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["skillRegistry"].getSkill(skillName, context.apiKeyId);
        if (!skill) {
            throw new Error(`Skill not found: ${skillName}`);
        }
        if (!skill.enabled) {
            throw new Error(`Skill is disabled: ${skillName}`);
        }
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const executionId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
        const startTime = Date.now();
        log.info("skills.executor.start", {
            skillId: skill.id,
            skillName,
            apiKeyId: context.apiKeyId
        });
        try {
            db.prepare(`INSERT INTO skill_executions (id, skill_id, api_key_id, session_id, input, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`).run(executionId, skill.id, context.apiKeyId, context.sessionId || null, JSON.stringify(input), __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SkillStatus"].RUNNING, new Date().toISOString());
            const handler = this.handlers.get(skill.handler);
            if (!handler) {
                throw new Error(`Handler not found: ${skill.handler}`);
            }
            let output = null;
            let errorMessage = null;
            let status = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SkillStatus"].SUCCESS;
            try {
                const result = await this.executeWithTimeout(handler(input, {
                    apiKeyId: context.apiKeyId,
                    sessionId: context.sessionId || ""
                }));
                output = result;
            } catch (err) {
                errorMessage = err instanceof Error ? err.message : String(err);
                status = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SkillStatus"].ERROR;
            }
            const durationMs = Date.now() - startTime;
            db.prepare(`UPDATE skill_executions SET output = ?, status = ?, error_message = ?, duration_ms = ? WHERE id = ?`).run(output ? JSON.stringify(output) : null, status, errorMessage, durationMs, executionId);
            log.info("skills.executor.complete", {
                skillId: skill.id,
                success: status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SkillStatus"].SUCCESS,
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
            db.prepare(`UPDATE skill_executions SET status = ?, error_message = ?, duration_ms = ? WHERE id = ?`).run(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$skills$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SkillStatus"].ERROR, errorMessage, durationMs, executionId);
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
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
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
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const row = apiKeyId ? db.prepare("SELECT COUNT(*) as count FROM skill_executions WHERE api_key_id = ?").get(apiKeyId) : db.prepare("SELECT COUNT(*) as count FROM skill_executions").get();
        return row?.count ?? 0;
    }
}
const skillExecutor = SkillExecutor.getInstance();
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/skills/githubCollector.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GitHubSkillsInstallSchema",
    ()=>GitHubSkillsInstallSchema,
    "GitHubSkillsScanSchema",
    ()=>GitHubSkillsScanSchema,
    "GitHubSkillsSearchSchema",
    ()=>GitHubSkillsSearchSchema,
    "INSTALL_TARGETS",
    ()=>INSTALL_TARGETS,
    "QUERY_STRATEGIES",
    ()=>QUERY_STRATEGIES,
    "inferCategory",
    ()=>inferCategory,
    "resolveInstallPath",
    ()=>resolveInstallPath,
    "scanText",
    ()=>scanText,
    "scoreRepo",
    ()=>scoreRepo,
    "searchGitHubSkills",
    ()=>searchGitHubSkills
]);
/**
 * githubCollector.ts — GitHub agent skill discovery, scoring, and import.
 *
 * Mirrors the logic from the Skill Collector Python tool:
 *   - Searches GitHub for repos with SKILL.md / agent skill files
 *   - Scores repos by relevance (stars, name/desc signals, topics)
 *   - Scans for blocked patterns (malware, secrets)
 *   - Installs SKILL.md into agent directories (Hermes, Claude, etc.)
 *
 * This is the backend library consumed by the MCP tools and REST API.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// ── Constants ────────────────────────────────────────────────────────────────
const BLOCKED_PATTERNS = [
    {
        regex: /eval\s*\(base64/i,
        description: "eval(base64) — dangerous code execution"
    },
    {
        regex: /exec\s*\(base64/i,
        description: "exec(base64) — dangerous code execution"
    },
    {
        regex: /os\.system\(/i,
        description: "os.system() — shell injection risk"
    },
    {
        regex: /subprocess\.Popen\(/i,
        description: "subprocess.Popen() — shell spawn"
    },
    {
        regex: /invoke-expression/i,
        description: "PowerShell Invoke-Expression"
    },
    {
        regex: /-----BEGIN.*PRIVATE KEY-----/i,
        description: "Private key leaked"
    },
    {
        regex: /id_rsa/i,
        description: "SSH private key reference"
    },
    {
        regex: /password\s*[=:]\s*['"]/,
        description: "Hardcoded password"
    },
    {
        regex: /api_key\s*[=:]\s*['"]/,
        description: "Hardcoded API key"
    },
    {
        regex: /secret\s*[=:]\s*['"]/,
        description: "Hardcoded secret"
    },
    {
        regex: /sk-[a-zA-Z0-9]{20,}/i,
        description: "OpenAI API key pattern"
    },
    {
        regex: /ghp_[a-zA-Z0-9]{36,}/i,
        description: "GitHub PAT token"
    }
];
const SKILL_FILE_SIGNALS = [
    "skill.md",
    "skills.md",
    "agents.md",
    "claude.md",
    "codex.md",
    "cursor.md",
    "copilot.md",
    ".cursorrules",
    ".clauderules",
    ".windsurfrules",
    "copilot-instructions",
    "agent.md",
    "context.md",
    "instructions.md",
    "rules.md",
    "conventions.md"
];
const HIGH_VALUE_KEYWORDS = [
    "agent",
    "skill",
    "cursor",
    "copilot",
    "claude",
    "codex",
    "gemini",
    "opencode",
    "hermes",
    "windsurf",
    "mcp",
    "llm",
    "autonomous",
    "orchestrat",
    "workflow"
];
const AGENT_TOPICS = new Set([
    "agent",
    "ai-agent",
    "llm-agent",
    "agentic-ai",
    "agent-framework",
    "autonomous-agent",
    "multi-agent",
    "mcp",
    "mcp-server",
    "mcp-tool",
    "claude",
    "claude-code",
    "cursor-ai",
    "copilot",
    "codex",
    "prompt-engineering",
    "context-engineering",
    "ai-toolkit"
]);
const KNOWN_GOLD_REPOS = new Set([
    "addyosmani/agent-skills",
    "K-Dense-AI/scientific-agent-skills",
    "modelcontextprotocol/servers",
    "continuedev/continue",
    "aider-ai/aider",
    "Significant-Gravitas/AutoGPT",
    "crewAIInc/crewAI",
    "microsoft/autogen",
    "langchain-ai/langchain",
    "openai/codex"
]);
const INSTALL_TARGETS = [
    "hermes",
    "claude",
    "gemini",
    "opencode"
];
const INSTALL_PATHS = {
    hermes: "~/AppData/Local/hermes/skills/{category}",
    claude: "~/.claude/skills/{category}",
    gemini: "~/.gemini/skills/{category}",
    opencode: "~/.opencode/skills/{category}"
};
function scoreRepo(params) {
    const { fullName, description, stars: rawStars, forks, hasLicense, topics } = params;
    const name = fullName.toLowerCase();
    const desc = description.toLowerCase();
    let stars = rawStars;
    let points = 0.0;
    let bonus = 0.0;
    let isAwesome = false;
    let hasSkillFile = false;
    // Gold repos get max score
    if (KNOWN_GOLD_REPOS.has(fullName)) return 0.98;
    // Awesome-list detection (curated, not skill repos)
    if (name.includes("awesome") || desc.includes("curated list") || desc.includes("awesome list")) {
        isAwesome = true;
        points += 0.3;
    }
    // Skill-file name signals
    for (const sig of SKILL_FILE_SIGNALS){
        if (name.includes(sig)) {
            points += 0.22;
            hasSkillFile = true;
            break;
        }
    }
    // Loose keyword matches
    for (const sig of [
        ".md",
        "skill",
        "agent",
        "rules",
        "instructions"
    ]){
        if (name.includes(sig)) points += 0.02;
        if (desc.includes(sig)) points += 0.01;
    }
    // High-value keywords
    for (const kw of HIGH_VALUE_KEYWORDS){
        if (name.includes(kw)) points += 0.04;
        if (desc.includes(kw)) points += 0.02;
    }
    // Topic matches
    const topicMatch = topics.filter((t)=>AGENT_TOPICS.has(t)).length;
    points += topicMatch * 0.06;
    // Stars bonus (logarithmic, capped for awesome lists)
    if (isAwesome) stars = Math.min(stars, 1000);
    if (stars > 20000) bonus = Math.min(0.7, stars / 30000);
    else if (stars > 5000) bonus = stars / 15000;
    else if (stars > 1000) bonus = stars / 10000;
    else if (stars > 300) bonus = stars / 8000;
    else if (stars > 100) bonus = stars / 12000;
    else if (stars > 50) bonus = stars / 15000;
    if (forks > 500) bonus += 0.05;
    else if (forks > 100) bonus += 0.03;
    if (hasLicense) points += 0.03;
    if (stars < 300 && !isAwesome) points += 0.06;
    const base = isAwesome ? hasSkillFile ? 0.38 : 0.16 : hasSkillFile ? 0.38 : 0.28;
    let score = Math.min(1.0, (points + bonus) * 0.48 + base);
    if (isAwesome && !hasSkillFile) score = Math.min(score, 0.82);
    return Math.round(score * 10000) / 10000;
}
// ── Scanning ─────────────────────────────────────────────────────────────────
const DOC_FILES = new Set([
    "readme.md",
    "changelog.md",
    "security.md",
    "contributing.md",
    "code_of_conduct.md",
    "license",
    "authors.md",
    "credits.md"
]);
function scanText(text, label = "") {
    const findings = [];
    for (const { regex, description } of BLOCKED_PATTERNS){
        const match = regex.exec(text);
        if (match) {
            const start = Math.max(0, match.index - 10);
            const context = text.slice(start, match.index + match[0].length + 20).replace(/\n/g, " ");
            findings.push({
                file: label,
                pattern: description,
                context: `...${context}...`
            });
        }
    }
    return findings;
}
function inferCategory(fullName, description) {
    const text = `${fullName} ${description}`.toLowerCase();
    const mapping = {
        security: [
            "security",
            "pentest",
            "exploit",
            "malware",
            "forensics",
            "vulnerability"
        ],
        "data-science": [
            "data",
            "analytics",
            "pandas",
            "ml",
            "model",
            "train"
        ],
        devops: [
            "deploy",
            "docker",
            "k8s",
            "terraform",
            "ci/cd",
            "pipeline"
        ],
        creative: [
            "design",
            "image",
            "video",
            "art",
            "music"
        ],
        productivity: [
            "email",
            "doc",
            "slide",
            "report",
            "calendar"
        ],
        research: [
            "paper",
            "arxiv",
            "academic",
            "literature"
        ],
        "software-development": [
            "code",
            "refactor",
            "test",
            "lint",
            "review",
            "debug"
        ],
        media: [
            "youtube",
            "transcript",
            "gif",
            "video",
            "audio"
        ]
    };
    for (const [cat, keywords] of Object.entries(mapping)){
        if (keywords.some((k)=>text.includes(k))) return cat;
    }
    return "imported-github";
}
function resolveInstallPath(target, skillName, description) {
    const category = inferCategory(skillName, description);
    let template = INSTALL_PATHS[target];
    if (!template) throw new Error(`Unknown install target: ${target}`);
    template = template.replace("{category}", category);
    const home = typeof process !== "undefined" && process.env?.HOME ? process.env.HOME : typeof process !== "undefined" && process.env?.USERPROFILE ? process.env.USERPROFILE : "";
    return template.replace("~", home).replace("{name}", skillName);
}
const QUERY_STRATEGIES = {
    file: [
        "filename:SKILL.md stars:>=1",
        "filename:CLAUDE.md stars:>=1",
        "filename:CODEX.md stars:>=1",
        "filename:CURSOR.md stars:>=1",
        "filename:.cursorrules stars:>=1",
        "filename:AGENTS.md stars:>=1",
        "filename:COPILOT.md stars:>=1",
        "filename:.clauderules stars:>=1",
        "filename:copilot-instructions.md stars:>=1",
        "filename:INSTRUCTIONS.md stars:>=1"
    ],
    name: [
        "agent skill in:name stars:>=3",
        "skill-pack in:name stars:>=3",
        "cursor rules in:name stars:>=3",
        "claude rules in:name stars:>=3",
        "agent codex in:name stars:>=3",
        "mcp server in:name,topic stars:>=3",
        "llm agent in:name stars:>=5"
    ],
    description: [
        "agent skill in:description stars:>=5",
        "SKILL.md in:description stars:>=3",
        "LLM agent tool in:description stars:>=5"
    ]
};
async function searchGitHubSkills(options = {}) {
    const { token = process.env.GITHUB_TOKEN || "", minStars = 1, maxResults = 100 } = options;
    const seen = new Set();
    const repos = [];
    const errors = [];
    const headers = {
        Accept: "application/vnd.github+json",
        ...token ? {
            Authorization: `Bearer ${token}`
        } : {}
    };
    const allQueries = [
        ...QUERY_STRATEGIES.file,
        ...QUERY_STRATEGIES.name,
        ...QUERY_STRATEGIES.description
    ];
    for (const query of allQueries){
        if (repos.length >= maxResults) break;
        try {
            const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=30`;
            const res = await fetch(url, {
                headers,
                signal: AbortSignal.timeout(10000)
            });
            if (!res.ok) {
                if (res.status === 403) {
                    errors.push("GitHub API rate limited — add a GITHUB_TOKEN");
                    break;
                }
                if (res.status === 422) continue; // bad query, skip
                errors.push(`GitHub API ${res.status} for query: ${query.slice(0, 40)}`);
                continue;
            }
            const data = await res.json();
            for (const item of data.items || []){
                if (repos.length >= maxResults) break;
                if (seen.has(item.full_name)) continue;
                if ((item.stargazers_count ?? 0) < minStars) continue;
                seen.add(item.full_name);
                repos.push({
                    fullName: item.full_name,
                    htmlUrl: item.html_url,
                    description: item.description || "",
                    stars: item.stargazers_count ?? 0,
                    forks: item.forks_count ?? 0,
                    topics: item.topics || [],
                    score: scoreRepo({
                        fullName: item.full_name,
                        description: item.description || "",
                        stars: item.stargazers_count ?? 0,
                        forks: item.forks_count ?? 0,
                        hasLicense: !!item.license,
                        topics: item.topics || []
                    }),
                    hasSkillFile: SKILL_FILE_SIGNALS.some((s)=>item.full_name.toLowerCase().includes(s)),
                    isAwesome: item.full_name.toLowerCase().includes("awesome"),
                    updatedAt: item.updated_at || null,
                    license: item.license?.spdx_id || null
                });
            }
        } catch (err) {
            errors.push(`Query "${query.slice(0, 30)}…" failed: ${err.message}`);
        }
    }
    repos.sort((a, b)=>b.score - a.score);
    return {
        repos,
        errors
    };
}
const GitHubSkillsSearchSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    query: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().describe("Optional search text to filter results"),
    minStars: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).max(100000).default(1).describe("Minimum GitHub stars"),
    maxResults: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(1).max(500).default(50).describe("Max repos to return"),
    minScore: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).max(1).default(0).describe("Minimum relevance score filter")
});
const GitHubSkillsScanSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    repoName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Full repo name (e.g. 'user/repo')"),
    content: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("SKILL.md or README content to scan")
});
const GitHubSkillsInstallSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    repoName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().describe("Full repo name to install"),
    targets: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum(INSTALL_TARGETS)).default([
        "hermes"
    ]).describe("Where to install the skill"),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().default("").describe("Repo description for category inference")
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/agentSkills/catalog.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_SKILL_IDS",
    ()=>API_SKILL_IDS,
    "CLI_SKILL_IDS",
    ()=>CLI_SKILL_IDS,
    "CONFIG_SKILL_IDS",
    ()=>CONFIG_SKILL_IDS,
    "computeCoverage",
    ()=>computeCoverage,
    "fetchSkillMarkdown",
    ()=>fetchSkillMarkdown,
    "filterCatalog",
    ()=>filterCatalog,
    "getCatalog",
    ()=>getCatalog,
    "getSkillById",
    ()=>getSkillById,
    "refreshCatalog",
    ()=>refreshCatalog
]);
/**
 * catalog.ts — single source of truth for the 43-entry Agent Skills catalog.
 *
 * Consumers: REST routes (/api/agent-skills/*), MCP tools, A2A skill, Generator.
 * Do NOT import this from UI components directly — use the REST API instead.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$agentSkills$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/agentSkills.ts [app-route] (ecmascript)");
;
;
;
const API_SKILL_IDS = [
    "omni-auth",
    "omni-providers",
    "omni-models",
    "omni-combos-routing",
    "omni-api-keys",
    "omni-usage-logs",
    "omni-budget",
    "omni-settings",
    "omni-proxies",
    "omni-cache",
    "omni-compression",
    "omni-context-rtk",
    "omni-resilience",
    "omni-cli-tools",
    "omni-tunnels",
    "omni-sync-cloud",
    "omni-db-backups",
    "omni-webhooks",
    "omni-mcp",
    "omni-agents-a2a",
    "omni-version-manager",
    "omni-inference",
    "omni-github-skills"
];
const CONFIG_SKILL_IDS = [
    "config-codex-cli"
];
const CLI_SKILL_IDS = [
    "cli-serve",
    "cli-health",
    "cli-providers",
    "cli-keys",
    "cli-models",
    "cli-chat",
    "cli-routing",
    "cli-resilience",
    "cli-compression",
    "cli-contexts",
    "cli-cost-usage",
    "cli-mcp",
    "cli-a2a",
    "cli-tunnel",
    "cli-backup-sync",
    "cli-policy-audit",
    "cli-batches",
    "cli-eval",
    "cli-plugins-skills",
    "cli-setup",
    "cli-skill-collector"
];
// ── Module-scope cache ──────────────────────────────────────────────────────
let _cache = null;
// ── Helpers ─────────────────────────────────────────────────────────────────
function buildFullSkill(curated) {
    return {
        ...curated,
        endpoints: curated.category === "api" ? [] : undefined,
        cliCommands: curated.category === "cli" ? [] : undefined,
        rawUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$agentSkills$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAgentSkillRawUrl"])(curated.id),
        githubUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$agentSkills$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAgentSkillBlobUrl"])(curated.id)
    };
}
function deriveCatalog() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$agentSkills$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CURATED_SKILLS"].map(buildFullSkill);
}
function getCatalog() {
    if (!_cache) {
        _cache = deriveCatalog();
    }
    return _cache;
}
function getSkillById(id) {
    return getCatalog().find((s)=>s.id === id) ?? null;
}
function filterCatalog(opts) {
    let skills = getCatalog();
    if (opts.category) {
        skills = skills.filter((s)=>s.category === opts.category);
    }
    if (opts.area) {
        skills = skills.filter((s)=>s.area === opts.area);
    }
    return skills;
}
function computeCoverage() {
    const catalog = getCatalog();
    const skillsDir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(process.cwd(), "skills");
    let presentIds;
    try {
        const entries = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(skillsDir, {
            withFileTypes: true
        });
        presentIds = new Set(entries.filter((e)=>e.isDirectory()).filter((e)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(skillsDir, e.name, "SKILL.md"))).map((e)=>e.name));
    } catch  {
        // Directory doesn't exist yet — zero coverage
        presentIds = new Set();
    }
    const apiHave = catalog.filter((s)=>s.category === "api" && presentIds.has(s.id)).length;
    const cliHave = catalog.filter((s)=>s.category === "cli" && presentIds.has(s.id)).length;
    const configTotal = CONFIG_SKILL_IDS.length;
    const configHave = catalog.filter((s)=>s.category === "config" && presentIds.has(s.id)).length;
    return {
        // Totals derive from the id lists — hardcoded 23/20 went stale the first
        // time the catalog grew (cli-skill-collector registration, 2026-07-15).
        api: {
            have: apiHave,
            total: API_SKILL_IDS.length
        },
        cli: {
            have: cliHave,
            total: CLI_SKILL_IDS.length
        },
        config: {
            have: configHave,
            total: configTotal
        },
        totalSkills: apiHave + cliHave + configHave,
        generatedAt: new Date().toISOString()
    };
}
function refreshCatalog() {
    _cache = null;
}
async function fetchSkillMarkdown(id) {
    const localPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(process.cwd(), "skills", id, "SKILL.md");
    // 1. Try filesystem first
    try {
        const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(localPath, "utf-8");
        const parsed = parseMarkdownFrontmatter(raw);
        return {
            id,
            frontmatter: parsed.frontmatter,
            body: parsed.body,
            source: "filesystem",
            fetchedAt: new Date().toISOString()
        };
    } catch  {
    // File not present locally — fall through to GitHub
    }
    // 2. Fetch from GitHub raw (with Next.js revalidate cache if available)
    const skill = getSkillById(id);
    if (!skill) {
        throw new Error(`Skill not found in catalog: ${id}`);
    }
    const response = await fetch(skill.rawUrl, {
        next: {
            revalidate: 3600
        }
    });
    if (!response.ok) {
        throw new Error(`GitHub raw fetch failed: HTTP ${response.status} for ${skill.rawUrl}`);
    }
    const raw = await response.text();
    const parsed = parseMarkdownFrontmatter(raw);
    return {
        id,
        frontmatter: parsed.frontmatter,
        body: parsed.body,
        source: "github",
        fetchedAt: new Date().toISOString()
    };
}
// ── Internal helpers ─────────────────────────────────────────────────────────
/**
 * Parses YAML frontmatter from a markdown string.
 * Expects: `---\nkey: value\n---\n<body>` format.
 * Returns default values if frontmatter is absent or malformed.
 */ function parseMarkdownFrontmatter(content) {
    const FM_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = FM_REGEX.exec(content);
    if (!match) {
        return {
            frontmatter: {
                name: "",
                description: ""
            },
            body: content
        };
    }
    const yamlBlock = match[1];
    const body = match[2] ?? "";
    // Simple key: value extraction (avoids importing js-yaml here to stay lightweight)
    const nameMatch = /^name:\s*(.+)$/m.exec(yamlBlock);
    const descMatch = /^description:\s*(.+)$/m.exec(yamlBlock);
    return {
        frontmatter: {
            name: nameMatch ? nameMatch[1].trim().replace(/^["']|["']$/g, "") : "",
            description: descMatch ? descMatch[1].trim().replace(/^["']|["']$/g, "") : ""
        },
        body
    };
}
}),
"[project]/src/lib/plugins/manifest.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "ConfigFieldSchema",
    ()=>ConfigFieldSchema,
    "HooksSchema",
    ()=>HooksSchema,
    "ManifestSkillSchema",
    ()=>ManifestSkillSchema,
    "PermissionSchema",
    ()=>PermissionSchema,
    "PluginManifestSchema",
    ()=>PluginManifestSchema,
    "RequiresSchema",
    ()=>RequiresSchema,
    "applyDefaults",
    ()=>applyDefaults,
    "safeValidateManifest",
    ()=>safeValidateManifest,
    "validateManifest",
    ()=>validateManifest,
    "validatePluginConfig",
    ()=>validatePluginConfig
]);
/**
 * Plugin manifest validator — Zod schema for plugin.json files.
 *
 * @module plugins/manifest
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const PermissionSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
    "network",
    "file-read",
    "file-write",
    "env",
    "exec"
]);
const ManifestSkillSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).max(100),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(500).optional(),
    input: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()).optional(),
    output: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()).optional()
});
const ConfigFieldSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "string",
        "number",
        "boolean",
        "select"
    ]),
    default: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown().optional(),
    min: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    max: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    enum: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional(),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
});
const HooksSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    onRequest: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    onResponse: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    onError: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    onInstall: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    onActivate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    onDeactivate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    onUninstall: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional()
});
const RequiresSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    omniroute: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    permissions: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(PermissionSchema).optional()
});
const PluginManifestSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Name must be kebab-case (lowercase, hyphens only)"),
    version: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().regex(/^\d+\.\d+\.\d+$/, "Version must be semver (e.g. 1.0.0)"),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(500).optional(),
    author: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(200).optional(),
    license: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    main: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    source: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "local",
        "marketplace"
    ]).optional(),
    tags: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional(),
    requires: RequiresSchema.optional(),
    hooks: HooksSchema.optional(),
    skills: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(ManifestSkillSchema).optional(),
    enabledByDefault: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    configSchema: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), ConfigFieldSchema).optional(),
    /**
   * OPT-IN tamper-detection: `sha256-<base64>` of the plugin's entry file.
   *
   * NOT a security boundary — loopback-only routing and exec opt-in are the real
   * boundaries. Local-operator plugins without `integrity` are fully allowed (trust
   * is implicit for locally installed code). When this field IS present, the loader
   * verifies the entry file hash at load time and refuses to activate on mismatch.
   *
   * Format: `sha256-<base64url>` (same as SRI / W3C Subresource Integrity).
   * Generate with: `node -e "const {createHash}=require('crypto'),{readFileSync}=require('fs');
   *   console.log('sha256-'+createHash('sha256').update(readFileSync('index.js')).digest('base64'))"`
   */ integrity: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
});
function applyDefaults(manifest) {
    return {
        ...manifest,
        license: manifest.license ?? "MIT",
        main: manifest.main ?? "index.js",
        source: manifest.source ?? "local",
        tags: manifest.tags ?? [],
        requires: {
            omniroute: manifest.requires?.omniroute,
            permissions: manifest.requires?.permissions ?? []
        },
        hooks: {
            onRequest: manifest.hooks?.onRequest ?? false,
            onResponse: manifest.hooks?.onResponse ?? false,
            onError: manifest.hooks?.onError ?? false,
            onInstall: manifest.hooks?.onInstall ?? false,
            onActivate: manifest.hooks?.onActivate ?? false,
            onDeactivate: manifest.hooks?.onDeactivate ?? false,
            onUninstall: manifest.hooks?.onUninstall ?? false
        },
        skills: manifest.skills ?? [],
        enabledByDefault: manifest.enabledByDefault ?? false,
        configSchema: manifest.configSchema ?? {}
    };
}
function validateManifest(raw) {
    const parsed = PluginManifestSchema.parse(raw);
    return applyDefaults(parsed);
}
function safeValidateManifest(raw) {
    const result = PluginManifestSchema.safeParse(raw);
    if (result.success) {
        return {
            success: true,
            data: applyDefaults(result.data)
        };
    }
    return {
        success: false,
        errors: result.error.issues.map((i)=>`${i.path.join(".")}: ${i.message}`)
    };
}
function validatePluginConfig(config, schema) {
    const errors = [];
    // If schema is empty, allow anything
    const hasSchema = Object.keys(schema).length > 0;
    if (!hasSchema) return {
        valid: true
    };
    for (const [key, value] of Object.entries(config)){
        const field = schema[key];
        if (!field) {
            errors.push(`Unknown config key: ${key}`);
            continue;
        }
        switch(field.type){
            case "string":
                if (typeof value !== "string") errors.push(`${key} must be a string`);
                break;
            case "number":
                if (typeof value !== "number") {
                    errors.push(`${key} must be a number`);
                } else {
                    if (field.min !== undefined && value < field.min) errors.push(`${key} must be >= ${field.min}`);
                    if (field.max !== undefined && value > field.max) errors.push(`${key} must be <= ${field.max}`);
                }
                break;
            case "boolean":
                if (typeof value !== "boolean") errors.push(`${key} must be a boolean`);
                break;
            case "select":
                if (!field.enum || !field.enum.includes(value)) errors.push(`${key} must be one of: ${(field.enum ?? []).join(", ")}`);
                break;
        }
    }
    if (errors.length > 0) return {
        valid: false,
        errors
    };
    return {
        valid: true
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/plugins/scanner.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getDefaultPluginDir",
    ()=>getDefaultPluginDir,
    "scanPluginDir",
    ()=>scanPluginDir
]);
/**
 * Plugin scanner — discovers plugins from the filesystem.
 *
 * Scans ~/.omniroute/plugins/ for subdirectories containing plugin.json manifests.
 * Returns validated manifests with directory paths.
 *
 * @module plugins/scanner
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manifest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/plugins/manifest.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manifest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manifest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"])("PLUGIN_SCANNER");
function getDefaultPluginDir() {
    const home = process.env.HOME || process.env.USERPROFILE || "/tmp";
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(home, ".omniroute", "plugins");
}
async function scanPluginDir(dir) {
    const plugins = [];
    const errors = [];
    let entries;
    try {
        const dirEntries = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["readdir"])(dir, {
            withFileTypes: true
        });
        entries = dirEntries.filter((e)=>e.isDirectory() && !e.name.startsWith(".")).map((e)=>e.name);
    } catch (err) {
        if (err.code === "ENOENT") {
            log.info("scanner.dir_not_found", {
                dir
            });
            return {
                plugins: [],
                errors: []
            };
        }
        throw err;
    }
    for (const entry of entries){
        const pluginDir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(dir, entry);
        const manifestPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(pluginDir, "plugin.json");
        try {
            const manifestStat = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["stat"])(manifestPath);
            if (!manifestStat.isFile()) {
                errors.push({
                    name: entry,
                    error: "plugin.json is not a file"
                });
                continue;
            }
        } catch  {
            errors.push({
                name: entry,
                error: "no plugin.json found"
            });
            continue;
        }
        try {
            const raw = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["readFile"])(manifestPath, "utf-8");
            const parsed = JSON.parse(raw);
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$manifest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeValidateManifest"])(parsed);
            if (!result.success) {
                const failResult = result;
                errors.push({
                    name: entry,
                    error: `invalid manifest: ${failResult.errors.join("; ")}`
                });
                continue;
            }
            const manifest = result.data;
            const entryPoint = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(pluginDir, manifest.main);
            // Verify entry point exists
            try {
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["stat"])(entryPoint);
            } catch  {
                errors.push({
                    name: entry,
                    error: `entry point not found: ${manifest.main}`
                });
                continue;
            }
            plugins.push({
                name: manifest.name,
                manifest,
                pluginDir,
                entryPoint
            });
            log.info("scanner.discovered", {
                name: manifest.name,
                version: manifest.version
            });
        } catch (err) {
            errors.push({
                name: entry,
                error: `failed to read manifest: ${err.message}`
            });
        }
    }
    return {
        plugins,
        errors
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/plugins/loader.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeIntegrity",
    ()=>computeIntegrity,
    "loadPlugin",
    ()=>loadPlugin
]);
/**
 * Plugin loader — loads plugins in isolated child processes.
 *
 * Uses a child Node.js process with IPC for process-level isolation. Each plugin
 * runs in a separate Node.js process with restricted environment.
 * Complies with Rule 3 (no eval/new Function/implied eval).
 *
 * @module plugins/loader
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"])("PLUGIN_LOADER");
const DEFAULT_HOOK_TIMEOUT = 10_000;
const SIGKILL_GRACE_MS = 3_000;
// #8395: stdout/stderr forwarding hygiene — cap how much of a plugin's own console
// output we relay per stream, so a runaway/misbehaving plugin can't flood memory or
// the log sink. Mirrors the per-plugin rate-limit hygiene already used for hooks
// (hooks.ts::isRateLimited).
const MAX_FORWARDED_LINES_PER_STREAM = 500;
const MAX_FORWARDED_LINE_LENGTH = 4_000;
function computeIntegrity(source) {
    const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(source, "utf-8").digest("base64");
    return `sha256-${hash}`;
}
/**
 * #8395: forward a plugin child process's stdout/stderr to the parent's structured
 * logger, line-buffered. Without this, plugin console.log/console.error output is
 * silently discarded at the OS level (the child is spawned with that stream set to
 * "ignore"), even though the plugin's hook handlers do run correctly over IPC.
 * Caps total forwarded lines per stream to avoid a runaway plugin flooding the log.
 */ function forwardChildOutput(stream, pluginName, level) {
    if (!stream) return;
    let buffer = "";
    let forwardedLines = 0;
    stream.on("data", (chunk)=>{
        buffer += chunk.toString("utf-8");
        let newlineIndex = buffer.indexOf("\n");
        while(newlineIndex !== -1){
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            if (line.length > 0 && forwardedLines < MAX_FORWARDED_LINES_PER_STREAM) {
                forwardedLines++;
                const truncated = line.length > MAX_FORWARDED_LINE_LENGTH ? `${line.slice(0, MAX_FORWARDED_LINE_LENGTH)}…` : line;
                log[level]("plugin.output", {
                    name: pluginName,
                    line: truncated
                });
            }
            newlineIndex = buffer.indexOf("\n");
        }
    });
}
/**
 * Delete the generated host script synchronously. An async unlink loses the race
 * against process exit — under `node --test --test-force-exit` the runner exits
 * before the promise settles, leaking one temp .mjs per plugin load.
 */ function removeHostScript(path) {
    try {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["rmSync"])(path, {
            force: true
        });
    } catch  {
    // Best-effort: a leftover temp script is harmless; a throw from an exit handler is not.
    }
}
// ── Plugin host script (runs in child process over IPC) ──
// Uses process.send()/process.on("message") — NOT worker_threads.
// Written as .mjs to force ESM execution regardless of package.json.
const PLUGIN_HOST_SCRIPT = `
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);

// pathToFileURL: on Windows a bare absolute path ("C:\\\\...") makes import()
// throw ERR_UNSUPPORTED_ESM_URL_SCHEME ("C:" is parsed as a URL scheme), so no
// plugin could ever load. file:// URLs work on every platform.
const pluginPath = process.argv[2];
const plugin = await import(pathToFileURL(pluginPath).href);
const exports = plugin.default || plugin;

// Send ready signal
process.send({ type: "ready", hooks: Object.keys(exports).filter(k => typeof exports[k] === "function") });

// Handle messages from parent
process.on("message", async (msg) => {
  if (msg.type === "call") {
    try {
      const handler = exports[msg.hook];
      if (typeof handler !== "function") {
        process.send({ type: "result", id: msg.id, error: "Hook not found" });
        return;
      }
      const result = await handler(msg.payload);
      process.send({ type: "result", id: msg.id, result });
    } catch (err) {
      process.send({ type: "result", id: msg.id, error: err.message });
    }
  }
});
`;
async function loadPlugin(entryPoint, manifest) {
    // Integrity check: if the manifest declares an integrity field, verify the entry point.
    // Missing integrity is OK for backward compatibility; mismatched integrity is a fatal error.
    const integrityField = manifest.integrity;
    if (typeof integrityField === "string" && integrityField.length > 0) {
        let source;
        try {
            source = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["readFile"])(entryPoint, "utf-8");
        } catch (err) {
            throw new Error(`Plugin '${manifest.name}' integrity check failed: cannot read entry point — ${err instanceof Error ? err.message : String(err)}`);
        }
        const actual = computeIntegrity(source);
        if (actual !== integrityField) {
            throw new Error(`Plugin '${manifest.name}' integrity mismatch: expected ${integrityField}, got ${actual}`);
        }
    }
    const permissions = manifest.requires.permissions;
    // IMPORTANT-6: Write the host script with O_EXCL (wx flag) so the open fails if
    // anything already exists at that path, defeating symlink/pre-create races (TOCTOU).
    // mode 0o600 ensures no other OS user can read or replace the script.
    // On EEXIST collision (astronomically unlikely with UUID but theoretically possible),
    // retry once with a fresh UUID.
    let hostScriptPath;
    {
        // .mjs extension forces ESM execution regardless of package.json type field
        const tryWrite = async (id)=>{
            const p = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["tmpdir"])(), `omniroute-plugin-host-${id}.mjs`);
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["writeFile"])(p, PLUGIN_HOST_SCRIPT, {
                encoding: "utf-8",
                mode: 0o600,
                flag: "wx"
            });
            return p;
        };
        try {
            hostScriptPath = await tryWrite((0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])());
        } catch (err) {
            // EEXIST on a UUID path is a collision — retry once with a fresh UUID.
            if (err instanceof Error && err.code === "EEXIST") {
                hostScriptPath = await tryWrite((0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])());
            } else {
                throw err;
            }
        }
    }
    const env = {
        ...getFilteredEnv(permissions),
        PLUGIN_ENTRY: entryPoint,
        PLUGIN_NAME: manifest.name
    };
    const child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["spawn"])(process.execPath, [
        "--no-warnings",
        hostScriptPath,
        entryPoint
    ], {
        windowsHide: true,
        env,
        // #8395: stdout/stderr must be piped (not "ignore") so the plugin's own
        // console.log/console.error output — the SDK's documented logging pattern
        // (sdk.ts) — is observable on the parent side instead of discarded at the OS
        // level. See forwardChildOutput() below.
        stdio: [
            "ignore",
            "pipe",
            "pipe",
            "ipc"
        ]
    });
    forwardChildOutput(child.stdout, manifest.name, "info");
    forwardChildOutput(child.stderr, manifest.name, "error");
    // Track pending calls with timeout support
    const pendingCalls = new Map();
    let callCounter = 0;
    child.on("message", (msg)=>{
        if (msg.type === "ready") {
            log.info("loader.process_ready", {
                name: manifest.name,
                hooks: msg.hooks
            });
        } else if (msg.type === "result" && msg.id) {
            const pending = pendingCalls.get(msg.id);
            if (pending) {
                clearTimeout(pending.timer);
                pendingCalls.delete(msg.id);
                if (msg.error) {
                    pending.reject(new Error(msg.error));
                } else {
                    pending.resolve(msg.result);
                }
            }
        }
    });
    child.on("error", (err)=>{
        log.error("loader.process_error", {
            name: manifest.name,
            error: err.message
        });
    });
    child.on("exit", (code)=>{
        log.info("loader.process_exit", {
            name: manifest.name,
            code
        });
        for (const [, pending] of pendingCalls){
            clearTimeout(pending.timer);
            pending.reject(new Error(`Plugin process exited with code ${code}`));
        }
        pendingCalls.clear();
        removeHostScript(hostScriptPath);
    });
    // Call a hook in the child process with timeout + SIGTERM + SIGKILL escalation
    const callHook = (hook, payload, timeout = DEFAULT_HOOK_TIMEOUT)=>{
        return new Promise((resolve, reject)=>{
            const id = String(++callCounter);
            const timer = setTimeout(()=>{
                pendingCalls.delete(id);
                child.kill("SIGTERM");
                // Escalate to SIGKILL if plugin ignores SIGTERM
                const killTimer = setTimeout(()=>{
                    try {
                        child.kill("SIGKILL");
                    } catch  {}
                }, SIGKILL_GRACE_MS);
                child.once("exit", ()=>clearTimeout(killTimer));
                reject(new Error(`Plugin hook '${hook}' timed out after ${timeout}ms`));
            }, timeout);
            pendingCalls.set(id, {
                resolve,
                reject,
                timer
            });
            child.send({
                type: "call",
                id,
                hook,
                payload
            });
        });
    };
    // Build Plugin interface — only register hooks declared in the manifest.
    const plugin = {
        name: manifest.name,
        priority: 100,
        enabled: true
    };
    const registeredHooks = [];
    if (manifest.hooks.onRequest) {
        plugin.onRequest = async (ctx)=>{
            try {
                const result = await callHook("onRequest", ctx);
                return result;
            } catch (err) {
                log.error("plugin.onRequest_error", {
                    name: manifest.name,
                    error: err instanceof Error ? err.message : String(err)
                });
            }
        };
        registeredHooks.push("onRequest");
    }
    if (manifest.hooks.onResponse) {
        plugin.onResponse = async (ctx, response)=>{
            try {
                return await callHook("onResponse", {
                    ctx,
                    response
                });
            } catch (err) {
                log.error("plugin.onResponse_error", {
                    name: manifest.name,
                    error: err instanceof Error ? err.message : String(err)
                });
            }
        };
        registeredHooks.push("onResponse");
    }
    if (manifest.hooks.onError) {
        plugin.onError = async (ctx, error)=>{
            try {
                return await callHook("onError", {
                    ctx,
                    error: error.message
                });
            } catch (err) {
                log.error("plugin.onError_error", {
                    name: manifest.name,
                    error: err instanceof Error ? err.message : String(err)
                });
            }
        };
        registeredHooks.push("onError");
    }
    // ── Lifecycle hooks (fire-and-forget, errors logged but don't block) ──
    const lifecycleHooks = [
        {
            key: "onInstall",
            manifestFlag: manifest.hooks.onInstall
        },
        {
            key: "onActivate",
            manifestFlag: manifest.hooks.onActivate
        },
        {
            key: "onDeactivate",
            manifestFlag: manifest.hooks.onDeactivate
        },
        {
            key: "onUninstall",
            manifestFlag: manifest.hooks.onUninstall
        }
    ];
    for (const { key, manifestFlag } of lifecycleHooks){
        if (manifestFlag) {
            plugin[key] = async (payload)=>{
                try {
                    await callHook(key, payload);
                } catch (err) {
                    log.error(`plugin.${key}_error`, {
                        name: manifest.name,
                        error: err instanceof Error ? err.message : String(err)
                    });
                }
            };
            registeredHooks.push(key);
        }
    }
    log.info("loader.loaded", {
        name: manifest.name,
        hooks: registeredHooks,
        pid: child.pid
    });
    const cleanup = ()=>{
        child.kill("SIGTERM");
        // Escalate to SIGKILL after grace period
        const killTimer = setTimeout(()=>{
            try {
                child.kill("SIGKILL");
            } catch  {}
        }, SIGKILL_GRACE_MS);
        child.once("exit", ()=>clearTimeout(killTimer));
        removeHostScript(hostScriptPath);
        log.info("loader.cleanup", {
            name: manifest.name
        });
    };
    return {
        name: manifest.name,
        manifest,
        plugin,
        cleanup
    };
}
/**
 * Filter environment variables based on permissions.
 * Uses allowlist approach — only pass explicitly safe vars.
 */ function getFilteredEnv(permissions) {
    // SystemRoot/windir are not optional on Windows: node aborts during
    // InitializeOncePerProcessInternal ("Assertion failed: ncrypto::CSPRNG") before
    // running any script, because its CSPRNG lives under %SystemRoot%. Without these
    // the child dies instantly, every hook times out, and — hooks being fail-open —
    // plugins silently stop applying. They carry no secrets.
    const platformKeys = ("TURBOPACK compile-time truthy", 1) ? [
        "SystemRoot",
        "windir"
    ] : "TURBOPACK unreachable";
    const safeKeys = [
        "PATH",
        "HOME",
        "USER",
        "LANG",
        "LC_ALL",
        "NODE_ENV",
        ...platformKeys
    ];
    const extendedSafeKeys = [
        ...safeKeys,
        "PORT",
        "HOSTNAME",
        "TZ",
        "TMPDIR"
    ];
    const allowedKeys = permissions.includes("env") ? extendedSafeKeys : safeKeys;
    const env = {};
    for (const key of allowedKeys){
        if (process.env[key] !== undefined) env[key] = process.env[key];
    }
    return env;
}
}),
"[project]/src/lib/plugins/hooks.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BUILTIN_EVENTS",
    ()=>BUILTIN_EVENTS,
    "emitHook",
    ()=>emitHook,
    "emitHookBlocking",
    ()=>emitHookBlocking,
    "getActiveEvents",
    ()=>getActiveEvents,
    "getHooks",
    ()=>getHooks,
    "registerHook",
    ()=>registerHook,
    "resetHooks",
    ()=>resetHooks,
    "runOnError",
    ()=>runOnError,
    "runOnRequest",
    ()=>runOnRequest,
    "runOnResponse",
    ()=>runOnResponse,
    "unregisterHook",
    ()=>unregisterHook,
    "unregisterHooks",
    ()=>unregisterHooks
]);
/**
 * Custom hook registry — event-driven plugin hook system.
 *
 * Plugins can register handlers for any OmniRoute event. Built-in events
 * cover the full request lifecycle plus routing, rate limiting, and errors.
 *
 * @module plugins/hooks
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [app-route] (ecmascript)");
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"])("PLUGIN_HOOKS");
const BUILTIN_EVENTS = [
    "onRequest",
    "onResponse",
    "onError",
    "onInstall",
    "onActivate",
    "onDeactivate",
    "onUninstall"
];
// ── Rate limiting ──
const RATE_LIMIT_MAX = 100; // max calls per plugin per window
const RATE_LIMIT_WINDOW_MS = 1000; // 1 second window
const rateLimitMap = new Map();
function isRateLimited(pluginName) {
    const now = Date.now();
    const key = pluginName;
    const state = rateLimitMap.get(key);
    if (!state || now - state.windowStart >= RATE_LIMIT_WINDOW_MS) {
        // New window
        rateLimitMap.set(key, {
            count: 1,
            windowStart: now
        });
        return false;
    }
    state.count++;
    if (state.count > RATE_LIMIT_MAX) {
        return true;
    }
    return false;
}
// ── Registry ──
const hooks = new Map();
function registerHook(event, pluginName, handler, priority = 100) {
    if (!hooks.has(event)) {
        hooks.set(event, []);
    }
    const list = hooks.get(event);
    // Prevent duplicate registration
    if (list.some((r)=>r.pluginName === pluginName && r.handler === handler)) {
        return;
    }
    list.push({
        pluginName,
        handler,
        priority
    });
    list.sort((a, b)=>a.priority - b.priority);
    log.info("hook.registered", {
        event,
        pluginName,
        priority
    });
}
function unregisterHooks(pluginName) {
    for (const [event, list] of hooks.entries()){
        const before = list.length;
        const filtered = list.filter((r)=>r.pluginName !== pluginName);
        if (filtered.length !== before) {
            hooks.set(event, filtered);
            log.info("hook.unregistered", {
                event,
                pluginName,
                removed: before - filtered.length
            });
        }
    }
    // Evict rate-limit state so uninstalled plugins don't accumulate entries
    rateLimitMap.delete(pluginName);
}
function unregisterHook(event, pluginName) {
    const list = hooks.get(event);
    if (!list) return;
    const before = list.length;
    const filtered = list.filter((r)=>r.pluginName !== pluginName);
    hooks.set(event, filtered);
    if (before !== filtered.length) {
        log.info("hook.unregistered", {
            event,
            pluginName
        });
    }
}
async function emitHook(event, payload) {
    const list = hooks.get(event);
    if (!list || list.length === 0) return;
    for (const reg of list){
        if (isRateLimited(reg.pluginName)) {
            log.warn("hook.rate_limited", {
                event,
                pluginName: reg.pluginName
            });
            continue;
        }
        try {
            await reg.handler(payload);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            log.error("hook.handler_error", {
                event,
                pluginName: reg.pluginName,
                error: message
            });
        }
    }
}
async function emitHookBlocking(event, payload) {
    const list = hooks.get(event) || [];
    const ctx = payload || {};
    let mergedBody = ctx.body;
    let mergedMetadata = ctx.metadata || {};
    for (const reg of list){
        // Mirror emitHook: rate-limit the hot blocking path too
        if (isRateLimited(reg.pluginName)) {
            log.warn("hook.blocking_rate_limited", {
                event,
                pluginName: reg.pluginName
            });
            continue;
        }
        try {
            // Chain the payload: each handler must see the body/metadata as mutated by
            // previous handlers, not the original static payload — otherwise plugin B
            // can't observe plugin A's changes. (#3286)
            const currentPayload = {
                ...ctx,
                body: mergedBody,
                metadata: mergedMetadata
            };
            const result = await reg.handler(currentPayload);
            if (result && typeof result === "object") {
                if ("body" in result) mergedBody = result.body;
                if ("metadata" in result) mergedMetadata = {
                    ...mergedMetadata,
                    ...result.metadata || {}
                };
                if ("blocked" in result && result.blocked) {
                    return {
                        ...result,
                        body: result.body ?? mergedBody,
                        metadata: {
                            ...mergedMetadata,
                            ...result.metadata || {}
                        }
                    };
                }
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            log.error("hook.blocking_handler_error", {
                event,
                pluginName: reg.pluginName,
                error: message
            });
        }
    }
    return {
        body: mergedBody,
        metadata: mergedMetadata
    };
}
/**
 * Reload plugins left active in the DB, once per process.
 *
 * The `hooks` map above is module state and does not survive a restart, while the DB
 * keeps status='active' — so without this every active plugin silently stops applying
 * after a reboot while the UI still reports it as active. Hooks are fail-open, so a
 * plugin that exists to *block* traffic fails open.
 *
 * This lives on the request path on purpose. Booting it from instrumentation-node.ts
 * does not work: Next.js gives instrumentation its own module graph, so its `hooks` map
 * is a different instance from the one route handlers read. Verified — plugins loaded
 * there register into a copy nothing consults, and leak an unused child process.
 *
 * The import is dynamic because manager.ts imports this module.
 */ let pluginBoot = null;
function ensurePluginsLoaded() {
    if (!pluginBoot) {
        pluginBoot = (async ()=>{
            const { pluginManager } = await __turbopack_context__.A("[project]/src/lib/plugins/manager.ts [app-route] (ecmascript, async loader)");
            await pluginManager.loadAll();
        })().catch((err)=>{
            // Retry on the next request rather than wedging every later call.
            pluginBoot = null;
            log.error("hooks.boot_failed", {
                error: err instanceof Error ? err.message : String(err)
            });
        });
    }
    return pluginBoot;
}
async function runOnRequest(ctx) {
    await ensurePluginsLoaded();
    return emitHookBlocking("onRequest", ctx);
}
async function runOnResponse(ctx, response) {
    let currentResponse = response;
    const list = hooks.get("onResponse") || [];
    for (const reg of list){
        try {
            const result = await reg.handler({
                ...ctx,
                response: currentResponse
            });
            if (result !== undefined && result !== null && typeof result === "object" && "response" in result) {
                currentResponse = result.response;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            log.error("hook.response_handler_error", {
                pluginName: reg.pluginName,
                error: message
            });
        }
    }
    return currentResponse;
}
async function runOnError(ctx, error) {
    await emitHook("onError", {
        ...ctx,
        error
    });
}
function getHooks(event) {
    return hooks.get(event) ?? [];
}
function getActiveEvents() {
    return [
        ...hooks.entries()
    ].filter(([, list])=>list.length > 0).map(([event])=>event);
}
function resetHooks() {
    hooks.clear();
    rateLimitMap.clear();
}
}),
"[project]/src/lib/plugins/manager.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "compareSemver",
    ()=>compareSemver,
    "pluginManager",
    ()=>pluginManager
]);
/**
 * Plugin manager — lifecycle management for plugins.
 *
 * Singleton that coordinates scanner, loader, DB, and hook registry.
 * Handles install, activate, deactivate, uninstall, scan, and startup loading.
 *
 * @module plugins/manager
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$scanner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/plugins/scanner.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/plugins/loader.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$hooks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/plugins/hooks.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/plugins.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$scanner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$scanner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"])("PLUGIN_MANAGER");
function compareSemver(a, b) {
    // Strip optional pre-release suffix (e.g. "-beta", "-rc.1") before parsing
    const stripPreRelease = (v)=>v.replace(/-.*$/, "");
    const parse = (v)=>stripPreRelease(v).split(".").map((s)=>{
            const n = Number(s);
            return Number.isNaN(n) ? 0 : n;
        });
    const [aMaj, aMin, aPat] = parse(a);
    const [bMaj, bMin, bPat] = parse(b);
    if (aMaj !== bMaj) return aMaj - bMaj;
    if (aMin !== bMin) return aMin - bMin;
    return aPat - bPat;
}
// ── SECURITY: CRITICAL-2 ────────────────────────────────────────────────────
/**
 * Assert that `target` is strictly contained within `pluginRoot`.
 * Prevents a tampered/legacy DB `pluginDir` from causing deletion of an
 * arbitrary filesystem path when passed to `rm({ recursive: true })`.
 *
 * Throws immediately if `target` resolves outside `pluginRoot`.
 */ function assertWithinPluginDir(pluginRoot, target) {
    const root = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(pluginRoot);
    const t = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(target);
    if (t !== root && !t.startsWith(root + __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"])) {
        throw new Error(`Refusing to delete a path outside the plugin directory: "${t}" is not under "${root}"`);
    }
}
// ── SECURITY: CRITICAL-3 (shared) ──────────────────────────────────────────
/**
 * Assert that `entryPoint` is strictly within `destDir`.
 * Called at install/upgrade time to reject `manifest.main` values like
 * `"../../evil.js"` before the plugin is ever persisted to DB.
 *
 * Throws if the resolved entryPoint escapes `destDir`.
 */ function assertEntryPointWithinDest(destDir, entryPoint) {
    const root = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(destDir);
    const ep = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(entryPoint);
    if (!ep.startsWith(root + __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"])) {
        throw new Error(`Plugin manifest.main resolves outside plugin directory: "${ep}" escapes "${root}"`);
    }
}
class PluginManager {
    static instance;
    loadedPlugins = new Map();
    pluginDir;
    constructor(){
        this.pluginDir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$scanner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultPluginDir"])();
    }
    static getInstance() {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }
    /**
   * Install a plugin from a source directory.
   * Copies to a staging dir first, validates manifest.main containment, then
   * atomically renames into place. Cleans up staging dir on any failure.
   */ async install(sourceDir) {
        // Check if sourceDir itself contains plugin.json (direct plugin dir)
        const { safeValidateManifest } = await __turbopack_context__.A("[project]/src/lib/plugins/manifest.ts [app-route] (ecmascript, async loader)");
        const { readFile: readFileFs } = await __turbopack_context__.A("[externals]/fs/promises [external] (fs/promises, cjs, async loader)");
        let directPlugin = null;
        try {
            const manifestPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(sourceDir, "plugin.json");
            const raw = await readFileFs(manifestPath, "utf-8");
            const parsed = JSON.parse(raw);
            const result = safeValidateManifest(parsed);
            if (result.success) {
                const entryPoint = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(sourceDir, result.data.main);
                directPlugin = {
                    name: result.data.name,
                    manifest: result.data,
                    pluginDir: sourceDir,
                    entryPoint
                };
            }
        } catch  {}
        const { plugins, errors } = directPlugin ? {
            plugins: [
                directPlugin
            ],
            errors: []
        } : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$scanner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scanPluginDir"])(sourceDir);
        if (plugins.length === 0) {
            throw new Error(`No valid plugin found in ${sourceDir}: ${errors.map((e)=>e.error).join(", ")}`);
        }
        const discovered = plugins[0];
        const { name, manifest, pluginDir: srcDir } = discovered;
        // If already installed, auto-upgrade when source is strictly newer; reject otherwise.
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginExists"])(name)) {
            const existing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPluginByName"])(name);
            if (compareSemver(manifest.version, existing.version) > 0) {
                // Source is newer — delegate to upgrade()
                return this.upgrade(sourceDir);
            }
            throw new Error(`Plugin '${name}' is already installed (${existing.version}) and source version ${manifest.version} is not newer`);
        }
        // CRITICAL-3: Copy to staging dir first, validate, then rename atomically.
        const destDir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(this.pluginDir, name);
        const stagingDir = `${destDir}.staging-${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])()}`;
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["mkdir"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(destDir), {
            recursive: true
        });
        // Reaching here means the plugin is not DB-registered (the pluginExists()
        // guard above returns/throws otherwise). A destDir still present on disk is
        // therefore orphaned (e.g. a crash mid-uninstall left files behind) and would
        // make the atomic rename below fail with ENOTEMPTY — remove it first, guarded
        // by path containment so we never rm outside the plugin directory.
        assertWithinPluginDir(this.pluginDir, destDir);
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["rm"])(destDir, {
            recursive: true,
            force: true
        }).catch(()=>{});
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["cp"])(srcDir, stagingDir, {
            recursive: true
        });
        try {
            // CRITICAL-3: Validate manifest.main is within the staging dir before persisting.
            const entryPoint = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(stagingDir, manifest.main || "index.js");
            assertEntryPointWithinDest(stagingDir, entryPoint);
            // Atomic: rename staging → final dest
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["rename"])(stagingDir, destDir);
        } catch (err) {
            // Cleanup staging dir so no half-installed directory is left behind.
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["rm"])(stagingDir, {
                recursive: true,
                force: true
            }).catch(()=>{});
            throw err;
        }
        // Register in DB (destDir is now in place)
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["insertPlugin"])({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])(),
            name,
            version: manifest.version,
            description: manifest.description,
            author: manifest.author,
            license: manifest.license,
            main: manifest.main,
            source: manifest.source,
            tags: manifest.tags,
            manifest: manifest,
            configSchema: manifest.configSchema,
            hooks: [
                manifest.hooks.onRequest && "onRequest",
                manifest.hooks.onResponse && "onResponse",
                manifest.hooks.onError && "onError",
                manifest.hooks.onInstall && "onInstall",
                manifest.hooks.onActivate && "onActivate",
                manifest.hooks.onDeactivate && "onDeactivate",
                manifest.hooks.onUninstall && "onUninstall"
            ].filter(Boolean),
            permissions: manifest.requires.permissions,
            pluginDir: destDir,
            enabled: manifest.enabledByDefault
        });
        log.info("manager.installed", {
            name,
            version: manifest.version
        });
        // Fire onInstall lifecycle hook
        if (manifest.hooks.onInstall) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$hooks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["emitHook"])("onInstall", {
                name,
                version: manifest.version,
                manifest
            });
        }
        // Auto-activate if enabledByDefault
        if (manifest.enabledByDefault) {
            await this.activate(name);
        }
        return row;
    }
    /**
   * Upgrade an installed plugin to a newer version from sourceDir.
   * Preserves nothing (clean reinstall); config is reset to defaults.
   * Throws if the plugin is not installed or the source version is not strictly newer.
   *
   * Atomically: copy to staging → validate → rm old (containment-checked) → rename staging.
   * On any failure after staging copy, staging is cleaned up and old install is left intact.
   */ async upgrade(sourceDir) {
        // Scan source to get new manifest
        const { safeValidateManifest } = await __turbopack_context__.A("[project]/src/lib/plugins/manifest.ts [app-route] (ecmascript, async loader)");
        const { readFile: readFileFs } = await __turbopack_context__.A("[externals]/fs/promises [external] (fs/promises, cjs, async loader)");
        let discovered = null;
        // Try direct plugin dir first
        try {
            const manifestPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(sourceDir, "plugin.json");
            const raw = await readFileFs(manifestPath, "utf-8");
            const parsed = JSON.parse(raw);
            const result = safeValidateManifest(parsed);
            if (result.success) {
                discovered = {
                    name: result.data.name,
                    manifest: result.data,
                    pluginDir: sourceDir
                };
            }
        } catch  {}
        if (!discovered) {
            const { plugins, errors } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$scanner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scanPluginDir"])(sourceDir);
            if (plugins.length === 0) {
                throw new Error(`No valid plugin found in ${sourceDir}: ${errors.map((e)=>e.error).join(", ")}`);
            }
            discovered = plugins[0];
        }
        const { name, manifest } = discovered;
        // Must be already installed
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginExists"])(name)) {
            throw new Error(`Plugin '${name}' is not installed — use install() instead`);
        }
        const existing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPluginByName"])(name);
        // Source must be strictly newer
        if (compareSemver(manifest.version, existing.version) <= 0) {
            throw new Error(`Plugin '${name}' upgrade rejected: source version ${manifest.version} is not newer than installed ${existing.version}`);
        }
        log.info("manager.upgrading", {
            name,
            from: existing.version,
            to: manifest.version
        });
        // Deactivate if active before touching files
        if (existing.status === "active") {
            await this.deactivate(name);
        }
        // CRITICAL-3: Copy to staging dir first, validate manifest.main, then swap atomically.
        const destDir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(this.pluginDir, name);
        const stagingDir = `${destDir}.staging-${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])()}`;
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["mkdir"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(destDir), {
            recursive: true
        });
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["cp"])(discovered.pluginDir, stagingDir, {
            recursive: true
        });
        try {
            // CRITICAL-3: Validate manifest.main is within staging before we destroy old version.
            const entryPoint = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(stagingDir, manifest.main || "index.js");
            assertEntryPointWithinDest(stagingDir, entryPoint);
            // CRITICAL-2: Assert old install dir is within pluginDir before deleting it.
            assertWithinPluginDir(this.pluginDir, existing.pluginDir);
            // Only now remove old dir (after staging succeeded and was validated).
            try {
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["rm"])(existing.pluginDir, {
                    recursive: true,
                    force: true
                });
            } catch (err) {
                log.warn("manager.upgrade_dir_error", {
                    name,
                    error: err.message
                });
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deletePlugin"])(name);
            // Atomic rename staging → final dest
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["rename"])(stagingDir, destDir);
        } catch (err) {
            // Cleanup staging, leave old install intact.
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["rm"])(stagingDir, {
                recursive: true,
                force: true
            }).catch(()=>{});
            throw err;
        }
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["insertPlugin"])({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])(),
            name,
            version: manifest.version,
            description: manifest.description,
            author: manifest.author,
            license: manifest.license,
            main: manifest.main,
            source: manifest.source,
            tags: manifest.tags,
            manifest: manifest,
            configSchema: manifest.configSchema,
            hooks: [
                manifest.hooks.onRequest && "onRequest",
                manifest.hooks.onResponse && "onResponse",
                manifest.hooks.onError && "onError",
                manifest.hooks.onInstall && "onInstall",
                manifest.hooks.onActivate && "onActivate",
                manifest.hooks.onDeactivate && "onDeactivate",
                manifest.hooks.onUninstall && "onUninstall"
            ].filter(Boolean),
            permissions: manifest.requires.permissions,
            pluginDir: destDir,
            enabled: manifest.enabledByDefault
        });
        log.info("manager.upgraded", {
            name,
            version: manifest.version
        });
        if (manifest.enabledByDefault) {
            await this.activate(name);
        }
        return row;
    }
    /**
   * Activate a plugin — load into VM, register hooks, update DB.
   */ async activate(name) {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPluginByName"])(name);
        if (!row) throw new Error(`Plugin '${name}' not found`);
        // Guard on in-memory state, not DB status. DB status survives a restart but
        // loadedPlugins/hooks do not, so a DB-only check makes activate() a no-op for
        // every plugin already marked active — including the loadAll() boot path, whose
        // whole job is reloading exactly those. Hooks being fail-open, the plugin then
        // silently enforces nothing while the UI still reports it as active.
        if (row.status === "active" && this.loadedPlugins.has(name)) return;
        const manifest = JSON.parse(row.manifest);
        // Path traversal guard: use realpath to resolve symlinks
        const entryPoint = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(row.pluginDir, manifest.main);
        let resolvedPluginDir;
        try {
            resolvedPluginDir = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["realpath"])(row.pluginDir);
        } catch  {
            throw new Error(`Plugin directory '${row.pluginDir}' does not exist`);
        }
        const resolvedEntry = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["realpath"])(entryPoint).catch(()=>null);
        if (!resolvedEntry || !resolvedEntry.startsWith(resolvedPluginDir + __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"]) && resolvedEntry !== resolvedPluginDir) {
            throw new Error(`Plugin '${name}' entry point escapes plugin directory`);
        }
        try {
            const loaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$loader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadPlugin"])(entryPoint, manifest);
            const hookNames = [
                "onRequest",
                "onResponse",
                "onError",
                "onInstall",
                "onActivate",
                "onDeactivate",
                "onUninstall"
            ];
            for (const hookName of hookNames){
                const handler = loaded.plugin[hookName];
                if (typeof handler === "function") {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$hooks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerHook"])(hookName, name, handler);
                }
            }
            this.loadedPlugins.set(name, loaded);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updatePluginStatus"])(name, "active");
            // Fire onActivate lifecycle hook
            if (manifest.hooks.onActivate) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$hooks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["emitHook"])("onActivate", {
                    name,
                    version: manifest.version,
                    manifest
                });
            }
            log.info("manager.activated", {
                name
            });
        } catch (err) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updatePluginStatus"])(name, "error", err.message);
            log.error("manager.activate_failed", {
                name,
                error: err.message
            });
            throw err;
        }
    }
    /**
   * Deactivate a plugin — fire onDeactivate, unregister hooks, update DB.
   *
   * IMPORTANT: onDeactivate MUST fire BEFORE unregisterHooks(name) so the
   * plugin's own onDeactivate handler is still registered and can execute
   * cleanup logic. See PR #3473 review finding.
   */ async deactivate(name) {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPluginByName"])(name);
        const manifest = row ? JSON.parse(row.manifest) : null;
        // Fire onDeactivate lifecycle hook BEFORE unregistering — plugin's handlers
        // are still registered at this point so its own onDeactivate can run.
        if (manifest?.hooks.onDeactivate) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$hooks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["emitHook"])("onDeactivate", {
                name,
                version: manifest.version,
                manifest
            });
        }
        const loaded = this.loadedPlugins.get(name);
        if (loaded) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$hooks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unregisterHooks"])(name);
            loaded.cleanup();
            this.loadedPlugins.delete(name);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updatePluginStatus"])(name, "inactive");
        log.info("manager.deactivated", {
            name
        });
    }
    /**
   * Uninstall a plugin — deactivate, delete directory (containment-checked), remove from DB.
   */ async uninstall(name) {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPluginByName"])(name);
        if (!row) throw new Error(`Plugin '${name}' not found`);
        const manifest = JSON.parse(row.manifest);
        // Deactivate first if active
        if (row.status === "active") {
            await this.deactivate(name);
        }
        // Fire onUninstall lifecycle hook (before deleting files)
        if (manifest.hooks.onUninstall) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$hooks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["emitHook"])("onUninstall", {
                name,
                version: manifest.version,
                manifest
            });
        }
        // CRITICAL-2: Assert the pluginDir from DB is within our managed pluginDir root
        // before issuing a recursive delete. Prevents a tampered/legacy DB value from
        // causing deletion of an arbitrary path on the filesystem.
        assertWithinPluginDir(this.pluginDir, row.pluginDir);
        // Delete plugin directory
        try {
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["rm"])(row.pluginDir, {
                recursive: true,
                force: true
            });
        } catch (err) {
            log.warn("manager.uninstall_dir_error", {
                name,
                error: err.message
            });
        }
        // Remove from DB
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deletePlugin"])(name);
        log.info("manager.uninstalled", {
            name
        });
    }
    /**
   * Scan plugin directory and sync with DB.
   * Discovers new plugins and marks missing ones.
   */ async scan() {
        const { plugins, errors } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plugins$2f$scanner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scanPluginDir"])(this.pluginDir);
        // Register newly discovered plugins that aren't in DB
        for (const discovered of plugins){
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pluginExists"])(discovered.name)) {
                try {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["insertPlugin"])({
                        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])(),
                        name: discovered.name,
                        version: discovered.manifest.version,
                        description: discovered.manifest.description,
                        author: discovered.manifest.author,
                        license: discovered.manifest.license,
                        main: discovered.manifest.main,
                        source: discovered.manifest.source,
                        tags: discovered.manifest.tags,
                        manifest: discovered.manifest,
                        configSchema: discovered.manifest.configSchema,
                        hooks: [
                            discovered.manifest.hooks.onRequest && "onRequest",
                            discovered.manifest.hooks.onResponse && "onResponse",
                            discovered.manifest.hooks.onError && "onError",
                            discovered.manifest.hooks.onInstall && "onInstall",
                            discovered.manifest.hooks.onActivate && "onActivate",
                            discovered.manifest.hooks.onDeactivate && "onDeactivate",
                            discovered.manifest.hooks.onUninstall && "onUninstall"
                        ].filter(Boolean),
                        permissions: discovered.manifest.requires.permissions,
                        pluginDir: discovered.pluginDir,
                        enabled: discovered.manifest.enabledByDefault
                    });
                } catch (err) {
                    errors.push({
                        name: discovered.name,
                        error: `DB insert failed: ${err.message}`
                    });
                }
            }
        }
        return {
            discovered: plugins.length,
            errors
        };
    }
    /**
   * Load all active plugins on startup.
   */ async loadAll() {
        const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listPlugins"])("active");
        log.info("manager.loadAll", {
            count: rows.length
        });
        for (const row of rows){
            try {
                await this.activate(row.name);
            } catch (err) {
                log.error("manager.loadAll_failed", {
                    name: row.name,
                    error: err.message
                });
            }
        }
    }
    /**
   * Get a loaded plugin by name.
   */ getLoaded(name) {
        return this.loadedPlugins.get(name);
    }
    /**
   * List all plugins from DB.
   */ listAll() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listPlugins"])();
    }
    /**
   * Get plugin by name from DB.
   */ getPlugin(name) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPluginByName"])(name);
    }
}
const pluginManager = PluginManager.getInstance();
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/notion/api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotionAuthError",
    ()=>NotionAuthError,
    "NotionNotFoundError",
    ()=>NotionNotFoundError,
    "NotionRateLimitError",
    ()=>NotionRateLimitError,
    "NotionServerError",
    ()=>NotionServerError,
    "NotionTimeoutError",
    ()=>NotionTimeoutError,
    "NotionValidationError",
    ()=>NotionValidationError,
    "createNotionClient",
    ()=>createNotionClient
]);
const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2026-03-11";
const MAX_RETRIES = 3;
const TIMEOUT_MS = 55000;
class NotionAuthError extends Error {
    constructor(msg){
        super(msg);
        this.name = "NotionAuthError";
    }
}
class NotionNotFoundError extends Error {
    constructor(msg){
        super(msg);
        this.name = "NotionNotFoundError";
    }
}
class NotionRateLimitError extends Error {
    retryAfter;
    constructor(msg, retryAfter){
        super(msg);
        this.name = "NotionRateLimitError";
        this.retryAfter = retryAfter;
    }
}
class NotionValidationError extends Error {
    constructor(msg){
        super(msg);
        this.name = "NotionValidationError";
    }
}
class NotionServerError extends Error {
    constructor(msg){
        super(msg);
        this.name = "NotionServerError";
    }
}
class NotionTimeoutError extends Error {
    constructor(msg){
        super(msg);
        this.name = "NotionTimeoutError";
    }
}
function classifyNotionError(status, code, message) {
    switch(status){
        case 401:
            return new NotionAuthError(message);
        case 403:
            return new NotionAuthError(`Access denied: ${message}`);
        case 404:
            return new NotionNotFoundError(message);
        case 409:
            return new NotionValidationError(`Conflict: ${message}`);
        case 429:
            {
                const retryAfter = 1;
                const match = message.match(/retry after (\d+)/i) ?? message.match(/(\d+)/);
                const parsed = match ? parseInt(match[1], 10) : 1;
                return new NotionRateLimitError(message, Math.max(parsed, retryAfter));
            }
        case 400:
            return new NotionValidationError(message);
        default:
            if (status >= 500) return new NotionServerError(message);
            return new NotionValidationError(message);
    }
}
function sanitize(msg) {
    return msg.replace(/\s+at\s+\S+/g, "").replace(/\/[\w/.-]+\.[a-z]+\:\d+/g, "").slice(0, 4096);
}
async function notionFetch(path, apiKey, options = {}) {
    const url = `${NOTION_API_BASE}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), TIMEOUT_MS);
    const mergedSignal = options.signal ? combineSignals(options.signal, controller.signal) : controller.signal;
    let lastError = null;
    for(let attempt = 0; attempt < MAX_RETRIES; attempt++){
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Notion-Version": NOTION_VERSION,
                    "Content-Type": "application/json",
                    ...options.headers
                },
                signal: mergedSignal
            });
            if (!response.ok) {
                const body = await response.json().catch(()=>({}));
                const errBody = body;
                const code = errBody?.code ?? "unknown";
                const msg = errBody?.message ?? `HTTP ${response.status}`;
                const error = classifyNotionError(response.status, code, msg);
                if (error instanceof NotionRateLimitError) {
                    lastError = error;
                    const waitMs = error.retryAfter * 1000 + Math.pow(2, attempt) * 200;
                    await sleep(waitMs);
                    continue;
                }
                if (error instanceof NotionServerError && attempt < MAX_RETRIES - 1) {
                    lastError = error;
                    await sleep(Math.pow(2, attempt) * 500);
                    continue;
                }
                throw error;
            }
            return response.json();
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                clearTimeout(timeout);
                throw new NotionTimeoutError("Notion API request timed out after 55s");
            }
            if (err instanceof NotionAuthError || err instanceof NotionNotFoundError || err instanceof NotionValidationError) {
                clearTimeout(timeout);
                throw err;
            }
            if (attempt < MAX_RETRIES - 1) {
                lastError = err instanceof Error ? err : new NotionServerError(String(err));
                await sleep(Math.pow(2, attempt) * 500);
                continue;
            }
        }
    }
    clearTimeout(timeout);
    throw lastError ?? new NotionServerError("Exhausted all retries");
}
function combineSignals(...signals) {
    const controller = new AbortController();
    for (const signal of signals){
        if (signal.aborted) {
            controller.abort(signal.reason);
            return controller.signal;
        }
        signal.addEventListener("abort", ()=>controller.abort(signal.reason), {
            once: true
        });
    }
    return controller.signal;
}
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
function createNotionClient(apiKey) {
    const client = {
        async searchPagesAndDatabases (query, startCursor, pageSize = 20) {
            const body = {
                query,
                page_size: Math.min(pageSize, 100),
                filter: {
                    value: "page",
                    property: "object"
                }
            };
            if (startCursor) body.start_cursor = startCursor;
            return notionFetch("/search", apiKey, {
                method: "POST",
                body: JSON.stringify(body)
            });
        },
        async getPage (pageId) {
            return notionFetch(`/pages/${pageId}`, apiKey);
        },
        async listBlockChildren (blockId, startCursor, pageSize = 50) {
            const params = new URLSearchParams();
            params.set("page_size", String(Math.min(pageSize, 100)));
            if (startCursor) params.set("start_cursor", startCursor);
            return notionFetch(`/blocks/${blockId}/children?${params}`, apiKey);
        },
        async queryDatabase (databaseId, filter, sorts, startCursor, pageSize = 50) {
            const body = {
                page_size: Math.min(pageSize, 100)
            };
            if (filter) body.filter = filter;
            if (sorts) body.sorts = sorts;
            if (startCursor) body.start_cursor = startCursor;
            return notionFetch(`/databases/${databaseId}/query`, apiKey, {
                method: "POST",
                body: JSON.stringify(body)
            });
        },
        async getDatabase (databaseId) {
            return notionFetch(`/databases/${databaseId}`, apiKey);
        },
        async appendBlocks (blockId, children, after) {
            const body = {
                children: children.slice(0, 100)
            };
            if (after) body.after = after;
            return notionFetch(`/blocks/${blockId}/children`, apiKey, {
                method: "PATCH",
                body: JSON.stringify(body)
            });
        }
    };
    return client;
}
}),
"[project]/src/lib/obsidian/api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ObsidianAuthError",
    ()=>ObsidianAuthError,
    "ObsidianNotFoundError",
    ()=>ObsidianNotFoundError,
    "ObsidianServerError",
    ()=>ObsidianServerError,
    "ObsidianTimeoutError",
    ()=>ObsidianTimeoutError,
    "createObsidianClient",
    ()=>createObsidianClient,
    "createSyncServerClient",
    ()=>createSyncServerClient,
    "getSyncToken",
    ()=>getSyncToken,
    "setSyncToken",
    ()=>setSyncToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
;
const DEFAULT_OBSIDIAN_BASE_URL = "http://127.0.0.1:27123";
const MAX_RETRIES = 2;
const TIMEOUT_MS = 30000;
class ObsidianAuthError extends Error {
    constructor(msg){
        super(msg);
        this.name = "ObsidianAuthError";
    }
}
class ObsidianNotFoundError extends Error {
    constructor(msg){
        super(msg);
        this.name = "ObsidianNotFoundError";
    }
}
class ObsidianServerError extends Error {
    constructor(msg){
        super(msg);
        this.name = "ObsidianServerError";
    }
}
class ObsidianTimeoutError extends Error {
    constructor(msg){
        super(msg);
        this.name = "ObsidianTimeoutError";
    }
}
function classifyObsidianError(status, message) {
    switch(status){
        case 401:
        case 403:
            return new ObsidianAuthError(message);
        case 404:
            return new ObsidianNotFoundError(message);
        default:
            if (status >= 500) return new ObsidianServerError(message);
            return new Error(`Obsidian API error (${status}): ${message}`);
    }
}
function obsidianFetch(path, apiKey, baseUrl, options = {}) {
    const url = `${baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), TIMEOUT_MS);
    const mergedSignal = options.signal ? combineSignals(options.signal, controller.signal) : controller.signal;
    let lastError = null;
    const attempt = async (retryCount)=>{
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    ...options.headers
                },
                signal: mergedSignal
            });
            clearTimeout(timeout);
            if (!response.ok) {
                const body = await response.json().catch(()=>({}));
                const msg = body?.message ?? `HTTP ${response.status}`;
                const error = classifyObsidianError(response.status, msg);
                if (error instanceof ObsidianServerError && retryCount < MAX_RETRIES - 1) {
                    lastError = error;
                    await sleep(Math.pow(2, retryCount) * 200);
                    return attempt(retryCount + 1);
                }
                throw error;
            }
            const ct = response.headers.get("content-type") ?? "";
            if (ct.includes("application/json")) {
                return response.json();
            }
            return response.text();
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                clearTimeout(timeout);
                throw new ObsidianTimeoutError("Obsidian API request timed out after 30s");
            }
            if (err instanceof ObsidianAuthError || err instanceof ObsidianNotFoundError) {
                clearTimeout(timeout);
                throw err;
            }
            if (err instanceof TypeError && err.message === "fetch failed") {
                clearTimeout(timeout);
                throw new ObsidianServerError(`Cannot reach Obsidian at ${baseUrl}. Ensure the Local REST API plugin is running ` + `and using the correct port. The REST API uses HTTP on port 27123 — do not use ` + `port 27124 (that is a separate MCP endpoint with HTTPS). If connecting via ` + `Tailscale, use http://<tailscale-ip>:27123.`);
            }
            if (retryCount < MAX_RETRIES - 1) {
                lastError = err instanceof Error ? err : new ObsidianServerError(String(err));
                await sleep(Math.pow(2, retryCount) * 200);
                return attempt(retryCount + 1);
            }
            clearTimeout(timeout);
            throw err;
        }
    };
    return attempt(0);
}
function combineSignals(...signals) {
    const controller = new AbortController();
    for (const signal of signals){
        if (signal.aborted) {
            controller.abort(signal.reason);
            return controller.signal;
        }
        signal.addEventListener("abort", ()=>controller.abort(signal.reason), {
            once: true
        });
    }
    return controller.signal;
}
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
function encodePath(segments) {
    return segments.split("/").map(encodeURIComponent).join("/");
}
function createObsidianClient(apiKey, baseUrl) {
    const resolvedBaseUrl = baseUrl ?? DEFAULT_OBSIDIAN_BASE_URL;
    const client = {
        async checkStatus () {
            return obsidianFetch("/", apiKey, resolvedBaseUrl);
        },
        async searchSimple (query, contextLength = 100) {
            const params = new URLSearchParams();
            params.set("query", query);
            params.set("contextLength", String(contextLength));
            return obsidianFetch(`/search/simple/?${params}`, apiKey, resolvedBaseUrl, {
                method: "POST"
            });
        },
        async searchStructured (jsonLogic) {
            return obsidianFetch("/search/", apiKey, resolvedBaseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/vnd.olrapi.jsonlogic+json"
                },
                body: JSON.stringify(jsonLogic)
            });
        },
        async readNote (path, targetType, target) {
            const headers = {};
            if (targetType) headers["Target-Type"] = targetType;
            if (target) headers["Target"] = encodeURIComponent(target);
            return obsidianFetch(`/vault/${encodePath(path)}`, apiKey, resolvedBaseUrl, {
                headers
            });
        },
        async listVault (path = "") {
            const suffix = path ? `/${encodePath(path)}/` : "/";
            return obsidianFetch(`/vault${suffix}`, apiKey, resolvedBaseUrl);
        },
        async getDocumentMap (path) {
            return obsidianFetch(`/vault/${encodePath(path)}`, apiKey, resolvedBaseUrl, {
                headers: {
                    Accept: "application/vnd.olrapi.document-map+json"
                }
            });
        },
        async getNoteMetadata (path) {
            return obsidianFetch(`/vault/${encodePath(path)}`, apiKey, resolvedBaseUrl, {
                headers: {
                    Accept: "application/vnd.olrapi.note+json"
                }
            });
        },
        async getActiveFile () {
            return obsidianFetch("/active/", apiKey, resolvedBaseUrl);
        },
        async getPeriodicNote (period, year, month, day) {
            let url;
            if (year && month && day) {
                url = `/periodic/${period}/${year}/${month}/${day}/`;
            } else {
                url = `/periodic/${period}/`;
            }
            return obsidianFetch(url, apiKey, resolvedBaseUrl);
        },
        async getTags () {
            return obsidianFetch("/tags/", apiKey, resolvedBaseUrl);
        },
        async commandList () {
            return obsidianFetch("/commands/", apiKey, resolvedBaseUrl);
        },
        async writeNote (path, content) {
            await obsidianFetch(`/vault/${encodePath(path)}`, apiKey, resolvedBaseUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "text/markdown"
                },
                body: content
            });
        },
        async appendNote (path, content, targetType, target) {
            const headers = {
                "Content-Type": "text/markdown"
            };
            if (targetType) headers["Target-Type"] = targetType;
            if (target) headers["Target"] = encodeURIComponent(target);
            await obsidianFetch(`/vault/${encodePath(path)}`, apiKey, resolvedBaseUrl, {
                method: "POST",
                headers,
                body: content
            });
        },
        async patchNote (path, operation, targetType, target, content, createTargetIfMissing = false) {
            const headers = {
                Operation: operation,
                "Target-Type": targetType,
                Target: encodeURIComponent(target),
                "Content-Type": "text/markdown"
            };
            if (createTargetIfMissing) headers["Create-Target-If-Missing"] = "true";
            return obsidianFetch(`/vault/${encodePath(path)}`, apiKey, resolvedBaseUrl, {
                method: "PATCH",
                headers,
                body: content
            });
        },
        async deleteNote (path) {
            await obsidianFetch(`/vault/${encodePath(path)}`, apiKey, resolvedBaseUrl, {
                method: "DELETE"
            });
        },
        async moveNote (path, destination) {
            await obsidianFetch(`/vault/${encodePath(path)}`, apiKey, resolvedBaseUrl, {
                method: "MOVE",
                headers: {
                    Destination: encodeURIComponent(destination)
                }
            });
        },
        async executeCommand (commandId) {
            await obsidianFetch(`/commands/${encodeURIComponent(commandId)}/`, apiKey, resolvedBaseUrl, {
                method: "POST"
            });
        },
        async openFile (path) {
            await obsidianFetch(`/open/${encodePath(path)}`, apiKey, resolvedBaseUrl, {
                method: "POST"
            });
        }
    };
    return client;
}
const DEFAULT_SYNC_SERVER_URL = "http://127.0.0.1:27781";
const SYNC_TOKEN_KEY = "omniroute_sync_token";
function getSyncToken() {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get("sync", SYNC_TOKEN_KEY);
        return typeof row?.value === "string" ? JSON.parse(row.value) : null;
    } catch  {
        return null;
    }
}
function setSyncToken(token) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        if (token === null) {
            db.prepare("DELETE FROM key_value WHERE namespace = ? AND key = ?").run("sync", SYNC_TOKEN_KEY);
        } else {
            const existing = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get("sync", SYNC_TOKEN_KEY);
            if (existing) {
                db.prepare("UPDATE key_value SET value = ? WHERE namespace = ? AND key = ?").run(JSON.stringify(token), "sync", SYNC_TOKEN_KEY);
            } else {
                db.prepare("INSERT INTO key_value (namespace, key, value) VALUES (?, ?, ?)").run("sync", SYNC_TOKEN_KEY, JSON.stringify(token));
            }
        }
    } catch  {}
}
function createSyncServerClient(syncToken, baseUrl) {
    const resolvedBaseUrl = baseUrl ?? DEFAULT_SYNC_SERVER_URL;
    async function request(path, init) {
        const res = await fetch(`${resolvedBaseUrl}${path}`, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                ...syncToken ? {
                    Authorization: `Bearer ${syncToken}`
                } : {},
                ...init?.headers
            }
        });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Sync server ${res.status}: ${body}`);
        }
        return res.json();
    }
    return {
        async getStatus () {
            return request("/vault/sync/status");
        },
        async triggerSync () {
            return request("/vault/sync/trigger", {
                method: "POST"
            });
        },
        async getConflicts () {
            return request("/vault/sync/conflicts");
        },
        async resolveConflict (path, resolution) {
            return request("/vault/sync/resolve", {
                method: "POST",
                body: JSON.stringify({
                    path,
                    resolution
                })
            });
        }
    };
}
}),
"[project]/src/lib/localCorpus/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocalCorpusIndex",
    ()=>LocalCorpusIndex,
    "canonicalizeLocalCorpusRoot",
    ()=>canonicalizeLocalCorpusRoot,
    "getDefaultLocalCorpusStatus",
    ()=>getDefaultLocalCorpusStatus
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const DEFAULT_ALLOWED_EXTENSIONS = new Set([
    ".cfg",
    ".csv",
    ".geojson",
    ".htm",
    ".html",
    ".ini",
    ".js",
    ".json",
    ".jsonl",
    ".jsx",
    ".log",
    ".md",
    ".mjs",
    ".ps1",
    ".py",
    ".sh",
    ".sql",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml"
]);
const DENIED_PATH_SEGMENTS = new Set([
    ".build",
    ".codex",
    ".env",
    ".git",
    ".next",
    ".omniroute",
    ".ssh",
    "coverage",
    "dist",
    "node_modules",
    "secrets"
]);
const DEFAULT_MAX_FILES = 5_000;
const DEFAULT_MAX_FILE_BYTES = 1_048_576;
const DEFAULT_MAX_TOTAL_BYTES = 67_108_864;
const DEFAULT_MAX_READ_LINES = 400;
const DEFAULT_CHUNK_CHARS = 4_000;
const DEFAULT_STALE_MS = 30_000;
const MAX_SEARCH_RESULTS = 20;
const MAX_SNIPPET_CHARS = 1_200;
function positiveInteger(value, fallback) {
    return Number.isInteger(value) && Number(value) > 0 ? Number(value) : fallback;
}
function resolveLimits(input) {
    return {
        maxFiles: positiveInteger(input.maxFiles, DEFAULT_MAX_FILES),
        maxFileBytes: positiveInteger(input.maxFileBytes, DEFAULT_MAX_FILE_BYTES),
        maxTotalBytes: positiveInteger(input.maxTotalBytes, DEFAULT_MAX_TOTAL_BYTES),
        maxReadLines: positiveInteger(input.maxReadLines, DEFAULT_MAX_READ_LINES),
        chunkChars: positiveInteger(input.chunkChars, DEFAULT_CHUNK_CHARS),
        staleMs: positiveInteger(input.staleMs, DEFAULT_STALE_MS),
        allowedExtensions: input.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS
    };
}
function normalizeRelativePath(relativePath) {
    return relativePath.split(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].sep).join("/");
}
function hasDeniedSegment(relativePath) {
    return relativePath.split(/[\\/]+/).filter(Boolean).some((segment)=>DENIED_PATH_SEGMENTS.has(segment.toLowerCase()));
}
function isContained(root, candidate) {
    const relative = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].relative(root, candidate);
    return relative !== "" && !relative.startsWith("..") && !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].isAbsolute(relative);
}
function isAllowedExtension(filePath, allowedExtensions) {
    return allowedExtensions.has(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].extname(filePath).toLowerCase());
}
function buildChunks(content, maxChars) {
    const lines = content.split(/\r?\n/);
    const chunks = [];
    let current = [];
    let currentChars = 0;
    let startLine = 1;
    const flush = (endLine)=>{
        if (current.length === 0) return;
        const chunkContent = current.join("\n");
        chunks.push({
            content: chunkContent,
            normalizedContent: chunkContent.toLowerCase(),
            startLine,
            endLine
        });
        current = [];
        currentChars = 0;
    };
    for(let index = 0; index < lines.length; index++){
        const line = lines[index];
        const lineNumber = index + 1;
        if (line.length > maxChars) {
            flush(lineNumber - 1);
            for(let offset = 0; offset < line.length; offset += maxChars){
                const part = line.slice(offset, offset + maxChars);
                chunks.push({
                    content: part,
                    normalizedContent: part.toLowerCase(),
                    startLine: lineNumber,
                    endLine: lineNumber
                });
            }
            startLine = lineNumber + 1;
            continue;
        }
        const nextChars = currentChars + line.length + (current.length > 0 ? 1 : 0);
        if (current.length > 0 && nextChars > maxChars) {
            flush(lineNumber - 1);
            startLine = lineNumber;
        }
        current.push(line);
        currentChars += line.length + (current.length > 1 ? 1 : 0);
    }
    flush(lines.length);
    return chunks;
}
function scoreChunk(chunk, query, tokens) {
    let score = 0;
    const exactIndex = chunk.normalizedContent.indexOf(query);
    if (exactIndex >= 0) score += 100;
    for (const token of tokens){
        let tokenMatches = 0;
        let cursor = 0;
        while(tokenMatches < 10){
            const index = chunk.normalizedContent.indexOf(token, cursor);
            if (index < 0) break;
            tokenMatches++;
            cursor = index + token.length;
        }
        if (tokenMatches === 0) return 0;
        score += tokenMatches;
    }
    return score;
}
function createSnippet(content, query, tokens) {
    const normalized = content.toLowerCase();
    let matchIndex = normalized.indexOf(query);
    if (matchIndex < 0) matchIndex = normalized.indexOf(tokens[0]);
    if (matchIndex < 0) matchIndex = 0;
    const half = Math.floor(MAX_SNIPPET_CHARS / 2);
    const start = Math.max(0, matchIndex - half);
    const end = Math.min(content.length, start + MAX_SNIPPET_CHARS);
    const prefix = start > 0 ? "…" : "";
    const suffix = end < content.length ? "…" : "";
    return `${prefix}${content.slice(start, end).trim()}${suffix}`;
}
async function canonicalizeLocalCorpusRoot(inputPath) {
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].isAbsolute(inputPath)) {
        throw new Error("Local corpus root must be an absolute directory path");
    }
    let canonical;
    let stat;
    try {
        canonical = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].realpath(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(inputPath));
        stat = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].stat(canonical);
    } catch  {
        throw new Error("Local corpus root is not accessible");
    }
    if (!stat.isDirectory()) {
        throw new Error("Local corpus root must point to a directory");
    }
    return canonical;
}
class LocalCorpusIndex {
    configuredRoot;
    limits;
    canonicalRoot = null;
    files = new Map();
    lastIndexedAt = null;
    truncated = false;
    refreshPromise = null;
    constructor(rootPath, limits = {}){
        this.configuredRoot = rootPath;
        this.limits = resolveLimits(limits);
    }
    async getRoot() {
        const canonical = await canonicalizeLocalCorpusRoot(this.configuredRoot);
        if (this.canonicalRoot && this.canonicalRoot !== canonical) {
            this.files.clear();
            this.lastIndexedAt = null;
        }
        this.canonicalRoot = canonical;
        return canonical;
    }
    async collectCandidates(root) {
        const candidates = [];
        const directories = [
            root
        ];
        let indexedBytes = 0;
        let skippedFiles = 0;
        let truncated = false;
        while(directories.length > 0){
            const directory = directories.pop();
            if (!directory) break;
            let entries;
            try {
                entries = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readdir(directory, {
                    withFileTypes: true
                });
            } catch  {
                skippedFiles++;
                continue;
            }
            entries.sort((left, right)=>left.name.localeCompare(right.name));
            for (const entry of entries){
                if (entry.isSymbolicLink()) {
                    skippedFiles++;
                    continue;
                }
                const absolutePath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(directory, entry.name);
                const relativePath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].relative(root, absolutePath);
                if (!relativePath || hasDeniedSegment(relativePath)) {
                    skippedFiles++;
                    continue;
                }
                if (entry.isDirectory()) {
                    directories.push(absolutePath);
                    continue;
                }
                if (!entry.isFile() || !isAllowedExtension(entry.name, this.limits.allowedExtensions)) {
                    skippedFiles++;
                    continue;
                }
                if (candidates.length >= this.limits.maxFiles) {
                    truncated = true;
                    skippedFiles++;
                    continue;
                }
                let stat;
                try {
                    stat = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].stat(absolutePath);
                } catch  {
                    skippedFiles++;
                    continue;
                }
                if (stat.size > this.limits.maxFileBytes) {
                    skippedFiles++;
                    continue;
                }
                if (indexedBytes + stat.size > this.limits.maxTotalBytes) {
                    truncated = true;
                    skippedFiles++;
                    continue;
                }
                indexedBytes += stat.size;
                candidates.push({
                    absolutePath,
                    relativePath: normalizeRelativePath(relativePath),
                    bytes: stat.size,
                    mtimeMs: stat.mtimeMs
                });
            }
        }
        candidates.sort((left, right)=>left.relativePath.localeCompare(right.relativePath));
        return {
            candidates,
            skippedFiles,
            truncated
        };
    }
    async performRefresh() {
        const root = await this.getRoot();
        const { candidates, skippedFiles, truncated } = await this.collectCandidates(root);
        const nextFiles = new Map();
        let changedFiles = 0;
        let unchangedFiles = 0;
        let readErrors = 0;
        for (const candidate of candidates){
            const existing = this.files.get(candidate.relativePath);
            if (existing && existing.bytes === candidate.bytes && existing.mtimeMs === candidate.mtimeMs) {
                nextFiles.set(candidate.relativePath, existing);
                unchangedFiles++;
                continue;
            }
            try {
                const content = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readFile(candidate.absolutePath, "utf8");
                if (content.includes("\0")) {
                    readErrors++;
                    continue;
                }
                nextFiles.set(candidate.relativePath, {
                    relativePath: candidate.relativePath,
                    bytes: candidate.bytes,
                    mtimeMs: candidate.mtimeMs,
                    sha256: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(content).digest("hex"),
                    chunks: buildChunks(content, this.limits.chunkChars)
                });
                changedFiles++;
            } catch  {
                readErrors++;
            }
        }
        const deletedFiles = Array.from(this.files.keys()).filter((key)=>!nextFiles.has(key)).length;
        this.files = nextFiles;
        this.lastIndexedAt = Date.now();
        this.truncated = truncated;
        const status = this.getStatus();
        return {
            configured: true,
            source: status.source ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].basename(root),
            indexedFiles: status.indexedFiles,
            indexedBytes: status.indexedBytes,
            chunks: status.chunks,
            changedFiles,
            unchangedFiles,
            deletedFiles,
            skippedFiles,
            readErrors,
            truncated,
            lastIndexedAt: status.lastIndexedAt ?? new Date(this.lastIndexedAt).toISOString()
        };
    }
    async refresh() {
        if (!this.refreshPromise) {
            this.refreshPromise = this.performRefresh().finally(()=>{
                this.refreshPromise = null;
            });
        }
        return this.refreshPromise;
    }
    getStatus() {
        const indexedFiles = this.files.size;
        const indexedBytes = Array.from(this.files.values()).reduce((total, file)=>total + file.bytes, 0);
        const chunks = Array.from(this.files.values()).reduce((total, file)=>total + file.chunks.length, 0);
        return {
            configured: true,
            source: this.canonicalRoot ? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].basename(this.canonicalRoot) : null,
            indexedFiles,
            indexedBytes,
            chunks,
            truncated: this.truncated,
            lastIndexedAt: this.lastIndexedAt === null ? null : new Date(this.lastIndexedAt).toISOString(),
            limits: {
                maxFiles: this.limits.maxFiles,
                maxFileBytes: this.limits.maxFileBytes,
                maxTotalBytes: this.limits.maxTotalBytes,
                maxReadLines: this.limits.maxReadLines
            }
        };
    }
    async search(query, options = {}) {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) throw new Error("Local corpus search query is required");
        const stale = this.lastIndexedAt === null || Date.now() - this.lastIndexedAt >= this.limits.staleMs;
        if (options.refresh === true || stale) await this.refresh();
        const tokens = Array.from(new Set(normalizedQuery.split(/\s+/).filter(Boolean)));
        const limit = Math.min(positiveInteger(options.limit, 10), MAX_SEARCH_RESULTS);
        const results = [];
        for (const file of this.files.values()){
            for (const chunk of file.chunks){
                const score = scoreChunk(chunk, normalizedQuery, tokens);
                if (score === 0) continue;
                results.push({
                    relativePath: file.relativePath,
                    startLine: chunk.startLine,
                    endLine: chunk.endLine,
                    score,
                    snippet: createSnippet(chunk.content, normalizedQuery, tokens)
                });
            }
        }
        results.sort((left, right)=>right.score - left.score || left.relativePath.localeCompare(right.relativePath) || left.startLine - right.startLine);
        return {
            query: query.trim(),
            results: results.slice(0, limit),
            status: this.getStatus()
        };
    }
    async read(inputPath, options = {}) {
        if (!inputPath || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].isAbsolute(inputPath) || hasDeniedSegment(inputPath)) {
            throw new Error("Local corpus file path must be a permitted relative path");
        }
        if (!isAllowedExtension(inputPath, this.limits.allowedExtensions)) {
            throw new Error("Local corpus file type is not permitted");
        }
        const root = await this.getRoot();
        const resolved = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(root, inputPath);
        if (!isContained(root, resolved)) {
            throw new Error("Local corpus file path escapes the configured root");
        }
        let linkStat;
        try {
            linkStat = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].lstat(resolved);
        } catch  {
            throw new Error("Local corpus file is not accessible");
        }
        if (linkStat.isSymbolicLink() || !linkStat.isFile()) {
            throw new Error("Local corpus path must point to a regular file");
        }
        if (linkStat.size > this.limits.maxFileBytes) {
            throw new Error("Local corpus file exceeds the configured read limit");
        }
        let canonicalFile;
        try {
            canonicalFile = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].realpath(resolved);
        } catch  {
            throw new Error("Local corpus file is not accessible");
        }
        if (!isContained(root, canonicalFile)) {
            throw new Error("Local corpus file path escapes the configured root");
        }
        let content;
        try {
            content = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readFile(canonicalFile, "utf8");
        } catch  {
            throw new Error("Local corpus file is not accessible");
        }
        if (content.includes("\0")) throw new Error("Local corpus file is not valid text");
        const lines = content.split(/\r?\n/);
        const requestedStart = positiveInteger(options.startLine, 1);
        const requestedEnd = positiveInteger(options.endLine, requestedStart + this.limits.maxReadLines - 1);
        if (requestedEnd < requestedStart) {
            throw new Error("Local corpus endLine must be greater than or equal to startLine");
        }
        const startLine = Math.min(requestedStart, Math.max(lines.length, 1));
        const endLine = Math.min(lines.length, requestedEnd, startLine + this.limits.maxReadLines - 1);
        return {
            relativePath: normalizeRelativePath(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].relative(root, canonicalFile)),
            content: lines.slice(startLine - 1, endLine).join("\n"),
            startLine,
            endLine,
            totalLines: lines.length,
            truncated: startLine > 1 || endLine < lines.length
        };
    }
}
function getDefaultLocalCorpusStatus() {
    const limits = resolveLimits({});
    return {
        configured: false,
        source: null,
        indexedFiles: 0,
        indexedBytes: 0,
        chunks: 0,
        truncated: false,
        lastIndexedAt: null,
        limits: {
            maxFiles: limits.maxFiles,
            maxFileBytes: limits.maxFileBytes,
            maxTotalBytes: limits.maxTotalBytes,
            maxReadLines: limits.maxReadLines
        }
    };
}
}),
"[project]/src/lib/localCorpus/configured.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConfiguredLocalCorpusStatus",
    ()=>getConfiguredLocalCorpusStatus,
    "readConfiguredLocalCorpus",
    ()=>readConfiguredLocalCorpus,
    "resetLocalCorpusIndex",
    ()=>resetLocalCorpusIndex,
    "searchConfiguredLocalCorpus",
    ()=>searchConfiguredLocalCorpus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$localCorpus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/localCorpus.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localCorpus$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/localCorpus/index.ts [app-route] (ecmascript)");
;
;
let sharedRoot = null;
let sharedIndex = null;
function resetLocalCorpusIndex() {
    sharedRoot = null;
    sharedIndex = null;
}
function getConfiguredIndex() {
    const rootPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$localCorpus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLocalCorpusRoot"])();
    if (!rootPath) {
        throw new Error("Local corpus is not configured. Set a root in Settings > Context Sources");
    }
    if (!sharedIndex || sharedRoot !== rootPath) {
        sharedRoot = rootPath;
        sharedIndex = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localCorpus$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LocalCorpusIndex"](rootPath);
    }
    return sharedIndex;
}
function getConfiguredLocalCorpusStatus() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$localCorpus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLocalCorpusRoot"])() ? getConfiguredIndex().getStatus() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localCorpus$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultLocalCorpusStatus"])();
}
async function searchConfiguredLocalCorpus(query, options = {}) {
    return getConfiguredIndex().search(query, options);
}
async function readConfiguredLocalCorpus(relativePath, options = {}) {
    return getConfiguredIndex().read(relativePath, options);
}
}),
"[project]/src/lib/api/internalServiceAuth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INTERNAL_SERVICE_AUTH_HEADER",
    ()=>INTERNAL_SERVICE_AUTH_HEADER,
    "getInternalServiceAuthHeaders",
    ()=>getInternalServiceAuthHeaders,
    "isInternalServiceRequest",
    ()=>isInternalServiceRequest,
    "isTrustedLoopbackInternalServiceRequest",
    ()=>isTrustedLoopbackInternalServiceRequest
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/headers.ts [app-route] (ecmascript)");
;
;
;
const INTERNAL_SERVICE_AUTH_HEADER = "x-omniroute-internal-service-token";
function configuredToken() {
    const inlineToken = process.env.OMNIROUTE_INTERNAL_SERVICE_TOKEN?.trim();
    if (inlineToken) return inlineToken;
    const tokenFile = process.env.OMNIROUTE_INTERNAL_SERVICE_TOKEN_FILE?.trim();
    if (!tokenFile) return "";
    try {
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(tokenFile, "utf8").trim();
    } catch  {
        return "";
    }
}
function getInternalServiceAuthHeaders() {
    const token = configuredToken();
    return token ? {
        [INTERNAL_SERVICE_AUTH_HEADER]: token
    } : {};
}
function isInternalServiceRequest(request) {
    const expected = configuredToken();
    const provided = request.headers.get(INTERNAL_SERVICE_AUTH_HEADER)?.trim() || "";
    if (!expected || !provided || expected.length !== provided.length) return false;
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(Buffer.from(provided, "utf8"), Buffer.from(expected, "utf8"));
}
function isTrustedLoopbackInternalServiceRequest(request) {
    return request.headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_PEER_LOCALITY"]) === "loopback" && isInternalServiceRequest(request);
}
}),
"[project]/src/lib/api/errorResponse.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createErrorResponse",
    ()=>createErrorResponse,
    "createErrorResponseFromUnknown",
    ()=>createErrorResponseFromUnknown
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
function createErrorResponse(payload) {
    const requestId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
    const resolvedType = payload.type || (payload.status >= 500 ? "server_error" : payload.status === 404 ? "not_found" : payload.status === 409 ? "conflict" : "invalid_request");
    return Response.json({
        error: {
            message: payload.message,
            type: resolvedType,
            details: payload.details
        },
        requestId
    }, {
        status: payload.status
    });
}
function createErrorResponseFromUnknown(error, fallbackMessage = "Unexpected server error") {
    const anyError = error;
    const status = Number(anyError?.status) || 500;
    return createErrorResponse({
        status,
        message: typeof anyError?.message === "string" ? anyError.message : fallbackMessage,
        type: anyError?.type,
        details: anyError?.details
    });
}
}),
"[project]/src/lib/api/requireManagementAuth.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "hasManageScope",
    ()=>hasManageScope,
    "requireManagementAuth",
    ()=>requireManagementAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/apiAuth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$errorResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api/errorResponse.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2f$cliTokenAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/middleware/cliTokenAuth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$accessTokenAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/accessTokenAuth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$internalServiceAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api/internalServiceAuth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$managementScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/managementScopes.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
function hasManageScope(scopes = []) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$managementScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasManageScope"])(scopes);
}
function invalidManagementTokenResponse(options) {
    const status = options.invalidApiKeyStatus ?? 403;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$errorResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])({
        status,
        message: status === 401 ? "Invalid API key" : "Invalid management token",
        type: "invalid_request"
    });
}
async function requireManagementAuth(request, options = {}) {
    if (!options.alwaysRequireAuth && !await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAuthRequired"])(request)) {
        return null;
    }
    if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$apiAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDashboardSessionAuthenticated"])(request)) {
        return null;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$internalServiceAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTrustedLoopbackInternalServiceRequest"])(request)) {
        return null;
    }
    // CLI machine-id token allows localhost CLI access without an explicit API key.
    if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2f$cliTokenAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCliTokenAuthValid"])(request)) {
        return null;
    }
    // Scoped CLI access token (remote mode). Intercepted BEFORE the API-key branch:
    // these `oma_` tokens are management/CLI credentials, not inference API keys,
    // and would otherwise be rejected by isValidApiKey. Same shared evaluation the
    // central managementPolicy uses (no drift). Dashboard JWT, the loopback CLI
    // token, and manage-scope API keys remain full-access above/below.
    const accessVerdict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$accessTokenAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateAccessTokenAuth"])(request);
    switch(accessVerdict.kind){
        case "ok":
            return null;
        case "error":
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$errorResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])({
                status: 503,
                message: "Service temporarily unavailable",
                type: "server_error"
            });
        case "invalid":
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$errorResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])({
                status: 401,
                message: "Invalid or expired access token",
                type: "invalid_request"
            });
        case "insufficient":
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$errorResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])({
                status: 403,
                message: `Access token scope '${accessVerdict.have}' is insufficient; '${accessVerdict.need}' required.`,
                type: "invalid_request"
            });
        case "absent":
            break; // no oma_ token → fall through to API-key auth
    }
    // Management auth never honours a URL-borne credential (header-only) — a token
    // in the path/query must not authenticate a management route. See #3300 follow-up.
    const apiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractApiKey"])(request, {
        allowUrl: false
    });
    if (apiKey) {
        let meta;
        try {
            if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isValidApiKey"])(apiKey)) {
                return invalidManagementTokenResponse(options);
            }
            meta = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getApiKeyMetadata"])(apiKey);
        } catch  {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$errorResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])({
                status: 503,
                message: "Service temporarily unavailable",
                type: "server_error"
            });
        }
        if (meta && hasManageScope(meta.scopes)) return null;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$errorResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])({
            status: 403,
            message: "API key lacks 'manage' scope. Enable it in the API Keys dashboard.",
            type: "invalid_request"
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$errorResponse$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])({
        status: 401,
        message: "Authentication required",
        type: "invalid_request"
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/machineToken.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getLegacyCliTokenSync",
    ()=>getLegacyCliTokenSync,
    "getMachineTokenSync",
    ()=>getMachineTokenSync
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
let machineIdSync;
try {
    // Use require() to bypass webpack static analysis that breaks the default export
    const mod = __turbopack_context__.r("[externals]/node-machine-id [external] (node-machine-id, cjs, [project]/node_modules/node-machine-id)");
    machineIdSync = mod.machineIdSync || mod.default?.machineIdSync;
} catch  {
    machineIdSync = ()=>"";
}
const BUILTIN_DEFAULT_SALT = "omniroute-cli-auth-v1";
function getActiveSalt() {
    return process.env.OMNIROUTE_CLI_SALT || BUILTIN_DEFAULT_SALT;
}
function deriveToken(rawId, salt) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])("sha256", rawId).update(salt).digest("hex");
}
let cached = null;
let cachedSalt = null;
function getMachineTokenSync(salt) {
    const activeSalt = salt ?? getActiveSalt();
    try {
        // machineIdSync(true) returns the original unhashed hardware ID.
        const rawId = machineIdSync(true);
        if (activeSalt === cachedSalt && cached !== null) return cached;
        const token = deriveToken(rawId, activeSalt);
        if (!salt) {
            cached = token;
            cachedSalt = activeSalt;
        }
        return token;
    } catch  {
        return "";
    }
}
function getLegacyCliTokenSync(salt) {
    const activeSalt = salt ?? getActiveSalt();
    try {
        const machineId = machineIdSync();
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(machineId + activeSalt).digest("hex").substring(0, 32);
    } catch  {
        return "";
    }
}
}),
"[project]/src/lib/middleware/cliTokenAuth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isCliTokenAuthValid",
    ()=>isCliTokenAuthValid,
    "isLoopback",
    ()=>isLoopback
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$machineToken$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/machineToken.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/headers.ts [app-route] (ecmascript)");
;
;
;
;
const HEADER_NAME = "x-omniroute-cli-token";
function isLoopback(ip) {
    const normalized = ip.replace(/^::ffff:/, "");
    return normalized === "127.0.0.1" || normalized === "::1" || normalized === "localhost";
}
/**
 * Read a header value preferring the Request's own headers (works in any
 * context — App Router request handlers, unit tests, raw fetch) and falling
 * back to `next/headers` only when the request object isn't carrying them.
 *
 * Calling `headers()` outside a request scope throws (see Next.js
 * `next-dynamic-api-wrong-context`), so we guard the import.
 */ async function readHeader(request, name) {
    const fromRequest = request.headers?.get(name);
    if (fromRequest != null) return fromRequest;
    try {
        const hdrs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["headers"])();
        return hdrs.get(name);
    } catch  {
        return null;
    }
}
function firstHeaderIp(value) {
    return value?.split(",")[0]?.trim() || null;
}
function requestPeerAddress(request) {
    return request.ip || request.socket?.remoteAddress || null;
}
async function isLocalCliRequest(request) {
    // 1. Direct / non-middleware callers (raw Node, unit tests) may carry a real
    //    socket peer.
    const peerAddress = requestPeerAddress(request);
    if (peerAddress) return isLoopback(peerAddress);
    // 2. A forwarded request came through a proxy → it is not a local CLI call.
    const forwardedPeer = firstHeaderIp(await readHeader(request, "cf-connecting-ip")) || firstHeaderIp(await readHeader(request, "x-forwarded-for")) || firstHeaderIp(await readHeader(request, "x-real-ip"));
    if (forwardedPeer) return false;
    // 3. Behind the authz pipeline, trust ONLY the locality verdict the middleware
    //    stamped from the real TCP peer IP. NEVER derive locality from the Host
    //    header (new URL(request.url).hostname) — it is client-controlled, so a
    //    remote caller with a stolen CLI token could send Host: 127.0.0.1 to pass.
    const locality = await readHeader(request, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AUTHZ_HEADER_PEER_LOCALITY"]);
    if (locality !== null) return locality === "loopback";
    // 4. No trusted locality signal → fail closed.
    return false;
}
async function isCliTokenAuthValid(request) {
    if (process.env.OMNIROUTE_DISABLE_CLI_TOKEN === "true") return false;
    const token = await readHeader(request, HEADER_NAME);
    if (!token) return false;
    if (!await isLocalCliRequest(request)) return false;
    const expectedTokens = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$machineToken$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMachineTokenSync"])(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$machineToken$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLegacyCliTokenSync"])()
    ].filter(Boolean);
    return expectedTokens.some((expected)=>{
        if (token.length !== expected.length) return false;
        try {
            return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].timingSafeEqual(Buffer.from(token, "utf8"), Buffer.from(expected, "utf8"));
        } catch  {
            return false;
        }
    });
}
}),
"[project]/src/lib/accessTokens/scopes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * CLI access-token scopes — the 3-level hierarchy used by remote mode.
 *
 * These tokens authorize the `omniroute` CLI (and dashboard) to run *management*
 * commands against a (possibly remote) OmniRoute server. They are distinct from
 * inference API keys (`api_keys`), which authorize `/v1/chat/completions` traffic.
 *
 * Hierarchy (admin ⊃ write ⊃ read):
 *   - read  : list/inspect only (models list, providers status, logs, usage, cost)
 *   - write : read + configure/apply (setup-codex, keys add, config set, combo edit)
 *   - admin : write + sensitive management (tokens create/revoke, providers add,
 *             services install/start, policy, oauth)
 *
 * Loopback-only routes that spawn processes (`isLocalOnlyPath`) are NEVER reachable
 * by a remote token regardless of scope — that enforcement happens before auth.
 */ __turbopack_context__.s([
    "ACCESS_SCOPES",
    ()=>ACCESS_SCOPES,
    "isAccessScope",
    ()=>isAccessScope,
    "normalizeScope",
    ()=>normalizeScope,
    "scopeSatisfies",
    ()=>scopeSatisfies
]);
const ACCESS_SCOPES = [
    "read",
    "write",
    "admin"
];
/** Numeric rank for hierarchy comparisons. Higher = more privileged. */ const SCOPE_RANK = {
    read: 1,
    write: 2,
    admin: 3
};
function isAccessScope(value) {
    return typeof value === "string" && ACCESS_SCOPES.includes(value);
}
function scopeSatisfies(have, need) {
    if (!isAccessScope(have)) return false;
    return SCOPE_RANK[have] >= SCOPE_RANK[need];
}
function normalizeScope(value, fallback = "read") {
    return isAccessScope(value) ? value : fallback;
}
}),
];

//# sourceMappingURL=src_lib_0095ljw._.js.map