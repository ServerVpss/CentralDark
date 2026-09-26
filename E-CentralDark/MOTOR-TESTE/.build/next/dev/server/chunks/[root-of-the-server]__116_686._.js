module.exports = [
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
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
"[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createLogger",
    ()=>createLogger,
    "default",
    ()=>__TURBOPACK__default__export__,
    "defaultLogger",
    ()=>defaultLogger,
    "generateRequestId",
    ()=>generateRequestId,
    "log",
    ()=>log,
    "logger",
    ()=>logger,
    "maskKey",
    ()=>maskKey
]);
/**
 * Structured console logger utility for omniroute.
 *
 * Provides consistent, machine-parseable log output across the codebase.
 * Supports two output formats controlled by APP_LOG_FORMAT env var:
 *   - "text" (default): [LEVEL] [TAG] message {metadata}
 *   - "json": Single-line JSON objects for log aggregators
 *
 * Usage:
 *   import { logger, createLogger, generateRequestId } from "../utils/logger.ts";
 *
 *   // Tag-based (simple — for services/utilities):
 *   const log = logger("CHAT");
 *   log.info("Request received", { model: "claude-4" });
 *
 *   // Request-scoped (with correlation ID — for request pipelines):
 *   const reqLog = createLogger(generateRequestId());
 *   reqLog.info("AUTH", "Token refreshed", { provider: "claude" });
 *
 * Environment variables:
 *   APP_LOG_LEVEL  — minimum level: debug | info | warn | error (default: info)
 *   APP_LOG_FORMAT — output format: text | json (default: text)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
;
const LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};
function isLogLevel(value) {
    return Object.prototype.hasOwnProperty.call(LEVELS, value);
}
const configuredLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogLevel"])("info").toLowerCase();
const currentLevel = isLogLevel(configuredLevel) ? LEVELS[configuredLevel] : LEVELS.info;
const jsonFormat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogFormat"])("text") === "json";
let requestCounter = 0;
function generateRequestId() {
    return `req_${Date.now()}_${++requestCounter}`;
}
function maskKey(key) {
    if (!key || key.length < 12) return "(redacted)";
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
}
/**
 * Get the correct console method for a log level.
 * @param {string} level
 * @returns {Function}
 */ function getConsoleFn(level) {
    switch(level){
        case "debug":
            return console.debug;
        case "warn":
            return console.warn;
        case "error":
            return console.error;
        default:
            return console.log;
    }
}
/**
 * Format metadata object as compact JSON string for log output.
 * Omits keys with null/undefined values to keep logs clean.
 * @param {object} [meta] - Optional metadata
 * @returns {string} Formatted metadata string or empty string
 */ function formatMeta(meta) {
    if (!meta || typeof meta !== "object") return "";
    const cleaned = {};
    for (const [k, v] of Object.entries(meta)){
        if (v !== undefined && v !== null) cleaned[k] = v;
    }
    return Object.keys(cleaned).length > 0 ? ` ${JSON.stringify(cleaned)}` : "";
}
function logger(tag) {
    const emit = (level, message, meta)=>{
        if (LEVELS[level] < currentLevel) return;
        const consoleFn = getConsoleFn(level);
        if (jsonFormat) {
            const entry = {
                ts: new Date().toISOString(),
                level,
                tag,
                msg: message
            };
            if (meta && typeof meta === "object" && Object.keys(meta).length > 0) {
                entry.data = meta;
            }
            consoleFn(JSON.stringify(entry));
        } else {
            consoleFn(`[${level.toUpperCase()}] [${tag}] ${message}${formatMeta(meta)}`);
        }
    };
    return {
        debug: (message, meta)=>emit("debug", message, meta),
        info: (message, meta)=>emit("info", message, meta),
        warn: (message, meta)=>emit("warn", message, meta),
        error: (message, meta)=>emit("error", message, meta)
    };
}
function createLogger(requestId = null) {
    const emit = (level, tag, message, data)=>{
        if (LEVELS[level] < currentLevel) return;
        const consoleFn = getConsoleFn(level);
        if (jsonFormat) {
            const entry = {
                ts: new Date().toISOString(),
                level,
                tag,
                msg: message
            };
            if (requestId) entry.reqId = requestId;
            if (data && typeof data === "object" && Object.keys(data).length > 0) {
                entry.data = data;
            }
            consoleFn(JSON.stringify(entry));
        } else {
            const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
            const prefix = requestId ? `[${requestId}]` : "";
            const dataStr = formatMeta(data);
            consoleFn(`${ts} ${prefix}[${tag}] ${message}${dataStr}`);
        }
    };
    return {
        debug: (tag, msg, data)=>emit("debug", tag, msg, data),
        info: (tag, msg, data)=>emit("info", tag, msg, data),
        warn: (tag, msg, data)=>emit("warn", tag, msg, data),
        error: (tag, msg, data)=>emit("error", tag, msg, data)
    };
}
const defaultLogger = createLogger();
const log = defaultLogger;
const __TURBOPACK__default__export__ = logger;
}),
"[project]/src/lib/plugins/hooks.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logger"])("PLUGIN_HOOKS");
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
            const { pluginManager } = await __turbopack_context__.A("[project]/src/lib/plugins/manager.ts [instrumentation] (ecmascript, async loader)");
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
];

//# sourceMappingURL=%5Broot-of-the-server%5D__116_686._.js.map