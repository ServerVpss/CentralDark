module.exports = [
"[project]/src/shared/utils/secretsValidator.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "enforceSecrets",
    ()=>enforceSecrets,
    "validateSecrets",
    ()=>validateSecrets
]);
/**
 * Secrets Validator — FASE-01 Security Hardening
 *
 * Validates that required secrets are configured with strong values.
 * Called during server initialization (fail-fast on missing or weak secrets).
 *
 * @module secretsValidator
 */ const KNOWN_WEAK_SECRETS = [
    "omniroute-default-secret-change-me",
    "change-me-to-a-long-random-secret",
    "endpoint-proxy-api-key-secret",
    "change-me-storage-encryption-key",
    "your-secret-here",
    "secret",
    "password",
    "changeme"
];
/**
 * @typedef {Object} SecretRule
 * @property {string} name - Environment variable name
 * @property {number} minLength - Minimum acceptable length
 * @property {boolean} required - Whether the secret is required for startup
 * @property {string} description - Human-readable description
 * @property {string} generateHint - Command to generate a strong value
 */ /** @type {SecretRule[]} */ const SECRET_RULES = [
    {
        name: "JWT_SECRET",
        minLength: 32,
        required: false,
        description: "JWT signing secret for dashboard authentication (auto-generated if not set)",
        generateHint: "openssl rand -base64 48"
    },
    {
        name: "API_KEY_SECRET",
        minLength: 16,
        required: true,
        description: "HMAC secret for API key CRC generation",
        generateHint: "openssl rand -hex 32"
    }
];
function validateSecrets(env = process.env) {
    const errors = [];
    const warnings = [];
    for (const rule of SECRET_RULES){
        const value = env[rule.name];
        // Missing entirely
        if (!value || value.trim() === "") {
            if (rule.required) {
                errors.push({
                    name: rule.name,
                    issue: `Required environment variable "${rule.name}" is not set.`,
                    hint: `Generate with: ${rule.generateHint}`
                });
            }
            continue;
        }
        // Too short
        if (value.length < rule.minLength) {
            errors.push({
                name: rule.name,
                issue: `"${rule.name}" is too short (${value.length} chars, minimum ${rule.minLength}).`,
                hint: `Generate with: ${rule.generateHint}`
            });
            continue;
        }
        // Known weak value
        if (KNOWN_WEAK_SECRETS.includes(value.toLowerCase())) {
            warnings.push({
                name: rule.name,
                issue: `"${rule.name}" appears to use a default/weak value. Please generate a strong secret.`
            });
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
function enforceSecrets(logger = console, env = process.env) {
    const result = validateSecrets(env);
    // Print warnings (non-fatal)
    for (const w of result.warnings){
        logger.warn(`⚠️  [SECURITY] ${w.issue}`);
    }
    // If there are errors, print them and exit
    if (!result.valid) {
        logger.error("");
        logger.error("═══════════════════════════════════════════════════");
        logger.error("  ❌  SECURITY: Missing required secrets");
        logger.error("═══════════════════════════════════════════════════");
        for (const e of result.errors){
            logger.error(`  • ${e.issue}`);
            logger.error(`    → ${e.hint}`);
        }
        logger.error("");
        logger.error("  Set these in your .env file or environment.");
        logger.error("  See .env.example for reference.");
        logger.error("═══════════════════════════════════════════════════");
        logger.error("");
        process.exit(1);
    }
}
}),
"[project]/src/lib/env/runtimeEnv.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "enforceWebRuntimeEnv",
    ()=>enforceWebRuntimeEnv,
    "formatRuntimeEnvValidationErrors",
    ()=>formatRuntimeEnvValidationErrors,
    "getWebRuntimeEnv",
    ()=>getWebRuntimeEnv,
    "validateWebRuntimeEnv",
    ()=>validateWebRuntimeEnv,
    "webRuntimeEnvSchema",
    ()=>webRuntimeEnvSchema
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secretsValidator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/secretsValidator.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const NODE_ENV_VALUES = [
    "development",
    "production",
    "test"
];
const BOOLEAN_ENV_VALUES = [
    "true",
    "false"
];
function normalizeOptionalString(value) {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
}
const optionalTrimmedString = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].preprocess(normalizeOptionalString, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).optional());
const optionalBooleanEnv = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].preprocess(normalizeOptionalString, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum(BOOLEAN_ENV_VALUES).optional());
const optionalHttpUrl = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].preprocess(normalizeOptionalString, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().url().refine((value)=>value.startsWith("http://") || value.startsWith("https://"), {
    message: "must start with http:// or https://"
}).optional());
const optionalPortEnv = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].preprocess(normalizeOptionalString, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().regex(/^\d+$/, "must be an integer between 1 and 65535").refine((value)=>{
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 1 && parsed <= 65535;
}, "must be an integer between 1 and 65535").optional());
const webRuntimeEnvSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    NODE_ENV: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].preprocess(normalizeOptionalString, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum(NODE_ENV_VALUES).optional()),
    DATA_DIR: optionalTrimmedString,
    JWT_SECRET: optionalTrimmedString,
    API_KEY_SECRET: optionalTrimmedString,
    INITIAL_PASSWORD: optionalTrimmedString,
    AUTH_COOKIE_SECURE: optionalBooleanEnv,
    PRICING_SYNC_ENABLED: optionalBooleanEnv,
    OMNIROUTE_DISABLE_BACKGROUND_SERVICES: optionalBooleanEnv,
    CLOUD_URL: optionalHttpUrl,
    NEXT_PUBLIC_CLOUD_URL: optionalHttpUrl,
    OMNIROUTE_PUBLIC_BASE_URL: optionalHttpUrl,
    OMNIROUTE_BASE_URL: optionalHttpUrl,
    BASE_URL: optionalHttpUrl,
    NEXT_PUBLIC_BASE_URL: optionalHttpUrl,
    OMNIROUTE_PORT: optionalPortEnv,
    API_PORT: optionalPortEnv,
    DASHBOARD_PORT: optionalPortEnv
});
function formatZodPath(path) {
    return path.length > 0 ? String(path[0]) : "env";
}
function getSchemaIssues(error) {
    return error.issues.map((issue)=>({
            name: formatZodPath(issue.path),
            issue: `Invalid environment variable "${formatZodPath(issue.path)}": ${issue.message}.`
        }));
}
function validateWebRuntimeEnv(env = process.env) {
    const secretValidation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secretsValidator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateSecrets"])(env);
    const schemaValidation = webRuntimeEnvSchema.safeParse(env);
    const errors = [
        ...secretValidation.errors
    ];
    const warnings = [
        ...secretValidation.warnings
    ];
    if (!schemaValidation.success) {
        errors.push(...getSchemaIssues(schemaValidation.error));
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        data: schemaValidation.success ? schemaValidation.data : undefined
    };
}
function formatRuntimeEnvValidationErrors(errors, warnings = []) {
    const lines = [
        "Invalid web runtime environment configuration:"
    ];
    for (const error of errors){
        lines.push(`- ${error.issue}`);
        if (error.hint) {
            lines.push(`  hint: ${error.hint}`);
        }
    }
    for (const warning of warnings){
        lines.push(`- Warning: ${warning.issue}`);
    }
    return lines.join("\n");
}
function getWebRuntimeEnv(env = process.env) {
    const result = validateWebRuntimeEnv(env);
    if (!result.valid || !result.data) {
        throw new Error(formatRuntimeEnvValidationErrors(result.errors, result.warnings));
    }
    return result.data;
}
function enforceWebRuntimeEnv(env = process.env, logger = console) {
    const result = validateWebRuntimeEnv(env);
    for (const warning of result.warnings){
        logger.warn(`[STARTUP] ${warning.issue}`);
    }
    if (result.valid) return;
    logger.error("");
    logger.error("═══════════════════════════════════════════════════");
    logger.error("  ❌  STARTUP: Invalid web runtime environment");
    logger.error("═══════════════════════════════════════════════════");
    for (const error of result.errors){
        logger.error(`  • ${error.issue}`);
        if (error.hint) {
            logger.error(`    → ${error.hint}`);
        }
    }
    logger.error("");
    logger.error("  Fix the environment and restart the server.");
    logger.error("  Secrets are intentionally not printed.");
    logger.error("═══════════════════════════════════════════════════");
    logger.error("");
    process.exit(1);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("zod-dcb22c6336e0bc69");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0o0j3q8._.js.map