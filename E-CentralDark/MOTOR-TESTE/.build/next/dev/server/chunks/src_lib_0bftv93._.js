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
"[project]/src/lib/oauth/services/kiro.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KiroService",
    ()=>KiroService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/constants/oauth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/kiroExternalIdp.ts [instrumentation] (ecmascript)");
;
;
/**
 * Kiro OAuth Service
 * Supports multiple authentication methods:
 * 1. AWS Builder ID (Device Code Flow)
 * 2. AWS IAM Identity Center/IDC (Device Code Flow)
 * 3. Google/GitHub Social Login (Authorization Code Flow + Manual Callback)
 * 4. Import Token (Manual refresh token paste)
 */ const KIRO_AUTH_SERVICE = "https://prod.us-east-1.auth.desktop.kiro.dev";
class KiroService {
    /**
   * Register OIDC client with AWS SSO
   * Returns clientId and clientSecret for device code flow
   */ async registerClient(region = "us-east-1") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        const endpoint = `https://oidc.${region}.amazonaws.com/client/register`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                clientName: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["KIRO_CONFIG"].clientName,
                clientType: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["KIRO_CONFIG"].clientType,
                scopes: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["KIRO_CONFIG"].scopes,
                grantTypes: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["KIRO_CONFIG"].grantTypes,
                issuerUrl: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["KIRO_CONFIG"].issuerUrl
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to register client: ${error}`);
        }
        const data = await response.json();
        return {
            clientId: data.clientId,
            clientSecret: data.clientSecret,
            clientSecretExpiresAt: data.clientSecretExpiresAt
        };
    }
    /**
   * Start device authorization for AWS Builder ID or IDC
   */ async startDeviceAuthorization(clientId, clientSecret, startUrl, region = "us-east-1") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        const endpoint = `https://oidc.${region}.amazonaws.com/device_authorization`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                clientId,
                clientSecret,
                startUrl
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to start device authorization: ${error}`);
        }
        const data = await response.json();
        return {
            deviceCode: data.deviceCode,
            userCode: data.userCode,
            verificationUri: data.verificationUri,
            verificationUriComplete: data.verificationUriComplete,
            expiresIn: data.expiresIn,
            interval: data.interval || 5
        };
    }
    /**
   * Poll for token using device code (AWS Builder ID/IDC)
   */ async pollDeviceToken(clientId, clientSecret, deviceCode, region = "us-east-1") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        const endpoint = `https://oidc.${region}.amazonaws.com/token`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                clientId,
                clientSecret,
                deviceCode,
                grantType: "urn:ietf:params:oauth:grant-type:device_code"
            })
        });
        const data = await response.json();
        // Handle pending/slow_down/errors
        if (!response.ok || data.error) {
            return {
                success: false,
                error: data.error,
                errorDescription: data.error_description,
                pending: data.error === "authorization_pending" || data.error === "slow_down"
            };
        }
        return {
            success: true,
            tokens: {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresIn: data.expiresIn,
                tokenType: data.tokenType
            }
        };
    }
    /**
   * Build Google/GitHub social login URL
   * Returns authorization URL for manual callback flow
   * Uses kiro:// custom protocol as required by AWS Cognito whitelist
   */ buildSocialLoginUrl(provider, codeChallenge, state) {
        const idp = provider === "google" ? "Google" : "Github";
        // AWS Cognito only whitelists kiro:// protocol, not localhost
        const redirectUri = "kiro://kiro.kiroAgent/authenticate-success";
        return `${KIRO_AUTH_SERVICE}/login?idp=${idp}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}&prompt=select_account`;
    }
    /**
   * Exchange authorization code for tokens (Social Login)
   * Must use same redirect_uri as authorization request
   */ async exchangeSocialCode(code, codeVerifier) {
        // Must match the redirect_uri used in buildSocialLoginUrl
        const redirectUri = "kiro://kiro.kiroAgent/authenticate-success";
        const response = await fetch(`${KIRO_AUTH_SERVICE}/oauth/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Token exchange failed: ${error}`);
        }
        const data = await response.json();
        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            profileArn: data.profileArn,
            expiresIn: data.expiresIn || 3600
        };
    }
    /**
   * Refresh token using refresh token
   */ async refreshToken(refreshToken, providerSpecificData = {}) {
        const { authMethod, clientId, clientSecret, region } = providerSpecificData;
        // Enterprise / Microsoft Entra "Your organization" (external_idp) login: refresh with a
        // standard public-client OAuth2 refresh_token grant against the org IdP's tokenEndpoint
        // (form-encoded client_id + refresh_token + scope, no client_secret). The AWS SSO OIDC and
        // Kiro social endpoints cannot refresh these tokens.
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isExternalIdpAuthMethod"])(authMethod)) {
            const refreshRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildExternalIdpRefreshParams"])(refreshToken, providerSpecificData);
            const response = await fetch(refreshRequest.tokenEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json"
                },
                body: refreshRequest.body
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Token refresh failed: ${error}`);
            }
            const data = await response.json();
            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token || refreshToken,
                expiresIn: data.expires_in || 3600
            };
        }
        // AWS SSO OIDC refresh (Builder ID or IDC).
        // Imported social tokens (authMethod === "imported") have a registered clientId/clientSecret
        // but a Kiro-social refresh token the OIDC client can't refresh — use the social path (#2467).
        if (clientId && clientSecret && authMethod !== "imported") {
            const resolvedRegion = region || "us-east-1";
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(resolvedRegion);
            const endpoint = `https://oidc.${resolvedRegion}.amazonaws.com/token`;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    clientId,
                    clientSecret,
                    refreshToken,
                    grantType: "refresh_token"
                })
            });
            if (!response.ok) {
                // Client credentials may be expired or invalid (DB import, TTL, browser conflict).
                // Re-register a fresh OIDC client and retry once before giving up (#2524).
                console.warn("[kiro refresh] OIDC refresh failed, attempting client re-registration...");
                try {
                    const newReg = await this.registerClient(resolvedRegion);
                    const retryRes = await fetch(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            clientId: newReg.clientId,
                            clientSecret: newReg.clientSecret,
                            refreshToken,
                            grantType: "refresh_token"
                        })
                    });
                    if (retryRes.ok) {
                        const retryData = await retryRes.json();
                        return {
                            accessToken: retryData.accessToken,
                            refreshToken: retryData.refreshToken || refreshToken,
                            expiresIn: retryData.expiresIn || 3600,
                            _newClientId: newReg.clientId,
                            _newClientSecret: newReg.clientSecret,
                            _newClientSecretExpiresAt: newReg.clientSecretExpiresAt
                        };
                    } else {
                        const retryError = await retryRes.text();
                        throw new Error(`Token refresh retry failed after re-registration: ${retryError}`);
                    }
                } catch (reRegErr) {
                    if (reRegErr.message?.includes("Token refresh retry failed")) throw reRegErr;
                    console.warn("[kiro refresh] Re-registration fallback failed:", reRegErr);
                }
                const error = await response.text();
                throw new Error(`Token refresh failed: ${error}`);
            }
            const data = await response.json();
            return {
                // Builder ID / IDC OIDC refresh: no profileArn (the social path supplies
                // one; Builder ID connections legitimately have none). expiresIn falls
                // back to 3600 so the import route never computes Date(NaN) if upstream
                // omits it (the social path already guards the same way).
                accessToken: data.accessToken,
                refreshToken: data.refreshToken || refreshToken,
                expiresIn: data.expiresIn || 3600
            };
        }
        // Social auth refresh (Google/GitHub)
        const response = await fetch(`${KIRO_AUTH_SERVICE}/refreshToken`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                refreshToken
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Token refresh failed: ${error}`);
        }
        const data = await response.json();
        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || refreshToken,
            profileArn: data.profileArn,
            expiresIn: data.expiresIn || 3600
        };
    }
    /**
   * Validate and import refresh token.
   * First attempts to validate using cached AWS SSO client credentials (Builder ID path).
   * If that fails or no cached credentials exist, registers a dedicated OIDC client.
   * If registerClient() also fails, the import falls back to the shared social-auth refresh path.
   */ async validateImportToken(refreshToken, region = "us-east-1", clientIdHint) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        // Validate token format
        if (!refreshToken.startsWith("aorAAAAAG")) {
            throw new Error("Invalid token format. Token should start with aorAAAAAG...");
        }
        // Try to read cached clientId/clientSecret from AWS SSO cache (Builder ID tokens).
        // When the caller knows the token's own clientId (#1253 — e.g. surfaced by
        // auto-import from a direct `clientId` field on the token file), pass it
        // through so the cache lookup can match it exactly instead of guessing via
        // region + latest-expiry, which can silently adopt an unrelated stale
        // client registration on hosts with multiple cached SSO sessions.
        const cachedClient = await this.readCachedClientCredentials(region, clientIdHint);
        // Attempt 1: Try Builder ID refresh using cached credentials
        if (cachedClient) {
            try {
                const result = await this.refreshToken(refreshToken, {
                    clientId: cachedClient.clientId,
                    clientSecret: cachedClient.clientSecret,
                    authMethod: "builder-id",
                    // Forward the requested region so a non-us-east-1 Builder ID validates
                    // against the right OIDC endpoint instead of defaulting to us-east-1.
                    region
                });
                return {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken || refreshToken,
                    // profileArn is intentionally absent for Builder ID (OIDC) imports —
                    // only the social-auth path returns one, and Builder ID connections
                    // don't require it. The Kiro executor adds profileArn conditionally.
                    profileArn: result.profileArn,
                    expiresIn: result.expiresIn,
                    authMethod: "builder-id",
                    clientId: cachedClient.clientId,
                    clientSecret: cachedClient.clientSecret
                };
            } catch  {
            // Cached credentials didn't work, fall through
            }
        }
        // Attempt 2: Try social auth refresh
        let result;
        try {
            result = await this.refreshToken(refreshToken);
        } catch (error) {
            throw new Error(`Token validation failed: ${error.message}`);
        }
        // Register an independent OIDC client for this connection so multiple accounts
        // do not share a single Kiro backend session (issue #2328).
        let clientId;
        let clientSecret;
        let clientSecretExpiresAt;
        try {
            const registration = await this.registerClient(region);
            clientId = registration.clientId;
            clientSecret = registration.clientSecret;
            clientSecretExpiresAt = registration.clientSecretExpiresAt;
        } catch (err) {
            console.warn("[kiro import] registerClient failed, continuing without isolated client:", err);
        }
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken || refreshToken,
            profileArn: result.profileArn,
            expiresIn: result.expiresIn,
            authMethod: "imported",
            ...clientId ? {
                clientId,
                clientSecret,
                clientSecretExpiresAt
            } : {}
        };
    }
    /**
   * Read clientId/clientSecret from AWS SSO cache (for Builder ID tokens).
   * The cache is located at ~/.aws/sso/cache/ and contains JSON files from
   * the OIDC client registration step of the device code flow.
   */ async readCachedClientCredentials(region, clientIdHint) {
        try {
            const { readdir, readFile } = await __turbopack_context__.A("[externals]/fs/promises [external] (fs/promises, cjs, async loader)");
            const { homedir } = await __turbopack_context__.A("[externals]/os [external] (os, cjs, async loader)");
            const { join } = await __turbopack_context__.A("[externals]/path [external] (path, cjs, async loader)");
            const cachePath = join(homedir(), ".aws", "sso", "cache");
            const files = await readdir(cachePath);
            const candidates = [];
            for (const file of files){
                if (!file.endsWith(".json")) continue;
                try {
                    const content = await readFile(join(cachePath, file), "utf-8");
                    const data = JSON.parse(content);
                    if (data.clientId && data.clientSecret) {
                        candidates.push({
                            clientId: data.clientId,
                            clientSecret: data.clientSecret,
                            region: data.region,
                            expiresAt: data.clientSecretExpiresAt || data.expiresAt
                        });
                    }
                } catch  {
                    continue;
                }
            }
            if (candidates.length === 0) return null;
            // When the caller knows the token's own clientId (#1253), an exact match
            // is authoritative — it identifies the one registration that can actually
            // refresh this token, regardless of region or expiry. Falling through to
            // the region/latest-expiry heuristic below for an unmatched hint would
            // silently adopt an unrelated (and non-working) client pair.
            if (clientIdHint) {
                const exactMatch = candidates.find((c)=>c.clientId === clientIdHint);
                if (exactMatch) {
                    return {
                        clientId: exactMatch.clientId,
                        clientSecret: exactMatch.clientSecret
                    };
                }
            }
            // A host can cache OIDC client registrations for several SSO sessions;
            // adopting the wrong pair makes the Builder ID refresh fail. Prefer a
            // registration whose region matches the requested import region, then —
            // among the candidates — the one with the latest secret expiry, instead
            // of blindly taking the first file readdir happens to return.
            const byLatestExpiry = (a, b)=>String(b.expiresAt || "").localeCompare(String(a.expiresAt || ""));
            const matching = region ? candidates.filter((c)=>c.region === region) : [];
            const ordered = (matching.length > 0 ? matching : candidates).slice().sort(byLatestExpiry);
            const best = ordered[0];
            return {
                clientId: best.clientId,
                clientSecret: best.clientSecret
            };
        } catch  {
        // Cache not available
        }
        return null;
    }
    /**
   * List available CodeWhisperer profiles for an access token or long-lived API key.
   * Some long-lived API keys can call GenerateAssistantResponse but are explicitly
   * denied on ListAvailableProfiles, so callers must treat an AccessDenied profile
   * lookup as an optional discovery failure rather than a hard auth failure.
   */ async listAvailableProfiles(accessToken, region = "us-east-1") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        const endpoint = region === "us-east-1" ? "https://codewhisperer.us-east-1.amazonaws.com" : `https://q.${region}.amazonaws.com`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/x-amz-json-1.0",
                "x-amz-target": "AmazonCodeWhispererService.ListAvailableProfiles",
                Accept: "application/json",
                tokentype: "API_KEY"
            },
            body: JSON.stringify({
                maxResults: 10
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to list profiles: ${error}`);
        }
        const data = await response.json();
        const profiles = Array.isArray(data?.profiles) ? data.profiles : [];
        const arnOf = (profile)=>profile?.arn || profile?.profileArn || null;
        const match = profiles.find((profile)=>String(arnOf(profile) || "").includes(`:${region}:`)) || profiles[0];
        return arnOf(match);
    }
    /**
   * Normalize a long-lived Kiro/CodeWhisperer API key.
   */ async validateApiKey(apiKey, regionInput) {
        // Default kept OUT of the parameter list: check-public-creds' CRED_KEY_RE matches the
        // `apiKey:` annotation and flags any string literal in the signature (fn-param FP class).
        const region = regionInput || "us-east-1";
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        const accessToken = apiKey.trim();
        if (!accessToken) {
            throw new Error("API key is required");
        }
        let profileArn = null;
        try {
            profileArn = await this.listAvailableProfiles(accessToken, region);
        } catch (error) {
            const message = String(error?.message || error || "");
            const isApiKeyProfileDenied = message.includes("AccessDeniedException") && message.includes("API key authentication is not supported for this operation");
            if (!isApiKeyProfileDenied) {
                throw error;
            }
        }
        return {
            accessToken,
            refreshToken: null,
            profileArn,
            region,
            authMethod: "api_key"
        };
    }
    /**
   * Fetch user email from access token (optional, for display)
   */ extractEmailFromJWT(accessToken) {
        try {
            const parts = accessToken.split(".");
            if (parts.length !== 3) return null;
            // Decode payload (add padding if needed)
            let payload = parts[1];
            while(payload.length % 4){
                payload += "=";
            }
            const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
            return decoded.email || decoded.preferred_username || decoded.sub;
        } catch  {
            return null;
        }
    }
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
"[project]/src/lib/cloudAgent/julesApi.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Jules REST API base — https://developers.google.com/jules/api */ __turbopack_context__.s([
    "JULES_API_BASE_URL",
    ()=>JULES_API_BASE_URL,
    "buildJulesApiUrl",
    ()=>buildJulesApiUrl
]);
const JULES_API_BASE_URL = "https://jules.googleapis.com/v1alpha";
function buildJulesApiUrl(path) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${JULES_API_BASE_URL}${normalized}`;
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
"[project]/src/lib/tokenHealthCheckCopilot.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshGithubCopilotSubTokenIfNeeded",
    ()=>refreshGithubCopilotSubTokenIfNeeded
]);
// @ts-nocheck
/**
 * GitHub Copilot sub-token refresh helper for the proactive token health check.
 *
 * GitHub Copilot issues a short-lived (~30 min) API token separate from the
 * GitHub OAuth token. After a successful OAuth refresh, the health check must
 * also refresh this sub-token before it expires mid-session. The Copilot
 * token expiry is stored in providerSpecificData.copilotTokenExpiresAt (Unix
 * seconds). Extracted out of tokenHealthCheck.ts to keep that file under the
 * frozen file-size budget (see config/quality/file-size-baseline.json).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/copilot.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function refreshGithubCopilotSubTokenIfNeeded(params) {
    const { conn, result, proxyConfig, healthCheckLog, log, logWarn, logError, getConnectionLogLabel, logPrefix } = params;
    if (String(conn.provider || "").toLowerCase() !== "github") return;
    // Re-read the latest connection after the OAuth refresh (onPersist may have updated it).
    const latestConn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnectionById"])(conn.id).catch(()=>null) || conn;
    const accessTokenForCopilot = result.accessToken || latestConn.accessToken;
    if (!accessTokenForCopilot) return;
    const copilotExpiresAtRaw = latestConn.providerSpecificData?.copilotTokenExpiresAt ?? conn.providerSpecificData?.copilotTokenExpiresAt;
    const copilotExpiresAtMs = typeof copilotExpiresAtRaw === "number" && copilotExpiresAtRaw < 1e12 ? copilotExpiresAtRaw * 1000 // Unix seconds → ms
     : typeof copilotExpiresAtRaw === "string" ? new Date(copilotExpiresAtRaw).getTime() : typeof copilotExpiresAtRaw === "number" ? copilotExpiresAtRaw : 0;
    const copilotAboutToExpire = !copilotExpiresAtMs || copilotExpiresAtMs - Date.now() < 5 * 60 * 1000;
    if (!copilotAboutToExpire) return;
    log(`${logPrefix} Refreshing GitHub Copilot sub-token for ${getConnectionLogLabel(conn)}`);
    try {
        const copilotResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshCopilotToken"])(accessTokenForCopilot, healthCheckLog, proxyConfig);
        if (copilotResult?.token) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                providerSpecificData: {
                    ...latestConn.providerSpecificData || {},
                    copilotToken: copilotResult.token,
                    copilotTokenExpiresAt: copilotResult.expiresAt
                }
            });
            log(`${logPrefix} ✓ GitHub Copilot sub-token refreshed for ${getConnectionLogLabel(conn)}`);
        } else {
            logWarn(`${logPrefix} ✗ GitHub Copilot sub-token refresh failed for ${getConnectionLogLabel(conn)}`);
        }
    } catch (copilotErr) {
        logError(`${logPrefix} Error refreshing Copilot sub-token:`, copilotErr?.message || copilotErr);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/tokenHealthCheck.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildRefreshFailureUpdate",
    ()=>buildRefreshFailureUpdate,
    "buildTransientRefreshRetryUpdate",
    ()=>buildTransientRefreshRetryUpdate,
    "checkConnection",
    ()=>checkConnection,
    "clearHealthCheckLogCache",
    ()=>clearHealthCheckLogCache,
    "clearRefreshCircuit",
    ()=>clearRefreshCircuit,
    "default",
    ()=>__TURBOPACK__default__export__,
    "extractResolvedProxyConfig",
    ()=>extractResolvedProxyConfig,
    "getRefreshBackoffUntil",
    ()=>getRefreshBackoffUntil,
    "initTokenHealthCheck",
    ()=>initTokenHealthCheck,
    "isInRefreshBackoff",
    ()=>isInRefreshBackoff,
    "shouldHideLogs",
    ()=>shouldHideLogs,
    "stopTokenHealthCheck",
    ()=>stopTokenHealthCheck,
    "sweep",
    ()=>sweep
]);
// @ts-nocheck
/**
 * Proactive Token Health Check Scheduler
 *
 * Background job that periodically refreshes OAuth tokens before they expire.
 * Each connection can configure its own `healthCheckInterval` (minutes).
 * Default: 60 minutes.  0 = disabled.
 *
 * The scheduler runs a lightweight sweep every TICK_MS (60 s).
 * For each eligible connection it calls the provider-specific refresh function,
 * updates the DB, and logs the result.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/copilot.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tokenHealthCheckCopilot.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const LOG_PREFIX = "[HealthCheck]";
const TRUE_ENV_VALUES = new Set([
    "1",
    "true",
    "yes",
    "on"
]);
const TICK_MS = 60 * 1000; // sweep interval: every 60 seconds (restored — #7719 dropped the const but kept two call sites)
const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_HEALTH_CHECK_INTERVAL_MIN = 60; // default per-connection interval
function isBuildProcess() {
    return typeof process !== "undefined" && process.env.NEXT_PHASE === "phase-production-build";
}
function getConnectionLogLabel(conn) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["pickMaskedDisplayValue"])([
        conn.name,
        conn.email
    ], conn.id || "-");
}
function extractResolvedProxyConfig(resolvedProxy) {
    if (resolvedProxy && typeof resolvedProxy === "object" && !Array.isArray(resolvedProxy) && "proxy" in resolvedProxy) {
        return resolvedProxy.proxy ?? null;
    }
    return resolvedProxy ?? null;
}
function getEffectiveTokenExpiryIso(conn) {
    if (!conn || typeof conn !== "object") return null;
    return conn.tokenExpiresAt || conn.expiresAt || null;
}
function getEffectiveTokenExpiryMs(conn) {
    const effectiveExpiry = getEffectiveTokenExpiryIso(conn);
    if (!effectiveExpiry) return 0;
    const expiryMs = new Date(effectiveExpiry).getTime();
    return Number.isFinite(expiryMs) ? expiryMs : 0;
}
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes
function getCopilotTokenExpiryMs(expiresAt) {
    if (typeof expiresAt === "number" && Number.isFinite(expiresAt)) {
        return expiresAt < 1e12 ? expiresAt * 1000 : expiresAt;
    }
    if (typeof expiresAt === "string" && expiresAt.trim()) {
        const parsed = new Date(expiresAt).getTime();
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
// Providers whose OAuth flow yields only a GitHub-style access token (no
// refresh_token) plus a short-lived Copilot sub-token: github.com Copilot and
// GHE Copilot (device-code flow against the enterprise host) both fit this
// shape. Keep both in sync — adding a github-token-only provider elsewhere
// (e.g. new GHE-flavored Copilot variant) must also list it here.
const GITHUB_ACCESS_TOKEN_ONLY_PROVIDERS = new Set([
    "github",
    "ghe-copilot"
]);
function isGitHubAccessTokenOnlyConnection(conn) {
    return GITHUB_ACCESS_TOKEN_ONLY_PROVIDERS.has(String(conn?.provider || "").toLowerCase()) && typeof conn?.accessToken === "string" && conn.accessToken.trim().length > 0;
}
/**
 * Resolve the Copilot token endpoint base URL for a connection. github.com
 * Copilot always uses api.github.com; GHE Copilot uses its own per-enterprise
 * host stored in providerSpecificData.gheUrl at connect time.
 */ function getCopilotTokenBaseUrl(conn) {
    if (String(conn?.provider || "").toLowerCase() === "ghe-copilot") {
        const gheUrl = conn?.providerSpecificData?.gheUrl;
        if (typeof gheUrl === "string" && gheUrl.trim().length > 0) {
            return `${gheUrl.trim().replace(/\/+$/, "")}/api/v3`;
        }
    }
    return "https://api.github.com";
}
function canClearGitHubNoRefreshTokenState(conn) {
    return !conn?.testStatus || conn.testStatus === "active" || conn.testStatus === "expired" && conn.errorCode === "no_refresh_token";
}
// ── Refresh circuit breaker ───────────────────────────────────────────────
// A refresh that returns null (network blip, dead proxy, unclassified error)
// leaves the connection active, so the next 60s sweep retries immediately —
// the production refresh loop (claude/aa5dd5cf 1352×, kimi 270×). We track
// consecutive failures and back off exponentially so a stuck connection stops
// hammering the upstream (and stops flooding the logs) instead of looping.
const REFRESH_CIRCUIT_BASE_MIN = 5;
const REFRESH_CIRCUIT_MAX_MIN = 240; // cap at 4h
const TRANSIENT_REFRESH_RETRY_MIN = 2; // flat 2-minute retry for network/timeout errors
function getRefreshBackoffUntil(streak, now) {
    const steps = Math.max(0, streak - 1);
    const backoffMin = Math.min(REFRESH_CIRCUIT_BASE_MIN * 2 ** steps, REFRESH_CIRCUIT_MAX_MIN);
    return new Date(new Date(now).getTime() + backoffMin * 60 * 1000).toISOString();
}
function isInRefreshBackoff(conn, nowMs) {
    const until = conn?.providerSpecificData?.refreshCircuit?.until;
    if (typeof until !== "string") return false;
    const untilMs = new Date(until).getTime();
    return Number.isFinite(untilMs) && untilMs > nowMs;
}
function buildRefreshFailureUpdate(conn, now) {
    const wasExpired = conn.testStatus === "expired";
    const retryCount = (conn.expiredRetryCount ?? 0) + (wasExpired ? 1 : 0);
    // Circuit breaker: increment the consecutive-failure streak and set an
    // exponential backoff window so the next sweep skips this connection instead
    // of retrying every 60s. Cleared by a successful refresh (clearRefreshCircuit).
    // Guard: providerSpecificData may be a primitive or null - treat as empty.
    const psd = typeof conn.providerSpecificData === "object" && conn.providerSpecificData !== null ? conn.providerSpecificData : {};
    const prevStreak = psd.refreshCircuit?.streak ?? 0;
    const streak = prevStreak + 1;
    return {
        lastHealthCheckAt: now,
        // A failed background refresh should not evict otherwise healthy accounts
        // from request routing. Keep non-expired connections active and only persist
        // the refresh error metadata for observability.
        testStatus: wasExpired ? "expired" : "active",
        lastError: "Health check: token refresh failed",
        lastErrorAt: now,
        lastErrorType: "token_refresh_failed",
        lastErrorSource: "oauth",
        errorCode: "refresh_failed",
        providerSpecificData: {
            ...psd,
            refreshCircuit: {
                streak,
                until: getRefreshBackoffUntil(streak, now),
                lastFailAt: now
            }
        },
        ...wasExpired ? {
            expiredRetryCount: retryCount,
            expiredRetryAt: now
        } : {}
    };
}
function buildTransientRefreshRetryUpdate(conn, now) {
    const wasExpired = conn.testStatus === "expired";
    const retryCount = (conn.expiredRetryCount ?? 0) + (wasExpired ? 1 : 0);
    // Preserve existing streak from any prior permanent failures so a transient
    // error does not reset the exponential backoff ladder.
    // Guard: providerSpecificData may be a primitive or null - treat as empty.
    const psd = typeof conn.providerSpecificData === "object" && conn.providerSpecificData !== null ? conn.providerSpecificData : {};
    const existingCircuit = psd.refreshCircuit;
    const existingStreak = existingCircuit?.streak ?? 0;
    const parsedExistingUntil = existingCircuit?.until ? new Date(existingCircuit.until).getTime() : 0;
    // Guard against NaN from malformed date strings - treat as no existing backoff.
    const existingUntil = Number.isFinite(parsedExistingUntil) ? parsedExistingUntil : 0;
    const transientUntil = new Date(now).getTime() + TRANSIENT_REFRESH_RETRY_MIN * 60 * 1000;
    // Use the longer of the two: preserve an existing permanent backoff
    // (e.g. 4h from exponential) or extend to the transient window.
    const useTransient = existingUntil <= transientUntil;
    const until = useTransient ? new Date(transientUntil).toISOString() : existingCircuit?.until ?? new Date(transientUntil).toISOString();
    return {
        lastHealthCheckAt: now,
        testStatus: wasExpired ? "expired" : "active",
        lastError: "Health check: token refresh transient error (network/timeout)",
        lastErrorAt: now,
        lastErrorType: "token_refresh_transient",
        lastErrorSource: "oauth",
        errorCode: "refresh_transient",
        providerSpecificData: {
            ...psd,
            refreshCircuit: {
                streak: existingStreak,
                until,
                lastFailAt: now,
                // Always set the transient flag for observability. When the existing
                // backoff is longer (useTransient=false), the transient error occurred
                // but the permanent backoff was preserved - flag it as false so
                // observers can distinguish this from a pure transient retry.
                transient: useTransient
            }
        },
        ...wasExpired ? {
            expiredRetryCount: retryCount,
            expiredRetryAt: now
        } : {}
    };
}
function clearRefreshCircuit(providerSpecificData) {
    if (!providerSpecificData || typeof providerSpecificData !== "object") return undefined;
    if (!("refreshCircuit" in providerSpecificData)) return undefined;
    const next = {
        ...providerSpecificData
    };
    delete next.refreshCircuit;
    return next;
}
/**
 * Concurrent-check batch size for the sweep, read per-call (not at module
 * load) so tests — and operators — can override it via HEALTHCHECK_BATCH_SIZE
 * without restarting the process. #7719 hardcoded this to a module-level
 * `const BATCH_SIZE = 20`, silently dropping the configurability restored
 * here (#7875). Falls back to DEFAULT_BATCH_SIZE on a missing/invalid value.
 */ function getConfiguredBatchSize() {
    const configured = parseInt(process.env.HEALTHCHECK_BATCH_SIZE || "", 10);
    return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_BATCH_SIZE;
}
function isEnvFlagEnabled(name) {
    const value = process.env[name];
    if (!value) return false;
    return TRUE_ENV_VALUES.has(value.trim().toLowerCase());
}
function isHealthCheckDisabled() {
    return isEnvFlagEnabled("OMNIROUTE_DISABLE_TOKEN_HEALTHCHECK") || isBuildProcess() || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
}
/**
 * Providers excluded from the PROACTIVE sweep, comma-separated, case-insensitive
 * (e.g. "codex,openai"). Targeted alternative to OMNIROUTE_DISABLE_TOKEN_HEALTHCHECK:
 * keeps rotating-token cascade providers (Codex/OpenAI share one Auth0 family) on the
 * reactive 401 path WITHOUT starving short-TTL providers (Kimi-coding) sweep-wide.
 */ function getHealthCheckSkipProviders() {
    const raw = process.env.OMNIROUTE_HEALTHCHECK_SKIP_PROVIDERS || "";
    return new Set(raw.split(",").map((s)=>s.trim().toLowerCase()).filter(Boolean));
}
// ── Logging helper ───────────────────────────────────────────────────────────
let cachedHideLogs = null;
let cacheTimestamp = 0;
let pendingHideLogs = null;
const CACHE_TTL = 30_000; // Cache settings for 30 seconds
async function shouldHideLogs() {
    if (isEnvFlagEnabled("OMNIROUTE_HIDE_HEALTHCHECK_LOGS") || isBuildProcess() || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])()) {
        return true;
    }
    const now = Date.now();
    // Return cached value if valid
    if (cachedHideLogs !== null && now - cacheTimestamp < CACHE_TTL) {
        return cachedHideLogs;
    }
    // Return pending promise if a query is already in progress (request coalescing)
    if (pendingHideLogs !== null) {
        return pendingHideLogs;
    }
    // Create new promise for DB query
    pendingHideLogs = (async ()=>{
        try {
            const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
            cachedHideLogs = settings.hideHealthCheckLogs === true;
            cacheTimestamp = now;
            return cachedHideLogs;
        } catch  {
            return false;
        } finally{
            pendingHideLogs = null;
        }
    })();
    return pendingHideLogs;
}
function log(message, ...args) {
    shouldHideLogs().then((hide)=>{
        if (!hide) console.log(message, ...args);
    });
}
function logWarn(message, ...args) {
    shouldHideLogs().then((hide)=>{
        if (!hide) console.warn(message, ...args);
    });
}
function logError(message, ...args) {
    shouldHideLogs().then((hide)=>{
        if (!hide) console.error(message, ...args);
    });
}
function clearHealthCheckLogCache() {
    cachedHideLogs = null;
    cacheTimestamp = 0;
}
function getHCState() {
    if (!globalThis.__omnirouteTokenHC) {
        globalThis.__omnirouteTokenHC = {
            initialized: false,
            interval: null,
            initTimeout: null,
            sweeping: false
        };
    }
    return globalThis.__omnirouteTokenHC;
}
function initTokenHealthCheck() {
    const state = getHCState();
    if (state.initialized || isHealthCheckDisabled()) return;
    state.initialized = true;
    log(`${LOG_PREFIX} Starting proactive token health-check (tick every ${TICK_MS / 1000}s)`);
    const timer = setTimeout(()=>{
        state.initTimeout = null;
        sweep();
        state.interval = setInterval(sweep, TICK_MS);
        if (state.interval && typeof state.interval === "object" && "unref" in state.interval) {
            state.interval.unref?.();
        }
    }, 10_000);
    state.initTimeout = timer;
    if (timer && typeof timer === "object" && "unref" in timer) {
        timer.unref?.();
    }
}
function stopTokenHealthCheck() {
    const state = getHCState();
    if (state.initTimeout) {
        clearTimeout(state.initTimeout);
        state.initTimeout = null;
    }
    if (state.interval) {
        clearInterval(state.interval);
        state.interval = null;
    }
    state.initialized = false;
}
async function sweep() {
    const state = getHCState();
    if (state.sweeping) {
        return log(`${LOG_PREFIX} Sweep skipped — previous sweep still in progress`);
    }
    state.sweeping = true;
    try {
        const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
            authType: "oauth"
        });
        if (!connections || connections.length === 0) return;
        const staggerMs = parseInt(process.env.HEALTHCHECK_STAGGER_MS || "3000", 10);
        const total = connections.length;
        // Process connections in concurrent batches. Within a single batch
        // connections are checked concurrently (same-epoch start) so the array
        // is drained faster and the event loop can service requests between
        // batches. The inter-batch stagger preserves the original burst-
        // prevention intent (Issue #1220) while reducing total sweep time from
        // O(total × staggerMs) to O(total ÷ batchSize × staggerMs).
        const batchSize = Math.min(getConfiguredBatchSize(), total);
        for(let offset = 0; offset < total; offset += batchSize){
            const batchEnd = Math.min(offset + batchSize, total);
            const batch = [];
            for(let i = offset; i < batchEnd; i++){
                const conn = connections[i];
                batch.push(checkConnection(conn).catch((err)=>{
                    logError(`${LOG_PREFIX} Error checking ${conn.name || conn.id}:`, err.message);
                }));
            }
            await Promise.all(batch);
            // Stagger between batches (not between individual connections) to
            // prevent sustained bursting while reducing total sweep duration.
            if (batchEnd < total) {
                if (staggerMs > 0) {
                    const jitterMin = parseInt(process.env.HEALTHCHECK_JITTER_MIN_MS || "500", 10);
                    const jitterMax = parseInt(process.env.HEALTHCHECK_JITTER_MAX_MS || "5000", 10);
                    const jitter = jitterMin + Math.random() * Math.max(0, jitterMax - jitterMin);
                    await new Promise((resolve)=>setTimeout(resolve, staggerMs + jitter));
                }
                // Yield a microtask so the event loop can service pending I/O
                // (DB contention, network responses) before the next batch starts.
                await new Promise((resolve)=>setTimeout(resolve, 0));
            }
        }
    } catch (err) {
        logError(`${LOG_PREFIX} Sweep error:`, err.message);
    } finally{
        state.sweeping = false;
    }
}
async function checkConnection(conn) {
    if (!conn?.id) return;
    const latestConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(conn.id) || conn;
    conn = latestConnection;
    // Per-provider opt-out of proactive refresh (e.g. Codex/OpenAI cascade
    // providers) — their token stays on the reactive, serialized 401 path while
    // other providers keep being refreshed proactively.
    if (getHealthCheckSkipProviders().has(String(conn.provider || "").toLowerCase())) {
        return;
    }
    // Determine interval (0 = disabled)
    const intervalMin = conn.healthCheckInterval ?? DEFAULT_HEALTH_CHECK_INTERVAL_MIN;
    if (intervalMin <= 0) return;
    if (!conn.isActive) return;
    // #8182: skip terminal connections (credits_exhausted / banned / expired).
    // These can never self-heal via a token refresh — probing them wastes
    // CPU and network on every sweep cycle. Mirrors isTerminalConnectionStatus
    // in src/sse/services/auth.ts and TERMINAL_CONNECTION_STATUSES in
    // src/lib/quota/connectionRecovery.ts.
    //
    // #5326 exception: a GitHub Copilot access-token-only connection parked in
    // "expired" with errorCode "no_refresh_token" is NOT actually terminal — it's
    // the exact target of the self-heal below (canClearGitHubNoRefreshTokenState),
    // which clears that stale status back to "active" once the Copilot sub-token
    // proves usable. Treating it as terminal here made that self-heal unreachable,
    // leaving healthy Copilot connections stuck at "expired" forever.
    const isRecoverableGithubCopilotNoRefresh = conn.testStatus === "expired" && conn.errorCode === "no_refresh_token" && isGitHubAccessTokenOnlyConnection(conn);
    const terminalStatuses = new Set([
        "credits_exhausted",
        "banned",
        "expired"
    ]);
    if (typeof conn.testStatus === "string" && terminalStatuses.has(conn.testStatus.toLowerCase()) && !isRecoverableGithubCopilotNoRefresh) {
        return;
    }
    // Deprecated upstream (see DEPRECATED_PROVIDERS in tokenRefresh): the provider is not
    // routable, so refreshing kept a credential alive that could never answer a request.
    // Surface that as a terminal state naming the migration, instead of the silent
    // `Skipping … (refresh unsupported)` that dropping it from supportsTokenRefresh alone
    // would produce — which would leave the row at "active" forever, doing nothing.
    //
    // Placed AFTER the terminal-status guard above, which makes this idempotent for free:
    // once marked "expired" the connection is skipped on every later sweep, so this writes
    // exactly once instead of rewriting the same reason each cycle.
    const deprecation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDeprecationNotice"])(String(conn.provider || ""));
    if (deprecation) {
        const now = new Date().toISOString();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
            testStatus: "expired",
            lastHealthCheckAt: now,
            lastError: deprecation.reason,
            lastErrorAt: now,
            lastErrorType: "provider_deprecated",
            lastErrorSource: "oauth",
            errorCode: "provider_deprecated"
        });
        log(`${LOG_PREFIX} ${conn.provider}/${getConnectionLogLabel(conn)} is a deprecated provider; marking expired (migrate to ${deprecation.migrateTo})`);
        return;
    }
    if (!conn.refreshToken || typeof conn.refreshToken !== "string") {
        if (isGitHubAccessTokenOnlyConnection(conn)) {
            const now = new Date().toISOString();
            const providerSpecificData = conn.providerSpecificData || {};
            const hasCopilotToken = typeof providerSpecificData.copilotToken === "string" && providerSpecificData.copilotToken.trim().length > 0;
            const copilotExpiresAtMs = getCopilotTokenExpiryMs(providerSpecificData.copilotTokenExpiresAt);
            const copilotAboutToExpire = !hasCopilotToken || !copilotExpiresAtMs || copilotExpiresAtMs - Date.now() < TOKEN_EXPIRY_BUFFER;
            let refreshedProviderSpecificData = null;
            if (copilotAboutToExpire) {
                const hideLogs = await shouldHideLogs();
                const proxyResolution = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(conn.id);
                const proxyConfig = extractResolvedProxyConfig(proxyResolution);
                const healthCheckLog = {
                    info: (tag, msg)=>{
                        if (!hideLogs) console.log(LOG_PREFIX, `[${tag}]`, msg);
                    },
                    warn: (tag, msg)=>{
                        if (!hideLogs) console.warn(LOG_PREFIX, `[${tag}]`, msg);
                    },
                    error: (tag, msg, extra)=>{
                        if (!hideLogs) console.error(LOG_PREFIX, `[${tag}]`, msg, extra || "");
                    }
                };
                const copilotResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshCopilotToken"])(conn.accessToken, healthCheckLog, proxyConfig, getCopilotTokenBaseUrl(conn));
                if (copilotResult?.token) {
                    refreshedProviderSpecificData = {
                        ...providerSpecificData,
                        copilotToken: copilotResult.token,
                        copilotTokenExpiresAt: copilotResult.expiresAt
                    };
                }
            }
            if (canClearGitHubNoRefreshTokenState(conn)) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                    lastHealthCheckAt: now,
                    testStatus: "active",
                    lastError: copilotAboutToExpire && !refreshedProviderSpecificData ? "Health check: Copilot token refresh failed" : null,
                    lastErrorAt: copilotAboutToExpire && !refreshedProviderSpecificData ? now : null,
                    lastErrorType: copilotAboutToExpire && !refreshedProviderSpecificData ? "token_refresh_failed" : null,
                    lastErrorSource: copilotAboutToExpire && !refreshedProviderSpecificData ? "oauth" : null,
                    errorCode: copilotAboutToExpire && !refreshedProviderSpecificData ? "refresh_failed" : null,
                    expiredRetryCount: null,
                    expiredRetryAt: null,
                    ...refreshedProviderSpecificData ? {
                        providerSpecificData: refreshedProviderSpecificData
                    } : {}
                });
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                    lastHealthCheckAt: now,
                    ...refreshedProviderSpecificData ? {
                        providerSpecificData: refreshedProviderSpecificData
                    } : {}
                });
            }
            // Steady-state ticks stay silent: this path runs once per TICK_MS (60s) for
            // EVERY github/ghe-copilot connection, so an unconditional line here emits
            // ~1440 entries/day per connection all saying the same nothing-changed thing.
            // Only report when the sweep actually did work — a Copilot sub-token refresh
            // attempt — so a genuine refresh failure still surfaces in the log.
            if (copilotAboutToExpire) {
                log(`${LOG_PREFIX} ${conn.provider}/${getConnectionLogLabel(conn)} Copilot token ${refreshedProviderSpecificData ? "refreshed" : "refresh FAILED"} (no refresh token; connection stays active)`);
            }
            return;
        }
        // #5326: a refresh-CAPABLE provider (e.g. antigravity/gemini) with no usable
        // refresh token can never self-heal via the sweep — it genuinely needs re-auth.
        // Silently skipping here left the row at testStatus="active" while the dashboard
        // badge (which derives expiry from tokenExpiresAt||expiresAt) showed a confusing
        // cosmetic "Token Expired". Surface reality as a terminal "expired" status instead.
        // Guard tightly so we do NOT clobber:
        //   - providers without refresh tokens (supportsTokenRefresh=false; #8407 devin-cli)
        //   - connections already in a terminal/specific state (expired/banned/credits_exhausted)
        //   - transient cooldown state (unavailable) owned by the request path
        const refreshCapableNeedsReauth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supportsTokenRefresh"])(conn.provider) && (!conn.testStatus || conn.testStatus === "active") && !(conn.apiKey && conn.apiKey.length > 0); // API-key-only connections don't need refresh tokens
        if (refreshCapableNeedsReauth) {
            const now = new Date().toISOString();
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                testStatus: "expired",
                lastHealthCheckAt: now,
                lastError: "No refresh token available — re-authenticate this account.",
                lastErrorAt: now,
                lastErrorType: "no_refresh_token",
                lastErrorSource: "oauth",
                errorCode: "no_refresh_token"
            });
            log(`${LOG_PREFIX} ${conn.provider}/${getConnectionLogLabel(conn)} has no refresh token; marking expired (needs re-auth)`);
        }
        return;
    }
    // Retry expired connections with exponential backoff up to EXPIRED_RETRY_MAX times.
    if (conn.testStatus === "expired") {
        const retryCount = conn.expiredRetryCount ?? 0;
        if (retryCount >= EXPIRED_RETRY_MAX) return;
        const lastRetry = conn.expiredRetryAt ? new Date(conn.expiredRetryAt).getTime() : 0;
        const backoffMs = EXPIRED_RETRY_BACKOFF_MIN * 60 * 1000 * Math.pow(2, retryCount);
        if (Date.now() - lastRetry < backoffMs) return;
        log(`${LOG_PREFIX} Retrying expired ${conn.provider}/${getConnectionLogLabel(conn)} (attempt ${retryCount + 1}/${EXPIRED_RETRY_MAX})`);
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supportsTokenRefresh"])(conn.provider)) {
        const now = new Date().toISOString();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
            lastHealthCheckAt: now
        });
        log(`${LOG_PREFIX} Skipping ${conn.provider}/${getConnectionLogLabel(conn)} (refresh unsupported)`);
        return;
    }
    const intervalMs = intervalMin * 60 * 1000;
    const lastCheck = conn.lastHealthCheckAt ? new Date(conn.lastHealthCheckAt).getTime() : 0;
    // Prefer expiry-driven refresh when the provider returns a concrete expiry timestamp.
    // Rotating-token providers such as Codex should not be refreshed on a fixed hourly
    // cadence while the access token is still valid for days.
    const tokenExpiresAt = getEffectiveTokenExpiryMs(conn);
    const hasKnownExpiry = tokenExpiresAt > 0;
    const isAboutToExpire = hasKnownExpiry && tokenExpiresAt - Date.now() < TOKEN_EXPIRY_BUFFER;
    // ROTATING_REFRESH_PROVIDERS — providers whose refresh_tokens are SINGLE-USE
    // (each refresh consumes the old one and returns a new one). For these, refreshing
    // on a fixed interval — instead of strictly on imminent expiry — burns rotations
    // unnecessarily AND can trigger Auth0's token family revocation (especially OpenAI
    // Codex). 9router did not have this background sweep; it was introduced in OmniRoute
    // and is the root cause of "adding account B invalidates account A" reports.
    // The interval path is kept ONLY for non-rotating providers where token state can
    // drift silently (e.g. cookie-based, opaque sessions without expires_at).
    const ROTATING_REFRESH_PROVIDERS = new Set([
        "codex",
        "openai",
        "kimi-coding",
        "cline",
        "kiro",
        "amazon-q",
        "gitlab-duo",
        "claude"
    ]);
    const isRotatingProvider = ROTATING_REFRESH_PROVIDERS.has(String(conn.provider || "").toLowerCase());
    const shouldRefreshByInterval = !hasKnownExpiry && !isRotatingProvider && Date.now() - lastCheck >= intervalMs;
    if (!isAboutToExpire && !shouldRefreshByInterval) return;
    // Circuit breaker: if recent refreshes for this connection failed, wait out
    // the exponential backoff window instead of retrying every 60s tick. This is
    // what stops the refresh loop when getAccessToken keeps returning null
    // (dead proxy / network blip / unclassified upstream error).
    if (isInRefreshBackoff(conn, Date.now())) {
        return;
    }
    const reason = isAboutToExpire ? "token expiring soon" : `interval: ${intervalMin}min`;
    log(`${LOG_PREFIX} Refreshing ${conn.provider}/${getConnectionLogLabel(conn)} (${reason})`);
    const attemptedRefreshToken = conn.refreshToken;
    const attemptedAccessToken = conn.accessToken || null;
    const credentials = {
        connectionId: conn.id,
        refreshToken: attemptedRefreshToken,
        accessToken: attemptedAccessToken,
        expiresAt: getEffectiveTokenExpiryIso(conn),
        providerSpecificData: conn.providerSpecificData
    };
    const hideLogs = await shouldHideLogs();
    const proxyResolution = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(conn.id);
    const proxyConfig = extractResolvedProxyConfig(proxyResolution);
    const healthCheckLog = {
        info: (tag, msg)=>{
            if (!hideLogs) console.log(LOG_PREFIX, `[${tag}]`, msg);
        },
        warn: (tag, msg)=>{
            if (!hideLogs) console.warn(LOG_PREFIX, `[${tag}]`, msg);
        },
        error: (tag, msg, extra)=>{
            if (!hideLogs) console.error(LOG_PREFIX, `[${tag}]`, msg, extra || "");
        }
    };
    let persistedResult = null;
    let result;
    try {
        result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAccessToken"])(conn.provider, credentials, healthCheckLog, proxyConfig, async (refreshResult)=>{
            const now = new Date().toISOString();
            const updateData = {
                accessToken: refreshResult.accessToken,
                lastHealthCheckAt: now,
                testStatus: "active",
                lastError: null,
                lastErrorAt: null,
                lastErrorType: null,
                lastErrorSource: null,
                errorCode: null,
                expiredRetryCount: null,
                expiredRetryAt: null
            };
            if (refreshResult.refreshToken) {
                updateData.refreshToken = refreshResult.refreshToken;
            }
            if (refreshResult.expiresAt) {
                updateData.expiresAt = refreshResult.expiresAt;
                updateData.tokenExpiresAt = refreshResult.expiresAt;
            } else if (refreshResult.expiresIn) {
                const expiresAt = new Date(Date.now() + refreshResult.expiresIn * 1000).toISOString();
                updateData.expiresAt = expiresAt;
                updateData.tokenExpiresAt = expiresAt;
            }
            // Merge new providerSpecificData and ALWAYS clear the refresh circuit
            // breaker streak on a successful refresh.
            const mergedProviderData = {
                ...conn.providerSpecificData || {},
                ...refreshResult.providerSpecificData || {}
            };
            const clearedProviderData = clearRefreshCircuit(mergedProviderData);
            if (clearedProviderData !== undefined) {
                updateData.providerSpecificData = clearedProviderData;
            } else if (refreshResult.providerSpecificData) {
                updateData.providerSpecificData = mergedProviderData;
            }
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
            } catch (dbErr) {
                // DB write failed after successful refresh - log but do not throw.
                // The outer catch would misclassify this as a network error.
                logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} DB write failed after successful refresh` + ` (${dbErr instanceof Error ? dbErr.message : String(dbErr)}); token not persisted`);
                return;
            }
            // Mark as persisted AFTER the DB write succeeds.
            persistedResult = refreshResult;
        });
    } catch (err) {
        // If onPersist already wrote a successful result, do not overwrite it.
        if (persistedResult) {
            logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} refresh error after successful persist` + ` (${err instanceof Error ? err.message : String(err)}); ignoring`);
            return;
        }
        // Classify: only network/timeout errors are transient. Programming errors
        // and DB failures fall through to the exponential backoff path.
        const errObj = typeof err === "object" && err !== null ? err : {};
        const errName = err instanceof Error ? err.name : String(errObj.name ?? "");
        const errMsg = err instanceof Error ? err.message : String(err);
        const errCode = String(errObj.code ?? "");
        // Also check err.cause for wrapped fetch errors.
        const errCause = errObj.cause instanceof Error ? errObj.cause.message : "";
        const errCauseCode = String(errObj.cause?.code ?? "");
        const combinedMsg = `${errMsg} ${errCause}`;
        const combinedCode = `${errCode} ${errCauseCode}`;
        const isTransientNetworkError = errName === "AbortError" || errName === "TimeoutError" || /ETIMEDOUT|ECONNREFUSED|ECONNRESET|ECONNABORTED|EPIPE|EHOSTUNREACH|ENETUNREACH|ENOTCONN|ENOTFOUND|EAI_AGAIN|ERR_NETWORK|ERR_SOCKET|ERR_CONNECTION|socket hang up|fetch failed/i.test(combinedMsg) || /ETIMEDOUT|ECONNREFUSED|ECONNRESET|ECONNABORTED|EPIPE|EHOSTUNREACH|ENETUNREACH|ENOTCONN|ENOTFOUND|EAI_AGAIN|ERR_NETWORK|ERR_SOCKET|ERR_CONNECTION/i.test(combinedCode);
        if (isTransientNetworkError) {
            const transientNow = new Date().toISOString();
            const updateData = buildTransientRefreshRetryUpdate(conn, transientNow);
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
            } catch (dbErr) {
                logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} DB write failed after transient error` + ` (${dbErr instanceof Error ? dbErr.message : String(dbErr)}); state not persisted`);
            }
            logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} refresh transient error` + ` (${err instanceof Error ? err.message : String(err)}); retry in ${TRANSIENT_REFRESH_RETRY_MIN}min`);
        } else {
            // Non-transient error: apply standard exponential backoff.
            const failNow = new Date().toISOString();
            const updateData = buildRefreshFailureUpdate(conn, failNow);
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
            } catch (dbErr) {
                logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} DB write failed after permanent error` + ` (${dbErr instanceof Error ? dbErr.message : String(dbErr)}); state not persisted`);
            }
            logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} refresh error` + ` (${err instanceof Error ? err.message : String(err)}); applying exponential backoff`);
        }
        return;
    }
    const now = new Date().toISOString();
    // ─── Handle unrecoverable errors (e.g. refresh_token_reused) ───────────
    // OpenAI Codex uses rotating one-time-use refresh tokens.
    // Once used, the old token is permanently invalidated.
    // Retrying will never succeed → deactivate and stop the loop.
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isUnrecoverableRefreshError"])(result)) {
        const currentConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(conn.id);
        const credentialsChangedSinceSweep = !!currentConnection && (currentConnection.refreshToken !== attemptedRefreshToken || (currentConnection.accessToken || null) !== attemptedAccessToken);
        if (credentialsChangedSinceSweep) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                lastHealthCheckAt: now
            });
            logWarn(`${LOG_PREFIX} ! ${conn.provider}/${getConnectionLogLabel(conn)} changed during refresh; skipping stale deactivation`);
            return;
        }
        const accessTokenStillValid = getEffectiveTokenExpiryMs(currentConnection || conn) > Date.now() + TOKEN_EXPIRY_BUFFER;
        if (accessTokenStillValid) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                lastHealthCheckAt: now,
                testStatus: "active",
                lastError: `Health check refresh failed (${result.error}). Re-authenticate before the current access token expires.`,
                lastErrorAt: now,
                lastErrorType: result.error,
                lastErrorSource: "oauth",
                errorCode: result.error
            });
            logWarn(`${LOG_PREFIX} ! ${conn.provider}/${getConnectionLogLabel(conn)} refresh token is invalid (${result.error}), but the current access token is still valid; keeping connection active`);
            return;
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
            lastHealthCheckAt: now,
            testStatus: "expired",
            lastError: isRotatingProvider ? `Refresh token consumed (${result.error}). Please re-authenticate this account.` : `Refresh token rejected (${result.error}). Please re-authenticate this account.`,
            lastErrorAt: now,
            lastErrorType: result.error,
            lastErrorSource: "oauth",
            errorCode: result.error,
            isActive: false,
            // Only rotating-token providers (Codex/OpenAI/etc.) have single-use refresh
            // tokens that are genuinely consumed and worthless after a failed refresh, so
            // clearing them is safe. For non-rotating providers (Google: antigravity /
            // gemini) the stored refresh_token is the user's only recovery
            // artifact — nulling it caused #3679 (the connection reports "No valid refresh
            // token available" and can never recover even after re-activation). Preserve it.
            ...isRotatingProvider ? {
                refreshToken: null
            } : {}
        });
        logError(`${LOG_PREFIX} ✗ ${conn.provider}/${getConnectionLogLabel(conn)} — ` + `Refresh token is permanently invalid (${result.error}). ` + `Connection deactivated. Re-authenticate to restore.`);
        return;
    }
    if (result && result.accessToken) {
        // onPersist already wrote the core token fields atomically inside the mutex.
        // Only write the lastHealthCheckAt timestamp (and any fields onPersist may have
        // missed) here, to avoid a redundant full update that would race against another
        // concurrent refresh that already wrote fresh credentials.
        if (persistedResult) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                lastHealthCheckAt: now
            });
        } else {
            // No onPersist (e.g. no connectionId — token-hash dedup path). Write all fields.
            const updateData = {
                accessToken: result.accessToken,
                lastHealthCheckAt: now,
                testStatus: "active",
                lastError: null,
                lastErrorAt: null,
                lastErrorType: null,
                lastErrorSource: null,
                errorCode: null,
                expiredRetryCount: null,
                expiredRetryAt: null
            };
            if (result.refreshToken) {
                updateData.refreshToken = result.refreshToken;
            }
            if (result.expiresAt) {
                updateData.expiresAt = result.expiresAt;
                updateData.tokenExpiresAt = result.expiresAt;
            } else if (result.expiresIn) {
                const expiresAt = new Date(Date.now() + result.expiresIn * 1000).toISOString();
                updateData.expiresAt = expiresAt;
                updateData.tokenExpiresAt = expiresAt;
            }
            if (result.providerSpecificData) {
                updateData.providerSpecificData = {
                    ...conn.providerSpecificData || {},
                    ...result.providerSpecificData
                };
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
        }
        log(`${LOG_PREFIX} ✓ ${conn.provider}/${getConnectionLogLabel(conn)} refreshed`);
        // ── GitHub Copilot sub-token refresh ──────────────────────────────────────
        // Extracted to tokenHealthCheckCopilot.ts to keep this file under the
        // frozen file-size budget. See that file's header comment for context.
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshGithubCopilotSubTokenIfNeeded"])({
            conn,
            result,
            proxyConfig,
            healthCheckLog,
            log,
            logWarn,
            logError,
            getConnectionLogLabel,
            logPrefix: LOG_PREFIX
        });
    } else {
        const updateData = buildRefreshFailureUpdate(conn, now);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
        logWarn(`${LOG_PREFIX} ✗ ${conn.provider}/${getConnectionLogLabel(conn)} refresh failed` + (conn.testStatus === "expired" ? ` (${updateData.expiredRetryCount}/${EXPIRED_RETRY_MAX} expired retries used)` : ""));
    }
}
// Auto-start when imported
initTokenHealthCheck();
const __TURBOPACK__default__export__ = initTokenHealthCheck;
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
"[project]/src/lib/credentialHealth/scheduler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "forceSweep",
    ()=>forceSweep,
    "initCredentialHealthCheck",
    ()=>initCredentialHealthCheck,
    "stopCredentialHealthCheck",
    ()=>stopCredentialHealthCheck,
    "sweep",
    ()=>sweep
]);
/**
 * Credential Health Check Scheduler
 *
 * Background scheduler that periodically tests provider credential health.
 * Follows the pattern from localHealthCheck.ts — runs on a configurable
 * interval with exponential backoff on failure.
 *
 * Reuses the existing testSingleConnection() infrastructure so all 20+
 * provider-specific validators work automatically.
 *
 * Schedule:
 *   - Initial delay: 30s after server boot (allows DB migrations to complete)
 *   - Interval: configurable via CREDENTIAL_HEALTH_CHECK_INTERVAL (default 5 min)
 *   - OAuth connections: tested less frequently (2x interval)
 *   - Backoff on failure: 5min -> 10min -> 30min -> max 2h
 *   - Resets to default on success
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$providers$2f5b$id$5d2f$test$2f$route$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/providers/[id]/test/route.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$credentialHealth$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/credentialHealth/cache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$events$2f$eventBus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/events/eventBus.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$providers$2f5b$id$5d2f$test$2f$route$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$providers$2f5b$id$5d2f$test$2f$route$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
// ── Config ────────────────────────────────────────────────────────────────
const BACKOFF_SCHEDULE = [
    300_000,
    600_000,
    1_800_000,
    7_200_000
]; // 5min, 10min, 30min, 2h
const INITIAL_DELAY_MS = 30_000; // Wait for server boot
const OAUTH_INTERVAL_MULTIPLIER = 2; // OAuth tested 2x less frequently
const CONCURRENCY_LIMIT = 5; // Max simultaneous connection tests
const LOG_PREFIX = "[CredentialHealth]";
const TRUE_ENV_VALUES = new Set([
    "1",
    "true",
    "yes",
    "on"
]);
function getSchedulerState() {
    if (!globalThis.__omnirouteCredentialHC) {
        globalThis.__omnirouteCredentialHC = {
            initialized: false,
            sweepTimer: null,
            sweepInProgress: false,
            failureCounts: new Map()
        };
    }
    return globalThis.__omnirouteCredentialHC;
}
// ── Helpers ───────────────────────────────────────────────────────────────
function isBuildProcess() {
    return typeof process !== "undefined" && process.env.NEXT_PHASE === "phase-production-build";
}
function isCredentialHealthCheckDisabled() {
    if (isBuildProcess() || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])()) return true;
    const val = process.env.OMNIROUTE_DISABLE_CREDENTIAL_HEALTH_CHECK;
    return val ? TRUE_ENV_VALUES.has(val.trim().toLowerCase()) : false;
}
function getSweepInterval() {
    const envVal = process.env.CREDENTIAL_HEALTH_CHECK_INTERVAL;
    if (envVal) {
        const parsed = parseInt(envVal, 10);
        if (!isNaN(parsed) && parsed >= 10_000) return parsed;
    }
    return 300_000; // default 5 min
}
function getNextBackoff(connectionId) {
    const state = getSchedulerState();
    const failures = state.failureCounts.get(connectionId) ?? 0;
    return BACKOFF_SCHEDULE[Math.min(failures, BACKOFF_SCHEDULE.length - 1)];
}
function getMaxFailuresAcrossConnections() {
    const state = getSchedulerState();
    let max = 0;
    for (const count of state.failureCounts.values()){
        if (count > max) max = count;
    }
    return max;
}
// ── Core Sweep Logic ─────────────────────────────────────────────────────
async function testConnection(connectionId, provider, isOAuth) {
    const startTime = Date.now();
    let oldStatus;
    try {
        const { getCredentialHealth } = await __turbopack_context__.A("[project]/src/lib/credentialHealth/cache.ts [instrumentation] (ecmascript, async loader)");
        const prev = getCredentialHealth(connectionId);
        oldStatus = prev?.status;
    } catch  {}
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$providers$2f5b$id$5d2f$test$2f$route$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["testSingleConnection"])(connectionId);
        const latencyMs = Date.now() - startTime;
        const state = getSchedulerState();
        if (result.valid) {
            // Success — reset failure count, update cache
            state.failureCounts.delete(connectionId);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$credentialHealth$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setCredentialHealth"])(connectionId, provider, "active", undefined, undefined, undefined, latencyMs);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$events$2f$eventBus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emit"])("credential.health.changed", {
                connectionId,
                provider,
                oldStatus: oldStatus || "unknown",
                newStatus: "active",
                timestamp: Date.now()
            });
        } else {
            // Failure — increment failure count, update cache with error
            const currentFailures = (state.failureCounts.get(connectionId) ?? 0) + 1;
            state.failureCounts.set(connectionId, currentFailures);
            const diagnosis = result.diagnosis;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$credentialHealth$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setCredentialHealth"])(connectionId, provider, "error", result.error || "Unknown error", diagnosis?.type || "unknown", diagnosis?.source || "unknown", latencyMs);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$events$2f$eventBus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emit"])("credential.health.changed", {
                connectionId,
                provider,
                oldStatus: oldStatus || "unknown",
                newStatus: "error",
                timestamp: Date.now()
            });
            // Log state transition on consecutive failures
            if (currentFailures <= 2) {
                const backoff = getNextBackoff(connectionId);
                console.log(LOG_PREFIX, `❌ ${provider}/${connectionId} — ${result.error || "Connection failed"}` + ` [${latencyMs}ms] (failure #${currentFailures}, next check in ${backoff / 1000}s)`);
            }
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Scheduler error";
        const latencyMs = Date.now() - startTime;
        const state = getSchedulerState();
        const currentFailures = (state.failureCounts.get(connectionId) ?? 0) + 1;
        state.failureCounts.set(connectionId, currentFailures);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$credentialHealth$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setCredentialHealth"])(connectionId, provider, "error", message);
        if (currentFailures <= 2) {
            console.log(LOG_PREFIX, `⚠️ ${provider}/${connectionId} — ${message} [${latencyMs}ms] (failure #${currentFailures})`);
        }
    }
}
async function sweep() {
    const state = getSchedulerState();
    if (state.sweepInProgress) return;
    state.sweepInProgress = true;
    try {
        // Get active provider connections only (API-key + OAuth). Disabled
        // connections are excluded from routing and must not consume health-check
        // concurrency or delay the scheduler with avoidable upstream timeouts.
        let connections;
        try {
            const raw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
                isActive: true
            });
            connections = (Array.isArray(raw) ? raw : []).filter((conn)=>conn && conn.id && (conn.authType === "apikey" || conn.authType === "oauth"));
        } catch (err) {
            console.error(LOG_PREFIX, "Failed to load provider connections:", err);
            return;
        }
        if (connections.length === 0) return;
        // Compute backoff per connection — skip connections that aren't due yet
        const now = Date.now();
        const interval = getSweepInterval();
        const dueConnections = connections.filter((conn)=>{
            const isOAuth = conn.authType === "oauth";
            const connInterval = isOAuth ? interval * OAUTH_INTERVAL_MULTIPLIER : interval;
            const backoff = getNextBackoff(conn.id);
            const effectiveInterval = Math.max(connInterval, backoff);
            // If we don't have a failure count, it hasn't been tested this session
            const state_ = getSchedulerState();
            return !state_.failureCounts.has(conn.id) || effectiveInterval <= interval;
        });
        if (dueConnections.length === 0) return;
        console.log(LOG_PREFIX, `Testing ${dueConnections.length}/${connections.length} connections...`);
        // Process with concurrency limit
        const batches = [];
        for(let i = 0; i < dueConnections.length; i += CONCURRENCY_LIMIT){
            batches.push(dueConnections.slice(i, i + CONCURRENCY_LIMIT));
        }
        for (const batch of batches){
            await Promise.allSettled(batch.map((conn)=>testConnection(conn.id, conn.provider, conn.authType === "oauth")));
        }
    } finally{
        state.sweepInProgress = false;
        scheduleSweep();
    }
}
function scheduleSweep() {
    const state = getSchedulerState();
    if (!state.initialized) return;
    if (state.sweepTimer) clearTimeout(state.sweepTimer);
    const maxFailures = getMaxFailuresAcrossConnections();
    const baseInterval = getSweepInterval();
    const backoffInterval = BACKOFF_SCHEDULE[Math.min(maxFailures, BACKOFF_SCHEDULE.length - 1)];
    const interval = Math.max(baseInterval, backoffInterval);
    state.sweepTimer = setTimeout(sweep, interval);
}
function initCredentialHealthCheck() {
    const state = getSchedulerState();
    if (state.initialized || isCredentialHealthCheckDisabled()) return;
    state.initialized = true;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$credentialHealth$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["initCredentialCache"])();
    console.log(LOG_PREFIX, `Starting credential health check (initial delay ${INITIAL_DELAY_MS / 1000}s, interval ${getSweepInterval() / 1000}s)`);
    state.sweepTimer = setTimeout(()=>{
        sweep().catch((err)=>console.error(LOG_PREFIX, "Initial sweep failed:", err));
    }, INITIAL_DELAY_MS);
}
function stopCredentialHealthCheck() {
    const state = getSchedulerState();
    if (state.sweepTimer) {
        clearTimeout(state.sweepTimer);
        state.sweepTimer = null;
    }
    state.initialized = false;
}
async function forceSweep() {
    const state = getSchedulerState();
    state.initialized = true;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$credentialHealth$2f$cache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["initCredentialCache"])();
    await sweep();
}
// Auto-initialize on first import
initCredentialHealthCheck();
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
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
];

//# sourceMappingURL=src_lib_0bftv93._.js.map