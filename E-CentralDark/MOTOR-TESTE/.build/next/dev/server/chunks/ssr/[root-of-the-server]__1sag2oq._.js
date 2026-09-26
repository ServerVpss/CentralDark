module.exports = [
"[project]/src/lib/quota/quotaModelNaming.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/logRotation.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [app-rsc] (ecmascript)");
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
    const logToFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAppLogToFile"])();
    const logFilePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAppLogFilePath"])() || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), "logs/application/app.log");
    const maxFileSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAppLogMaxFileSize"])();
    const retentionDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAppLogRetentionDays"])();
    const maxFiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAppLogMaxFiles"])();
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
"[project]/src/shared/utils/logRedaction.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "redactLogArgs",
    ()=>redactLogArgs,
    "redactSecrets",
    ()=>redactSecrets
]);
/**
 * Log redaction safety net (free-claude-code port, Fase 8.3).
 *
 * Final defense-in-depth layer: scrubs credentials that slip into log MESSAGES or
 * arbitrary object/error values, regardless of call site. It complements — does not
 * replace — the call-site maskers (`src/mitm/maskSecrets.ts`, `src/lib/logPayloads.ts`),
 * and runs in the pino `hooks.logMethod` (main thread, so it works with transports).
 *
 * Patterns are strictly bounded (single, non-overlapping character classes with `{n,}`
 * limits) to avoid catastrophic backtracking on untrusted input — see CLAUDE.md
 * "PII & Stream Sanitization Learnings" §1.
 */ const CENSOR = "[REDACTED]";
// Cheap pre-test: skip the (still bounded) replace work entirely for clean strings.
const SECRET_HINT = /bearer|telegram\.org\/bot|api[_-]?key|authorization|sk-/i;
const PATTERNS = [
    // Authorization: Bearer <token>  /  authorization=Bearer <token>
    [
        /(authorization\s*[:=]\s*bearer\s+)[\w.\-]{6,}/gi,
        `$1${CENSOR}`
    ],
    // bare "Bearer <token>"
    [
        /\bbearer\s+[\w.\-]{12,}/gi,
        `Bearer ${CENSOR}`
    ],
    // x-api-key: <val>  /  api_key=<val>
    [
        /((?:x-api-key|api[_-]?key)\s*[:=]\s*)[\w.\-]{6,}/gi,
        `$1${CENSOR}`
    ],
    // Telegram bot token in a URL: api.telegram.org/bot<digits>:<token>
    [
        /(api\.telegram\.org\/bot)\d{6,}:[\w\-]{20,}/gi,
        `$1${CENSOR}`
    ],
    // OpenAI-style keys: sk-... (also sk-proj-...)
    [
        /\bsk-[A-Za-z0-9_\-]{16,}/g,
        `sk-${CENSOR}`
    ]
];
const MAX_DEPTH = 6;
const MAX_NODES = 2000;
function redactSecrets(text) {
    if (typeof text !== "string" || text.length === 0 || !SECRET_HINT.test(text)) return text;
    let out = text;
    for (const [pattern, replacement] of PATTERNS){
        out = out.replace(pattern, replacement);
    }
    return out;
}
function redactValue(value, depth, state) {
    if (state.budget <= 0 || depth > MAX_DEPTH) return value;
    state.budget -= 1;
    if (typeof value === "string") return redactSecrets(value);
    if (value === null || typeof value !== "object") return value;
    if (state.seen.has(value)) return value; // circular guard
    state.seen.add(value);
    if (value instanceof Error) {
        const message = redactSecrets(value.message || "");
        const stack = redactSecrets(value.stack || "");
        // Untouched error → keep the original instance so pino's err serializer still runs.
        if (message === (value.message || "") && stack === (value.stack || "")) return value;
        // Return a redacted CLONE (not the original — it may be used elsewhere) that is still
        // a real Error, so pino's err serializer produces the usual {type, message, stack}.
        const cloned = new Error(message);
        cloned.name = value.name;
        cloned.stack = stack;
        return cloned;
    }
    if (Array.isArray(value)) {
        let changed = false;
        const out = value.map((item)=>{
            const redacted = redactValue(item, depth + 1, state);
            if (redacted !== item) changed = true;
            return redacted;
        });
        return changed ? out : value;
    }
    let changed = false;
    const out = {};
    for (const key of Object.keys(value)){
        const original = value[key];
        const redacted = redactValue(original, depth + 1, state);
        if (redacted !== original) changed = true;
        out[key] = redacted;
    }
    return changed ? out : value;
}
function redactLogArgs(args) {
    if (!Array.isArray(args) || args.length === 0) return args;
    const state = {
        budget: MAX_NODES,
        seen: new WeakSet()
    };
    let changed = false;
    const out = args.map((arg)=>{
        const redacted = redactValue(arg, 0, state);
        if (redacted !== arg) changed = true;
        return redacted;
    });
    return changed ? out : args;
}
}),
"[project]/src/shared/utils/logger.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createLogger",
    ()=>createLogger,
    "logger",
    ()=>logger
]);
/**
 * Structured Logger — Pino-based logger for OmniRoute
 *
 * Usage:
 *   import { logger } from "@/shared/utils/logger";
 *   const log = logger.child({ module: "proxy" });
 *   log.info({ model: "gpt-4o" }, "Request received");
 *   log.error({ err }, "Connection failed");
 *
 * In development, output is pretty-printed via pino-pretty.
 * In production, output is structured JSON for log aggregation.
 *
 * When APP_LOG_TO_FILE is enabled (default: true), logs are also written
 * as JSON lines to the file specified by APP_LOG_FILE_PATH.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__ = __turbopack_context__.i("[externals]/pino [external] (pino, cjs, [project]/node_modules/pino)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logRotation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logRotation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logRedaction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logRedaction.ts [app-rsc] (ecmascript)");
;
;
;
;
;
const isDev = ("TURBOPACK compile-time value", "development") !== "production";
const baseConfig = {
    level: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAppLogLevel"])(("TURBOPACK compile-time truthy", 1) ? "debug" : "TURBOPACK unreachable"),
    base: {
        service: "omniroute"
    },
    timestamp: __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"].stdTimeFunctions.isoTime,
    formatters: {
        level (label) {
            return {
                level: label
            };
        }
    },
    // Final defense-in-depth redaction net: runs in the main thread (transport-safe) and
    // scrubs credentials that slip into any log message/object/error. See logRedaction.ts.
    hooks: {
        logMethod (inputArgs, method) {
            return method.apply(this, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logRedaction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redactLogArgs"])(inputArgs));
        }
    }
};
function getTransportCompatibleConfig() {
    const { formatters, ...rest } = baseConfig;
    if (!formatters) return rest;
    const { level: _levelFormatter, ...safeFormatters } = formatters;
    return Object.keys(safeFormatters).length > 0 ? {
        ...rest,
        formatters: safeFormatters
    } : rest;
}
/**
 * Build a `pino.transport()` worker-thread stream and attach an `error` listener
 * BEFORE handing it to `pino()`.
 *
 * `pino({ transport: {...} })` builds the same stream internally but never listens
 * for its `error` event. A destination that stops existing mid-run (its directory is
 * deleted — e.g. a test's tmp `DATA_DIR` removed in `after()`, or an operator wiping
 * `logs/`) makes the worker's write fail with `ENOENT`; that surfaces as an unlistened
 * `error` event on the main-thread stream, which Node re-throws as an uncaught
 * exception (issue #6360 — "resource generated asynchronous activity after the test
 * ended"). A logger must never crash its host process because its own log file
 * vanished, so failed writes are dropped (best-effort stderr notice) instead of
 * escalating.
 */ function buildFileTransportStream(targets) {
    const stream = __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"].transport({
        targets
    });
    stream.on("error", (err)=>{
        try {
            process.stderr.write(`[logger] log transport write failed, dropping log line: ${err?.message || err}\n`);
        } catch  {
        // Nothing more we can do — never let a logging failure crash the process.
        }
    });
    return stream;
}
/**
 * Build the logger with optional file transport.
 * Uses pino transport targets for all destinations.
 */ function buildLogger() {
    const logConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logRotation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getLogConfig"])();
    const logLevel = baseConfig.level || "info";
    const transportConfig = getTransportCompatibleConfig();
    // If file logging is enabled, set up dual transport (stdout + file)
    if (logConfig.logToFile) {
        try {
            // Initialize log directory and rotation
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logRotation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initLogRotation"])();
            // Resolve to absolute path for pino worker threads
            const absLogPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(logConfig.logFilePath);
            if ("TURBOPACK compile-time truthy", 1) {
                // Dev: pino-pretty → stdout, JSON → file
                const stream = buildFileTransportStream([
                    {
                        target: "pino-pretty",
                        options: {
                            colorize: true,
                            translateTime: "HH:MM:ss.l",
                            ignore: "pid,hostname,service",
                            messageFormat: "[{module}] {msg}",
                            destination: 1
                        },
                        level: logLevel
                    },
                    {
                        target: "pino/file",
                        options: {
                            destination: absLogPath,
                            mkdir: true
                        },
                        level: logLevel
                    }
                ]);
                return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"])(transportConfig, stream);
            }
            //TURBOPACK unreachable
            ;
        } catch (err) {
            // Log the actual error for diagnostics (issue #165)
            try {
                process.stderr.write(`[logger] Failed to set up file transport, attempting sync fallback: ${err?.message || err}\n`);
            } catch  {}
            // Fallback: use sync pino.destination() instead of worker-thread transport
            // pino.transport() uses worker threads which can fail in Next.js production bundles
            try {
                const absLogPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(logConfig.logFilePath);
                const fileDestination = __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"].destination({
                    dest: absLogPath,
                    mkdir: true,
                    sync: true
                });
                fileDestination.on("error", (err)=>{
                    try {
                        process.stderr.write(`[logger] sync log destination write failed, dropping log line: ${err?.message || err}\n`);
                    } catch  {
                    // Nothing more we can do — never let a logging failure crash the process.
                    }
                });
                // Production fallback: JSON to both stdout and file via multistream
                return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"])(baseConfig, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"].multistream([
                    {
                        stream: process.stdout,
                        level: logLevel
                    },
                    {
                        stream: fileDestination,
                        level: logLevel
                    }
                ]));
            } catch (fallbackErr) {
                try {
                    process.stderr.write(`[logger] Sync fallback also failed, falling back to console only: ${fallbackErr?.message || fallbackErr}\n`);
                } catch  {}
            }
        }
    }
    // Console-only (no file logging)
    if ("TURBOPACK compile-time truthy", 1) {
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"])({
            ...baseConfig,
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "HH:MM:ss.l",
                    ignore: "pid,hostname,service",
                    messageFormat: "[{module}] {msg}"
                }
            }
        });
    }
    //TURBOPACK unreachable
    ;
}
const logger = buildLogger();
function createLogger(module) {
    return logger.child({
        module
    });
}
}),
"[project]/src/lib/quota/quotaCombos.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaGroups.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/quotaModelNaming.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
const QUOTA_SHARE_STRATEGY = "quota-share";
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createLogger"])("quota/quotaCombos");
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
    const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPool"])(poolId);
    if (!pool) return null;
    // Defensive: ensure connectionIds is always a non-empty array.
    const connectionIds = Array.isArray(pool.connectionIds) && pool.connectionIds.length > 0 ? pool.connectionIds : [
        pool.connectionId
    ];
    // B4: resolve the group name for combo naming.
    // Fall back to pool.name when the group is missing (legacy / test isolation).
    const groupName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGroupName"])(pool.groupId) ?? pool.name;
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
    const entry = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["REGISTRY"][provider];
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
    const groupSlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["quotaGroupSlug"])(groupName);
    // D2: build desired names as the UNION across ALL member connections.
    // A missing connection (no DB row / no provider field) is silently skipped —
    // it contributes nothing to the desired set but does NOT abort the whole sync.
    const desiredNames = new Set();
    // Track (connId, provider, modelIds) tuples for upsert, in order.
    const upsertWork = [];
    for (const connId of pool.connectionIds){
        let connection = null;
        try {
            connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(connId);
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
            desiredNames.add((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["quotaModelName"])(groupName, provider, modelId));
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
        const comboName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["quotaModelName"])(groupName, provider, modelId);
        const steps = conns.map((c)=>({
                kind: "model",
                model: `${provider}/${modelId}`,
                providerId: provider,
                connectionId: c.connId,
                weight: 100
            }));
        try {
            const existing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getComboByName"])(comboName);
            const payload = {
                name: comboName,
                models: steps,
                strategy: QUOTA_SHARE_STRATEGY,
                isHidden: true
            };
            if (existing && typeof existing.id === "string") await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateCombo"])(existing.id, payload);
            else await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createCombo"])(payload);
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
        allCombos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCombos"])();
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
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isQuotaModelName"])(name)) continue;
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseQuotaModelName"])(name);
        if (!parsed) continue;
        // B4: provider-scoped prune — only prune combos for THIS group+provider.
        if (parsed.groupSlug !== groupSlug) continue;
        if (parsed.provider !== poolProvider) continue;
        // Belongs to this group+provider but not produced by any current connection → prune.
        if (!desiredNames.has(name)) {
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteComboByName"])(name);
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
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isQuotaModelName"])(m.id)) return false;
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseQuotaModelName"])(m.id);
        return parsed !== null && slugSet.has(parsed.groupSlug);
    });
}
async function buildQuotaExclusiveModels(allowedQuotas, combos, timestamp, metadataFor) {
    const { resolveQuotaKeyScope } = await __turbopack_context__.A("[project]/src/lib/quota/quotaKey.ts [app-rsc] (ecmascript, async loader)");
    const scope = await resolveQuotaKeyScope(allowedQuotas);
    if (scope.poolSlugs.length === 0) return [];
    const slugSet = new Set(scope.poolSlugs);
    const out = [];
    for (const combo of combos){
        const name = typeof combo.name === "string" ? combo.name : "";
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isQuotaModelName"])(name)) continue;
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseQuotaModelName"])(name);
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
    const groupSlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["quotaGroupSlug"])(groupName);
    // Resolve the pool's provider from its connections.
    let poolProvider;
    for (const connId of pool.connectionIds){
        try {
            const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(connId);
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
        allCombos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCombos"])();
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
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isQuotaModelName"])(name)) continue;
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$quotaModelNaming$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseQuotaModelName"])(name);
        if (!parsed) continue;
        // B4: only delete combos for this group+provider.
        if (parsed.groupSlug !== groupSlug) continue;
        if (parsed.provider !== poolProvider) continue;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteComboByName"])(name);
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
"[externals]/pino [external] (pino, cjs, [project]/node_modules/pino)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("pino-28069d5257187539", () => require("pino-28069d5257187539"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1sag2oq._.js.map