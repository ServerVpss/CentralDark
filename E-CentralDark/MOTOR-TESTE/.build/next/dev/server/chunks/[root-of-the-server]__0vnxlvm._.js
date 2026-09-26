module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

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
"[project]/src/lib/consoleInterceptor.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__consoleInterceptorInternals",
    ()=>__consoleInterceptorInternals,
    "initConsoleInterceptor",
    ()=>initConsoleInterceptor
]);
/**
 * Console Log Interceptor — captures console output to a log file.
 *
 * Monkey-patches console.log, console.info, console.warn, console.error,
 * and console.debug to also append JSON log entries to a file. This allows
 * the Console Log Viewer to display application logs in real-time.
 *
 * Call initConsoleInterceptor() once at server startup (before any logging).
 *
 * @module lib/consoleInterceptor
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
;
;
;
const logToFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogToFile"])();
const logFilePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogFilePath"])());
/**
 * State owned by initConsoleInterceptor, cleared by __consoleInterceptorInternals.reset().
 * Kept module-level (not inside init) so reset() can undo a previous init: `test:unit:fast`
 * runs with `--test-isolation=none`, so a patched console or a leaked stream listener would
 * otherwise persist across every subsequent test file in the process.
 */ let savedConsoleMethods = null;
let streamErrorHandler = null;
function isEpipe(error) {
    return error?.code === "EPIPE";
}
/**
 * Handle an 'error' event on process.stdout / process.stderr.
 *
 * Node only converts a stream 'error' into an uncaughtException when the emitter has no
 * listener, so simply attaching this handler is what breaks the #8181 loop.
 *
 * That also means attaching it absorbs EVERY stream error on these streams, process-wide —
 * including conditions that are fatal today (ENOSPC, EBADF, ECONNRESET). Absorb EPIPE, which
 * is the one we are here to survive, and re-raise everything else on a fresh stack so the
 * process keeps its current crash semantics.
 */ function handleStreamError(error) {
    if (isEpipe(error)) return;
    setImmediate(()=>{
        throw error;
    });
}
/**
 * Install the stdio error guard. Idempotent.
 *
 * Deliberately independent of console interception. `structuredLogger.error()`/`.fatal()`
 * write to stderr directly, and those writes happen whether or not file logging is enabled,
 * so a broken pipe can raise an async EPIPE in configurations where interception is off
 * (`APP_LOG_TO_FILE=false`, or a log directory that cannot be created). The guard has to be
 * in place for those too, otherwise the very loop this exists to prevent is still reachable.
 */ function installStdioErrorGuard() {
    if (streamErrorHandler) return;
    streamErrorHandler = handleStreamError;
    process.stdout.on("error", streamErrorHandler);
    process.stderr.on("error", streamErrorHandler);
}
/**
 * Map console method names to log levels.
 */ const LEVEL_MAP = {
    debug: "debug",
    log: "info",
    info: "info",
    warn: "warn",
    error: "error"
};
/**
 * Ensure the log directory exists.
 */ function ensureDir() {
    const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(logFilePath);
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(dir)) {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["mkdirSync"])(dir, {
            recursive: true
        });
    }
}
/**
 * Try to extract component name from message patterns like [COMPONENT] or [component].
 */ function extractComponent(msg) {
    const match = msg.match(/^\[([^\]]+)\]/);
    return match ? match[1] : "app";
}
/**
 * Convert arguments to a string message, handling objects and errors.
 */ function argsToMessage(args) {
    return args.map((arg)=>{
        if (arg instanceof Error) return `${arg.message}\n${arg.stack || ""}`;
        if (typeof arg === "object" && arg !== null) {
            try {
                return JSON.stringify(arg);
            } catch  {
                return String(arg);
            }
        }
        return String(arg);
    }).join(" ");
}
// Rate limiting for interceptor disk writes, applied to `error` entries ONLY.
//
// The policy mirrors #1006's in structuredLogger (50 writes/sec, 5s dedup, bounded map) so the
// numbers are ones upstream has already accepted. The `error`-only scope is deliberate and is
// not what #1006 did by accident: structuredLogger applies its limiter solely to error() and
// fatal(), whereas writeEntry here serves all five of log/info/warn/error/debug across ~800
// non-error call sites. Applying a 50/sec cap to ordinary logging would silently drop routine
// startup and per-request lines from the Console Log Viewer's file.
const ERROR_DEDUP_WINDOW_MS = 5_000;
const ERROR_MAX_WRITES_PER_SECOND = 50;
const ERROR_MAX_TRACKED = 500;
let recentErrorEntries = new Map();
let errorWriteCount = 0;
let errorWindowStart = Date.now();
let missingDirNoticeEmitted = false;
function shouldSuppressErrorEntry(message) {
    const now = Date.now();
    if (now - errorWindowStart > 1000) {
        errorWriteCount = 0;
        errorWindowStart = now;
    }
    if (errorWriteCount >= ERROR_MAX_WRITES_PER_SECOND) return true;
    const firstSeen = recentErrorEntries.get(message);
    if (firstSeen !== undefined && now - firstSeen < ERROR_DEDUP_WINDOW_MS) return true;
    if (recentErrorEntries.size >= ERROR_MAX_TRACKED) {
        // Map preserves insertion order; evict oldest as a backstop against a unique-message burst.
        const oldest = recentErrorEntries.keys().next();
        if (!oldest.done) recentErrorEntries.delete(oldest.value);
    }
    recentErrorEntries.set(message, now);
    errorWriteCount++;
    return false;
}
/**
 * Report, exactly once, that the log file has become unwritable.
 *
 * Written straight to stderr rather than through console: console is patched by this module,
 * so routing it there would re-enter writeEntry and could recurse. Guarded on stream health
 * for the same reason structuredLogger's raw writes now are (#8181).
 */ function emitMissingDirNoticeOnce() {
    if (missingDirNoticeEmitted) return;
    missingDirNoticeEmitted = true;
    if (process.stderr.destroyed || process.stderr.writableEnded) return;
    try {
        process.stderr.write(`[consoleInterceptor] console file-logging is failing; log file unavailable: ${logFilePath}\n`);
    } catch  {
    /* the notice is best-effort by definition */ }
}
/**
 * Append a JSON log entry to the log file.
 *
 * ensureDir() runs once in initConsoleInterceptor(), so if the log directory is removed while
 * the process is alive every subsequent append throws ENOENT into the catch below and console
 * file-logging stops permanently, with nothing surfaced. Recreate the directory and retry once
 * before giving up, and say so on the first failure.
 */ function writeEntry(level, args) {
    try {
        const message = argsToMessage(args);
        if (level === "error" && shouldSuppressErrorEntry(message)) return;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            component: extractComponent(message),
            message
        };
        const line = JSON.stringify(entry) + "\n";
        try {
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["appendFileSync"])(logFilePath, line);
        } catch  {
            try {
                ensureDir();
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["appendFileSync"])(logFilePath, line);
            } catch  {
                emitMissingDirNoticeOnce();
            }
        }
    } catch  {
    // Silently fail — never break the app over log writing
    }
}
function shouldIgnoreConsoleWriteError(error) {
    return error instanceof Error && error.code === "EPIPE";
}
function initConsoleInterceptor() {
    // Install the stdio guard first, before any early return. It protects the raw stderr writes
    // in structuredLogger, which happen regardless of whether console interception is enabled.
    installStdioErrorGuard();
    if (!logToFile || globalThis.__omnirouteConsoleInterceptorInit) return;
    try {
        ensureDir();
    } catch  {
        // Can't create log dir — skip interception
        return;
    }
    globalThis.__omnirouteConsoleInterceptorInit = true;
    // Capture the raw method references first, so reset() can restore the exact functions that
    // were installed before patching. The bound copies below are for calling, not restoring —
    // restoring a bound copy would change function identity and defeat the save/restore that
    // existing console-mocking tests rely on.
    savedConsoleMethods = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };
    // Save original methods
    const originalMethods = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        debug: console.debug.bind(console)
    };
    // Patch each console method
    for (const [method, level] of Object.entries(LEVEL_MAP)){
        const original = originalMethods[method];
        if (!original) continue;
        console[method] = (...args)=>{
            writeEntry(level, args);
            try {
                original(...args);
            } catch (error) {
                if (!shouldIgnoreConsoleWriteError(error)) throw error;
            }
        };
    }
}
const __consoleInterceptorInternals = {
    reset () {
        if (streamErrorHandler) {
            process.stdout.removeListener("error", streamErrorHandler);
            process.stderr.removeListener("error", streamErrorHandler);
            streamErrorHandler = null;
        }
        if (savedConsoleMethods) {
            for (const [method, fn] of Object.entries(savedConsoleMethods)){
                if (fn) console[method] = fn;
            }
            savedConsoleMethods = null;
        }
        recentErrorEntries = new Map();
        errorWriteCount = 0;
        errorWindowStart = Date.now();
        missingDirNoticeEmitted = false;
        globalThis.__omnirouteConsoleInterceptorInit = undefined;
    }
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0vnxlvm._.js.map