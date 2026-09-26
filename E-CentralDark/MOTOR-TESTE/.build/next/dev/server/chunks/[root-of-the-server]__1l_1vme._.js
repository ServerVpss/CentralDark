module.exports = [
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/src/lib/jobs/cronMatch.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Minimal, dependency-free 5-field cron expression matcher (minute hour
 * day-of-month month day-of-week), evaluated against local server time.
 *
 * No cron/scheduling library exists anywhere in this codebase (checked
 * package.json + node_modules) and the established pattern for periodic
 * work (`src/lib/jobs/budgetResetJob.ts`, `reasoningCacheCleanupJob.ts`) is
 * a plain `setInterval` tick, not a scheduler. This keeps that pattern:
 * `matchesCron` only answers "is `date` inside the window this expression
 * describes", the caller (a `setInterval` tick) decides when to ask.
 */ __turbopack_context__.s([
    "matchesCron",
    ()=>matchesCron
]);
const FIELD_RANGES = [
    {
        min: 0,
        max: 59
    },
    {
        min: 0,
        max: 23
    },
    {
        min: 1,
        max: 31
    },
    {
        min: 1,
        max: 12
    },
    {
        min: 0,
        max: 6
    }
];
function parseField(field, range) {
    const values = new Set();
    for (const part of field.split(",")){
        const stepMatch = part.match(/^(\*|\d+-\d+|\d+)(?:\/(\d+))?$/);
        if (!stepMatch) return null;
        const [, base, stepRaw] = stepMatch;
        const step = stepRaw ? Number(stepRaw) : 1;
        if (!Number.isInteger(step) || step <= 0) return null;
        let start = range.min;
        let end = range.max;
        if (base !== "*") {
            if (base.includes("-")) {
                const [a, b] = base.split("-").map(Number);
                if (!Number.isInteger(a) || !Number.isInteger(b) || a > b) return null;
                start = a;
                end = b;
            } else {
                const n = Number(base);
                if (!Number.isInteger(n)) return null;
                start = n;
                end = n;
            }
        }
        if (start < range.min || end > range.max) return null;
        for(let v = start; v <= end; v += step)values.add(v);
    }
    return values.size > 0 ? values : null;
}
function matchesCron(expr, date) {
    const fields = expr.trim().split(/\s+/);
    if (fields.length !== 5) return false;
    const parsed = fields.map((f, i)=>parseField(f, FIELD_RANGES[i]));
    if (parsed.some((p)=>p === null)) return false;
    const [minutes, hours, daysOfMonth, months, daysOfWeek] = parsed;
    if (!minutes.has(date.getMinutes())) return false;
    if (!hours.has(date.getHours())) return false;
    if (!months.has(date.getMonth() + 1)) return false;
    // Standard cron semantics: when BOTH day-of-month and day-of-week are
    // restricted (not "*"), a date matching either one is sufficient (OR).
    // When only one is restricted, that one alone must match.
    const domRestricted = daysOfMonth.size < FIELD_RANGES[2].max - FIELD_RANGES[2].min + 1;
    const dowRestricted = daysOfWeek.size < FIELD_RANGES[4].max - FIELD_RANGES[4].min + 1;
    const domMatch = daysOfMonth.has(date.getDate());
    const dowMatch = daysOfWeek.has(date.getDay());
    if (domRestricted && dowRestricted) return domMatch || dowMatch;
    if (domRestricted) return domMatch;
    if (dowRestricted) return dowMatch;
    return true;
}
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:stream/promises [external] (node:stream/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/promises", () => require("node:stream/promises"));

module.exports = mod;
}),
"[externals]/node:os [external] (node:os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:os", () => require("node:os"));

module.exports = mod;
}),
"[project]/bin/cli/data-dir.mjs [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDefaultDataDir",
    ()=>getDefaultDataDir,
    "getLegacyDotDataDir",
    ()=>getLegacyDotDataDir,
    "resolveDataDir",
    ()=>resolveDataDir,
    "resolveStoragePath",
    ()=>resolveStoragePath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const APP_NAME = "omniroute";
function normalizeConfiguredPath(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(trimmed) : null;
}
function safeHomeDir() {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir();
    } catch  {
        return process.env.HOME || process.env.USERPROFILE || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].tmpdir();
    }
}
function getLegacyDotDataDir(homeDir = safeHomeDir()) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(homeDir, `.${APP_NAME}`);
}
function getDefaultDataDir() {
    const homeDir = safeHomeDir();
    const legacyDir = getLegacyDotDataDir(homeDir);
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(legacyDir)) {
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(legacyDir).isDirectory()) {
                return legacyDir;
            }
        } catch  {
        // Ignore stat errors and continue to the platform default.
        }
    }
    if ("TURBOPACK compile-time truthy", 1) {
        const appData = process.env.APPDATA || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(homeDir, "AppData", "Roaming");
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(appData, APP_NAME);
    }
    //TURBOPACK unreachable
    ;
    const xdgConfigHome = undefined;
}
function resolveDataDir() {
    const configured = normalizeConfiguredPath(process.env.DATA_DIR);
    if (configured) return configured;
    return getDefaultDataDir();
}
function resolveStoragePath(dataDir = resolveDataDir()) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dataDir, "storage.sqlite");
}
}),
"[externals]/node:timers/promises [external] (node:timers/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:timers/promises", () => require("node:timers/promises"));

module.exports = mod;
}),
"[project]/bin/cli/utils/cliToken.mjs [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLI_TOKEN_HEADER",
    ()=>CLI_TOKEN_HEADER,
    "getCliToken",
    ()=>getCliToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const SALT = "omniroute-cli-auth-v1";
const CLI_TOKEN_HEADER = "[REDIGIDO-PRESERVACAO]";
let _cached = null;
async function getCliToken() {
    if (_cached !== null) return _cached;
    try {
        const { machineIdSync } = await __turbopack_context__.A("[externals]/node-machine-id [external] (node-machine-id, cjs, [project]/node_modules/node-machine-id, async loader)");
        const mid = machineIdSync();
        _cached = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(mid + SALT).digest("hex").substring(0, 32);
    } catch  {
        _cached = "";
    }
    return _cached;
}
}),
"[project]/bin/cli/contexts.mjs [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "configPath",
    ()=>configPath,
    "loadContexts",
    ()=>loadContexts,
    "resolveActiveContext",
    ()=>resolveActiveContext,
    "saveContexts",
    ()=>saveContexts
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/data-dir.mjs [instrumentation] (ecmascript)");
;
;
;
const CONFIG_VERSION = 1;
function configPath() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])(), "config.json");
}
function defaultConfig() {
    return {
        version: CONFIG_VERSION,
        currentContext: "default",
        contexts: {
            default: {
                baseUrl: `http://localhost:${process.env.PORT || "20128"}`,
                apiKey: null
            }
        }
    };
}
function loadContexts() {
    try {
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(configPath())) return defaultConfig();
        return JSON.parse((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(configPath(), "utf8"));
    } catch  {
        return defaultConfig();
    }
}
function saveContexts(cfg) {
    const path = configPath();
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["mkdirSync"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])(path), {
        recursive: true
    });
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["writeFileSync"])(path, JSON.stringify(cfg, null, 2));
    try {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["chmodSync"])(path, 0o600);
    } catch  {}
}
function resolveActiveContext(overrideName) {
    const cfg = loadContexts();
    const contexts = cfg.contexts || cfg.profiles || {};
    const name = overrideName || cfg.currentContext || cfg.activeProfile || "default";
    const found = contexts[name] || contexts.default;
    if (found) return found;
    if (cfg.baseUrl) return {
        baseUrl: cfg.baseUrl
    };
    return {
        baseUrl: `http://localhost:${process.env.PORT || "20128"}`
    };
}
}),
"[project]/bin/cli/api.mjs [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "RETRY_DEFAULTS",
    ()=>RETRY_DEFAULTS,
    "apiFetch",
    ()=>apiFetch,
    "buildHeaders",
    ()=>buildHeaders,
    "computeBackoff",
    ()=>computeBackoff,
    "getBaseUrl",
    ()=>getBaseUrl,
    "isServerUp",
    ()=>isServerUp,
    "shouldRetryError",
    ()=>shouldRetryError,
    "shouldRetryStatus",
    ()=>shouldRetryStatus,
    "statusToExitCode",
    ()=>statusToExitCode
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$timers$2f$promises__$5b$external$5d$__$28$node$3a$timers$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:timers/promises [external] (node:timers/promises, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$utils$2f$cliToken$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/utils/cliToken.mjs [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$contexts$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/contexts.mjs [instrumentation] (ecmascript)");
;
;
;
const RETRY_DEFAULTS = Object.freeze({
    maxAttempts: 3,
    baseMs: 500,
    maxMs: 8000,
    jitter: true,
    retryableStatuses: [
        408,
        425,
        429,
        502,
        503,
        504
    ],
    retryableErrorCodes: [
        "ECONNRESET",
        "ECONNREFUSED",
        "ETIMEDOUT",
        "ENOTFOUND",
        "EAI_AGAIN",
        "EPIPE"
    ]
});
const NON_RETRYABLE_ON_MUTATION = new Set([
    409,
    422,
    429
]);
const MUTATING_METHODS = new Set([
    "POST",
    "PUT",
    "PATCH",
    "DELETE"
]);
function getBaseUrl(opts = {}) {
    if (opts.baseUrl) return stripTrailingSlash(opts.baseUrl);
    const envUrl = process.env.OMNIROUTE_BASE_URL;
    if (envUrl) return stripTrailingSlash(envUrl);
    // Resolve from the active context (canonical store + legacy profile fallback).
    // This is what makes "remote mode" work: `omniroute contexts use <remote>`
    // routes every command at the remote server's baseUrl.
    try {
        const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$contexts$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveActiveContext"])(opts.context ?? process.env.OMNIROUTE_CONTEXT);
        if (ctx?.baseUrl) return stripTrailingSlash(ctx.baseUrl);
    } catch  {
    // Config read failures are not fatal — fall through to default.
    }
    const port = process.env.PORT || "20128";
    return `http://localhost:${port}`;
}
function stripTrailingSlash(value) {
    const s = String(value);
    let end = s.length;
    while(end > 0 && s.charCodeAt(end - 1) === 47)end--;
    return end === s.length ? s : s.slice(0, end);
}
function resolveUrl(path, opts) {
    if (/^https?:\/\//i.test(path)) return path;
    return `${getBaseUrl(opts)}${path.startsWith("/") ? path : `/${path}`}`;
}
async function buildHeaders(opts) {
    const headers = new Headers(opts.headers || {});
    if (!headers.has("accept")) headers.set("accept", "application/json");
    if (opts.body && !headers.has("content-type") && typeof opts.body !== "string") {
        headers.set("content-type", "application/json");
    }
    // Auth precedence: explicit key → active-context credential → ambient env key.
    //
    // The active context's scoped token MUST win over the ambient OMNIROUTE_API_KEY:
    // `omniroute connect <remote>` saves the context's token, but users keep
    // OMNIROUTE_API_KEY in their shell. The global `--api-key` option is bound to
    // that env var (.env("OMNIROUTE_API_KEY")), so commands that spread
    // `optsWithGlobals()` into apiFetch carry opts.apiKey === the env value. If that
    // echoed value outranked the context, every remote management command would send
    // the local inference key and fail with "Invalid management token" — defeating
    // remote mode. So an opts.apiKey that merely mirrors the ambient env var is
    // treated as ambient (a fallback), NOT as an explicit override; only a DISTINCT
    // key — a real `--api-key <x>` flag or a command-supplied token like
    // `connect --key` — counts as explicit and wins. Within a context the scoped
    // accessToken wins over the legacy apiKey.
    const ambientKey = process.env.OMNIROUTE_API_KEY || null;
    const explicitKey = opts.apiKey && opts.apiKey !== ambientKey ? opts.apiKey : null;
    let auth = explicitKey;
    if (!auth) {
        try {
            const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$contexts$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveActiveContext"])(opts.context ?? process.env.OMNIROUTE_CONTEXT);
            auth = ctx?.accessToken || ctx?.apiKey || null;
        } catch  {
        // No context credential available — fall through to the ambient fallback.
        }
    }
    if (!auth) auth = opts.apiKey || ambientKey || null;
    if (auth && !headers.has("authorization")) {
        headers.set("authorization", `Bearer ${auth}`);
    }
    // Inject machine-id derived CLI token; env var override for testing.
    const cliToken = opts.cliToken ?? process.env.OMNIROUTE_CLI_TOKEN ?? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$utils$2f$cliToken$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCliToken"])();
    if (cliToken && !headers.has(__TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$utils$2f$cliToken$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLI_TOKEN_HEADER"])) {
        headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$utils$2f$cliToken$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLI_TOKEN_HEADER"], cliToken);
    }
    if (opts.idempotencyKey && !headers.has("idempotency-key")) {
        headers.set("idempotency-key", opts.idempotencyKey);
    }
    return headers;
}
function serializeBody(body, headers) {
    if (body == null) return undefined;
    if (typeof body === "string") return body;
    if (body instanceof Buffer) return body;
    if (body instanceof URLSearchParams) return body;
    if (typeof body.pipe === "function") return body; // stream
    if (headers.get("content-type")?.includes("application/json")) return JSON.stringify(body);
    return JSON.stringify(body);
}
function computeBackoff(attempt, retryAfterHeader, defaults = RETRY_DEFAULTS) {
    if (retryAfterHeader != null) {
        const secs = Number.parseFloat(String(retryAfterHeader));
        if (Number.isFinite(secs) && secs >= 0) {
            return Math.min(secs * 1000, defaults.maxMs);
        }
    }
    const exp = Math.min(defaults.baseMs * 2 ** (attempt - 1), defaults.maxMs);
    if (!defaults.jitter) return exp;
    const jitter = exp * 0.25 * (Math.random() * 2 - 1);
    return Math.max(0, exp + jitter);
}
function shouldRetryStatus(status, method, opts = {}) {
    if (opts.retry === false) return false;
    const list = opts.retryableStatuses || RETRY_DEFAULTS.retryableStatuses;
    if (!list.includes(status)) return false;
    if (MUTATING_METHODS.has(method) && NON_RETRYABLE_ON_MUTATION.has(status)) {
        return status === 429 ? Boolean(opts.retryMutationsOn429) : false;
    }
    return true;
}
function shouldRetryError(err, opts = {}) {
    if (opts.retry === false) return false;
    const codes = opts.retryableErrorCodes || RETRY_DEFAULTS.retryableErrorCodes;
    if (err?.code && codes.includes(err.code)) return true;
    if (err?.name === "AbortError" || /timeout|abort/i.test(err?.message || "")) return true;
    return false;
}
function statusToExitCode(status) {
    if (status >= 200 && status < 300) return 0;
    if (status === 408) return 124;
    if (status === 401 || status === 403) return 4;
    if (status === 429) return 5;
    if (status === 400 || status === 404 || status === 422) return 2;
    if (status >= 500) return 1;
    return 1;
}
class ApiError extends Error {
    constructor(message, { status, code, exitCode } = {}){
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.exitCode = exitCode ?? (status != null ? statusToExitCode(status) : 1);
    }
}
async function readResponseBody(res) {
    const ct = res.headers.get("content-type") || "";
    try {
        if (ct.includes("application/json")) return await res.json();
        return await res.text();
    } catch  {
        return null;
    }
}
function fetchOnce(url, init, timeoutMs) {
    if (!timeoutMs) return fetch(url, init);
    const ac = new AbortController();
    const t = setTimeout(()=>ac.abort(), timeoutMs);
    const merged = {
        ...init,
        signal: ac.signal
    };
    return fetch(url, merged).finally(()=>clearTimeout(t));
}
async function apiFetch(path, opts = {}) {
    const method = String(opts.method || "GET").toUpperCase();
    const url = resolveUrl(path, opts);
    const headers = await buildHeaders(opts);
    const body = serializeBody(opts.body, headers);
    const timeout = opts.timeout ?? (Number.parseInt(process.env.OMNIROUTE_HTTP_TIMEOUT_MS || "", 10) || 30000);
    const maxAttempts = opts.retry === false ? 1 : opts.retryMax ?? RETRY_DEFAULTS.maxAttempts;
    const verbose = opts.verbose ?? process.env.OMNIROUTE_VERBOSE === "1";
    let lastErr;
    for(let attempt = 1; attempt <= maxAttempts; attempt++){
        try {
            const res = await fetchOnce(url, {
                method,
                headers,
                body
            }, timeout);
            if (res.ok) return enrichResponse(res, opts);
            if (attempt < maxAttempts && shouldRetryStatus(res.status, method, opts)) {
                const delay = computeBackoff(attempt, res.headers.get("retry-after"));
                if (verbose) {
                    process.stderr.write(`[retry ${attempt}/${maxAttempts - 1}] ${method} ${url} → HTTP ${res.status}; wait ${Math.round(delay)}ms\n`);
                }
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$timers$2f$promises__$5b$external$5d$__$28$node$3a$timers$2f$promises$2c$__cjs$29$__["setTimeout"])(delay);
                continue;
            }
            return enrichResponse(res, opts);
        } catch (err) {
            lastErr = err;
            if (attempt < maxAttempts && shouldRetryError(err, opts)) {
                const delay = computeBackoff(attempt, null);
                if (verbose) {
                    process.stderr.write(`[retry ${attempt}/${maxAttempts - 1}] ${method} ${url} → ${err.code || err.message}; wait ${Math.round(delay)}ms\n`);
                }
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$timers$2f$promises__$5b$external$5d$__$28$node$3a$timers$2f$promises$2c$__cjs$29$__["setTimeout"])(delay);
                continue;
            }
            throw normalizeNetworkError(err);
        }
    }
    throw normalizeNetworkError(lastErr);
}
function enrichResponse(res, opts) {
    res.exitCode = statusToExitCode(res.status);
    res.json = res.json.bind(res);
    res.text = res.text.bind(res);
    if (!res.ok && !opts.acceptNotOk) {
        res.assertOk = async ()=>{
            const payload = await readResponseBody(res);
            const message = extractErrorMessage(payload, res.status);
            throw new ApiError(message, {
                status: res.status
            });
        };
    } else {
        res.assertOk = async ()=>res;
    }
    return res;
}
function extractErrorMessage(payload, status) {
    if (payload && typeof payload === "object") {
        if (typeof payload.error === "string") return payload.error;
        if (payload.error?.message) return String(payload.error.message);
        if (payload.message) return String(payload.message);
    }
    if (typeof payload === "string" && payload.length < 200) return payload;
    return `HTTP ${status}`;
}
function normalizeNetworkError(err) {
    if (err instanceof ApiError) return err;
    const code = err?.code || (err?.name === "AbortError" ? "ETIMEDOUT" : undefined);
    const exitCode = code === "ETIMEDOUT" ? 124 : 1;
    return new ApiError(err?.message || "network error", {
        code,
        exitCode
    });
}
async function isServerUp(opts = {}) {
    try {
        const res = await apiFetch("/api/health", {
            ...opts,
            retry: false,
            timeout: opts.timeout ?? 1500,
            acceptNotOk: true
        });
        return res.ok || res.status < 500;
    } catch  {
        return false;
    }
}
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[project]/bin/cli/i18n.mjs [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectLocale",
    ()=>detectLocale,
    "getLocale",
    ()=>getLocale,
    "resetForTests",
    ()=>resetForTests,
    "setLocale",
    ()=>setLocale,
    "t",
    ()=>t
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:url [external] (node:url, cjs)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("bin/cli/i18n.mjs")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
;
const __dirname = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__["fileURLToPath"])(__TURBOPACK__import$2e$meta__.url));
const LOCALES_DIR = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(__dirname, "locales");
const FALLBACK_LOCALE = "en";
const cache = new Map();
let activeLocale = null;
let fallbackCatalog = null;
function detectLocale() {
    const raw = process.env.OMNIROUTE_LANG || process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || FALLBACK_LOCALE;
    return normalize(raw);
}
function normalize(raw) {
    const stripped = String(raw).split(".")[0].replaceAll("_", "-");
    if (!stripped || !/^[a-zA-Z0-9-]+$/.test(stripped)) return FALLBACK_LOCALE;
    if (hasCatalog(stripped)) return stripped;
    const base = stripped.split("-")[0];
    if (hasCatalog(base)) return base;
    return FALLBACK_LOCALE;
}
function hasCatalog(locale) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(LOCALES_DIR, `${locale}.json`));
}
function flattenToMap(obj, prefix, result) {
    for (const [key, value] of Object.entries(obj)){
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            flattenToMap(value, fullKey, result);
        } else if (typeof value === "string") {
            result.set(fullKey, value);
        }
    }
}
function loadCatalog(locale) {
    if (cache.has(locale)) return cache.get(locale);
    const file = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(LOCALES_DIR, `${locale}.json`);
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(file)) {
        cache.set(locale, null);
        return null;
    }
    try {
        const parsed = JSON.parse((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(file, "utf8"));
        const flat = new Map();
        flattenToMap(parsed, "", flat);
        cache.set(locale, flat);
        return flat;
    } catch  {
        cache.set(locale, null);
        return null;
    }
}
function setLocale(locale) {
    activeLocale = normalize(locale);
    loadCatalog(activeLocale);
    return activeLocale;
}
function getLocale() {
    if (!activeLocale) activeLocale = detectLocale();
    return activeLocale;
}
function interpolate(template, vars) {
    if (!vars) return template;
    const entries = Object.entries(vars);
    if (entries.length === 0) return template;
    const varMap = new Map(entries);
    return template.replace(/\{(\w+)\}/g, (match, name)=>{
        const v = varMap.get(name);
        return v !== undefined ? String(v) : match;
    });
}
function t(key, vars) {
    if (!activeLocale) activeLocale = detectLocale();
    const primary = loadCatalog(activeLocale);
    const fromPrimary = primary?.get(key);
    if (fromPrimary !== undefined) return interpolate(fromPrimary, vars);
    if (activeLocale !== FALLBACK_LOCALE) {
        if (!fallbackCatalog) fallbackCatalog = loadCatalog(FALLBACK_LOCALE);
        const fromFallback = fallbackCatalog?.get(key);
        if (fromFallback !== undefined) return interpolate(fromFallback, vars);
    }
    return key;
}
function resetForTests() {
    cache.clear();
    activeLocale = null;
    fallbackCatalog = null;
}
}),
"[project]/bin/cli/encryption.mjs [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decryptCredential",
    ()=>decryptCredential,
    "encryptCredential",
    ()=>encryptCredential
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const KEY_LENGTH = 32;
// Full 16-byte GCM tag produced by cipher.getAuthTag(). Pinning authTagLength on
// decrypt rejects truncated tags, closing the GCM tag-truncation forgery vector.
const AUTH_TAG_LENGTH = 16;
const PREFIX = "enc:v1:";
// Keep this salt in sync with the app-side field encryption format so credentials written by
// CLI setup remain decryptable by the dashboard/server and vice versa.
const STATIC_SALT = "omniroute-field-encryption-v1";
let cachedKey = null;
function getEncryptionKey() {
    if (cachedKey !== null) return cachedKey;
    const secret = process.env.STORAGE_ENCRYPTION_KEY;
    if (!secret || typeof secret !== "string" || secret.trim().length === 0) {
        return null;
    }
    cachedKey = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["scryptSync"])(secret, STATIC_SALT, KEY_LENGTH);
    return cachedKey;
}
function encryptCredential(value) {
    if (!value || typeof value !== "string" || value.startsWith(PREFIX)) return value || null;
    const key = getEncryptionKey();
    if (!key) return value;
    const iv = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(IV_LENGTH);
    const cipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createCipheriv"])(ALGORITHM, key, iv);
    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${PREFIX}${iv.toString("hex")}:${encrypted}:${authTag}`;
}
function decryptCredential(value) {
    if (!value || typeof value !== "string") return value || null;
    if (!value.startsWith(PREFIX)) return value;
    const key = getEncryptionKey();
    if (!key) {
        throw new Error("STORAGE_ENCRYPTION_KEY is required to decrypt this provider credential.");
    }
    const body = value.slice(PREFIX.length);
    const parts = body.split(":");
    if (parts.length !== 3) {
        throw new Error("Malformed encrypted provider credential.");
    }
    const [ivHex, encryptedHex, authTagHex] = parts;
    const decipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createDecipheriv"])(ALGORITHM, key, Buffer.from(ivHex, "hex"), {
        authTagLength: AUTH_TAG_LENGTH
    });
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
}),
"[project]/bin/cli/provider-store.mjs [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureProviderSchema",
    ()=>ensureProviderSchema,
    "findProviderConnection",
    ()=>findProviderConnection,
    "getProviderApiKey",
    ()=>getProviderApiKey,
    "listProviderConnections",
    ()=>listProviderConnections,
    "removeProviderConnectionByProvider",
    ()=>removeProviderConnectionByProvider,
    "updateProviderApiKey",
    ()=>updateProviderApiKey,
    "updateProviderTestResult",
    ()=>updateProviderTestResult,
    "upsertApiKeyProviderConnection",
    ()=>upsertApiKeyProviderConnection
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$encryption$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/encryption.mjs [instrumentation] (ecmascript)");
;
;
const REQUIRED_PROVIDER_COLUMNS = [
    [
        "auth_type",
        "TEXT"
    ],
    [
        "name",
        "TEXT"
    ],
    [
        "email",
        "TEXT"
    ],
    [
        "priority",
        "INTEGER DEFAULT 0"
    ],
    [
        "is_active",
        "INTEGER DEFAULT 1"
    ],
    [
        "access_token",
        "TEXT"
    ],
    [
        "refresh_token",
        "TEXT"
    ],
    [
        "expires_at",
        "TEXT"
    ],
    [
        "token_expires_at",
        "TEXT"
    ],
    [
        "scope",
        "TEXT"
    ],
    [
        "project_id",
        "TEXT"
    ],
    [
        "test_status",
        "TEXT"
    ],
    [
        "error_code",
        "TEXT"
    ],
    [
        "last_error",
        "TEXT"
    ],
    [
        "last_error_at",
        "TEXT"
    ],
    [
        "last_error_type",
        "TEXT"
    ],
    [
        "last_error_source",
        "TEXT"
    ],
    [
        "backoff_level",
        "INTEGER DEFAULT 0"
    ],
    [
        "rate_limited_until",
        "TEXT"
    ],
    [
        "health_check_interval",
        "INTEGER"
    ],
    [
        "last_health_check_at",
        "TEXT"
    ],
    [
        "last_tested",
        "TEXT"
    ],
    [
        "api_key",
        "TEXT"
    ],
    [
        "id_token",
        "TEXT"
    ],
    [
        "provider_specific_data",
        "TEXT"
    ],
    [
        "expires_in",
        "INTEGER"
    ],
    [
        "display_name",
        "TEXT"
    ],
    [
        "global_priority",
        "INTEGER"
    ],
    [
        "default_model",
        "TEXT"
    ],
    [
        "token_type",
        "TEXT"
    ],
    [
        "consecutive_use_count",
        "INTEGER DEFAULT 0"
    ],
    [
        "rate_limit_protection",
        "INTEGER DEFAULT 0"
    ],
    [
        "last_used_at",
        "TEXT"
    ],
    [
        '"group"',
        "TEXT"
    ],
    [
        "max_concurrent",
        "INTEGER"
    ],
    [
        "created_at",
        "TEXT"
    ],
    [
        "updated_at",
        "TEXT"
    ]
];
function ensureProviderColumns(db) {
    const existingColumns = new Set(db.prepare("PRAGMA table_info(provider_connections)").all().map((column)=>column.name));
    const missingColumns = REQUIRED_PROVIDER_COLUMNS.filter(([name])=>{
        const normalizedName = name.replaceAll('"', "");
        return !existingColumns.has(normalizedName);
    });
    if (missingColumns.length === 0) return;
    db.transaction(()=>{
        for (const [name, type] of missingColumns){
            db.prepare(`ALTER TABLE provider_connections ADD COLUMN ${name} ${type}`).run();
        }
    })();
}
function ensureProviderSchema(db) {
    db.prepare(`CREATE TABLE IF NOT EXISTS provider_connections (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      auth_type TEXT,
      name TEXT,
      email TEXT,
      priority INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      access_token TEXT,
      refresh_token TEXT,
      expires_at TEXT,
      token_expires_at TEXT,
      scope TEXT,
      project_id TEXT,
      test_status TEXT,
      error_code TEXT,
      last_error TEXT,
      last_error_at TEXT,
      last_error_type TEXT,
      last_error_source TEXT,
      backoff_level INTEGER DEFAULT 0,
      rate_limited_until TEXT,
      health_check_interval INTEGER,
      last_health_check_at TEXT,
      last_tested TEXT,
      api_key TEXT,
      id_token TEXT,
      provider_specific_data TEXT,
      expires_in INTEGER,
      display_name TEXT,
      global_priority INTEGER,
      default_model TEXT,
      token_type TEXT,
      consecutive_use_count INTEGER DEFAULT 0,
      rate_limit_protection INTEGER DEFAULT 0,
      last_used_at TEXT,
      "group" TEXT,
      max_concurrent INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`).run();
    ensureProviderColumns(db);
    db.prepare("CREATE INDEX IF NOT EXISTS idx_pc_provider ON provider_connections(provider)").run();
    db.prepare("CREATE INDEX IF NOT EXISTS idx_pc_active ON provider_connections(is_active)").run();
    db.prepare("CREATE INDEX IF NOT EXISTS idx_pc_priority ON provider_connections(provider, priority)").run();
}
function nextPriority(db, provider) {
    const row = db.prepare("SELECT MAX(priority) as max_priority FROM provider_connections WHERE provider = ?").get(provider);
    return Number(row?.max_priority || 0) + 1;
}
function parseJsonObject(value) {
    if (!value || typeof value !== "string") return undefined;
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch  {
        return null;
    }
}
function rowToConnection(row) {
    return {
        id: row.id,
        provider: row.provider,
        authType: row.auth_type || "oauth",
        name: row.name || row.display_name || row.email || row.provider,
        email: row.email || null,
        priority: row.priority || 0,
        isActive: row.is_active !== 0,
        apiKey: row.api_key || null,
        accessToken: row.access_token || null,
        refreshToken: row.refresh_token || null,
        idToken: row.id_token || null,
        providerSpecificData: parseJsonObject(row.provider_specific_data),
        testStatus: row.test_status || "unknown",
        defaultModel: row.default_model || null,
        lastTested: row.last_tested || null,
        lastError: row.last_error || null,
        updatedAt: row.updated_at || null,
        createdAt: row.created_at || null
    };
}
function listProviderConnections(db) {
    ensureProviderSchema(db);
    return db.prepare(`SELECT * FROM provider_connections
       ORDER BY provider ASC, priority ASC, updated_at DESC`).all().map(rowToConnection);
}
function findProviderConnection(db, selector) {
    const normalized = String(selector || "").trim().toLowerCase();
    if (!normalized) return null;
    const connections = listProviderConnections(db);
    return connections.find((connection)=>connection.id.toLowerCase() === normalized) || connections.find((connection)=>connection.id.toLowerCase().startsWith(normalized)) || connections.find((connection)=>String(connection.name || "").toLowerCase() === normalized) || connections.find((connection)=>connection.provider.toLowerCase() === normalized) || null;
}
function getProviderApiKey(connection) {
    if (connection.authType !== "apikey") {
        throw new Error(`Connection ${connection.name} is not an API-key provider.`);
    }
    if (!connection.apiKey) {
        throw new Error(`Connection ${connection.name} has no API key configured.`);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$encryption$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["decryptCredential"])(connection.apiKey);
}
function upsertApiKeyProviderConnection(db, input) {
    ensureProviderSchema(db);
    const provider = input.provider;
    const name = input.name || provider;
    const now = new Date().toISOString();
    const existing = db.prepare("SELECT id, priority FROM provider_connections WHERE provider = ? AND auth_type = 'apikey' AND name = ?").get(provider, name);
    const connection = {
        id: existing?.id || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        provider,
        authType: "apikey",
        name,
        priority: existing?.priority || nextPriority(db, provider),
        isActive: 1,
        apiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$encryption$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["encryptCredential"])(input.apiKey),
        testStatus: input.testStatus || "unknown",
        defaultModel: input.defaultModel || null,
        providerSpecificData: input.providerSpecificData ? JSON.stringify(input.providerSpecificData) : null,
        createdAt: input.createdAt || now,
        updatedAt: now
    };
    db.prepare(`INSERT INTO provider_connections (
      id, provider, auth_type, name, priority, is_active, api_key, provider_specific_data,
      test_status, default_model, created_at, updated_at
    ) VALUES (
      @id, @provider, @authType, @name, @priority, @isActive, @apiKey, @providerSpecificData,
      @testStatus, @defaultModel, @createdAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      api_key = excluded.api_key,
      provider_specific_data = excluded.provider_specific_data,
      test_status = excluded.test_status,
      default_model = excluded.default_model,
      is_active = excluded.is_active,
      updated_at = excluded.updated_at`).run(connection);
    return connection;
}
function removeProviderConnectionByProvider(db, provider) {
    ensureProviderSchema(db);
    const result = db.prepare("DELETE FROM provider_connections WHERE provider = ? AND (auth_type = 'apikey' OR (api_key IS NOT NULL AND api_key != ''))").run(provider);
    return result.changes;
}
function updateProviderApiKey(db, connectionId, encryptedKey) {
    ensureProviderSchema(db);
    const now = new Date().toISOString();
    const result = db.prepare(`UPDATE provider_connections
         SET api_key = @apiKey,
             test_status = 'unknown',
             last_error = NULL,
             last_error_at = NULL,
             last_error_type = NULL,
             last_error_source = NULL,
             error_code = NULL,
             rate_limited_until = NULL,
             backoff_level = 0,
             updated_at = @updatedAt
       WHERE id = @id`).run({
        id: connectionId,
        apiKey: encryptedKey,
        updatedAt: now
    });
    return result.changes;
}
function updateProviderTestResult(db, connectionId, result) {
    ensureProviderSchema(db);
    const now = new Date().toISOString();
    const valid = result?.valid === true;
    db.prepare(`UPDATE provider_connections SET
      test_status = @testStatus,
      last_error = @lastError,
      last_error_at = @lastErrorAt,
      last_error_type = @lastErrorType,
      last_error_source = @lastErrorSource,
      error_code = @errorCode,
      last_tested = @lastTested,
      updated_at = @updatedAt
    WHERE id = @id`).run({
        id: connectionId,
        testStatus: valid ? "active" : "error",
        lastError: valid ? null : result?.error || "Provider test failed",
        lastErrorAt: valid ? null : now,
        lastErrorType: valid ? null : "connection_test_failed",
        lastErrorSource: valid ? null : "upstream",
        errorCode: valid ? null : result?.statusCode || null,
        lastTested: now,
        updatedAt: now
    });
    return {
        ...result,
        testedAt: now
    };
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/bin/cli/settings-store.mjs [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureSettingsSchema",
    ()=>ensureSettingsSchema,
    "getSettings",
    ()=>getSettings,
    "hashManagementPassword",
    ()=>hashManagementPassword,
    "updateSettings",
    ()=>updateSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [instrumentation] (ecmascript)");
;
const MANAGEMENT_PASSWORD_SALT_ROUNDS = 12;
async function hashManagementPassword(password) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"].hash(password, MANAGEMENT_PASSWORD_SALT_ROUNDS);
}
function ensureSettingsSchema(db) {
    db.prepare(`CREATE TABLE IF NOT EXISTS key_value (
      namespace TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (namespace, key)
    )`).run();
}
function updateSettings(db, updates) {
    ensureSettingsSchema(db);
    const insert = db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('settings', ?, ?)");
    const tx = db.transaction(()=>{
        for (const [key, value] of Object.entries(updates)){
            insert.run(key, JSON.stringify(value));
        }
    });
    tx();
}
function getSettings(db) {
    ensureSettingsSchema(db);
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'settings'").all();
    const settings = {};
    for (const row of rows){
        try {
            settings[row.key] = JSON.parse(row.value);
        } catch  {
            settings[row.key] = row.value;
        }
    }
    return settings;
}
}),
"[project]/bin/cli/sqlite.mjs [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "backupSqliteFile",
    ()=>backupSqliteFile,
    "createSqliteNativeError",
    ()=>createSqliteNativeError,
    "normalizeBunSqliteParams",
    ()=>normalizeBunSqliteParams,
    "openOmniRouteDb",
    ()=>openOmniRouteDb,
    "readDatabaseHealth",
    ()=>readDatabaseHealth,
    "readEncryptedCredentialSamples",
    ()=>readEncryptedCredentialSamples,
    "readManagementPasswordState",
    ()=>readManagementPasswordState,
    "resetManagementPassword",
    ()=>resetManagementPassword,
    "withReadonlySqlite",
    ()=>withReadonlySqlite
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/data-dir.mjs [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$provider$2d$store$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/provider-store.mjs [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$settings$2d$store$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/settings-store.mjs [instrumentation] (ecmascript)");
;
;
;
;
async function loadSqlite() {
    if (process.versions.bun) {
        return {
            Database: (await __turbopack_context__.A("[externals]/bun:sqlite [external] (bun:sqlite, cjs, async loader)")).Database
        };
    }
    try {
        return {
            Database: (await __turbopack_context__.A("[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/node_modules/better-sqlite3, async loader)")).default
        };
    } catch (error) {
        return {
            error
        };
    }
}
// #7586: unlike the real server (src/lib/db/adapters/driverFactory.ts::tryOpenSync),
// this CLI helper historically had NO fallback beyond better-sqlite3 — so on any
// machine where better-sqlite3's native binary is unavailable (Windows without a
// prebuilt addon, etc.), every `omniroute doctor` DB check reported a false FAIL
// even when the actual server was healthy via its own (correct) driver cascade.
// Reuse that same cascade here instead of re-deriving it.
async function openWithSyncDriverFallback(dbPath, options, importError) {
    try {
        const { tryOpenSync } = await __turbopack_context__.A("[project]/src/lib/db/adapters/driverFactory.ts [instrumentation] (ecmascript, async loader)");
        const adapter = tryOpenSync(dbPath, options);
        if (adapter) {
            return adapter;
        }
    } catch  {
    // fall through to the original better-sqlite3 error below
    }
    throw createSqliteNativeError(importError);
}
function openBunSqlite(Database, dbPath, options) {
    const raw = new Database(dbPath, options);
    const prepare = (sql)=>{
        const statement = raw.query(sql);
        return {
            run: (...params)=>statement.run(...normalizeBunSqliteParams(params)),
            get: (...params)=>statement.get(...normalizeBunSqliteParams(params)),
            all: (...params)=>statement.all(...normalizeBunSqliteParams(params))
        };
    };
    return {
        prepare,
        query: (sql)=>raw.query(sql),
        exec: (sql)=>raw.exec(sql),
        transaction: (fn)=>raw.transaction(fn),
        close: ()=>raw.close(),
        serialize: ()=>raw.serialize(),
        pragma: (pragmaStr, pragmaOptions)=>{
            const statement = raw.query(`PRAGMA ${pragmaStr}`);
            if (pragmaOptions?.simple) {
                const row = statement.get();
                return row ? Object.values(row)[0] ?? null : null;
            }
            return statement.all();
        }
    };
}
function normalizeBunSqliteParams(params) {
    if (params.length !== 1 || params[0] === null || typeof params[0] !== "object" || Array.isArray(params[0]) || params[0] instanceof Uint8Array || typeof Buffer !== "undefined" && Buffer.isBuffer(params[0])) {
        return params;
    }
    const expanded = {};
    for (const [key, value] of Object.entries(params[0])){
        if (/^[:@$]/.test(key)) expanded[key] = value;
        else {
            expanded[`@${key}`] = value;
            expanded[`:${key}`] = value;
            expanded[`$${key}`] = value;
        }
    }
    return [
        expanded
    ];
}
function createSqliteNativeError(error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("NODE_MODULE_VERSION") || message.includes("ERR_DLOPEN_FAILED")) {
        return new Error("better-sqlite3 native binding is incompatible with this Node.js runtime. " + "Run `npm rebuild better-sqlite3` in the OmniRoute project and try again. " + "Or run: omniroute runtime repair  " + "(rebuilds into a user-writable runtime; works without a C++ toolchain).");
    }
    if (message.includes("Could not locate the bindings file") || message.includes("MODULE_NOT_FOUND") || message.includes("Cannot find module 'better-sqlite3'")) {
        return new Error("better-sqlite3 native binding could not be found (no prebuilt addon for this platform). " + "This is common under `npx`, which runs a fresh, ephemeral install that never built the addon. " + "Run: omniroute runtime repair  " + "(rebuilds into a user-writable runtime; works without a C++ toolchain).");
    }
    return error;
}
async function openSqliteDatabase(dbPath, options = {}) {
    const loaded = await loadSqlite();
    if (process.versions.bun) {
        if (options.fileMustExist && !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(dbPath)) {
            throw new Error(`SQLite file does not exist: ${dbPath}`);
        }
        const bunOptions = options.readonly ? {
            readonly: true
        } : {
            readwrite: true,
            create: options.fileMustExist !== true
        };
        try {
            return openBunSqlite(loaded.Database, dbPath, bunOptions);
        } catch (error) {
            throw createSqliteNativeError(error);
        }
    }
    if (loaded.error) {
        return openWithSyncDriverFallback(dbPath, options, loaded.error);
    }
    try {
        return new loaded.Database(dbPath, options);
    } catch (error) {
        throw createSqliteNativeError(error);
    }
}
async function openOmniRouteDb() {
    const dataDir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])();
    const dbPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveStoragePath"])(dataDir);
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].mkdirSync(dataDir, {
        recursive: true
    });
    const db = await openSqliteDatabase(dbPath);
    db.pragma("journal_mode = WAL");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$settings$2d$store$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureSettingsSchema"])(db);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$provider$2d$store$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureProviderSchema"])(db);
    return {
        db,
        dataDir,
        dbPath
    };
}
async function withReadonlySqlite(dbPath, callback) {
    const db = await openSqliteDatabase(dbPath, {
        readonly: true,
        fileMustExist: true
    });
    try {
        return await callback(db);
    } finally{
        db.close();
    }
}
async function backupSqliteFile(sourcePath, destPath) {
    const db = await openSqliteDatabase(sourcePath, {
        readonly: true
    });
    try {
        if (typeof db.backup === "function") {
            await db.backup(destPath);
        } else if (sourcePath === ":memory:" && typeof db.serialize === "function") {
            __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(destPath, Buffer.from(db.serialize()));
        } else {
            try {
                db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
            } catch  {}
            __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].copyFileSync(sourcePath, destPath);
        }
    } finally{
        db.close();
    }
}
async function readDatabaseHealth(dbPath) {
    return withReadonlySqlite(dbPath, (db)=>{
        const quickCheck = db.prepare("PRAGMA quick_check").get();
        const quickCheckValue = Object.values(quickCheck || {})[0];
        const hasMigrationTable = !!db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get("_omniroute_migrations");
        const appliedMigrationVersions = hasMigrationTable ? db.prepare("SELECT version FROM _omniroute_migrations").all().map((row)=>row.version) : [];
        return {
            quickCheckValue,
            hasMigrationTable,
            appliedMigrationVersions
        };
    });
}
async function readEncryptedCredentialSamples(dbPath) {
    return withReadonlySqlite(dbPath, (db)=>{
        const hasProviderTable = !!db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get("provider_connections");
        if (!hasProviderTable) {
            return {
                hasProviderTable: false,
                encryptedValues: []
            };
        }
        const rows = db.prepare(`SELECT api_key, access_token, refresh_token, id_token
         FROM provider_connections
         WHERE api_key LIKE 'enc:v1:%'
            OR access_token LIKE 'enc:v1:%'
            OR refresh_token LIKE 'enc:v1:%'
            OR id_token LIKE 'enc:v1:%'
         LIMIT 20`).all();
        const encryptedValues = rows.flatMap((row)=>[
                "api_key",
                "access_token",
                "refresh_token",
                "id_token"
            ].filter((key)=>typeof row[key] === "string" && row[key].startsWith("enc:v1:")).map((key)=>row[key]));
        return {
            hasProviderTable: true,
            encryptedValues
        };
    });
}
async function readManagementPasswordState(dbPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveStoragePath"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])())) {
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(dbPath)) {
        return {
            exists: false,
            hasPassword: false
        };
    }
    return withReadonlySqlite(dbPath, (db)=>{
        const hasSettingsTable = !!db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get("key_value");
        if (!hasSettingsTable) {
            return {
                exists: true,
                hasPassword: false
            };
        }
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'settings' AND key = ?").get("password");
        let password = row?.value;
        if (typeof password === "string") {
            try {
                password = JSON.parse(password);
            } catch  {}
        }
        return {
            exists: true,
            hasPassword: typeof password === "string" && password.length > 0
        };
    });
}
async function resetManagementPassword(password, dbPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveStoragePath"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])())) {
    const db = await openSqliteDatabase(dbPath);
    try {
        db.pragma("journal_mode = WAL");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$settings$2d$store$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureSettingsSchema"])(db);
        const hashedPassword = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$settings$2d$store$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["hashManagementPassword"])(password);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$settings$2d$store$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["updateSettings"])(db, {
            password: hashedPassword,
            requireLogin: true,
            setupComplete: true
        });
    } finally{
        db.close();
    }
}
}),
"[project]/bin/cli/commands/backup.mjs [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "registerBackup",
    ()=>registerBackup,
    "registerRestore",
    ()=>registerRestore,
    "runBackupAutoDisableCommand",
    ()=>runBackupAutoDisableCommand,
    "runBackupAutoEnableCommand",
    ()=>runBackupAutoEnableCommand,
    "runBackupAutoStatusCommand",
    ()=>runBackupAutoStatusCommand,
    "runBackupCommand",
    ()=>runBackupCommand,
    "runRestoreCommand",
    ()=>runRestoreCommand
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:stream [external] (node:stream, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream$2f$promises__$5b$external$5d$__$28$node$3a$stream$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:stream/promises [external] (node:stream/promises, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/data-dir.mjs [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$api$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/api.mjs [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/i18n.mjs [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$sqlite$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/sqlite.mjs [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$utils$2f$cliToken$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/utils/cliToken.mjs [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
function getBackupDir() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])(), "backups");
}
const FILES_TO_BACKUP = [
    {
        name: "storage.sqlite"
    },
    {
        name: "settings.json"
    },
    {
        name: "combos.json"
    },
    {
        name: "providers.json"
    }
];
function registerBackup(program) {
    const backup = program.command("backup").description((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.description"));
    backup.command("create").description((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.createDescription")).option("--name <name>", (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.nameOpt")).option("--cloud", (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.cloudOpt")).option("--encrypt", (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.encryptOpt")).option("--key-file <path>", (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.keyFileOpt")).option("--exclude <pattern>", (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.excludeOpt"), (v, prev = [])=>[
            ...prev,
            v
        ], []).option("--retention <n>", (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.retentionOpt"), parseInt).action(async (opts)=>{
        const exitCode = await runBackupCommand(opts);
        if (exitCode !== 0) process.exit(exitCode);
    });
    const auto = backup.command("auto").description((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.auto.title"));
    auto.command("enable").description((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.auto.enableDescription")).option("--cron <expr>", (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.auto.cronOpt"), "0 3 * * *").option("--cloud", (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.cloudOpt")).option("--encrypt", (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.encryptOpt")).option("--retention <n>", (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.retentionOpt"), parseInt).action(async (opts)=>{
        const exitCode = await runBackupAutoEnableCommand(opts);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    });
    auto.command("disable").description((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.auto.disableDescription")).action(async ()=>{
        const exitCode = await runBackupAutoDisableCommand();
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    });
    auto.command("status").description((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.auto.statusDescription")).action(async ()=>{
        const exitCode = await runBackupAutoStatusCommand();
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    });
    // Legacy: `omniroute backup` without a subcommand still creates a backup
    // (documented as the canonical usage in USER_GUIDE.md / CLI-TOOLS.md /
    // AGENT-SKILLS.md). No flags are declared here — declaring the same
    // option names as `create`/`auto enable` here previously shadowed them
    // (#8512), and no doc shows `omniroute backup` invoked with flags.
    backup.action(async (opts)=>{
        const exitCode = await runBackupCommand(opts);
        if (exitCode !== 0) process.exit(exitCode);
    });
}
function registerRestore(program) {
    program.command("restore [backupId]").description((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.restoreDescription")).option("--list", "List available backups").option("--yes", "Skip confirmation").action(async (backupId, opts)=>{
        const exitCode = await runRestoreCommand(backupId, opts);
        if (exitCode !== 0) process.exit(exitCode);
    });
}
function matchesGlob(fileName, pattern) {
    if (!pattern.includes("*")) return fileName === pattern;
    const parts = pattern.split("*");
    let pos = 0;
    for(let i = 0; i < parts.length; i++){
        const part = parts[i];
        if (!part) continue;
        if (i === 0) {
            if (!fileName.startsWith(part)) return false;
            pos = part.length;
        } else if (i === parts.length - 1) {
            if (!fileName.endsWith(part)) return false;
            if (fileName.length < pos + part.length) return false;
        } else {
            const idx = fileName.indexOf(part, pos);
            if (idx === -1) return false;
            pos = idx + part.length;
        }
    }
    return true;
}
function shouldExclude(fileName, patterns) {
    if (!patterns || patterns.length === 0) return false;
    return patterns.some((p)=>matchesGlob(fileName, p));
}
async function encryptFile(srcPath, destPath, passphrase) {
    const salt = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16);
    const iv = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(12);
    const key = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["scryptSync"])(passphrase, salt, 32);
    const cipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createCipheriv"])("aes-256-gcm", key, iv);
    const tmpCipherPath = `${destPath}.ciphertext`;
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream$2f$promises__$5b$external$5d$__$28$node$3a$stream$2f$promises$2c$__cjs$29$__["pipeline"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["createReadStream"])(srcPath), cipher, (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["createWriteStream"])(tmpCipherPath));
    const authTag = cipher.getAuthTag();
    // Format: salt(16) + iv(12) + authTag(16) + ciphertext
    const out = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["createWriteStream"])(destPath);
    try {
        await new Promise((resolve, reject)=>{
            out.write(Buffer.concat([
                salt,
                iv,
                authTag
            ]), (err)=>{
                if (err) reject(err);
                else resolve();
            });
        });
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream$2f$promises__$5b$external$5d$__$28$node$3a$stream$2f$promises$2c$__cjs$29$__["pipeline"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["createReadStream"])(tmpCipherPath), out);
    } finally{
        try {
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["unlinkSync"])(tmpCipherPath);
        } catch  {}
    }
}
async function promptPassphrase() {
    const readline = await __turbopack_context__.A("[externals]/node:readline [external] (node:readline, cjs, async loader)");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve)=>rl.question((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.passphrasePrompt"), (ans)=>{
            rl.close();
            resolve(ans.trim());
        }));
}
async function pruneBackups(backupDir, retention) {
    if (!retention || retention <= 0 || !(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(backupDir)) return;
    try {
        const dirs = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readdirSync"])(backupDir).filter((f)=>f.startsWith("omniroute-backup-")).sort().reverse();
        for (const old of dirs.slice(retention)){
            const { rmSync } = await __turbopack_context__.A("[externals]/node:fs [external] (node:fs, cjs, async loader)");
            rmSync((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(backupDir, old), {
                recursive: true,
                force: true
            });
        }
    } catch  {}
}
async function runBackupCommand(opts = {}) {
    const dataDir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])();
    const backupDir = getBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const safeName = opts.name ? String(opts.name).replace(/[/\\]/g, "_") : null;
    const backupName = safeName ? `omniroute-backup-${safeName}` : `omniroute-backup-${timestamp}`;
    const backupPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(backupDir, backupName);
    const excludePatterns = opts.exclude || [];
    console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.creating"));
    let passphrase = null;
    if (opts.encrypt) {
        if (opts.keyFile) {
            passphrase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(opts.keyFile, "utf8").trim();
        } else {
            passphrase = await promptPassphrase();
            if (!passphrase) {
                console.error((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.noPassphrase"));
                return 1;
            }
        }
    }
    try {
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(backupDir)) (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["mkdirSync"])(backupDir, {
            recursive: true
        });
        let backedUp = 0;
        let skipped = 0;
        for (const file of FILES_TO_BACKUP){
            if (shouldExclude(file.name, excludePatterns)) {
                skipped++;
                continue;
            }
            const sourcePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dataDir, file.name);
            if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(sourcePath)) {
                const destName = opts.encrypt ? `${file.name}.enc` : file.name;
                const destPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(backupPath, destName);
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["mkdirSync"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])(destPath), {
                    recursive: true
                });
                if (file.name.endsWith(".sqlite")) {
                    const tmpPath = destPath.replace(/\.enc$/, "");
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$sqlite$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupSqliteFile"])(sourcePath, tmpPath);
                    if (opts.encrypt) {
                        await encryptFile(tmpPath, destPath, passphrase);
                        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["unlinkSync"])(tmpPath);
                    }
                } else if (opts.encrypt) {
                    await encryptFile(sourcePath, destPath, passphrase);
                } else {
                    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["copyFileSync"])(sourcePath, destPath);
                }
                backedUp++;
            } else {
                skipped++;
            }
        }
        if (backedUp > 0) {
            const info = {
                timestamp: new Date().toISOString(),
                version: "omniroute-cli-v1",
                encrypted: !!opts.encrypt,
                files: FILES_TO_BACKUP.filter((f)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dataDir, f.name)) && !shouldExclude(f.name, excludePatterns)).map((f)=>opts.encrypt ? `${f.name}.enc` : f.name)
            };
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["writeFileSync"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(backupPath, "backup-info.json"), JSON.stringify(info, null, 2), "utf8");
            if (opts.cloud) {
                const cloudCode = await _uploadBackupToCloud(backupPath, info);
                if (cloudCode !== 0) {
                    console.warn((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.cloudFailed"));
                }
            }
            if (opts.retention) {
                await pruneBackups(backupDir, opts.retention);
            }
            console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.done", {
                path: backupPath
            }));
            console.log(`\x1b[2m  ${backedUp} backed up, ${skipped} skipped${opts.encrypt ? " (encrypted)" : ""}\x1b[0m`);
            return 0;
        }
        console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.noFiles"));
        return 0;
    } catch (err) {
        console.error((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.failed", {
            error: err instanceof Error ? err.message : String(err)
        }));
        return 1;
    }
}
async function _uploadBackupToCloud(backupPath, info) {
    const serverUp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$api$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["isServerUp"])();
    if (!serverUp) {
        console.warn((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("common.serverOffline"));
        return 1;
    }
    try {
        const boundary = `omniroute-backup-${Date.now().toString(36)}-${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(8).toString("hex")}`;
        const headers = new Headers({
            accept: "application/json",
            "content-type": `multipart/form-data; boundary=${boundary}`
        });
        const apiKey = process.env.OMNIROUTE_API_KEY;
        if (apiKey) headers.set("authorization", `Bearer ${apiKey}`);
        const cliToken = process.env.OMNIROUTE_CLI_TOKEN ?? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$utils$2f$cliToken$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCliToken"])();
        if (cliToken) headers.set(__TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$utils$2f$cliToken$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLI_TOKEN_HEADER"], cliToken);
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(), 30000);
        const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$api$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["getBaseUrl"])()}/api/db-backups/cloud`, {
            method: "POST",
            headers,
            body: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__["Readable"].from(createBackupMultipartStream(backupPath, info, boundary)),
            duplex: "half",
            signal: controller.signal
        }).finally(()=>clearTimeout(timeout));
        if (res.ok) {
            const data = await res.json();
            console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.cloudUploaded", {
                url: data.url || "(stored)"
            }));
            return 0;
        }
        return 1;
    } catch  {
        return 1;
    }
}
async function* createBackupMultipartStream(backupPath, info, boundary) {
    const encoder = new TextEncoder();
    const encode = (value)=>encoder.encode(value);
    yield encode(`--${boundary}\r\nContent-Disposition: form-data; name="info"\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(info)}\r\n`);
    for (const fname of (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readdirSync"])(backupPath)){
        const fullPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(backupPath, fname);
        const stat = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["statSync"])(fullPath);
        if (!stat.isFile()) continue;
        const safeName = fname.replace(/["\r\n]/g, "_");
        yield encode(`--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${safeName}"\r\nContent-Type: application/octet-stream\r\n\r\n`);
        yield* (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["createReadStream"])(fullPath);
        yield encode("\r\n");
    }
    yield encode(`--${boundary}--\r\n`);
}
function getSchedulePath() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])(), "backup-schedule.json");
}
async function runBackupAutoEnableCommand(opts = {}) {
    const schedulePath = getSchedulePath();
    const schedule = {
        enabled: true,
        cron: opts.cron || "0 3 * * *",
        cloud: !!opts.cloud,
        encrypt: !!opts.encrypt,
        retention: opts.retention || null,
        updatedAt: new Date().toISOString()
    };
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["mkdirSync"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])(schedulePath), {
        recursive: true
    });
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["writeFileSync"])(schedulePath, JSON.stringify(schedule, null, 2), "utf8");
    console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.auto.enabled", {
        cron: schedule.cron
    }));
    console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.auto.hint"));
    return 0;
}
async function runBackupAutoDisableCommand() {
    const schedulePath = getSchedulePath();
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(schedulePath)) {
        const schedule = JSON.parse((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(schedulePath, "utf8"));
        schedule.enabled = false;
        schedule.updatedAt = new Date().toISOString();
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["writeFileSync"])(schedulePath, JSON.stringify(schedule, null, 2), "utf8");
    }
    console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.auto.disabled"));
    return 0;
}
async function runBackupAutoStatusCommand() {
    const schedulePath = getSchedulePath();
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(schedulePath)) {
        console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.auto.notConfigured"));
        return 0;
    }
    const schedule = JSON.parse((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(schedulePath, "utf8"));
    const statusLabel = schedule.enabled ? "\x1b[32m● enabled\x1b[0m" : "\x1b[31m○ disabled\x1b[0m";
    console.log(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.auto.title")}: ${statusLabel}`);
    console.log(`  cron:      ${schedule.cron}`);
    console.log(`  cloud:     ${schedule.cloud ? "yes" : "no"}`);
    console.log(`  encrypt:   ${schedule.encrypt ? "yes" : "no"}`);
    console.log(`  retention: ${schedule.retention ?? "unlimited"}`);
    return 0;
}
async function runRestoreCommand(backupId, opts = {}) {
    const backupDir = getBackupDir();
    if (opts.list || !backupId) {
        console.log(`\n\x1b[1m\x1b[36m${(0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.listTitle")}\x1b[0m\n`);
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(backupDir)) {
            console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.noBackups"));
            return 0;
        }
        try {
            const dirs = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readdirSync"])(backupDir).filter((f)=>f.startsWith("omniroute-backup-")).sort().reverse();
            if (dirs.length === 0) {
                console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.noBackups"));
                return 0;
            }
            for (const dir of dirs){
                const infoPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(backupDir, dir, "backup-info.json");
                if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(infoPath)) {
                    const info = JSON.parse((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(infoPath, "utf8"));
                    const id = dir.replace("omniroute-backup-", "");
                    const dateStr = new Date(info.timestamp).toLocaleString();
                    console.log(`  ${id}`);
                    console.log(`\x1b[2m    ${dateStr} — ${info.files?.length || 0} files\x1b[0m`);
                } else {
                    console.log(`\x1b[2m  ${dir.replace("omniroute-backup-", "")}\x1b[0m`);
                }
            }
        } catch (err) {
            console.error((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("common.error", {
                message: err instanceof Error ? err.message : String(err)
            }));
            return 1;
        }
        if (!backupId) console.log("\nUsage: omniroute restore <backup-id>");
        return 0;
    }
    const safeBackupId = String(backupId).replace(/[/\\]/g, "_");
    const backupPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(backupDir, `omniroute-backup-${safeBackupId}`);
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(backupPath)) {
        console.error((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.notFound", {
            name: backupId
        }));
        return 1;
    }
    const infoPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(backupPath, "backup-info.json");
    const ts = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(infoPath) ? JSON.parse((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(infoPath, "utf8")).timestamp : backupId;
    if (!opts.yes) {
        const readline = await __turbopack_context__.A("[externals]/node:readline [external] (node:readline, cjs, async loader)");
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const answer = await new Promise((resolve)=>rl.question((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.confirmRestore", {
                ts
            }) + " [y/N] ", resolve));
        rl.close();
        if (!/^y(es)?$/i.test(answer)) {
            console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("common.cancelled"));
            return 0;
        }
    }
    console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.restoring", {
        path: backupPath
    }));
    const dataDir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])();
    try {
        for (const file of FILES_TO_BACKUP){
            const sourcePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(backupPath, file.name);
            if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(sourcePath)) {
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["copyFileSync"])(sourcePath, (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dataDir, file.name));
                console.log(`\x1b[2m  Restored: ${file.name}\x1b[0m`);
            }
        }
        console.log((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("backup.restored"));
        return 0;
    } catch (err) {
        console.error((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$i18n$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["t"])("common.error", {
            message: err instanceof Error ? err.message : String(err)
        }));
        return 1;
    }
}
}),
"[project]/src/lib/jobs/backupScheduleJob.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "runBackupScheduleTick",
    ()=>runBackupScheduleTick,
    "startBackupScheduleJob",
    ()=>startBackupScheduleJob,
    "stopBackupScheduleJob",
    ()=>stopBackupScheduleJob
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$cronMatch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/cronMatch.ts [instrumentation] (ecmascript)");
// Reuses the CLI's own backup implementation rather than duplicating it — the
// `omniroute backup auto enable` schedule this job executes is written by
// exactly that CLI, with the exact same cloud/encrypt/retention semantics.
// `runBackupCommand`/`resolveDataDir` are plain functions with no Commander
// or process.exit() coupling (verified), and `resolveDataDir()` here is
// algorithmically identical to `src/lib/dataPaths.ts`'s server-side resolver
// (same DATA_DIR/XDG/legacy-dir precedence) — both agree on where
// `backup-schedule.json` lives.
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$commands$2f$backup$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/commands/backup.mjs [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/bin/cli/data-dir.mjs [instrumentation] (ecmascript)");
;
;
;
;
;
const DEFAULT_INTERVAL_MS = 30 * 1000;
let timer = null;
function getIntervalMs() {
    const raw = process.env.OMNIROUTE_BACKUP_SCHEDULE_JOB_INTERVAL_MS;
    const parsed = raw ? Number(raw) : Number.NaN;
    // Floor at 5s (not the usual 60s+ floor used by the other jobs in this
    // directory): cron granularity is 1 minute, so the tick must be
    // meaningfully shorter than that to reliably land inside the matching
    // minute at all.
    return Number.isFinite(parsed) && parsed >= 5_000 ? parsed : DEFAULT_INTERVAL_MS;
}
function getSchedulePath() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$data$2d$dir$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])(), "backup-schedule.json");
}
function minuteKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
}
function readSchedule() {
    const schedulePath = getSchedulePath();
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(schedulePath)) return null;
    try {
        return JSON.parse((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(schedulePath, "utf8"));
    } catch  {
        return null;
    }
}
function writeLastRunAt(schedule, at) {
    const schedulePath = getSchedulePath();
    const updated = {
        ...schedule,
        lastRunAt: at.toISOString()
    };
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["writeFileSync"])(schedulePath, JSON.stringify(updated, null, 2), "utf8");
}
async function runBackupScheduleTick(now = new Date()) {
    const schedule = readSchedule();
    if (!schedule || !schedule.enabled || !schedule.cron) return false;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$cronMatch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["matchesCron"])(schedule.cron, now)) return false;
    // `runBackupCommand({ encrypt: true })` without a key file prompts for a
    // passphrase on stdin (`promptPassphrase()`) — fine for an interactive CLI
    // run, but this tick has no TTY to read from and would hang forever. And
    // `backup auto enable` doesn't even expose `--key-file` today, so there is
    // currently no way to configure a non-interactive passphrase for a
    // scheduled encrypted backup. Refuse rather than hang; --encrypt on the
    // schedule needs a follow-up (`--key-file` on `auto enable`) before this
    // can run unattended.
    if (schedule.encrypt) {
        console.error("[BackupSchedule] Schedule has encrypt:true but no non-interactive passphrase source exists yet " + "(backup auto enable has no --key-file) — skipping this run rather than blocking on stdin.");
        return false;
    }
    // A tick shorter than 60s means multiple ticks can land inside the same
    // matching minute — without this guard the backup would fire once per
    // tick for the whole minute instead of once for the whole day.
    if (schedule.lastRunAt) {
        const lastRun = new Date(schedule.lastRunAt);
        if (!Number.isNaN(lastRun.getTime()) && minuteKey(lastRun) === minuteKey(now)) {
            return false;
        }
    }
    writeLastRunAt(schedule, now);
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$bin$2f$cli$2f$commands$2f$backup$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["runBackupCommand"])({
            cloud: !!schedule.cloud,
            encrypt: !!schedule.encrypt,
            retention: schedule.retention || undefined
        });
    } catch (error) {
        console.error("[BackupSchedule] Job failed:", error);
    }
    return true;
}
function startBackupScheduleJob() {
    if (timer) {
        return timer;
    }
    const run = ()=>{
        runBackupScheduleTick().catch((error)=>{
            console.error("[BackupSchedule] Tick failed:", error);
        });
    };
    timer = setInterval(run, getIntervalMs());
    timer.unref?.();
    return timer;
}
function stopBackupScheduleJob() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}
}),
"[project]/node_modules/bcryptjs/index.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compare",
    ()=>compare,
    "compareSync",
    ()=>compareSync,
    "decodeBase64",
    ()=>decodeBase64,
    "default",
    ()=>__TURBOPACK__default__export__,
    "encodeBase64",
    ()=>encodeBase64,
    "genSalt",
    ()=>genSalt,
    "genSaltSync",
    ()=>genSaltSync,
    "getRounds",
    ()=>getRounds,
    "getSalt",
    ()=>getSalt,
    "hash",
    ()=>hash,
    "hashSync",
    ()=>hashSync,
    "setRandomFallback",
    ()=>setRandomFallback,
    "truncates",
    ()=>truncates
]);
/*
 Copyright (c) 2012 Nevins Bartolomeo <nevins.bartolomeo@gmail.com>
 Copyright (c) 2012 Shane Girish <shaneGirish@gmail.com>
 Copyright (c) 2025 Daniel Wirtz <dcode@dcode.io>

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 3. The name of the author may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */ // The Node.js crypto module is used as a fallback for the Web Crypto API. When
// building for the browser, inclusion of the crypto module should be disabled,
// which the package hints at in its package.json for bundlers that support it.
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
/**
 * The random implementation to use as a fallback.
 * @type {?function(number):!Array.<number>}
 * @inner
 */ var randomFallback = null;
/**
 * Generates cryptographically secure random bytes.
 * @function
 * @param {number} len Bytes length
 * @returns {!Array.<number>} Random bytes
 * @throws {Error} If no random implementation is available
 * @inner
 */ function randomBytes(len) {
    // Web Crypto API. Globally available in the browser and in Node.js >=23.
    try {
        return crypto.getRandomValues(new Uint8Array(len));
    } catch  {}
    // Node.js crypto module for non-browser environments.
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(len);
    } catch  {}
    // Custom fallback specified with `setRandomFallback`.
    if (!randomFallback) {
        throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative");
    }
    return randomFallback(len);
}
function setRandomFallback(random) {
    randomFallback = random;
}
function genSaltSync(rounds, seed_length) {
    rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
    if (typeof rounds !== "number") throw Error("Illegal arguments: " + typeof rounds + ", " + typeof seed_length);
    if (rounds < 4) rounds = 4;
    else if (rounds > 31) rounds = 31;
    var salt = [];
    salt.push("$2b$");
    if (rounds < 10) salt.push("0");
    salt.push(rounds.toString());
    salt.push("$");
    salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN)); // May throw
    return salt.join("");
}
function genSalt(rounds, seed_length, callback) {
    if (typeof seed_length === "function") callback = seed_length, seed_length = undefined; // Not supported.
    if (typeof rounds === "function") callback = rounds, rounds = undefined;
    if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
    else if (typeof rounds !== "number") throw Error("illegal arguments: " + typeof rounds);
    function _async(callback) {
        nextTick(function() {
            // Pretty thin, but salting is fast enough
            try {
                callback(null, genSaltSync(rounds));
            } catch (err) {
                callback(err);
            }
        });
    }
    if (callback) {
        if (typeof callback !== "function") throw Error("Illegal callback: " + typeof callback);
        _async(callback);
    } else return new Promise(function(resolve, reject) {
        _async(function(err, res) {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}
function hashSync(password, salt) {
    if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
    if (typeof salt === "number") salt = genSaltSync(salt);
    if (typeof password !== "string" || typeof salt !== "string") throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
    return _hash(password, salt);
}
function hash(password, salt, callback, progressCallback) {
    function _async(callback) {
        if (typeof password === "string" && typeof salt === "number") genSalt(salt, function(err, salt) {
            _hash(password, salt, callback, progressCallback);
        });
        else if (typeof password === "string" && typeof salt === "string") _hash(password, salt, callback, progressCallback);
        else nextTick(callback.bind(this, Error("Illegal arguments: " + typeof password + ", " + typeof salt)));
    }
    if (callback) {
        if (typeof callback !== "function") throw Error("Illegal callback: " + typeof callback);
        _async(callback);
    } else return new Promise(function(resolve, reject) {
        _async(function(err, res) {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}
/**
 * Compares two strings of the same length in constant time.
 * @param {string} known Must be of the correct length
 * @param {string} unknown Must be the same length as `known`
 * @returns {boolean}
 * @inner
 */ function safeStringCompare(known, unknown) {
    var diff = known.length ^ unknown.length;
    for(var i = 0; i < known.length; ++i){
        diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
    }
    return diff === 0;
}
function compareSync(password, hash) {
    if (typeof password !== "string" || typeof hash !== "string") throw Error("Illegal arguments: " + typeof password + ", " + typeof hash);
    if (hash.length !== 60) return false;
    return safeStringCompare(hashSync(password, hash.substring(0, hash.length - 31)), hash);
}
function compare(password, hashValue, callback, progressCallback) {
    function _async(callback) {
        if (typeof password !== "string" || typeof hashValue !== "string") {
            nextTick(callback.bind(this, Error("Illegal arguments: " + typeof password + ", " + typeof hashValue)));
            return;
        }
        if (hashValue.length !== 60) {
            nextTick(callback.bind(this, null, false));
            return;
        }
        hash(password, hashValue.substring(0, 29), function(err, comp) {
            if (err) callback(err);
            else callback(null, safeStringCompare(comp, hashValue));
        }, progressCallback);
    }
    if (callback) {
        if (typeof callback !== "function") throw Error("Illegal callback: " + typeof callback);
        _async(callback);
    } else return new Promise(function(resolve, reject) {
        _async(function(err, res) {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}
function getRounds(hash) {
    if (typeof hash !== "string") throw Error("Illegal arguments: " + typeof hash);
    return parseInt(hash.split("$")[2], 10);
}
function getSalt(hash) {
    if (typeof hash !== "string") throw Error("Illegal arguments: " + typeof hash);
    if (hash.length !== 60) throw Error("Illegal hash length: " + hash.length + " != 60");
    return hash.substring(0, 29);
}
function truncates(password) {
    if (typeof password !== "string") throw Error("Illegal arguments: " + typeof password);
    return utf8Length(password) > 72;
}
/**
 * Continues with the callback after yielding to the event loop.
 * @function
 * @param {function(...[*])} callback Callback to execute
 * @inner
 */ var nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
/** Calculates the byte length of a string encoded as UTF8. */ function utf8Length(string) {
    var len = 0, c = 0;
    for(var i = 0; i < string.length; ++i){
        c = string.charCodeAt(i);
        if (c < 128) len += 1;
        else if (c < 2048) len += 2;
        else if ((c & 0xfc00) === 0xd800 && (string.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            ++i;
            len += 4;
        } else len += 3;
    }
    return len;
}
/** Converts a string to an array of UTF8 bytes. */ function utf8Array(string) {
    var offset = 0, c1, c2;
    var buffer = new Array(utf8Length(string));
    for(var i = 0, k = string.length; i < k; ++i){
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
            buffer[offset++] = c1;
        } else if (c1 < 2048) {
            buffer[offset++] = c1 >> 6 | 192;
            buffer[offset++] = c1 & 63 | 128;
        } else if ((c1 & 0xfc00) === 0xd800 && ((c2 = string.charCodeAt(i + 1)) & 0xfc00) === 0xdc00) {
            c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
            ++i;
            buffer[offset++] = c1 >> 18 | 240;
            buffer[offset++] = c1 >> 12 & 63 | 128;
            buffer[offset++] = c1 >> 6 & 63 | 128;
            buffer[offset++] = c1 & 63 | 128;
        } else {
            buffer[offset++] = c1 >> 12 | 224;
            buffer[offset++] = c1 >> 6 & 63 | 128;
            buffer[offset++] = c1 & 63 | 128;
        }
    }
    return buffer;
}
// A base64 implementation for the bcrypt algorithm. This is partly non-standard.
/**
 * bcrypt's own non-standard base64 dictionary.
 * @type {!Array.<string>}
 * @const
 * @inner
 **/ var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
/**
 * @type {!Array.<number>}
 * @const
 * @inner
 **/ var BASE64_INDEX = [
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    0,
    1,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    -1,
    -1,
    -1,
    -1,
    -1
];
/**
 * Encodes a byte array to base64 with up to len bytes of input.
 * @param {!Array.<number>} b Byte array
 * @param {number} len Maximum input length
 * @returns {string}
 * @inner
 */ function base64_encode(b, len) {
    var off = 0, rs = [], c1, c2;
    if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
    while(off < len){
        c1 = b[off++] & 0xff;
        rs.push(BASE64_CODE[c1 >> 2 & 0x3f]);
        c1 = (c1 & 0x03) << 4;
        if (off >= len) {
            rs.push(BASE64_CODE[c1 & 0x3f]);
            break;
        }
        c2 = b[off++] & 0xff;
        c1 |= c2 >> 4 & 0x0f;
        rs.push(BASE64_CODE[c1 & 0x3f]);
        c1 = (c2 & 0x0f) << 2;
        if (off >= len) {
            rs.push(BASE64_CODE[c1 & 0x3f]);
            break;
        }
        c2 = b[off++] & 0xff;
        c1 |= c2 >> 6 & 0x03;
        rs.push(BASE64_CODE[c1 & 0x3f]);
        rs.push(BASE64_CODE[c2 & 0x3f]);
    }
    return rs.join("");
}
/**
 * Decodes a base64 encoded string to up to len bytes of output.
 * @param {string} s String to decode
 * @param {number} len Maximum output length
 * @returns {!Array.<number>}
 * @inner
 */ function base64_decode(s, len) {
    var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
    if (len <= 0) throw Error("Illegal len: " + len);
    while(off < slen - 1 && olen < len){
        code = s.charCodeAt(off++);
        c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
        code = s.charCodeAt(off++);
        c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
        if (c1 == -1 || c2 == -1) break;
        o = c1 << 2 >>> 0;
        o |= (c2 & 0x30) >> 4;
        rs.push(String.fromCharCode(o));
        if (++olen >= len || off >= slen) break;
        code = s.charCodeAt(off++);
        c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
        if (c3 == -1) break;
        o = (c2 & 0x0f) << 4 >>> 0;
        o |= (c3 & 0x3c) >> 2;
        rs.push(String.fromCharCode(o));
        if (++olen >= len || off >= slen) break;
        code = s.charCodeAt(off++);
        c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
        o = (c3 & 0x03) << 6 >>> 0;
        o |= c4;
        rs.push(String.fromCharCode(o));
        ++olen;
    }
    var res = [];
    for(off = 0; off < olen; off++)res.push(rs[off].charCodeAt(0));
    return res;
}
/**
 * @type {number}
 * @const
 * @inner
 */ var BCRYPT_SALT_LEN = 16;
/**
 * @type {number}
 * @const
 * @inner
 */ var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
/**
 * @type {number}
 * @const
 * @inner
 */ var BLOWFISH_NUM_ROUNDS = 16;
/**
 * @type {number}
 * @const
 * @inner
 */ var MAX_EXECUTION_TIME = 100;
/**
 * @type {Array.<number>}
 * @const
 * @inner
 */ var P_ORIG = [
    0x243f6a88,
    0x85a308d3,
    0x13198a2e,
    0x03707344,
    0xa4093822,
    0x299f31d0,
    0x082efa98,
    0xec4e6c89,
    0x452821e6,
    0x38d01377,
    0xbe5466cf,
    0x34e90c6c,
    0xc0ac29b7,
    0xc97c50dd,
    0x3f84d5b5,
    0xb5470917,
    0x9216d5d9,
    0x8979fb1b
];
/**
 * @type {Array.<number>}
 * @const
 * @inner
 */ var S_ORIG = [
    0xd1310ba6,
    0x98dfb5ac,
    0x2ffd72db,
    0xd01adfb7,
    0xb8e1afed,
    0x6a267e96,
    0xba7c9045,
    0xf12c7f99,
    0x24a19947,
    0xb3916cf7,
    0x0801f2e2,
    0x858efc16,
    0x636920d8,
    0x71574e69,
    0xa458fea3,
    0xf4933d7e,
    0x0d95748f,
    0x728eb658,
    0x718bcd58,
    0x82154aee,
    0x7b54a41d,
    0xc25a59b5,
    0x9c30d539,
    0x2af26013,
    0xc5d1b023,
    0x286085f0,
    0xca417918,
    0xb8db38ef,
    0x8e79dcb0,
    0x603a180e,
    0x6c9e0e8b,
    0xb01e8a3e,
    0xd71577c1,
    0xbd314b27,
    0x78af2fda,
    0x55605c60,
    0xe65525f3,
    0xaa55ab94,
    0x57489862,
    0x63e81440,
    0x55ca396a,
    0x2aab10b6,
    0xb4cc5c34,
    0x1141e8ce,
    0xa15486af,
    0x7c72e993,
    0xb3ee1411,
    0x636fbc2a,
    0x2ba9c55d,
    0x741831f6,
    0xce5c3e16,
    0x9b87931e,
    0xafd6ba33,
    0x6c24cf5c,
    0x7a325381,
    0x28958677,
    0x3b8f4898,
    0x6b4bb9af,
    0xc4bfe81b,
    0x66282193,
    0x61d809cc,
    0xfb21a991,
    0x487cac60,
    0x5dec8032,
    0xef845d5d,
    0xe98575b1,
    0xdc262302,
    0xeb651b88,
    0x23893e81,
    0xd396acc5,
    0x0f6d6ff3,
    0x83f44239,
    0x2e0b4482,
    0xa4842004,
    0x69c8f04a,
    0x9e1f9b5e,
    0x21c66842,
    0xf6e96c9a,
    0x670c9c61,
    0xabd388f0,
    0x6a51a0d2,
    0xd8542f68,
    0x960fa728,
    0xab5133a3,
    0x6eef0b6c,
    0x137a3be4,
    0xba3bf050,
    0x7efb2a98,
    0xa1f1651d,
    0x39af0176,
    0x66ca593e,
    0x82430e88,
    0x8cee8619,
    0x456f9fb4,
    0x7d84a5c3,
    0x3b8b5ebe,
    0xe06f75d8,
    0x85c12073,
    0x401a449f,
    0x56c16aa6,
    0x4ed3aa62,
    0x363f7706,
    0x1bfedf72,
    0x429b023d,
    0x37d0d724,
    0xd00a1248,
    0xdb0fead3,
    0x49f1c09b,
    0x075372c9,
    0x80991b7b,
    0x25d479d8,
    0xf6e8def7,
    0xe3fe501a,
    0xb6794c3b,
    0x976ce0bd,
    0x04c006ba,
    0xc1a94fb6,
    0x409f60c4,
    0x5e5c9ec2,
    0x196a2463,
    0x68fb6faf,
    0x3e6c53b5,
    0x1339b2eb,
    0x3b52ec6f,
    0x6dfc511f,
    0x9b30952c,
    0xcc814544,
    0xaf5ebd09,
    0xbee3d004,
    0xde334afd,
    0x660f2807,
    0x192e4bb3,
    0xc0cba857,
    0x45c8740f,
    0xd20b5f39,
    0xb9d3fbdb,
    0x5579c0bd,
    0x1a60320a,
    0xd6a100c6,
    0x402c7279,
    0x679f25fe,
    0xfb1fa3cc,
    0x8ea5e9f8,
    0xdb3222f8,
    0x3c7516df,
    0xfd616b15,
    0x2f501ec8,
    0xad0552ab,
    0x323db5fa,
    0xfd238760,
    0x53317b48,
    0x3e00df82,
    0x9e5c57bb,
    0xca6f8ca0,
    0x1a87562e,
    0xdf1769db,
    0xd542a8f6,
    0x287effc3,
    0xac6732c6,
    0x8c4f5573,
    0x695b27b0,
    0xbbca58c8,
    0xe1ffa35d,
    0xb8f011a0,
    0x10fa3d98,
    0xfd2183b8,
    0x4afcb56c,
    0x2dd1d35b,
    0x9a53e479,
    0xb6f84565,
    0xd28e49bc,
    0x4bfb9790,
    0xe1ddf2da,
    0xa4cb7e33,
    0x62fb1341,
    0xcee4c6e8,
    0xef20cada,
    0x36774c01,
    0xd07e9efe,
    0x2bf11fb4,
    0x95dbda4d,
    0xae909198,
    0xeaad8e71,
    0x6b93d5a0,
    0xd08ed1d0,
    0xafc725e0,
    0x8e3c5b2f,
    0x8e7594b7,
    0x8ff6e2fb,
    0xf2122b64,
    0x8888b812,
    0x900df01c,
    0x4fad5ea0,
    0x688fc31c,
    0xd1cff191,
    0xb3a8c1ad,
    0x2f2f2218,
    0xbe0e1777,
    0xea752dfe,
    0x8b021fa1,
    0xe5a0cc0f,
    0xb56f74e8,
    0x18acf3d6,
    0xce89e299,
    0xb4a84fe0,
    0xfd13e0b7,
    0x7cc43b81,
    0xd2ada8d9,
    0x165fa266,
    0x80957705,
    0x93cc7314,
    0x211a1477,
    0xe6ad2065,
    0x77b5fa86,
    0xc75442f5,
    0xfb9d35cf,
    0xebcdaf0c,
    0x7b3e89a0,
    0xd6411bd3,
    0xae1e7e49,
    0x00250e2d,
    0x2071b35e,
    0x226800bb,
    0x57b8e0af,
    0x2464369b,
    0xf009b91e,
    0x5563911d,
    0x59dfa6aa,
    0x78c14389,
    0xd95a537f,
    0x207d5ba2,
    0x02e5b9c5,
    0x83260376,
    0x6295cfa9,
    0x11c81968,
    0x4e734a41,
    0xb3472dca,
    0x7b14a94a,
    0x1b510052,
    0x9a532915,
    0xd60f573f,
    0xbc9bc6e4,
    0x2b60a476,
    0x81e67400,
    0x08ba6fb5,
    0x571be91f,
    0xf296ec6b,
    0x2a0dd915,
    0xb6636521,
    0xe7b9f9b6,
    0xff34052e,
    0xc5855664,
    0x53b02d5d,
    0xa99f8fa1,
    0x08ba4799,
    0x6e85076a,
    0x4b7a70e9,
    0xb5b32944,
    0xdb75092e,
    0xc4192623,
    0xad6ea6b0,
    0x49a7df7d,
    0x9cee60b8,
    0x8fedb266,
    0xecaa8c71,
    0x699a17ff,
    0x5664526c,
    0xc2b19ee1,
    0x193602a5,
    0x75094c29,
    0xa0591340,
    0xe4183a3e,
    0x3f54989a,
    0x5b429d65,
    0x6b8fe4d6,
    0x99f73fd6,
    0xa1d29c07,
    0xefe830f5,
    0x4d2d38e6,
    0xf0255dc1,
    0x4cdd2086,
    0x8470eb26,
    0x6382e9c6,
    0x021ecc5e,
    0x09686b3f,
    0x3ebaefc9,
    0x3c971814,
    0x6b6a70a1,
    0x687f3584,
    0x52a0e286,
    0xb79c5305,
    0xaa500737,
    0x3e07841c,
    0x7fdeae5c,
    0x8e7d44ec,
    0x5716f2b8,
    0xb03ada37,
    0xf0500c0d,
    0xf01c1f04,
    0x0200b3ff,
    0xae0cf51a,
    0x3cb574b2,
    0x25837a58,
    0xdc0921bd,
    0xd19113f9,
    0x7ca92ff6,
    0x94324773,
    0x22f54701,
    0x3ae5e581,
    0x37c2dadc,
    0xc8b57634,
    0x9af3dda7,
    0xa9446146,
    0x0fd0030e,
    0xecc8c73e,
    0xa4751e41,
    0xe238cd99,
    0x3bea0e2f,
    0x3280bba1,
    0x183eb331,
    0x4e548b38,
    0x4f6db908,
    0x6f420d03,
    0xf60a04bf,
    0x2cb81290,
    0x24977c79,
    0x5679b072,
    0xbcaf89af,
    0xde9a771f,
    0xd9930810,
    0xb38bae12,
    0xdccf3f2e,
    0x5512721f,
    0x2e6b7124,
    0x501adde6,
    0x9f84cd87,
    0x7a584718,
    0x7408da17,
    0xbc9f9abc,
    0xe94b7d8c,
    0xec7aec3a,
    0xdb851dfa,
    0x63094366,
    0xc464c3d2,
    0xef1c1847,
    0x3215d908,
    0xdd433b37,
    0x24c2ba16,
    0x12a14d43,
    0x2a65c451,
    0x50940002,
    0x133ae4dd,
    0x71dff89e,
    0x10314e55,
    0x81ac77d6,
    0x5f11199b,
    0x043556f1,
    0xd7a3c76b,
    0x3c11183b,
    0x5924a509,
    0xf28fe6ed,
    0x97f1fbfa,
    0x9ebabf2c,
    0x1e153c6e,
    0x86e34570,
    0xeae96fb1,
    0x860e5e0a,
    0x5a3e2ab3,
    0x771fe71c,
    0x4e3d06fa,
    0x2965dcb9,
    0x99e71d0f,
    0x803e89d6,
    0x5266c825,
    0x2e4cc978,
    0x9c10b36a,
    0xc6150eba,
    0x94e2ea78,
    0xa5fc3c53,
    0x1e0a2df4,
    0xf2f74ea7,
    0x361d2b3d,
    0x1939260f,
    0x19c27960,
    0x5223a708,
    0xf71312b6,
    0xebadfe6e,
    0xeac31f66,
    0xe3bc4595,
    0xa67bc883,
    0xb17f37d1,
    0x018cff28,
    0xc332ddef,
    0xbe6c5aa5,
    0x65582185,
    0x68ab9802,
    0xeecea50f,
    0xdb2f953b,
    0x2aef7dad,
    0x5b6e2f84,
    0x1521b628,
    0x29076170,
    0xecdd4775,
    0x619f1510,
    0x13cca830,
    0xeb61bd96,
    0x0334fe1e,
    0xaa0363cf,
    0xb5735c90,
    0x4c70a239,
    0xd59e9e0b,
    0xcbaade14,
    0xeecc86bc,
    0x60622ca7,
    0x9cab5cab,
    0xb2f3846e,
    0x648b1eaf,
    0x19bdf0ca,
    0xa02369b9,
    0x655abb50,
    0x40685a32,
    0x3c2ab4b3,
    0x319ee9d5,
    0xc021b8f7,
    0x9b540b19,
    0x875fa099,
    0x95f7997e,
    0x623d7da8,
    0xf837889a,
    0x97e32d77,
    0x11ed935f,
    0x16681281,
    0x0e358829,
    0xc7e61fd6,
    0x96dedfa1,
    0x7858ba99,
    0x57f584a5,
    0x1b227263,
    0x9b83c3ff,
    0x1ac24696,
    0xcdb30aeb,
    0x532e3054,
    0x8fd948e4,
    0x6dbc3128,
    0x58ebf2ef,
    0x34c6ffea,
    0xfe28ed61,
    0xee7c3c73,
    0x5d4a14d9,
    0xe864b7e3,
    0x42105d14,
    0x203e13e0,
    0x45eee2b6,
    0xa3aaabea,
    0xdb6c4f15,
    0xfacb4fd0,
    0xc742f442,
    0xef6abbb5,
    0x654f3b1d,
    0x41cd2105,
    0xd81e799e,
    0x86854dc7,
    0xe44b476a,
    0x3d816250,
    0xcf62a1f2,
    0x5b8d2646,
    0xfc8883a0,
    0xc1c7b6a3,
    0x7f1524c3,
    0x69cb7492,
    0x47848a0b,
    0x5692b285,
    0x095bbf00,
    0xad19489d,
    0x1462b174,
    0x23820e00,
    0x58428d2a,
    0x0c55f5ea,
    0x1dadf43e,
    0x233f7061,
    0x3372f092,
    0x8d937e41,
    0xd65fecf1,
    0x6c223bdb,
    0x7cde3759,
    0xcbee7460,
    0x4085f2a7,
    0xce77326e,
    0xa6078084,
    0x19f8509e,
    0xe8efd855,
    0x61d99735,
    0xa969a7aa,
    0xc50c06c2,
    0x5a04abfc,
    0x800bcadc,
    0x9e447a2e,
    0xc3453484,
    0xfdd56705,
    0x0e1e9ec9,
    0xdb73dbd3,
    0x105588cd,
    0x675fda79,
    0xe3674340,
    0xc5c43465,
    0x713e38d8,
    0x3d28f89e,
    0xf16dff20,
    0x153e21e7,
    0x8fb03d4a,
    0xe6e39f2b,
    0xdb83adf7,
    0xe93d5a68,
    0x948140f7,
    0xf64c261c,
    0x94692934,
    0x411520f7,
    0x7602d4f7,
    0xbcf46b2e,
    0xd4a20068,
    0xd4082471,
    0x3320f46a,
    0x43b7d4b7,
    0x500061af,
    0x1e39f62e,
    0x97244546,
    0x14214f74,
    0xbf8b8840,
    0x4d95fc1d,
    0x96b591af,
    0x70f4ddd3,
    0x66a02f45,
    0xbfbc09ec,
    0x03bd9785,
    0x7fac6dd0,
    0x31cb8504,
    0x96eb27b3,
    0x55fd3941,
    0xda2547e6,
    0xabca0a9a,
    0x28507825,
    0x530429f4,
    0x0a2c86da,
    0xe9b66dfb,
    0x68dc1462,
    0xd7486900,
    0x680ec0a4,
    0x27a18dee,
    0x4f3ffea2,
    0xe887ad8c,
    0xb58ce006,
    0x7af4d6b6,
    0xaace1e7c,
    0xd3375fec,
    0xce78a399,
    0x406b2a42,
    0x20fe9e35,
    0xd9f385b9,
    0xee39d7ab,
    0x3b124e8b,
    0x1dc9faf7,
    0x4b6d1856,
    0x26a36631,
    0xeae397b2,
    0x3a6efa74,
    0xdd5b4332,
    0x6841e7f7,
    0xca7820fb,
    0xfb0af54e,
    0xd8feb397,
    0x454056ac,
    0xba489527,
    0x55533a3a,
    0x20838d87,
    0xfe6ba9b7,
    0xd096954b,
    0x55a867bc,
    0xa1159a58,
    0xcca92963,
    0x99e1db33,
    0xa62a4a56,
    0x3f3125f9,
    0x5ef47e1c,
    0x9029317c,
    0xfdf8e802,
    0x04272f70,
    0x80bb155c,
    0x05282ce3,
    0x95c11548,
    0xe4c66d22,
    0x48c1133f,
    0xc70f86dc,
    0x07f9c9ee,
    0x41041f0f,
    0x404779a4,
    0x5d886e17,
    0x325f51eb,
    0xd59bc0d1,
    0xf2bcc18f,
    0x41113564,
    0x257b7834,
    0x602a9c60,
    0xdff8e8a3,
    0x1f636c1b,
    0x0e12b4c2,
    0x02e1329e,
    0xaf664fd1,
    0xcad18115,
    0x6b2395e0,
    0x333e92e1,
    0x3b240b62,
    0xeebeb922,
    0x85b2a20e,
    0xe6ba0d99,
    0xde720c8c,
    0x2da2f728,
    0xd0127845,
    0x95b794fd,
    0x647d0862,
    0xe7ccf5f0,
    0x5449a36f,
    0x877d48fa,
    0xc39dfd27,
    0xf33e8d1e,
    0x0a476341,
    0x992eff74,
    0x3a6f6eab,
    0xf4f8fd37,
    0xa812dc60,
    0xa1ebddf8,
    0x991be14c,
    0xdb6e6b0d,
    0xc67b5510,
    0x6d672c37,
    0x2765d43b,
    0xdcd0e804,
    0xf1290dc7,
    0xcc00ffa3,
    0xb5390f92,
    0x690fed0b,
    0x667b9ffb,
    0xcedb7d9c,
    0xa091cf0b,
    0xd9155ea3,
    0xbb132f88,
    0x515bad24,
    0x7b9479bf,
    0x763bd6eb,
    0x37392eb3,
    0xcc115979,
    0x8026e297,
    0xf42e312d,
    0x6842ada7,
    0xc66a2b3b,
    0x12754ccc,
    0x782ef11c,
    0x6a124237,
    0xb79251e7,
    0x06a1bbe6,
    0x4bfb6350,
    0x1a6b1018,
    0x11caedfa,
    0x3d25bdd8,
    0xe2e1c3c9,
    0x44421659,
    0x0a121386,
    0xd90cec6e,
    0xd5abea2a,
    0x64af674e,
    0xda86a85f,
    0xbebfe988,
    0x64e4c3fe,
    0x9dbc8057,
    0xf0f7c086,
    0x60787bf8,
    0x6003604d,
    0xd1fd8346,
    0xf6381fb0,
    0x7745ae04,
    0xd736fccc,
    0x83426b33,
    0xf01eab71,
    0xb0804187,
    0x3c005e5f,
    0x77a057be,
    0xbde8ae24,
    0x55464299,
    0xbf582e61,
    0x4e58f48f,
    0xf2ddfda2,
    0xf474ef38,
    0x8789bdc2,
    0x5366f9c3,
    0xc8b38e74,
    0xb475f255,
    0x46fcd9b9,
    0x7aeb2661,
    0x8b1ddf84,
    0x846a0e79,
    0x915f95e2,
    0x466e598e,
    0x20b45770,
    0x8cd55591,
    0xc902de4c,
    0xb90bace1,
    0xbb8205d0,
    0x11a86248,
    0x7574a99e,
    0xb77f19b6,
    0xe0a9dc09,
    0x662d09a1,
    0xc4324633,
    0xe85a1f02,
    0x09f0be8c,
    0x4a99a025,
    0x1d6efe10,
    0x1ab93d1d,
    0x0ba5a4df,
    0xa186f20f,
    0x2868f169,
    0xdcb7da83,
    0x573906fe,
    0xa1e2ce9b,
    0x4fcd7f52,
    0x50115e01,
    0xa70683fa,
    0xa002b5c4,
    0x0de6d027,
    0x9af88c27,
    0x773f8641,
    0xc3604c06,
    0x61a806b5,
    0xf0177a28,
    0xc0f586e0,
    0x006058aa,
    0x30dc7d62,
    0x11e69ed7,
    0x2338ea63,
    0x53c2dd94,
    0xc2c21634,
    0xbbcbee56,
    0x90bcb6de,
    0xebfc7da1,
    0xce591d76,
    0x6f05e409,
    0x4b7c0188,
    0x39720a3d,
    0x7c927c24,
    0x86e3725f,
    0x724d9db9,
    0x1ac15bb4,
    0xd39eb8fc,
    0xed545578,
    0x08fca5b5,
    0xd83d7cd3,
    0x4dad0fc4,
    0x1e50ef5e,
    0xb161e6f8,
    0xa28514d9,
    0x6c51133c,
    0x6fd5c7e7,
    0x56e14ec4,
    0x362abfce,
    0xddc6c837,
    0xd79a3234,
    0x92638212,
    0x670efa8e,
    0x406000e0,
    0x3a39ce37,
    0xd3faf5cf,
    0xabc27737,
    0x5ac52d1b,
    0x5cb0679e,
    0x4fa33742,
    0xd3822740,
    0x99bc9bbe,
    0xd5118e9d,
    0xbf0f7315,
    0xd62d1c7e,
    0xc700c47b,
    0xb78c1b6b,
    0x21a19045,
    0xb26eb1be,
    0x6a366eb4,
    0x5748ab2f,
    0xbc946e79,
    0xc6a376d2,
    0x6549c2c8,
    0x530ff8ee,
    0x468dde7d,
    0xd5730a1d,
    0x4cd04dc6,
    0x2939bbdb,
    0xa9ba4650,
    0xac9526e8,
    0xbe5ee304,
    0xa1fad5f0,
    0x6a2d519a,
    0x63ef8ce2,
    0x9a86ee22,
    0xc089c2b8,
    0x43242ef6,
    0xa51e03aa,
    0x9cf2d0a4,
    0x83c061ba,
    0x9be96a4d,
    0x8fe51550,
    0xba645bd6,
    0x2826a2f9,
    0xa73a3ae1,
    0x4ba99586,
    0xef5562e9,
    0xc72fefd3,
    0xf752f7da,
    0x3f046f69,
    0x77fa0a59,
    0x80e4a915,
    0x87b08601,
    0x9b09e6ad,
    0x3b3ee593,
    0xe990fd5a,
    0x9e34d797,
    0x2cf0b7d9,
    0x022b8b51,
    0x96d5ac3a,
    0x017da67d,
    0xd1cf3ed6,
    0x7c7d2d28,
    0x1f9f25cf,
    0xadf2b89b,
    0x5ad6b472,
    0x5a88f54c,
    0xe029ac71,
    0xe019a5e6,
    0x47b0acfd,
    0xed93fa9b,
    0xe8d3c48d,
    0x283b57cc,
    0xf8d56629,
    0x79132e28,
    0x785f0191,
    0xed756055,
    0xf7960e44,
    0xe3d35e8c,
    0x15056dd4,
    0x88f46dba,
    0x03a16125,
    0x0564f0bd,
    0xc3eb9e15,
    0x3c9057a2,
    0x97271aec,
    0xa93a072a,
    0x1b3f6d9b,
    0x1e6321f5,
    0xf59c66fb,
    0x26dcf319,
    0x7533d928,
    0xb155fdf5,
    0x03563482,
    0x8aba3cbb,
    0x28517711,
    0xc20ad9f8,
    0xabcc5167,
    0xccad925f,
    0x4de81751,
    0x3830dc8e,
    0x379d5862,
    0x9320f991,
    0xea7a90c2,
    0xfb3e7bce,
    0x5121ce64,
    0x774fbe32,
    0xa8b6e37e,
    0xc3293d46,
    0x48de5369,
    0x6413e680,
    0xa2ae0810,
    0xdd6db224,
    0x69852dfd,
    0x09072166,
    0xb39a460a,
    0x6445c0dd,
    0x586cdecf,
    0x1c20c8ae,
    0x5bbef7dd,
    0x1b588d40,
    0xccd2017f,
    0x6bb4e3bb,
    0xdda26a7e,
    0x3a59ff45,
    0x3e350a44,
    0xbcb4cdd5,
    0x72eacea8,
    0xfa6484bb,
    0x8d6612ae,
    0xbf3c6f47,
    0xd29be463,
    0x542f5d9e,
    0xaec2771b,
    0xf64e6370,
    0x740e0d8d,
    0xe75b1357,
    0xf8721671,
    0xaf537d5d,
    0x4040cb08,
    0x4eb4e2cc,
    0x34d2466a,
    0x0115af84,
    0xe1b00428,
    0x95983a1d,
    0x06b89fb4,
    0xce6ea048,
    0x6f3f3b82,
    0x3520ab82,
    0x011a1d4b,
    0x277227f8,
    0x611560b1,
    0xe7933fdc,
    0xbb3a792b,
    0x344525bd,
    0xa08839e1,
    0x51ce794b,
    0x2f32c9b7,
    0xa01fbac9,
    0xe01cc87e,
    0xbcc7d1f6,
    0xcf0111c3,
    0xa1e8aac7,
    0x1a908749,
    0xd44fbd9a,
    0xd0dadecb,
    0xd50ada38,
    0x0339c32a,
    0xc6913667,
    0x8df9317c,
    0xe0b12b4f,
    0xf79e59b7,
    0x43f5bb3a,
    0xf2d519ff,
    0x27d9459c,
    0xbf97222c,
    0x15e6fc2a,
    0x0f91fc71,
    0x9b941525,
    0xfae59361,
    0xceb69ceb,
    0xc2a86459,
    0x12baa8d1,
    0xb6c1075e,
    0xe3056a0c,
    0x10d25065,
    0xcb03a442,
    0xe0ec6e0e,
    0x1698db3b,
    0x4c98a0be,
    0x3278e964,
    0x9f1f9532,
    0xe0d392df,
    0xd3a0342b,
    0x8971f21e,
    0x1b0a7441,
    0x4ba3348c,
    0xc5be7120,
    0xc37632d8,
    0xdf359f8d,
    0x9b992f2e,
    0xe60b6f47,
    0x0fe3f11d,
    0xe54cda54,
    0x1edad891,
    0xce6279cf,
    0xcd3e7e6f,
    0x1618b166,
    0xfd2c1d05,
    0x848fd2c5,
    0xf6fb2299,
    0xf523f357,
    0xa6327623,
    0x93a83531,
    0x56cccd02,
    0xacf08162,
    0x5a75ebb5,
    0x6e163697,
    0x88d273cc,
    0xde966292,
    0x81b949d0,
    0x4c50901b,
    0x71c65614,
    0xe6c6c7bd,
    0x327a140a,
    0x45e1d006,
    0xc3f27b9a,
    0xc9aa53fd,
    0x62a80f00,
    0xbb25bfe2,
    0x35bdd2f6,
    0x71126905,
    0xb2040222,
    0xb6cbcf7c,
    0xcd769c2b,
    0x53113ec0,
    0x1640e3d3,
    0x38abbd60,
    0x2547adf0,
    0xba38209c,
    0xf746ce76,
    0x77afa1c5,
    0x20756060,
    0x85cbfe4e,
    0x8ae88dd8,
    0x7aaaf9b0,
    0x4cf9aa7e,
    0x1948c25c,
    0x02fb8a8c,
    0x01c36ae4,
    0xd6ebe1f9,
    0x90d4f869,
    0xa65cdea0,
    0x3f09252d,
    0xc208e69f,
    0xb74e6132,
    0xce77e25b,
    0x578fdfe3,
    0x3ac372e6
];
/**
 * @type {Array.<number>}
 * @const
 * @inner
 */ var C_ORIG = [
    0x4f727068,
    0x65616e42,
    0x65686f6c,
    0x64657253,
    0x63727944,
    0x6f756274
];
/**
 * @param {Array.<number>} lr
 * @param {number} off
 * @param {Array.<number>} P
 * @param {Array.<number>} S
 * @returns {Array.<number>}
 * @inner
 */ function _encipher(lr, off, P, S) {
    // This is our bottleneck: 1714/1905 ticks / 90% - see profile.txt
    var n, l = lr[off], r = lr[off + 1];
    l ^= P[0];
    /*
    for (var i=0, k=BLOWFISH_NUM_ROUNDS-2; i<=k;)
        // Feistel substitution on left word
        n  = S[l >>> 24],
        n += S[0x100 | ((l >> 16) & 0xff)],
        n ^= S[0x200 | ((l >> 8) & 0xff)],
        n += S[0x300 | (l & 0xff)],
        r ^= n ^ P[++i],
        // Feistel substitution on right word
        n  = S[r >>> 24],
        n += S[0x100 | ((r >> 16) & 0xff)],
        n ^= S[0x200 | ((r >> 8) & 0xff)],
        n += S[0x300 | (r & 0xff)],
        l ^= n ^ P[++i];
    */ //The following is an unrolled version of the above loop.
    //Iteration 0
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[1];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[2];
    //Iteration 1
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[3];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[4];
    //Iteration 2
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[5];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[6];
    //Iteration 3
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[7];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[8];
    //Iteration 4
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[9];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[10];
    //Iteration 5
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[11];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[12];
    //Iteration 6
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[13];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[14];
    //Iteration 7
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[15];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[16];
    lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
    lr[off + 1] = l;
    return lr;
}
/**
 * @param {Array.<number>} data
 * @param {number} offp
 * @returns {{key: number, offp: number}}
 * @inner
 */ function _streamtoword(data, offp) {
    for(var i = 0, word = 0; i < 4; ++i)word = word << 8 | data[offp] & 0xff, offp = (offp + 1) % data.length;
    return {
        key: word,
        offp: offp
    };
}
/**
 * @param {Array.<number>} key
 * @param {Array.<number>} P
 * @param {Array.<number>} S
 * @inner
 */ function _key(key, P, S) {
    var offset = 0, lr = [
        0,
        0
    ], plen = P.length, slen = S.length, sw;
    for(var i = 0; i < plen; i++)sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
    for(i = 0; i < plen; i += 2)lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
    for(i = 0; i < slen; i += 2)lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
/**
 * Expensive key schedule Blowfish.
 * @param {Array.<number>} data
 * @param {Array.<number>} key
 * @param {Array.<number>} P
 * @param {Array.<number>} S
 * @inner
 */ function _ekskey(data, key, P, S) {
    var offp = 0, lr = [
        0,
        0
    ], plen = P.length, slen = S.length, sw;
    for(var i = 0; i < plen; i++)sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
    offp = 0;
    for(i = 0; i < plen; i += 2)sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
    for(i = 0; i < slen; i += 2)sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
/**
 * Internaly crypts a string.
 * @param {Array.<number>} b Bytes to crypt
 * @param {Array.<number>} salt Salt bytes to use
 * @param {number} rounds Number of rounds
 * @param {function(Error, Array.<number>=)=} callback Callback receiving the error, if any, and the resulting bytes. If
 *  omitted, the operation will be performed synchronously.
 *  @param {function(number)=} progressCallback Callback called with the current progress
 * @returns {!Array.<number>|undefined} Resulting bytes if callback has been omitted, otherwise `undefined`
 * @inner
 */ function _crypt(b, salt, rounds, callback, progressCallback) {
    var cdata = C_ORIG.slice(), clen = cdata.length, err;
    // Validate
    if (rounds < 4 || rounds > 31) {
        err = Error("Illegal number of rounds (4-31): " + rounds);
        if (callback) {
            nextTick(callback.bind(this, err));
            return;
        } else throw err;
    }
    if (salt.length !== BCRYPT_SALT_LEN) {
        err = Error("Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN);
        if (callback) {
            nextTick(callback.bind(this, err));
            return;
        } else throw err;
    }
    rounds = 1 << rounds >>> 0;
    var P, S, i = 0, j;
    //Use typed arrays when available - huge speedup!
    if (typeof Int32Array === "function") {
        P = new Int32Array(P_ORIG);
        S = new Int32Array(S_ORIG);
    } else {
        P = P_ORIG.slice();
        S = S_ORIG.slice();
    }
    _ekskey(salt, b, P, S);
    /**
   * Calcualtes the next round.
   * @returns {Array.<number>|undefined} Resulting array if callback has been omitted, otherwise `undefined`
   * @inner
   */ function next() {
        if (progressCallback) progressCallback(i / rounds);
        if (i < rounds) {
            var start = Date.now();
            for(; i < rounds;){
                i = i + 1;
                _key(b, P, S);
                _key(salt, P, S);
                if (Date.now() - start > MAX_EXECUTION_TIME) break;
            }
        } else {
            for(i = 0; i < 64; i++)for(j = 0; j < clen >> 1; j++)_encipher(cdata, j << 1, P, S);
            var ret = [];
            for(i = 0; i < clen; i++)ret.push((cdata[i] >> 24 & 0xff) >>> 0), ret.push((cdata[i] >> 16 & 0xff) >>> 0), ret.push((cdata[i] >> 8 & 0xff) >>> 0), ret.push((cdata[i] & 0xff) >>> 0);
            if (callback) {
                callback(null, ret);
                return;
            } else return ret;
        }
        if (callback) nextTick(next);
    }
    // Async
    if (typeof callback !== "undefined") {
        next();
    // Sync
    } else {
        var res;
        while(true)if (typeof (res = next()) !== "undefined") return res || [];
    }
}
/**
 * Internally hashes a password.
 * @param {string} password Password to hash
 * @param {?string} salt Salt to use, actually never null
 * @param {function(Error, string=)=} callback Callback receiving the error, if any, and the resulting hash. If omitted,
 *  hashing is performed synchronously.
 *  @param {function(number)=} progressCallback Callback called with the current progress
 * @returns {string|undefined} Resulting hash if callback has been omitted, otherwise `undefined`
 * @inner
 */ function _hash(password, salt, callback, progressCallback) {
    var err;
    if (typeof password !== "string" || typeof salt !== "string") {
        err = Error("Invalid string / salt: Not a string");
        if (callback) {
            nextTick(callback.bind(this, err));
            return;
        } else throw err;
    }
    // Validate the salt
    var minor, offset;
    if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
        err = Error("Invalid salt version: " + salt.substring(0, 2));
        if (callback) {
            nextTick(callback.bind(this, err));
            return;
        } else throw err;
    }
    if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
    else {
        minor = salt.charAt(2);
        if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
            err = Error("Invalid salt revision: " + salt.substring(2, 4));
            if (callback) {
                nextTick(callback.bind(this, err));
                return;
            } else throw err;
        }
        offset = 4;
    }
    // Extract number of rounds
    if (salt.charAt(offset + 2) > "$") {
        err = Error("Missing salt rounds");
        if (callback) {
            nextTick(callback.bind(this, err));
            return;
        } else throw err;
    }
    var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
    password += minor >= "a" ? "\x00" : "";
    var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
    /**
   * Finishes hashing.
   * @param {Array.<number>} bytes Byte array
   * @returns {string}
   * @inner
   */ function finish(bytes) {
        var res = [];
        res.push("$2");
        if (minor >= "a") res.push(minor);
        res.push("$");
        if (rounds < 10) res.push("0");
        res.push(rounds.toString());
        res.push("$");
        res.push(base64_encode(saltb, saltb.length));
        res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
        return res.join("");
    }
    // Sync
    if (typeof callback == "undefined") return finish(_crypt(passwordb, saltb, rounds));
    else {
        _crypt(passwordb, saltb, rounds, function(err, bytes) {
            if (err) callback(err, null);
            else callback(null, finish(bytes));
        }, progressCallback);
    }
}
function encodeBase64(bytes, length) {
    return base64_encode(bytes, length);
}
function decodeBase64(string, length) {
    return base64_decode(string, length);
}
const __TURBOPACK__default__export__ = {
    setRandomFallback,
    genSaltSync,
    genSalt,
    hashSync,
    hash,
    compareSync,
    compare,
    getRounds,
    getSalt,
    truncates,
    encodeBase64,
    decodeBase64
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1l_1vme._.js.map