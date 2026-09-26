module.exports = [
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

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
"[project]/src/shared/utils/logRedaction.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/shared/utils/logger.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logRotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logRotation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logRedaction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logRedaction.ts [instrumentation] (ecmascript)");
;
;
;
;
;
const isDev = ("TURBOPACK compile-time value", "development") !== "production";
const baseConfig = {
    level: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogLevel"])(("TURBOPACK compile-time truthy", 1) ? "debug" : "TURBOPACK unreachable"),
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
            return method.apply(this, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logRedaction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["redactLogArgs"])(inputArgs));
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
    const logConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logRotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLogConfig"])();
    const logLevel = baseConfig.level || "info";
    const transportConfig = getTransportCompatibleConfig();
    // If file logging is enabled, set up dual transport (stdout + file)
    if (logConfig.logToFile) {
        try {
            // Initialize log directory and rotation
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logRotation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["initLogRotation"])();
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
"[project]/src/lib/quota/saturationSignals.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__setAnthropicSaturationDepsForTests",
    ()=>__setAnthropicSaturationDepsForTests,
    "__setGenericUsageFetcherForTests",
    ()=>__setGenericUsageFetcherForTests,
    "_clearRateLimitHeaders",
    ()=>_clearRateLimitHeaders,
    "_clearSaturationCache",
    ()=>_clearSaturationCache,
    "getSaturation",
    ()=>getSaturation,
    "getTokenHeaderSaturation",
    ()=>getTokenHeaderSaturation,
    "storeRateLimitHeaders",
    ()=>storeRateLimitHeaders
]);
/**
 * saturationSignals.ts — Read the current global saturation signal (0..1)
 * for a provider/connection/dimension combination.
 *
 * Strategy (per provider):
 *   codex            → codexQuotaFetcher (dual 5h + weekly window)
 *   bailian          → bailianQuotaFetcher (triple 5h + weekly + monthly window)
 *   anthropic/claude → REAL plan-window utilization from GET /api/oauth/usage
 *                      (the same path usage.ts already uses): window "5h" →
 *                      five_hour.utilization, "weekly" → seven_day.utilization.
 *                      Falls back to the per-minute REQUEST rate-limit headers
 *                      (anthropic-ratelimit-requests-*) only when no OAuth plan
 *                      window is available (e.g. API-key Claude connections).
 *   default          → getUsageForProvider (open-sse/services/usage.ts)
 *
 * Cache: in-memory Map, TTL = 30 seconds. The 30s TTL is what keeps the
 * NON-OFFICIAL, rate-limited oauth/usage endpoint from being polled per
 * request (it returns 429 under load) — never call it on the hot path without
 * this cache. usage.ts adds its own 429 cooldown on top.
 * Fail-open: on any error, return 0 (generous mode) and log pino.warn.
 * Hard Rule #12: no stack traces propagated to return values.
 *
 * Part of: Group B — Quota Sharing Engine (plan 22, frente F6).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$accountBuckets$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/accountBuckets.ts [instrumentation] (ecmascript)");
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createLogger"])("quota:saturation");
// ---------------------------------------------------------------------------
// In-memory cache (Map<cacheKey, CacheEntry>)
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 30_000; // 30 seconds
const _cache = new Map();
const _rateLimitHeaders = new Map();
const _tokenHeaders = new Map();
const RL_HEADER_TTL_MS = 5 * 60 * 1000; // 5 minutes
function _clearRateLimitHeaders() {
    _rateLimitHeaders.clear();
    _tokenHeaders.clear();
}
/**
 * Parse an OpenAI rate-limit reset DURATION string into milliseconds.
 * OpenAI reports token/request resets as Go-style durations, e.g. "6m0s",
 * "1s", "1h30m15s", "1.5s". Returns null when unparseable.
 */ function parseDurationMs(raw) {
    const s = raw.trim();
    if (!s) return null;
    // Bounded, non-overlapping segments to avoid ReDoS (PII learning #1).
    const re = /(\d+(?:\.\d+)?)(ms|h|m|s)/g;
    let total = 0;
    let matched = false;
    let m;
    while((m = re.exec(s)) !== null){
        matched = true;
        const value = Number(m[1]);
        if (!Number.isFinite(value)) return null;
        switch(m[2]){
            case "h":
                total += value * 3_600_000;
                break;
            case "m":
                total += value * 60_000;
                break;
            case "s":
                total += value * 1000;
                break;
            case "ms":
                total += value;
                break;
        }
    }
    return matched ? total : null;
}
/**
 * Normalize a token-reset header value to epoch ms.
 *   - Anthropic: RFC3339 timestamp ("2026-01-01T00:00:30Z") → Date.parse.
 *   - OpenAI: duration ("6m0s") → now + parsed ms.
 * Returns null when absent or unparseable.
 */ function normalizeTokenReset(raw, nowMs) {
    if (!raw) return null;
    const s = raw.trim();
    if (!s) return null;
    // RFC3339 / ISO-8601 if it looks like a date (YYYY-MM-DD with a time sep).
    if (/\d{4}-\d{2}-\d{2}/.test(s) && /[T:]/.test(s)) {
        const t = Date.parse(s);
        if (Number.isFinite(t)) return t;
    }
    // Otherwise treat as an OpenAI-style duration relative to now.
    const durMs = parseDurationMs(s);
    return durMs === null ? null : nowMs + durMs;
}
/**
 * Pick the first present {limit, remaining[, reset]} triple from a list of
 * header-key candidates, in priority order. Returns null when none are usable
 * (missing keys, non-finite, or limit <= 0).
 */ function pickTokenTriple(headers, candidates) {
    for (const c of candidates){
        const limitStr = headers[c.limit];
        const remainingStr = headers[c.remaining];
        if (limitStr === undefined || remainingStr === undefined) continue;
        const limit = Number(limitStr);
        const remaining = Number(remainingStr);
        if (Number.isFinite(limit) && limit > 0 && Number.isFinite(remaining)) {
            return {
                limit,
                remaining,
                reset: headers[c.reset]
            };
        }
    }
    return null;
}
function storeRateLimitHeaders(connectionId, provider, headers) {
    const key = `${provider}:${connectionId}`;
    // ── REQUEST headers (legacy path, unchanged) ──────────────────────────────
    // Anthropic: anthropic-ratelimit-requests-limit / anthropic-ratelimit-requests-remaining
    const limitStr = headers["anthropic-ratelimit-requests-limit"] ?? headers["x-ratelimit-limit-requests"] ?? headers["x-ratelimit-limit"];
    const remainingStr = headers["anthropic-ratelimit-requests-remaining"] ?? headers["x-ratelimit-remaining-requests"] ?? headers["x-ratelimit-remaining"];
    if (limitStr && remainingStr) {
        const limit = Number(limitStr);
        const remaining = Number(remainingStr);
        if (Number.isFinite(limit) && limit > 0 && Number.isFinite(remaining)) {
            _rateLimitHeaders.set(key, {
                limit,
                remaining,
                ts: Date.now()
            });
        }
    }
    // ── TOKEN headers (universal proactive saturation) ────────────────────────
    // Anthropic base tokens, then OpenAI x-ratelimit-*-tokens, then anthropic
    // input/output variants as a fallback. First usable triple wins.
    const tokenTriple = pickTokenTriple(headers, [
        {
            limit: "anthropic-ratelimit-tokens-limit",
            remaining: "anthropic-ratelimit-tokens-remaining",
            reset: "anthropic-ratelimit-tokens-reset"
        },
        {
            limit: "x-ratelimit-limit-tokens",
            remaining: "x-ratelimit-remaining-tokens",
            reset: "x-ratelimit-reset-tokens"
        },
        {
            limit: "anthropic-ratelimit-input-tokens-limit",
            remaining: "anthropic-ratelimit-input-tokens-remaining",
            reset: "anthropic-ratelimit-input-tokens-reset"
        },
        {
            limit: "anthropic-ratelimit-output-tokens-limit",
            remaining: "anthropic-ratelimit-output-tokens-remaining",
            reset: "anthropic-ratelimit-output-tokens-reset"
        }
    ]);
    if (tokenTriple) {
        const now = Date.now();
        _tokenHeaders.set(key, {
            limit: tokenTriple.limit,
            remaining: tokenTriple.remaining,
            resetAt: normalizeTokenReset(tokenTriple.reset, now),
            ts: now
        });
    }
}
function getTokenHeaderSaturation(provider, connectionId) {
    const entry = _tokenHeaders.get(`${provider}:${connectionId}`);
    if (!entry || Date.now() - entry.ts > RL_HEADER_TTL_MS) return null;
    if (!(entry.limit > 0)) return null;
    const used = entry.limit - entry.remaining;
    const saturation = Math.min(1, Math.max(0, used / entry.limit));
    return {
        saturation,
        resetAt: entry.resetAt
    };
}
function cacheKey(connectionId, provider, dim) {
    return `${provider}:${connectionId}:${dim.unit}:${dim.window}`;
}
function _clearSaturationCache() {
    _cache.clear();
}
// ---------------------------------------------------------------------------
// Provider-specific extractors
// ---------------------------------------------------------------------------
/**
 * Map QuotaWindow to the Codex window keys returned by the fetcher.
 */ function codexWindowKey(window) {
    switch(window){
        case "5h":
            return "session"; // CODEX_WINDOW_SESSION
        case "weekly":
            return "weekly"; // CODEX_WINDOW_WEEKLY
        default:
            return "session";
    }
}
async function fetchCodexSaturation(connectionId, dim, connection) {
    // Dynamic import — codexQuotaFetcher lives in open-sse workspace
    const mod = await __turbopack_context__.A("[project]/open-sse/services/codexQuotaFetcher.ts [instrumentation] (ecmascript, async loader)");
    // #6379: pass the loaded connection snapshot through so fetchCodexQuota can
    // read its accessToken/workspaceId even when this connection was never
    // registered via registerCodexConnection() (e.g. during headroom ranking,
    // which runs BEFORE any request is dispatched for the candidate). Without
    // this, fetchCodexQuota returns null for every candidate and saturation
    // fails open to 0 across the board — headroom then can't tell accounts
    // apart and keeps the original combo order.
    const quota = await mod.fetchCodexQuota(connectionId, connection);
    if (!quota) return 0;
    const winKey = codexWindowKey(dim.window);
    const windows = quota.windows;
    const win = windows[winKey];
    if (win && typeof win.percentUsed === "number") {
        return Math.min(1, Math.max(0, win.percentUsed));
    }
    // fallback to overall percentUsed
    return Math.min(1, Math.max(0, quota.percentUsed ?? 0));
}
async function fetchBailianSaturation(connectionId, dim) {
    const mod = await __turbopack_context__.A("[project]/open-sse/services/bailianQuotaFetcher.ts [instrumentation] (ecmascript, async loader)");
    const quota = await mod.fetchBailianQuota(connectionId);
    if (!quota) return 0;
    const q = quota;
    let pct = 0;
    switch(dim.window){
        case "5h":
            pct = q.window5h?.percentUsed ?? 0;
            break;
        case "weekly":
            pct = q.windowWeekly?.percentUsed ?? 0;
            break;
        case "monthly":
            pct = q.windowMonthly?.percentUsed ?? 0;
            break;
        default:
            pct = q.percentUsed ?? 0;
    }
    return Math.min(1, Math.max(0, pct));
}
/**
 * Per-minute REQUEST rate-limit headers fallback. Used only when the OAuth
 * plan-window utilization is unavailable (e.g. API-key Claude connections that
 * have no /api/oauth/usage data). This signal reflects TPM/RPM bursts, NOT the
 * 5h/weekly plan window, so it is a weak last resort.
 */ function anthropicHeaderSaturation(connectionId) {
    const entry = _rateLimitHeaders.get(`anthropic:${connectionId}`);
    if (!entry || Date.now() - entry.ts > RL_HEADER_TTL_MS) return 0;
    const used = entry.limit - entry.remaining;
    return Math.min(1, Math.max(0, used / entry.limit));
}
let _anthropicDepsOverride = null;
function __setAnthropicSaturationDepsForTests(deps) {
    _anthropicDepsOverride = deps;
}
async function defaultAnthropicDeps() {
    const [localDbMod, usageMod] = await Promise.all([
        __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/open-sse/services/usage.ts [instrumentation] (ecmascript, async loader)")
    ]);
    return {
        loadConnection: (connectionId)=>localDbMod.getCachedProviderConnectionById(connectionId),
        fetchUsage: (conn)=>usageMod.getUsageForProvider(conn)
    };
}
/**
 * Map a QuotaWindow to the Claude usage quota key produced by getClaudeUsage
 * (usage.ts). "session (5h)" carries five_hour.utilization and "weekly (7d)"
 * carries seven_day.utilization.
 */ function claudeUsageKeyForWindow(window) {
    switch(window){
        case "5h":
            return "session (5h)";
        case "weekly":
        case "monthly":
            // Anthropic exposes a 7-day plan window, not a monthly one — treat the
            // longer requested window as the weekly plan saturation.
            return "weekly (7d)";
        default:
            return null;
    }
}
/**
 * Extract the plan utilization (0..1) for the requested window from a
 * getClaudeUsage() result, or null when the OAuth plan window is unavailable
 * (e.g. legacy/admin API-key shape with no per-window quotas).
 */ function planUtilizationFromUsage(usage, window) {
    if (!usage || typeof usage !== "object") return null;
    const quotas = usage.quotas;
    if (!quotas || typeof quotas !== "object" || Array.isArray(quotas)) return null;
    const key = claudeUsageKeyForWindow(window);
    if (!key) return null;
    const entry = quotas[key];
    if (!entry || typeof entry !== "object") return null;
    // getClaudeUsage stores `used` = utilization (% used, 0..100).
    const used = entry.used;
    if (typeof used !== "number" || !Number.isFinite(used)) return null;
    return Math.min(1, Math.max(0, used / 100));
}
async function fetchAnthropicSaturation(connectionId, dim) {
    // Try the REAL plan-window utilization first (5h / weekly), via the same
    // /api/oauth/usage path usage.ts already uses. This is the signal fairShare
    // actually needs for Claude Pro/Max — the per-minute request headers do not
    // reflect the plan window. Any failure here falls back to the header path,
    // and ultimately fails open (0).
    try {
        const deps = _anthropicDepsOverride ?? await defaultAnthropicDeps();
        const conn = await deps.loadConnection(connectionId);
        // Only OAuth connections have plan-window usage; API-key Claude does not.
        const hasOauthToken = !!conn && typeof conn.accessToken === "string" && conn.accessToken.length > 0 && (conn.authType === undefined || conn.authType === "oauth");
        if (hasOauthToken) {
            const usage = await deps.fetchUsage(conn);
            // Update the per-window saturating buckets (Phase 3 #3) off the request
            // hot path — this runs behind the 30s saturation cache. Fail-open: any
            // bucket error must never affect the primary 0..1 saturation signal.
            try {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$accountBuckets$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updateAccountBuckets"])(connectionId, usage, Date.now());
            } catch  {
            // intentionally swallowed — buckets are additive, never gate-breaking
            }
            const util = planUtilizationFromUsage(usage, dim.window);
            if (util !== null) return util;
        }
    } catch (err) {
        log.warn({
            err: err?.message,
            connectionId
        }, "anthropic oauth/usage saturation failed — falling back to rate-limit headers");
    }
    // Fallback: per-minute REQUEST rate-limit headers (weak, TPM/RPM only).
    return anthropicHeaderSaturation(connectionId);
}
let _genericUsageFetcherOverride = null;
function __setGenericUsageFetcherForTests(fetcher) {
    _genericUsageFetcherOverride = fetcher;
}
async function defaultGenericUsageFetch(connectionId, provider) {
    const mod = await __turbopack_context__.A("[project]/open-sse/services/usage.ts [instrumentation] (ecmascript, async loader)");
    const conn = {
        id: connectionId,
        provider
    };
    return mod.getUsageForProvider(conn);
}
async function fetchGenericSaturation(connectionId, provider) {
    // 1. Real usage percent is authoritative when present (a provider that
    //    actually reports utilization beats the burst-window token headers).
    try {
        const fetcher = _genericUsageFetcherOverride ?? defaultGenericUsageFetch;
        const result = await fetcher(connectionId, provider);
        if (result && typeof result === "object") {
            const obj = result;
            const pct = typeof obj.percentUsed === "number" ? obj.percentUsed : typeof obj.used_percent === "number" ? obj.used_percent : null;
            if (pct !== null && Number.isFinite(pct)) {
                return Math.min(1, Math.max(0, pct));
            }
        }
    } catch  {
    // fall through to the token-header complement
    }
    // 2. Complement/fallback: proactive TOKEN-header saturation (universal, rides
    //    on every response). Fail-open to 0 when no fresh token-header data.
    return getTokenHeaderSaturation(provider, connectionId)?.saturation ?? 0;
}
async function getSaturation(connectionId, provider, dim, connection) {
    const key = cacheKey(connectionId, provider, dim);
    const cached = _cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        return cached.value;
    }
    let value = 0;
    try {
        switch(provider){
            case "codex":
                value = await fetchCodexSaturation(connectionId, dim, connection);
                break;
            case "bailian":
                value = await fetchBailianSaturation(connectionId, dim);
                break;
            case "anthropic":
            case "claude":
                value = await fetchAnthropicSaturation(connectionId, dim);
                break;
            default:
                value = await fetchGenericSaturation(connectionId, provider);
                break;
        }
    } catch (err) {
        log.warn({
            err: err?.message,
            connectionId,
            provider
        }, "saturation fetch failed — failing open with 0");
        value = 0;
    }
    _cache.set(key, {
        value,
        ts: Date.now()
    });
    return value;
}
}),
"[externals]/pino [external] (pino, cjs, [project]/node_modules/pino)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("pino-28069d5257187539", () => require("pino-28069d5257187539"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__18y6wvx._.js.map